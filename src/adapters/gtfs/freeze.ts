import { createWriteStream, existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { csvLine, header, rows } from './feed.ts';

/** Longitude and latitude bounds: west, south, east, north. */
export type Bbox = [number, number, number, number];

type Row = Record<string, string>;

async function write(input: string, output: string, name: string, keep: (row: Row) => Row | undefined): Promise<number> {
  const file = join(input, name);
  if (!existsSync(file)) {
    return 0;
  }
  const columns = await header(file);
  const out = createWriteStream(join(output, name));
  out.write(csvLine(columns));
  let kept = 0;
  for await (const row of rows(file)) {
    const result = keep(row);
    if (result !== undefined) {
      kept += 1;
      if (!out.write(csvLine(columns.map((column) => result[column] ?? '')))) {
        await new Promise<void>((resolve) => out.once('drain', () => resolve()));
      }
    }
  }
  await new Promise<void>((resolve, reject) => out.end((error?: Error | null) => (error ? reject(error) : resolve())));
  return kept;
}

async function activeServices(input: string, day: string): Promise<Set<string>> {
  const date = day.replaceAll('-', '');
  const weekday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(`${day}T12:00:00Z`).getUTCDay()] ?? '';
  const active = new Set<string>();
  if (existsSync(join(input, 'calendar.txt'))) {
    for await (const service of rows(join(input, 'calendar.txt'))) {
      if (service[weekday] === '1' && (service['start_date'] ?? '') <= date && date <= (service['end_date'] ?? '')) {
        active.add(service['service_id'] ?? '');
      }
    }
  }
  if (existsSync(join(input, 'calendar_dates.txt'))) {
    for await (const exception of rows(join(input, 'calendar_dates.txt'))) {
      if (exception['date'] === date) {
        const id = exception['service_id'] ?? '';
        if (exception['exception_type'] === '1') active.add(id);
        else active.delete(id);
      }
    }
  }
  return active;
}

/**
 * Keeps one service day of a feed, and with `bbox` only the trips that stop inside it, for a small frozen dataset:
 * the calendars and feed_info then cover that day alone, and shapes are dropped.
 */
export async function freezeDay(input: string, output: string, day: string, bbox?: Bbox): Promise<number> {
  await mkdir(output, { recursive: true });
  const date = day.replaceAll('-', '');
  const services = await activeServices(input, day);
  const inside = new Set<string>();
  if (bbox !== undefined) {
    const [west, south, east, north] = bbox;
    for await (const stop of rows(join(input, 'stops.txt'))) {
      const lat = Number(stop['stop_lat']);
      const lon = Number(stop['stop_lon']);
      if (lon >= west && lon <= east && lat >= south && lat <= north) inside.add(stop['stop_id'] ?? '');
    }
  }
  const trips = new Map<string, string>();
  for await (const trip of rows(join(input, 'trips.txt'))) {
    if (services.has(trip['service_id'] ?? '')) trips.set(trip['trip_id'] ?? '', trip['route_id'] ?? '');
  }
  if (bbox !== undefined) {
    const touching = new Set<string>();
    for await (const stopTime of rows(join(input, 'stop_times.txt'))) {
      if (inside.has(stopTime['stop_id'] ?? '')) touching.add(stopTime['trip_id'] ?? '');
    }
    for (const id of trips.keys()) if (!touching.has(id)) trips.delete(id);
  }
  const stops = new Set<string>();
  await write(input, output, 'stop_times.txt', (row) => {
    if (!trips.has(row['trip_id'] ?? '')) return undefined;
    stops.add(row['stop_id'] ?? '');
    return row;
  });
  const parents = new Set<string>();
  for await (const stop of rows(join(input, 'stops.txt'))) {
    if (stops.has(stop['stop_id'] ?? '') && stop['parent_station']) parents.add(stop['parent_station']);
  }
  const routes = new Set(trips.values());
  const kept = await write(input, output, 'trips.txt', (row) => (trips.has(row['trip_id'] ?? '') ? { ...row, shape_id: '' } : undefined));
  await write(input, output, 'stops.txt', (row) => (stops.has(row['stop_id'] ?? '') || parents.has(row['stop_id'] ?? '') ? row : undefined));
  await write(input, output, 'routes.txt', (row) => (routes.has(row['route_id'] ?? '') ? row : undefined));
  await write(input, output, 'agency.txt', (row) => row);
  await write(input, output, 'calendar.txt', (row) =>
    services.has(row['service_id'] ?? '') ? { ...row, start_date: date, end_date: date } : undefined,
  );
  await write(input, output, 'calendar_dates.txt', (row) =>
    services.has(row['service_id'] ?? '') && row['date'] === date ? row : undefined,
  );
  await write(input, output, 'feed_info.txt', (row) => ({ ...row, feed_start_date: date, feed_end_date: date }));
  return kept;
}
