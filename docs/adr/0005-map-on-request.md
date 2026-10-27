# ADR-0005: Map on request

- **Status:** Accepted; the map's loading on request superseded by ADR-0006 (the map loads with the results)
- **Date:** 2026-10-27

## Context

The results page shows the four options as text; the maintainer wants them on a map too. ADR-0003 asks for no third party and keeps the map out of the JavaScript budget, loaded only on request. A map needs a library and tiles. Measured on 2026-10-27:

| Measure | Value |
|---|---|
| MOTIS import with its vector tiles, capped at 2 CPUs and 1.6 GB | Killed for memory after 48 s, and again with `flush_threshold` lowered to 1,000,000 |
| MapLibre GL JS 6, once opened | 284 kB compressed, its worker 143 kB, its stylesheet 10 kB |
| The map's island before it opens | 3 kB compressed, Vue's runtime shared with the place fields |

## Decision

- **MapLibre GL JS 6**, loaded by a Vue island only when the person presses "Afficher la carte": the library, its worker (`setWorkerUrl`, built by Vite as an ES module) and its stylesheet (a `<link>` added then) never load with the page.
- **OpenFreeMap's "positron" style and tiles**: free, no key, no tracking, built from OpenStreetMap. The page credits them through MapLibre's attribution.
- `/api/itineraires` draws the very itineraries the page lists: the page passes its places' coordinates and the minute it searched, and a 60 s cache serves the same comparison.
- Each option has a colour, a dash pattern and an offset, and a text legend: no option is told by its colour alone.

## Alternatives considered

| Option | Why not |
|---|---|
| MOTIS's own tiles | Runs out of memory on the server's budget (above); worth another try if tiles get built in CI |
| Leaflet with raster tiles | Lighter, but raster tiles weigh more per screen and the third party is the same |
| A static image per itinerary | Needs a rendering service, and cannot be zoomed |

## Consequences

- Easier: a map in one island, the page's budget untouched (34 kB of JavaScript with both islands).
- Harder: a third party serves the tiles once the map opens, against ADR-0003's default; OpenFreeMap's availability is outside our control, and the page says the steps stay in the text when the map fails.
