import { describe, expect, it } from 'vitest';
import { itineraryMap } from './geojson.ts';

describe('itineraryMap', () => {
  it('draws each leg of each option found, and the two ends', () => {
    const at = new Date('2026-10-27T09:30:00Z');
    const map = itineraryMap(
      [
        {
          kind: 'bike',
          itinerary: {
            departure: at,
            arrival: at,
            legs: [{ mode: 'bike', from: '', to: '', departure: at, arrival: at, path: [{ lat: 44.82, lon: -0.55 }, { lat: 44.84, lon: -0.57 }] }],
          },
        },
        { kind: 'walk' },
      ],
      { lat: 44.82, lon: -0.55 },
      { lat: 44.84, lon: -0.57 },
    );

    expect(map.features).toEqual([
      { type: 'Feature', geometry: { type: 'LineString', coordinates: [[-0.55, 44.82], [-0.57, 44.84]] }, properties: { option: 'bike', mode: 'bike' } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-0.55, 44.82] }, properties: { end: 'from' } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-0.57, 44.84] }, properties: { end: 'to' } },
    ]);
  });
});
