import type { Card, CardKind } from '../domain/comparison.ts';
import type { Coordinates, Itinerary, Mode, Place } from '../domain/itinerary.ts';
import { clock, step } from './format.ts';

export interface LegFeature {
  type: 'Feature';
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  properties: { option: CardKind; mode: Mode };
}

/** A start, an end, or a change of mode or vehicle; `mode` is the step that starts there, `title` its text. */
export interface MarkerFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: { option: CardKind; marker: 'from' | 'to' | 'change'; mode?: Mode; title: string };
}

export interface ItineraryMap {
  type: 'FeatureCollection';
  features: (LegFeature | MarkerFeature)[];
}

const point = ({ lat, lon }: Coordinates): [number, number] => [lon, lat];

function markers(option: CardKind, itinerary: Itinerary, from: Place, to: Place): MarkerFeature[] {
  const marker = (at: Coordinates, properties: Omit<MarkerFeature['properties'], 'option'>): MarkerFeature => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: point(at) },
    properties: { option, ...properties },
  });
  const changes = itinerary.legs.slice(1).flatMap((leg) => {
    const start = leg.path?.[0];
    if (start === undefined) {
      return [];
    }
    const { vehicle, line, towards, detail } = step(leg, from.name, to.name);
    return [marker(start, { marker: 'change', mode: leg.mode, title: `${[vehicle, line, towards].filter(Boolean).join(' ')} : ${detail}` })];
  });
  return [
    marker(from.coordinates, { marker: 'from', title: `Départ de ${from.name} à ${clock(itinerary.departure)}` }),
    ...changes,
    marker(to.coordinates, { marker: 'to', title: `Arrivée à ${to.name} à ${clock(itinerary.arrival)}` }),
  ];
}

/** The legs of every option found, as GeoJSON lines tagged with their option, and the markers of its start, changes and end. */
export function itineraryMap(cards: Card[], from: Place, to: Place): ItineraryMap {
  return {
    type: 'FeatureCollection',
    features: cards.flatMap(({ kind, itinerary }) => {
      if (itinerary === undefined) {
        return [];
      }
      const legs = itinerary.legs.flatMap((leg): LegFeature[] =>
        leg.path && leg.path.length > 1
          ? [{ type: 'Feature', geometry: { type: 'LineString', coordinates: leg.path.map(point) }, properties: { option: kind, mode: leg.mode } }]
          : [],
      );
      return [...legs, ...markers(kind, itinerary, from, to)];
    }),
  };
}
