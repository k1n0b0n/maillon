import type { Coordinates } from './itinerary.ts';

/** The area the data covers: the Gironde's bounding box, as clipped by the `osm` workflow (ADR-0004). */
export const AREA = { west: -1.27, south: 44.19, east: 0.32, north: 45.58 };

export function isInsideArea({ lat, lon }: Coordinates): boolean {
  return lon >= AREA.west && lon <= AREA.east && lat >= AREA.south && lat <= AREA.north;
}

/** Reads `lat,lon` as the form's hidden fields send it; anything else is no coordinates. */
export function parseCoordinates(text: string | null): Coordinates | undefined {
  const match = /^(-?\d{1,3}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)$/.exec(text ?? '');
  if (match === null) {
    return undefined;
  }
  const lat = Number(match[1]);
  const lon = Number(match[2]);
  return Math.abs(lat) <= 90 && Math.abs(lon) <= 180 ? { lat, lon } : undefined;
}
