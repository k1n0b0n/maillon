# ADR-0002: Application stack

- **Status:** Accepted
- **Date:** 2026-10-26

## Context

The product is a form and its results: pages that must work without JavaScript, keep the search in the URL and stay light (ADR-0003). Interactivity is limited to place autocomplete and a map on request. The maintainer knows Vue 3 and is open to other tools when they fit.

## Decision

- **Astro 7 in server mode** (`@astrojs/node`, standalone) on Node 24, TypeScript 6 strict (`strictest` preset). Pages render on the server from a GET form; a page ships no JavaScript unless it holds an island.
- **Vue 3 islands** where interaction pays (autocomplete, map), added with the first one (E4.1).
- **Plain TypeScript domain** in `src/domain/`, tested with Vitest; `src/adapters/` alone reaches outside systems. dependency-cruiser enforces it in `npm run check`, proven by a deliberate violation (story 002).
- Configuration through `astro:env` (typed, read at run time).
- TypeScript 6, not 7: typescript-eslint and `@astrojs/check` do not support 7 yet.

## Alternatives considered

| Option | Why not |
|---|---|
| Nuxt 4 | Hydrates every page for a mostly server-side need; drifts towards state in a store instead of the URL |
| SvelteKit | Progressive enhancement built in, but a new framework and leaving Vue for little gain here |
| Symfony UX | The maintainer's fastest stack, but autocomplete and map are less comfortable in Stimulus than in Vue |

## Consequences

- Easier: RGAA and RGESN come almost free (server HTML, no JS by default); shareable URLs; the domain is portable.
- Harder: state shared between islands is awkward. If interactivity grows past a few islands, the way out is Nuxt: the domain is plain TypeScript and the islands are already Vue.
- The production image weighs 428 MB, mostly `node_modules`; bundling the server is an option if it matters.
