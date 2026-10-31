export interface SearchForm {
  from: string;
  to: string;
}

export type SearchField = keyof SearchForm;

export type ParsedSearch =
  | { complete: true; search: SearchForm }
  | { complete: false; values: SearchForm; missing: SearchField[] };

const MAX_LENGTH = 200;

function field(params: URLSearchParams, name: string): string {
  return (params.get(name) ?? '').trim().slice(0, MAX_LENGTH);
}

/** Reads a search from its URL: `de` and `a`, the French names the form submits. */
export function parseSearch(params: URLSearchParams): ParsedSearch {
  const values: SearchForm = { from: field(params, 'de'), to: field(params, 'a') };
  const missing = (Object.keys(values) as SearchField[]).filter((name) => values[name] === '');
  return missing.length === 0 ? { complete: true, search: values } : { complete: false, values, missing };
}
