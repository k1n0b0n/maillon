# ADR-0001: Routing engine

- **Status:** Accepted
- **Date:** 2026-10-26

## Context

maillon compares walking, cycling, transit and transit with the bike on board, door to door, now or over the coming days. Building a router is out of the question; the choice is between MOTIS 2 and OpenTripPlanner 2. MOTIS was the hypothesis, OTP the fallback if MOTIS failed a criterion of E2.1. Measured with MOTIS v2.11.4 on TBM, SNCF and OSM Gironde (story 001):

| Measure | Value |
|---|---|
| GR1 to GR5, transit + bike, data as published | GR3 and GR5 fail (no tram, no train), GR1 finds nothing at all; Le Bato is the only vehicle that takes a bike |
| GR1 to GR5, bike rules applied to `bikes_allowed` | 5 of 5 hold |
| Import, capped at 2 CPUs and 1 GB | 26 s; fails at 768 MB |
| Serving, capped at 2 CPUs and 512 MB | 314 MB after 400 requests |
| One search (2 requests), 200 random pairs of stops, 2 CPUs | p50 120 ms, p95 175 ms |
| First geocoder answer, 13 typical inputs | MOTIS 12 right (8 to 33 ms); BAN 11 right (120 to 180 ms) |

## Decision

- **MOTIS 2**, the official Alpine image pinned to an exact version, in its own container; the app talks to its REST API (`/api/v6/plan`, `/api/v1/geocode`) through an adapter.
- A search is two requests: walk, bike and transit together (`directModes=WALK,BIKE`), then transit + bike (`requireBikeTransport`, bike before and after, no direct mode). The folding bike drops `requireBikeTransport`.
- **Bikes on board come from the data, not the engine**: the pipeline writes `bikes_allowed` on every trip (E2.2). MOTIS's `default_bikes_allowed` is per dataset, so it would let bikes on every bus or every TGV.
- **The MOTIS geocoder serves M1** for stops, places and streets. It misses a house number that OSM lacks ("12 rue Sainte-Catherine" gives the 122), where the BAN is exact; E4.1 measures whether a BAN fallback for typed house numbers pays.

## Alternatives considered

| Option | Why not |
|---|---|
| OpenTripPlanner 2 | Not tried: MOTIS met every criterion. Java, several GB of memory for a region, a GraphQL API |
| BAN as the only geocoder | No TBM stops, wrong town for "Lormont Bas" and "sainte catherine", a third-party call per keystroke |

## Consequences

- Easier: 10 times under the 2 s target, one container, no third party for routing or place names.
- Harder: the bike rules are ours to maintain, dated and sourced (E2.2), and a trip overlapping a peak loses its bike for its whole run: 5,546 of the 15,210 tram trips.
- The import needs about 1 GB for a few seconds; E2.2 decides whether it runs on the server or in CI.
- Revisit if bike sharing (GBFS, experimental in MOTIS) or the folding bike semantics stop matching what MOTIS does.
