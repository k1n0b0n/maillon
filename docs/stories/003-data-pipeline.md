# Story 003: Nightly data and bike rules

- **PRD:** E2.2 (the criteria live there)
- **Status:** Done
- **Golden routes:** run by hand: GR2, GR3, GR5 on the first release; in CI with E2.3
- **Budgets touched:** NFR4 (data age in `/health`)

## Plan

1. The bike rules in the domain, sourced and dated; the GTFS adapter that rewrites `bikes_allowed`.
2. The pipeline: download, validate, import, publish a release; `scripts/refresh-data.sh` restarts the engine.
3. The `osm` workflow that clips the Gironde each week; the `freshness` workflow that checks production.
4. ADR-0004.

## Notes

- Sources checked on 2026-10-26: Bordeaux Métropole for TBM (tram peaks every day, 6 bikes per boat on Le Bato, where the planning had 10), TER Nouvelle-Aquitaine for trains (free outside summer, a €3 bike ticket on 11 lines from 1 May to 27 September).
- osmium needs 4.1 GB to clip with whole ways: the clipping moved to CI. Creating the `osm-gironde` release was refused to the agent, so the first release ran on the spike's extract, copied into the volume.
- The MOTIS server needs only `data/`, started from its parent folder: the inputs are deleted after the import.
- Criterion "no interruption": the engine restarts in under a second; the app's engine adapter retries (E3.1).
- Checked by hand: a broken source exits with 1 and keeps `current`; `refresh-data.sh` then skips the restart.

**Measure:** a release in 37 s (TBM 68,534 trips, 11,220 with bikes; SNCF 57,268, 38,117 with bikes); 312 MB per release.
