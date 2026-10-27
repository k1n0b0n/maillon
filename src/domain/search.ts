import { parseCoordinates } from './area.ts';
import type { Bike, Coordinates } from './itinerary.ts';

export interface SearchForm {
  from: string;
  to: string;
  /** Set when a suggestion or the person's position was chosen: no need to look the name up again. */
  fromAt?: Coordinates;
  toAt?: Coordinates;
  /** The time searched; now when absent. */
  at?: Date;
  bike: Bike;
}

export type SearchField = 'from' | 'to';

export type ParsedSearch =
  | { complete: true; search: SearchForm }
  | { complete: false; values: SearchForm; missing: SearchField[] };

const MAX_LENGTH = 200;

/** The values of `velo`; a link from before the choice has none, or `pliant`, and keeps its results. */
export const BIKE_PARAMS: Record<Bike, string> = { none: 'aucun', classic: 'classique', folding: 'pliant' };

function bike(value: string | null): Bike {
  return value === BIKE_PARAMS.none ? 'none' : value === BIKE_PARAMS.folding ? 'folding' : 'classic';
}

function field(params: URLSearchParams, name: string): string {
  return (params.get(name) ?? '').trim().slice(0, MAX_LENGTH);
}

/** Reads a search from its URL: `de`, `a`, `dep`, `arr`, `velo` and `quand`, the French names the form submits. */
export function parseSearch(params: URLSearchParams): ParsedSearch {
  const fromAt = parseCoordinates(params.get('dep'));
  const toAt = parseCoordinates(params.get('arr'));
  const at = new Date(params.get('quand') ?? '');
  const values: SearchForm = {
    from: field(params, 'de'),
    to: field(params, 'a'),
    bike: bike(params.get('velo')),
    ...(fromAt && { fromAt }),
    ...(toAt && { toAt }),
    ...(Number.isNaN(at.getTime()) ? {} : { at }),
  };
  const missing = (['from', 'to'] as const).filter((name) => values[name] === '');
  return missing.length === 0 ? { complete: true, search: values } : { complete: false, values, missing };
}
