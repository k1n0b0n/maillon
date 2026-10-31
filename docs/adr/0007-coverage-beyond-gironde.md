# ADR-0007: Nouvelle-Aquitaine and its networks

- **Status:** Accepted
- **Date:** 2026-10-31

## Context

maillon covers the Gironde's box (ADR-0004); the maintainer wants trips beyond it, such as Bordeaux → Thenon by TER with the bike. The SNCF feed already holds every TER of the region: only the area stops them. Measured on 2026-10-28, MOTIS 2.11.4 on 2 CPUs, swap off, 87 days, TBM, SNCF, the Dordogne and Gironde coaches and Péribus:

| Area | OSM | Smallest memory cap | Import | Release | Serving | p95 to Thenon |
|---|---|---|---|---|---|---|
| Gironde today | 115 MB | 1 GB | 23 s | 343 MB | 377 MB | out of area |
| Corridor to Thenon | 126 MB | 1 GB | 25 s | 358 MB | 380 MB | 246 ms |
| Gironde and Dordogne | 178 MB | 1.6 GB, 5 times slower | 33 s | 429 MB | 437 MB | 303 ms |
| Nouvelle-Aquitaine | 628 MB | 3 GB | 92 s | 944 MB | 670 MB | 357 ms |

Within Bordeaux, the p95 moves from 165 to 175 ms. The peak is the street graph's node counter, which grows with the spread of OSM node ids, not with the data: filtering tags barely moves it, and renumbering the ids makes the geocoder's import never end. Nouvelle-Aquitaine Mobilités publishes one GTFS for 46 networks besides TBM (`brief.md`).

## Decision

- **The area is Nouvelle-Aquitaine.** OSM: Geofabrik's Aquitaine, Limousin and Poitou-Charentes merged each week, published as the `osm-area` asset in place of `osm-gironde`. The area check uses the region's simplified outline, one source for the domain and the frozen dataset.
- **Its networks come from the regional GTFS** without TBM's agency; TBM's own feed stays, updated daily. One feed instead of 46: its publisher keeps it current, renamed networks included.
- **Vehicles by agency**: the "Cars régionaux" agencies are coaches, `route_type` 4 boats, the rest buses.
- **Bike rules**: a coach takes only a folded bike (booked the day before, limited places, some lines, no e-bikes); a bus too, unless its network's sourced rule says otherwise; a boat other than Le Bato takes no bike until a sourced rule says so.
- **The regional feed is imported as published**: its "no information" already means no bike under these rules, so nothing makes a derived database. A rule that lets bikes on one of its networks would make one, to republish on transport.data.gouv.fr under its special terms: that decision waits for such a rule.
- **Credits**: every page credits Nouvelle-Aquitaine Mobilités and links to a page that lists every network's producer, as the special terms allow.
- **A broken regional feed** gives way to its last good copy for up to 7 days, with an alert (kept as ADR-0008 says); TBM, SNCF or OSM failing still blocks the release. With no `feed_info.txt`, the feed ends on its calendar's last day.

## Alternatives considered

| Option | Why not |
|---|---|
| The corridor to Thenon | Fits today's 1 GB, but Sarlat or Bergerac stay out of area while coaches go there |
| Gironde and Dordogne | Fits the server only at the edge of its memory, and stops at the Dordogne |
| The two departments' coaches and Péribus as three feeds | The regional feed holds them and 43 more networks for the same work |
| Each network's own feed | Finer isolation of a failure, but 46 addresses to keep when networks rename |
| Renumbered OSM ids, to fit the server | The street graph fits in 1 GB, but the geocoder's import never ends |

## Consequences

- Easier: the TER with the bike across the region; buses for "no bike" and "folding bike" in every city.
- Harder: a 3 GB import, more than the server can spare, moves to CI (ADR-0008); the engine serves about 670 MB, more with the city networks; more bike rules to source and keep; a feed whose quality we do not control.
- Revisit if the regional feed breaks often, if a network's rule lets bikes on board, or if another region is wanted.
