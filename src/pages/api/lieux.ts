import type { APIRoute } from 'astro';
import { MOTIS_URL } from 'astro:env/server';
import { suggest } from '../../adapters/motis/geocode.ts';

/** Suggestions for the place fields (E4.1). Places change with a release, not within an hour. */
export const GET: APIRoute = async ({ url }) => {
  const text = (url.searchParams.get('q') ?? '').trim().slice(0, 200);
  if (text.length < 2) {
    return Response.json([]);
  }
  try {
    const suggestions = await suggest(MOTIS_URL, text);
    return Response.json(suggestions, { headers: { 'Cache-Control': 'public, max-age=3600' } });
  } catch (error) {
    console.error('suggestions failed:', error);
    return Response.json([], { status: 503 });
  }
};
