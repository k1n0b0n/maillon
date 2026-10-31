export interface SearchForm {
  from: string;
  to: string;
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

/** Reads a search from its URL: `de`, `a` and `velo`, the French names the form submits. */
export function parseSearch(params: URLSearchParams): ParsedSearch {
  const values: SearchForm = { from: field(params, 'de'), to: field(params, 'a'), folding: params.get('velo') === 'pliant' };
  const missing = (['from', 'to'] as const).filter((name) => values[name] === '');
  return missing.length === 0 ? { complete: true, search: values } : { complete: false, values, missing };
}
