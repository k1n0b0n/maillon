import type { APIRoute } from 'astro';
import { MOTIS_URL } from 'astro:env/server';
import { cachedCompare } from '../../adapters/motis/cache.ts';
import { isInsideArea } from '../../domain/area.ts';
import { cards, optionsFor } from '../../domain/comparison.ts';
import { parseSearch } from '../../domain/search.ts';
import { itineraryMap } from '../../ui/geojson.ts';

/**
 * The map's lines and markers (E4.6, E4.9), asked once the results page is shown. It passes its places' names and
 * coordinates and the time it searched, so the map draws the very itineraries the page lists.
 */
export const GET: APIRoute = async ({ url }) => {
  const parsed = parseSearch(url.searchParams);
  if (!parsed.complete) {
    return Response.json({ error: 'incomplete search' }, { status: 400 });
  }
  const { from, to, fromAt, toAt, at, bike } = parsed.search;
  if (fromAt === undefined || toAt === undefined || at === undefined || !isInsideArea(fromAt) || !isInsideArea(toAt)) {
    return Response.json({ error: 'the map needs both places inside the area, and the time' }, { status: 400 });
  }
  try {
    const comparison = await cachedCompare(MOTIS_URL, { from: fromAt, to: toAt, time: at, arriveBy: false, bike });
    return Response.json(itineraryMap(cards(comparison, optionsFor(bike)), { name: from, coordinates: fromAt }, { name: to, coordinates: toAt }), { headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch (error) {
    console.error('map failed:', error);
    return Response.json({ error: 'the engine does not answer' }, { status: 503 });
  }
};
