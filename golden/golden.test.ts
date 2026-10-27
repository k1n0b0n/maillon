import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { compare } from '../src/adapters/motis/plan.ts';
import { type Bike, type Coordinates, type Mode, type Option, options } from '../src/domain/itinerary.ts';

interface GoldenRoute {
  id: string;
  title: string;
  from: string;
  to: string;
  at: string;
  option: Option;
  bike?: Bike;
  arriveBy?: boolean;
  expect: { never?: Mode[]; some?: Mode };
}

const engine = process.env['MOTIS_URL'] ?? 'http://motis:8080';
const routes = parse(readFileSync(new URL('routes.yaml', import.meta.url), 'utf8')) as GoldenRoute[];

function coordinates(text: string): Coordinates {
  const [lat = Number.NaN, lon = Number.NaN] = text.split(',').map(Number);
  return { lat, lon };
}

beforeAll(async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const up = await fetch(new URL('/api/v1/health', engine)).then(
      (response) => response.ok,
      () => false,
    );
    if (up) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`no engine answers at ${engine}`);
}, 40_000);

describe.each(routes)('$id: $title', (route) => {
  it(`keeps its properties for ${route.option}`, async () => {
    const comparison = await compare(engine, {
      from: coordinates(route.from),
      to: coordinates(route.to),
      time: new Date(route.at),
      arriveBy: route.arriveBy ?? false,
      bike: route.bike ?? 'classic',
    });
    const modes = options(comparison, route.option).map((itinerary) => new Set(itinerary.legs.map(({ mode }) => mode)));

    expect(modes.length, 'itineraries found').toBeGreaterThan(0);
    for (const mode of route.expect.never ?? []) {
      expect(modes.filter((used) => used.has(mode)).length, `itineraries using ${mode}`).toBe(0);
    }
    if (route.expect.some !== undefined) {
      expect(modes.some((used) => used.has(route.expect.some as Mode)), `an itinerary using ${route.expect.some}`).toBe(true);
    }
  });
});
