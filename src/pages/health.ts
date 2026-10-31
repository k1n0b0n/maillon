import type { APIRoute } from 'astro';
import { DATA_DIR, MOTIS_URL } from 'astro:env/server';
import { ReleaseStore } from '../adapters/data/releases.ts';
import { engineIsUp } from '../adapters/motis/health.ts';
import { isStale } from '../domain/release.ts';

/** Liveness for the container and the smoke test: always 200, with the engine's state and its data's age (NFR4). */
export const GET: APIRoute = async () => {
  const [up, release] = await Promise.all([engineIsUp(MOTIS_URL), new ReleaseStore(DATA_DIR).current()]);
  return Response.json({
    app: 'up',
    engine: up ? 'up' : 'down',
    data: release && {
      release: release.id,
      createdAt: release.createdAt,
      coverage: release.coverage,
      stale: isStale(new Date(release.createdAt), new Date()),
    },
  });
};
