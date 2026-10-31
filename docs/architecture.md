# Architecture

> Status: target, confirmed ADR by ADR. Each part names the ADR that confirms or changes it.

## Overview

```
browser ── GET /trajet?de=…&a=…&quand=…&velo=… ──► app (Astro SSR, Node)
                                                  ├─ domain/             comparison, bike profiles, ranking (plain TypeScript)
                                                  ├─ adapters/motis    ──► motis (container)
                                                  ├─ adapters/geocoder ──► motis (ADR-0001)
                                                  └─ in-memory LRU cache (~60 s)
pipeline (nightly job): TBM GTFS + SNCF GTFS + OSM Gironde → validation → bike rules applied to bikes_allowed
                        → engine import → atomic switch → smoke test
```

- **Domain and adapters.** `domain/` holds the rules and never imports `adapters/`; only the adapters know the engine's and the geocoder's APIs. dependency-cruiser enforces the boundary, proven once by a deliberate violation (E1.1).
- **Pages.** Rendered on the server from a GET form, so the search lives in the URL and works without JavaScript. Vue islands only where they pay: place autocomplete, map.
- **Data.** The pipeline owns the bike rules: a versioned configuration where each rule carries its source and the date it was checked. A trip that overlaps a peak window does not allow bikes.
- **No database, no Redis** in the MVP.

## Founding ADRs (M0)

Numbered in the order they are written.

| Decision | Hypothesis | Story |
|---|---|---|
| Routing engine | [ADR-0001](adr/0001-routing-engine.md), accepted: MOTIS 2, its geocoder too | E2.1 |
| Application stack | [ADR-0002](adr/0002-application-stack.md), accepted: Astro SSR, Vue 3 islands, TypeScript strict | E1.1 |
| Responsible design | [ADR-0003](adr/0003-responsible-design.md), accepted: budgets in CI, a manual audit per milestone, honest statements | E1.1 |
| Hosting and delivery | balise's final state: GHCR images, SSH deploy with a forced command, the host's nginx, release-please | E1.2 |
| Data pipeline and bike rules | As in the overview | E2.2 |

## Small decisions

| Date | Decision | Why |
|---|---|---|
| 2026-10-26 | No database or Redis in the MVP; favourites, later, in the browser's storage | Nothing to keep on the server |
| 2026-10-26 | The search state lives in the URL | Shareable links, a reliable back button, pages that work without JavaScript |
| 2026-10-26 | Renovate keeps dependencies and images current | balise's own version tooling took three stories |
| 2026-10-26 | Code under MIT; data credited on every page | Licence Ouverte (TBM), ODbL (OSM, SNCF) |
