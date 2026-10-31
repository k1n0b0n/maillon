import type { Comparison, PlanQuery } from '../../domain/itinerary.ts';
import { compare } from './plan.ts';

const TTL_MS = 60_000;
const MAX_ENTRIES = 200;

const entries = new Map<string, { expires: number; comparison: Promise<Comparison> }>();

function key({ from, to, time, arriveBy, folding }: PlanQuery): string {
  return [from.lat.toFixed(5), from.lon.toFixed(5), to.lat.toFixed(5), to.lon.toFixed(5), time.toISOString(), arriveBy, folding].join('|');
}

/**
 * The results page and its map ask for the same comparison within seconds: one request to the engine serves both.
 * The promise is kept, so two requests at once share it; a failure is not kept.
 */
export function cachedCompare(baseUrl: string, query: PlanQuery, now = Date.now()): Promise<Comparison> {
  const id = key(query);
  const entry = entries.get(id);
  if (entry !== undefined && entry.expires > now) {
    return entry.comparison;
  }
  const comparison = compare(baseUrl, query);
  entries.delete(id);
  entries.set(id, { expires: now + TTL_MS, comparison });
  comparison.catch(() => entries.delete(id));
  for (const oldest of entries.keys()) {
    if (entries.size <= MAX_ENTRIES) break;
    entries.delete(oldest);
  }
  return comparison;
}
