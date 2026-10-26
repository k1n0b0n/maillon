# Story 001: Routing engine spike

- **PRD:** E2.1 (the criteria live there)
- **Status:** Done
- **Golden routes:** run: GR1 to GR5; added: none (stops of GR1 and GR4 chosen)
- **Budgets touched:** NFR3 (first measure)

## Plan

1. Download TBM GTFS, SNCF GTFS and OSM; run MOTIS v2.11.4 on the data as published and with the bike rules applied.
2. Run GR1 to GR5 on both; try the folding bike, arrive by, and the direct modes.
3. Measure import, memory and response time, capped at 2 CPUs; compare the MOTIS geocoder with the BAN.
4. Write ADR-0001.

## Notes

- Decision and measures in [ADR-0001](../adr/0001-routing-engine.md): MOTIS 2, OTP not needed.
- The openstreetmap.fr Gironde extract cuts ways at its border and MOTIS stops on `invalid location`; Geofabrik's Aquitaine clipped by `osmium extract -s complete_ways` to the Gironde's bounding box works (115 MB, 4 s).
- The SNCF GTFS (ODbL, TGV, Intercités and TER together) has no `bikes_allowed` column: without it, no train takes a bike. A trip's kind is in its stops' ids (`StopPoint:OCETrain TER-…`); the spike let bikes on "Train TER" and "TramTrain" only, TER rules still to check in E2.2.
- The spike applied the tram peaks every day of the week; E2.2 checks whether they hold on weekends.
- Changing the SNCF trips makes a derivative database under ODbL; publishing the pipeline's code shares the method, as ODbL 4.6 allows (E2.2's ADR).
- MOTIS drops a walk longer than `maxDirectTime` without a word: the walk request sets it (6 h at most, MOTIS's own limit).
- MOTIS names Le Bato `FERRY` and the TER `REGIONAL_RAIL`; a change between two trams with a bike shows as a 2-minute walk.
- The spike scripts stay out of the repository: E2.2 builds the rules properly, E2.3 replays the routes.

**Measure:** golden routes holding with a bike on board: 2 of 5 on the published data → 5 of 5 with the bike rules; search p95 175 ms (2 CPUs).
