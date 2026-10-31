# Story 015: Data built in CI

- **PRD:** E2.6 (the criteria live there; it changes E2.2)
- **Status:** Draft, after E1.2 (the SSH deploy with a forced command)
- **Golden routes:** run: GR1 to GR10 as today; added: none, a smoke search on each new release
- **Budgets touched:** NFR4, NFR5

## Plan

1. A `data` workflow, started by `workflow_dispatch`: the pipeline's container builds the release on the runner, OSM from `osm-area`, the regional feed's last good copy in the Actions cache.
2. Smoke search: the engine starts on the new release, Bordeaux → Thenon must find a TER with the bike, or the run fails and sends nothing.
3. Sending: the release as one `tar.gz` over SSH to `maillon-data receive <id>`; before the build, `maillon-data current` gives the trip counts that `lostTrips` compares; `maillon-data rollback`.
4. On the server, by the maintainer: `scripts/maillon-data.sh` behind the key's forced command; a nightly timer that starts `data` and `freshness` with a token limited to this repository's Actions; the pipeline service leaves the server's Compose file.
5. The `data` environment: the key and the host as secrets, no reviewer, `main` only.
6. Checks: one run end to end; a broken feed keeps `current`; a rollback; `/health` gives the new data's age (NFR4).

## Notes

- Needs the maintainer on the server: the key, the script, the timer and the token (ADR-0008).

**Measure:** a nightly build ? min, ? MB sent; memory kept on the server for the import 1.6 GB → 0.
