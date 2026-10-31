# Story 014: Every network in Nouvelle-Aquitaine

- **PRD:** E2.5 (the criteria live there)
- **Status:** Draft
- **Golden routes:** run: GR1 to GR8; added: GR9, GR10
- **Budgets touched:** NFR4 (a regional feed's last good copy), NFR6 (credits)

## Plan

1. The regional feed, tests first: `NAQ_GTFS_URL` in `compose.yaml` and the feeds of `pipeline/run.ts`, pigma.org's `naq-aggregated-gtfs.zip`, without TBM's agency (`BORDEAUX_METROPOLE:Operator:TBM`) and otherwise as published (ADR-0007). With no `feed_info.txt`, its end comes from its calendar: today `feedEnd` kills the pipeline with an unhandled stream error.
2. Vehicles by agency in `adapters/gtfs/feed.ts`: the "Cars régionaux" agencies → `coach`, `route_type` 4 → `ferry`, the rest → `bus`.
3. Bike rules in `domain/bike-rules.ts`: `coach` folded only, source transports.nouvelle-aquitaine.fr/cars-regionaux/velos-et-cars; the `bus` rule's source checked on the largest networks (Limoges, Poitiers, Pau, La Rochelle, Pays basque, Angoulême, Niort); boats other than Le Bato, no bike. A network that takes bikes gets its own rule, and that is a new decision (ADR-0007).
4. A regional feed that fails validation (`checkFeed`, `lostTrips`) gives way to its last good copy, up to 7 days, and the run says so; TBM, SNCF and OSM still block the release.
5. Credits: Nouvelle-Aquitaine Mobilités in the footer (`layouts/Base.astro`), linking to a "Sources des données" page that lists each operator of `agency.txt` with its link; `golden/dataset/README.md`.
6. Frozen dataset re-frozen on a Tuesday every feed covers, the golden routes' dates moved: GR9 Gare de Périgueux → Thenon at 8:40 by transit, `some: coach` (coach 336); GR10 Gare de Périgueux → Boulazac at 10:30 by transit, `some: bus`.
7. Display: a coach step reads "Car …" with the `coach` icon (`ui/format.ts`, `ui/icons.ts`).
8. Checks: `npm run check`; golden routes GR1 to GR10; `refresh-data.sh` with trips per feed; Firefox at 360 px: an address in Périgueux by Péribus, a coach step, a city bus refused to a bike and allowed to a folding bike.

## Notes

- Measured on 2026-10-31: the feed without TBM holds 64,284 trips and 1,667 routes, 516 MB unzipped. Its cost on the import and the engine's memory is estimated, not measured: about +150 to 250 MB of release.

**Measure:** trips per feed; release ? → ?; engine serving 670 MB → ?.
