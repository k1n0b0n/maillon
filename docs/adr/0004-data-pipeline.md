# ADR-0004: Data pipeline and bike rules

- **Status:** Accepted; the import on the server and the Gironde's clip superseded by ADR-0008 (data built in CI) and ADR-0007 (Nouvelle-Aquitaine)
- **Date:** 2026-10-26

## Context

The engine needs fresh timetables, and bikes on board come from `bikes_allowed` (ADR-0001), which the open data gets wrong: 0 for every TBM tram and bus, no column at all in the SNCF feed. TBM and SNCF publish daily. The server has little memory to spare: the MOTIS import needs 1 GB, and clipping OSM with whole ways needs 4.1 GB (osmium, `complete_ways`; 2.2 GB with `simple`, which leaves ways the engine cannot import).

## Decision

- **A nightly job builds a release**: download, validate, apply the bike rules, import, switch. It runs in its own container (Node on Alpine, with the MOTIS binary from the pinned image), capped at 1.6 GB, and `scripts/refresh-data.sh` restarts the engine on success.
- **Validation**: the GTFS files and a calendar are there, no feed has ended, and no feed lost more than half of its trips since the current release. The days loaded run up to the first feed's end (120 at most).
- **Bike rules in the domain** (`BIKE_RULES`), one per vehicle, each with its source and the date it was checked. A trip that overlaps a peak loses its bike for its whole run.
- **Releases**: `releases/<id>` holds only the engine's data (312 MB), and `current` is a symlink switched by a rename. The previous release is kept for rollback, older ones deleted. A failure leaves `current` untouched and exits with 1.
- **OSM clipped in CI** each week by the `osm` workflow and published as the `osm-gironde` release asset (ODbL). The server downloads 115 MB instead of 297 MB and never runs osmium.
- **Alerts**: the `freshness` workflow checks production's `/health` each morning and fails, which e-mails the maintainer, when the data is older than 48 h or the engine is down.
- **ODbL**: the SNCF trips we change make a derivative database; this repository publishes the method, as ODbL 4.6 allows.

## Alternatives considered

| Option | Why not |
|---|---|
| MOTIS's `default_bikes_allowed` | Per dataset: it would let bikes on every bus or every TGV |
| Import in CI, ship the data as an image | 312 MB to pull each night and serving tied to GitHub; kept as the way out if the server's memory gets short |
| Split tram trips at the peaks' edges | Invents trips the network does not publish; reconsider if riders report trams refused just outside a peak |

## Consequences

- Easier: a release is tested whole before it serves, rollback is a symlink, and the rules are reviewed like code.
- Harder: the bike rules are ours to keep current; the engine is down for under a second at each switch.
