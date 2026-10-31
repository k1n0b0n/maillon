import type { Card, CardKind } from '../domain/comparison.ts';
import type { Coordinates, Mode } from '../domain/itinerary.ts';

export interface LegFeature {
  type: 'Feature';
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  properties: { option: CardKind; mode: Mode };
}

export interface EndFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: { end: 'from' | 'to' };
}

export interface ItineraryMap {
  type: 'FeatureCollection';
  features: (LegFeature | EndFeature)[];
}

const point = ({ lat, lon }: Coordinates): [number, number] => [lon, lat];

/** The legs of every option found, as GeoJSON lines tagged with their option, and the search's two ends. */
export function itineraryMap(cards: Card[], from: Coordinates, to: Coordinates): ItineraryMap {
  const legs = cards.flatMap(({ kind, itinerary }) =>
    (itinerary?.legs ?? []).flatMap((leg): LegFeature[] =>
      leg.path && leg.path.length > 1
        ? [{ type: 'Feature', geometry: { type: 'LineString', coordinates: leg.path.map(point) }, properties: { option: kind, mode: leg.mode } }]
        : [],
    ),
  );
  const ends: EndFeature[] = [
    { type: 'Feature', geometry: { type: 'Point', coordinates: point(from) }, properties: { end: 'from' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: point(to) }, properties: { end: 'to' } },
  ];
  return { type: 'FeatureCollection', features: [...legs, ...ends] };
}
