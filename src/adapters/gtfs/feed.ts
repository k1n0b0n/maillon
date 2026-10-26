import { execFile } from 'node:child_process';
import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { rename } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { parse } from 'csv-parse';
import type { Span, Vehicle } from '../../domain/bike-rules.ts';

const run = promisify(execFile);

const REQUIRED = ['agency.txt', 'stops.txt', 'routes.txt', 'trips.txt', 'stop_times.txt'];

/** How a feed says which vehicle runs a trip. */
export type VehicleSource = 'route-type' | 'sncf-stop-category';

export async function* rows(file: string): AsyncGenerator<Record<string, string>> {
  yield* createReadStream(file).pipe(parse({ columns: true, bom: true, skip_empty_lines: true, relax_column_count: true }));
}

export async function header(file: string): Promise<string[]> {
  for await (const record of createReadStream(file).pipe(parse({ bom: true, to_line: 1 }))) {
    return record as string[];
  }
  return [];
}

export function csvLine(values: string[]): string {
  return values.map((value) => (/[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value)).join(',') + '\n';
}

export async function extract(zip: string, dir: string): Promise<void> {
  await run('unzip', ['-qo', zip, '-d', dir]);
  checkFeed(dir);
}

export function checkFeed(dir: string): void {
  const missing = REQUIRED.filter((name) => !existsSync(join(dir, name)));
  if (missing.length > 0) {
    throw new Error(`${dir} lacks ${missing.join(', ')}`);
  }
  if (!existsSync(join(dir, 'calendar.txt')) && !existsSync(join(dir, 'calendar_dates.txt'))) {
    throw new Error(`${dir} has no calendar`);
  }
}

/** The feed's last day as YYYY-MM-DD, from feed_info.txt. */
export async function feedEnd(dir: string): Promise<{ end: string; version: string }> {
  for await (const info of rows(join(dir, 'feed_info.txt'))) {
    const end = info['feed_end_date'] ?? '';
    return { end: `${end.slice(0, 4)}-${end.slice(4, 6)}-${end.slice(6, 8)}`, version: info['feed_version'] ?? '' };
  }
  throw new Error(`${dir}/feed_info.txt is empty`);
}

function minutes(time: string): number {
  const [hours = 0, mins = 0] = time.split(':').map(Number);
  return hours * 60 + mins;
}

function vehicleFromRouteType(type: string): Vehicle {
  const code = Number(type);
  if (code === 0 || code === 900) return 'tram';
  if (code === 4 || code === 1200 || (code >= 1000 && code < 1100)) return 'ferry';
  if (code === 2 || (code >= 100 && code < 200)) return 'other-train';
  return 'bus';
}

/** SNCF stop ids carry the train's kind: `StopPoint:OCETrain TER-87581009`. */
function vehicleFromSncfStop(stopId: string): Vehicle {
  const kind = stopId.replace(/^StopPoint:OCE/, '').replace(/-\d+$/, '');
  if (kind === 'Train TER' || kind === 'TramTrain') return 'regional-train';
  if (kind === 'Car TER' || kind === 'Car à réservation' || kind === 'Navette') return 'coach';
  return 'other-train';
}

export interface Trips {
  vehicles: Map<string, Vehicle>;
  spans: Map<string, Span>;
}

export async function readTrips(dir: string, source: VehicleSource): Promise<Trips> {
  const routeVehicles = new Map<string, Vehicle>();
  for await (const route of rows(join(dir, 'routes.txt'))) {
    routeVehicles.set(route['route_id'] ?? '', vehicleFromRouteType(route['route_type'] ?? ''));
  }
  const vehicles = new Map<string, Vehicle>();
  for await (const trip of rows(join(dir, 'trips.txt'))) {
    vehicles.set(trip['trip_id'] ?? '', routeVehicles.get(trip['route_id'] ?? '') ?? 'bus');
  }
  const spans = new Map<string, Span>();
  for await (const stopTime of rows(join(dir, 'stop_times.txt'))) {
    const tripId = stopTime['trip_id'] ?? '';
    const arrival = minutes(stopTime['arrival_time'] || stopTime['departure_time'] || '0:0');
    const departure = minutes(stopTime['departure_time'] || stopTime['arrival_time'] || '0:0');
    const span = spans.get(tripId);
    if (span === undefined) {
      spans.set(tripId, { first: departure, last: arrival });
      if (source === 'sncf-stop-category') {
        vehicles.set(tripId, vehicleFromSncfStop(stopTime['stop_id'] ?? ''));
      }
    } else {
      span.first = Math.min(span.first, departure);
      span.last = Math.max(span.last, arrival);
    }
  }
  return { vehicles, spans };
}

/** Rewrites `bikes_allowed` on every trip: 1 when `allowed` says so, 2 otherwise. */
export async function writeBikesAllowed(
  dir: string,
  allowed: (tripId: string) => boolean,
): Promise<{ trips: number; withBikes: number }> {
  const file = join(dir, 'trips.txt');
  const columns = await header(file);
  if (!columns.includes('bikes_allowed')) {
    columns.push('bikes_allowed');
  }
  const out = createWriteStream(`${file}.next`);
  out.write(csvLine(columns));
  let trips = 0;
  let withBikes = 0;
  for await (const trip of rows(file)) {
    const bikes = allowed(trip['trip_id'] ?? '');
    trips += 1;
    withBikes += bikes ? 1 : 0;
    trip['bikes_allowed'] = bikes ? '1' : '2';
    if (!out.write(csvLine(columns.map((column) => trip[column] ?? '')))) {
      await new Promise<void>((resolve) => out.once('drain', () => resolve()));
    }
  }
  await new Promise<void>((resolve, reject) => out.end((error?: Error | null) => (error ? reject(error) : resolve())));
  await rename(`${file}.next`, file);
  return { trips, withBikes };
}
