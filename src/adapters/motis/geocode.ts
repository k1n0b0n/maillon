import type { Mode, Place, Suggestion } from '../../domain/itinerary.ts';
import { MODES } from './modes.ts';

interface MotisArea {
  name: string;
  default?: boolean;
}

interface MotisMatch {
  type: 'STOP' | 'ADDRESS' | 'PLACE';
  name: string;
  lat: number;
  lon: number;
  areas?: MotisArea[];
  modes?: string[];
}

const KINDS = { STOP: 'stop', ADDRESS: 'address', PLACE: 'place' } as const;

/** Bordeaux's centre: the engine ranks matches near it first. */
const BIAS = '44.84,-0.58';

function suggestion(match: MotisMatch): Suggestion {
  const town = match.areas?.find((area) => area.default)?.name;
  const modes = [...new Set((match.modes ?? []).map((mode) => MODES[mode]).filter((mode): mode is Mode => mode !== undefined))];
  return {
    name: match.name,
    coordinates: { lat: match.lat, lon: match.lon },
    kind: KINDS[match.type] ?? 'place',
    ...(town && { town }),
    modes,
  };
}

export async function suggest(baseUrl: string, text: string, limit = 6): Promise<Suggestion[]> {
  const url = new URL('/api/v1/geocode', baseUrl);
  url.search = new URLSearchParams({ text, place: BIAS, numResults: String(limit) }).toString();
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) {
    throw new Error(`the engine answered ${response.status}`);
  }
  // OSM often maps one place twice under the same name: the second adds nothing to the list.
  const seen = new Set<string>();
  return ((await response.json()) as MotisMatch[])
    .map(suggestion)
    .filter(({ name, kind, town, modes }) => {
      const key = [name.toLowerCase(), kind, town, ...modes].join('|');
      return !seen.has(key) && seen.add(key);
    })
    .slice(0, limit);
}

export async function findPlace(baseUrl: string, text: string): Promise<Place | undefined> {
  const [best] = await suggest(baseUrl, text, 1);
  return best && { name: best.name, coordinates: best.coordinates };
}
