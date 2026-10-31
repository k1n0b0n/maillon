# Story 013: Nouvelle-Aquitaine covered

- **PRD:** E2.4 (the criteria live there)
- **Status:** Done
- **Golden routes:** run: GR1 to GR7; added: GR8
- **Budgets touched:** NFR3, with the region's data

## Plan

1. One area, tests first: the region's simplified outline, from Geofabrik's three `.poly` files, in `domain/area.ts`, and a point-in-polygon check in place of the box. `adapters/gtfs/freeze.ts` and `pipeline/freeze.ts` read it instead of their own copies of the box.
2. The "hors zone" page says that maillon covers Nouvelle-Aquitaine.
3. The `osm` workflow downloads Aquitaine, Limousin and Poitou-Charentes, merges them with osmium and publishes `osm-area/area.osm.pbf`; `OSM_URL`'s default follows. The maintainer runs the workflow once to create the release.
4. Compose: the pipeline's memory cap rises from 1.6 to 4 GB; the server no longer runs it (ADR-0008, story 015).
5. Frozen dataset: the SNCF trips that stop in the region; `scripts/freeze-dataset.sh` merges a small extract around Thenon with Bordeaux's. GR8: Gare Saint-Jean → Thenon at 10:30, transit + bike, `some: train`, `never: [bus]`.
6. Checks: `npm run check`; `sh scripts/golden.sh`; `sh scripts/refresh-data.sh` on the region (release size, import peak, trips per feed); Firefox at 360 px: Bordeaux → Thenon by TER with the bike and coherent steps; a place in Toulouse gives "hors zone"; the p95 of the golden routes against NFR3.

## Notes

- Criterion 1: Gare Saint-Jean → Thenon, Firefox at 360 px: "Transports + vélo" first, a direct TER L32 (12 h 27 → 14 h 20) then 2.8 km by bike to the village; walking and cycling "Aucun trajet", too far. GR8 passes on the frozen day, by the same TER.
- Criterion 2: Bordeaux → Toulouse shows "Hors de la zone couverte" and "« Toulouse » : maillon ne couvre que la Nouvelle-Aquitaine pour l'instant."; unit tests: 11 places inside (Oléron, Hendaye, Guéret…), 6 outside (Toulouse, Cahors, Bilbao…).
- Criterion 3: on the region's engine, p95 243 ms from Bordeaux to Thenon and 161 ms within Bordeaux (60 searches each, the app's two requests in parallel, on the Mac).
- The outline is the union of the three `.poly` files, grown by 0.02° then simplified by as much: 135 points, and it holds the whole union, so no place the data holds is refused.
- The `osm` workflow refuses three regions from two snapshots: the objects on their borders would come twice. `osm-area` is not published yet: the dev release and the frozen dataset used the same merge, Geofabrik's of 2026-10-27.
- Found on the way and fixed, tests first: SNCF trains carry their number as headsign ("direction 865214"); the engine adapter now names the trip's last stop ("direction Brive-la-Gaillarde").
- Transit without the bike finds nothing to Thenon's village: the engine walks 15 minutes at most after transit, and the halt is 38 minutes away on foot; to the halt itself it works (#15).
- The production build in `AGENTS.md` and Compose's dev image share the tag `maillon-app`: the first check ran on an old build until `docker compose up -d --build app` (#16).
- TBM's feed of 2026-10-31 holds 39,749 trips, against 68,534 on 2026-10-26: within the validation's half, to watch.

**Measure:** release 312 MB → 886 MB (TBM and SNCF, 91 days); pipeline peak 1 GB → 2.4 GB (`docker stats`, 61 s on the Mac); engine serving 377 → 657 MB; p95 within Bordeaux 165 → 161 ms, Bordeaux → Thenon out of area → 243 ms; frozen SNCF trips 434 → 1,048.
