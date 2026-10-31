import { parseCoordinates } from './area.ts';
import type { Coordinates } from './itinerary.ts';

export interface SearchForm {
  from: string;
  to: string;
  /** Set when a suggestion or the person's position was chosen: no need to look the name up again. */
  fromAt?: Coordinates;
  toAt?: Coordinates;
  /** The time searched; now when absent. */
  at?: Date;
  /** A folded bike rides every vehicle, the bus included. */
  folding: boolean;
}

export type SearchField = 'from' | 'to';

export type ParsedSearch =
  | { complete: true; search: SearchForm }
  | { complete: false; values: SearchForm; missing: SearchField[] };

const MAX_LENGTH = 200;

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
    folding: params.get('velo') === 'pliant',
    ...(fromAt && { fromAt }),
    ...(toAt && { toAt }),
    ...(Number.isNaN(at.getTime()) ? {} : { at }),
  };
  const missing = (['from', 'to'] as const).filter((name) => values[name] === '');
  return missing.length === 0 ? { complete: true, search: values } : { complete: false, values, missing };
}
