# Story 013: Nouvelle-Aquitaine covered

- **PRD:** E2.4 (the criteria live there)
- **Status:** Draft
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

- The measures behind the area are in ADR-0007; the import needs 3 GB, so this story runs on the Mac until story 015 moves the build to CI.
- If the frozen day must move, every golden route's date moves with it; story 014 re-freezes on a Tuesday the regional feed covers.

**Measure:** release 343 MB → ?; import peak 0.9 GB → ?; p95 of the golden routes ? → ?.
