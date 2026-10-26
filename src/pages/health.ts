import type { APIRoute } from 'astro';
import { MOTIS_URL } from 'astro:env/server';
import { engineIsUp } from '../adapters/motis/health.ts';

/** Liveness for the container and the smoke test: always 200, with the engine's state. */
export const GET: APIRoute = async () =>
  Response.json({ app: 'up', engine: (await engineIsUp(MOTIS_URL)) ? 'up' : 'down' });
