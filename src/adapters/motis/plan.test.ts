import { afterEach, describe, expect, it, vi } from 'vitest';
import { compare, itinerary } from './plan.ts';

describe('itinerary', () => {
  it('maps the engine modes and keeps what the text detail needs', () => {
    const mapped = itinerary({
      startTime: '2026-10-27T09:30:00Z',
      endTime: '2026-10-27T09:41:00Z',
      legs: [
        { mode: 'BIKE', from: { name: 'START' }, to: { name: 'Gare Saint-Jean' }, startTime: '2026-10-27T09:30:00Z', endTime: '2026-10-27T09:31:00Z', distance: 16.4 },
        {
          mode: 'TRAM',
          from: { name: 'Gare Saint-Jean' },
          to: { name: 'Tauzia' },
          startTime: '2026-10-27T09:31:00Z',
          endTime: '2026-10-27T09:32:00Z',
          routeShortName: 'F',
          headsign: 'Mérignac Aéroport',
        },
        { mode: 'REGIONAL_RAIL', from: { name: 'Pessac' }, to: { name: 'Bordeaux Saint-Jean' }, startTime: '2026-10-27T09:40:00Z', endTime: '2026-10-27T09:41:00Z' },
      ],
    });

    expect(mapped.legs.map(({ mode }) => mode)).toEqual(['bike', 'tram', 'train']);
    expect(mapped.legs[0]).toMatchObject({ from: '', distanceMeters: 16 });
    expect(mapped.legs[1]).toMatchObject({ line: 'F', headsign: 'Mérignac Aéroport', to: 'Tauzia' });
    expect(mapped.arrival.toISOString()).toBe('2026-10-27T09:41:00.000Z');
  });

  it("heads a train to its last stop when its headsign is the train's number", () => {
    const mapped = itinerary({
      startTime: '2026-11-03T11:27:00Z',
      endTime: '2026-11-03T13:20:00Z',
      legs: [
        {
          mode: 'REGIONAL_RAIL',
          from: { name: 'Bordeaux Saint-Jean' },
          to: { name: 'Thenon' },
          startTime: '2026-11-03T11:27:00Z',
          endTime: '2026-11-03T13:20:00Z',
          routeShortName: 'L32',
          headsign: '865214',
          tripTo: { name: 'Tulle' },
        },
      ],
    });

    expect(mapped.legs[0]).toMatchObject({ line: 'L32', headsign: 'Tulle' });
  });
});

describe('compare', () => {
  const query = {
    from: { lat: 44.81971, lon: -0.54369 },
    to: { lat: 45.177, lon: 1.03879 },
    time: new Date('2026-11-03T10:30:00Z'),
    arriveBy: false,
    bike: 'classic' as const,
  };
  const ride = {
    startTime: '2026-11-03T13:05:00Z',
    endTime: '2026-11-03T16:19:00Z',
    legs: [{ mode: 'REGIONAL_RAIL', from: { name: 'Bordeaux Saint-Jean' }, to: { name: 'Thenon' }, startTime: '2026-11-03T13:27:00Z', endTime: '2026-11-03T15:20:00Z' }],
  };

  /** Answers with a train only to the requests whose walk to transit reaches `walkSeconds`. */
  function engine(walkSeconds: number): URLSearchParams[] {
    const asked: URLSearchParams[] = [];
    vi.stubGlobal('fetch', async (url: URL) => {
      asked.push(url.searchParams);
      const walk = Number(url.searchParams.get('maxPostTransitTime') ?? 15 * 60);
      return new Response(JSON.stringify({ direct: [], itineraries: walk >= walkSeconds ? [ride] : [] }));
    });
    return asked;
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps the engine's 15 minutes' walk to transit when transit is found", async () => {
    const asked = engine(15 * 60);
    const comparison = await compare('http://motis:8080', query);

    expect(asked).toHaveLength(2);
    expect(asked.every((params) => !params.has('maxPostTransitTime'))).toBe(true);
    expect(comparison.transit).toHaveLength(1);
  });

  it('walks up to an hour to or from transit when nothing nearer is found', async () => {
    const asked = engine(60 * 60);
    const comparison = await compare('http://motis:8080', query);

    expect(asked).toHaveLength(3);
    expect(asked[2]?.get('maxPreTransitTime')).toBe('3600');
    expect(asked[2]?.get('maxPostTransitTime')).toBe('3600');
    expect(comparison.transit.map(({ arrival }) => arrival.toISOString())).toEqual(['2026-11-03T16:19:00.000Z']);
  });
});
