import { describe, expect, it } from 'vitest';
import { itinerary } from './plan.ts';

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
