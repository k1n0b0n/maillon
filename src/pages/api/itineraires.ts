import type { APIRoute } from 'astro';
import { MOTIS_URL } from 'astro:env/server';
import { cachedCompare } from '../../adapters/motis/cache.ts';
import { isInsideArea } from '../../domain/area.ts';
import { cards } from '../../domain/comparison.ts';
import { parseSearch } from '../../domain/search.ts';
import { itineraryMap } from '../../ui/geojson.ts';

/**
 * The map's lines (E4.6), asked only when the person opens the map. The results page passes its places' coordinates
 * and the time it searched, so the map draws the very itineraries the page lists.
 */
export const GET: APIRoute = async ({ url }) => {
  const parsed = parseSearch(url.searchParams);
  if (!parsed.complete) {
    return Response.json({ error: 'incomplete search' }, { status: 400 });
  }
  const { fromAt, toAt, at, folding } = parsed.search;
  if (fromAt === undefined || toAt === undefined || at === undefined || !isInsideArea(fromAt) || !isInsideArea(toAt)) {
    return Response.json({ error: 'the map needs both places inside the area, and the time' }, { status: 400 });
  }
  try {
    const comparison = await cachedCompare(MOTIS_URL, { from: fromAt, to: toAt, time: at, arriveBy: false, folding });
    return Response.json(itineraryMap(cards(comparison), fromAt, toAt), { headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch (error) {
    console.error('map failed:', error);
    return Response.json({ error: 'the engine does not answer' }, { status: 503 });
  }
};
