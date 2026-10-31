# Architecture

> Status: target, confirmed ADR by ADR. Each part names the ADR that confirms or changes it.

## Overview

```
browser ── GET /trajet?de=…&a=…&quand=…&velo=… ──► app (Astro SSR, Node)
                                                  ├─ domain/             comparison, bike profiles, ranking (plain TypeScript)
                                                  ├─ adapters/motis    ──► motis (container)
                                                  ├─ adapters/geocoder ──► motis (ADR-0001)
                                                  └─ in-memory LRU cache (~60 s)
pipeline (nightly, in CI): TBM GTFS + SNCF GTFS + Nouvelle-Aquitaine Mobilités GTFS + OSM Nouvelle-Aquitaine
                          (merged weekly in CI) → validation → bike rules applied to bikes_allowed → engine import
                          → smoke search → archive over SSH → atomic switch on the server → engine restart
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
| Data pipeline and bike rules | [ADR-0004](adr/0004-data-pipeline.md), accepted: nightly releases, OSM clipped in CI; the import moved to CI by ADR-0008 | E2.2 |
| Map on request | [ADR-0005](adr/0005-map-on-request.md), accepted: MapLibre and OpenFreeMap, loaded on request | E4.6 |
| Map with the results | [ADR-0006](adr/0006-map-with-the-results.md), accepted: the best option's map loads with the results, unless the browser asks to save data | E4.9 |
| Coverage | [ADR-0007](adr/0007-coverage-beyond-gironde.md), accepted: Nouvelle-Aquitaine, its networks from Nouvelle-Aquitaine Mobilités' regional GTFS | E2.4, E2.5 |
| Where the data is built | [ADR-0008](adr/0008-data-built-in-ci.md), accepted: in CI each night, sent to the server as an archive over SSH | E2.6 |

## Small decisions

| Date | Decision | Why |
|---|---|---|
| 2026-10-26 | No database or Redis in the MVP; favourites, later, in the browser's storage | Nothing to keep on the server |
| 2026-10-26 | The search state lives in the URL | Shareable links, a reliable back button, pages that work without JavaScript |
| 2026-10-26 | Renovate keeps dependencies and images current | balise's own version tooling took three stories |
| 2026-10-26 | Code under MIT; data credited on every page | Licence Ouverte (TBM), ODbL (OSM, SNCF) |
