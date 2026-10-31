import type { Place } from '../../domain/itinerary.ts';

interface MotisMatch {
  name: string;
  lat: number;
  lon: number;
}

/** Bordeaux's centre: the engine ranks matches near it first. */
const BIAS = '44.84,-0.58';

export async function findPlace(baseUrl: string, text: string): Promise<Place | undefined> {
  const url = new URL('/api/v1/geocode', baseUrl);
  url.search = new URLSearchParams({ text, place: BIAS }).toString();
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) {
    throw new Error(`the engine answered ${response.status}`);
  }
  const [match] = (await response.json()) as MotisMatch[];
  return match && { name: match.name, coordinates: { lat: match.lat, lon: match.lon } };
}
