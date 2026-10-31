import { describe, expect, it } from 'vitest';
import type { Leg } from '../domain/itinerary.ts';
import { itineraryMap } from './geojson.ts';

const at = (time: string) => new Date(`2026-10-27T${time}:00+01:00`);
const from = { name: 'Gare Saint-Jean', coordinates: { lat: 44.82, lon: -0.55 } };
const to = { name: 'Place de la Bourse', coordinates: { lat: 44.84, lon: -0.57 } };

describe('itineraryMap', () => {
  it('draws each leg of each option found, between its start and its end', () => {
    const ride: Leg = {
      mode: 'bike',
      from: '',
      to: '',
      departure: at('10:30'),
      arrival: at('10:41'),
      path: [{ lat: 44.82, lon: -0.55 }, { lat: 44.84, lon: -0.57 }],
    };
    const map = itineraryMap([{ kind: 'bike', itinerary: { departure: at('10:30'), arrival: at('10:41'), legs: [ride] } }, { kind: 'walk' }], from, to);

    expect(map.features).toEqual([
      { type: 'Feature', geometry: { type: 'LineString', coordinates: [[-0.55, 44.82], [-0.57, 44.84]] }, properties: { option: 'bike', mode: 'bike' } },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-0.55, 44.82] },
        properties: { option: 'bike', marker: 'from', title: 'Départ de Gare Saint-Jean à 10 h 30' },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-0.57, 44.84] },
        properties: { option: 'bike', marker: 'to', title: 'Arrivée à Place de la Bourse à 10 h 41' },
      },
    ]);
  });

  it('marks each change of mode or vehicle where its step starts, with that step', () => {
    const legs: Leg[] = [
      { mode: 'walk', from: '', to: 'Gare Saint-Jean', departure: at('10:30'), arrival: at('10:31'), path: [{ lat: 44.82, lon: -0.55 }, { lat: 44.825, lon: -0.556 }] },
      {
        mode: 'tram',
        from: 'Gare Saint-Jean',
        to: 'Quinconces',
        departure: at('10:31'),
        arrival: at('10:40'),
        line: 'C',
        headsign: 'Les Aubiers',
        path: [{ lat: 44.825, lon: -0.556 }, { lat: 44.844, lon: -0.574 }],
      },
      { mode: 'walk', from: 'Quinconces', to: '', departure: at('10:40'), arrival: at('10:44'), distanceMeters: 310 },
    ];
    const map = itineraryMap([{ kind: 'transit', itinerary: { departure: at('10:30'), arrival: at('10:44'), legs } }], from, to);
    const changes = map.features.filter((feature) => 'marker' in feature.properties && feature.properties.marker === 'change');

    expect(changes).toEqual([
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-0.556, 44.825] },
        properties: {
          option: 'transit',
          marker: 'change',
          mode: 'tram',
          title: 'Tram C direction Les Aubiers : Montez à Gare Saint-Jean à 10 h 31, descendez à Quinconces à 10 h 40',
        },
      },
    ]);
  });
});
