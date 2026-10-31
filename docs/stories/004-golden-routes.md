# Story 004: Golden routes in CI

- **PRD:** E2.3 (the criteria live there)
- **Status:** Done
- **Golden routes:** run: GR1 to GR5; added: GR1 to GR5 as tests
- **Budgets touched:** none

## Plan

1. The domain's itinerary and the engine adapter that compares the four options, used by the golden routes and by E3.1.
2. A frozen dataset in the repository, and the pipeline reading `file:` sources.
3. `golden/routes.yaml` run by Vitest against the engine; `scripts/golden.sh` locally and in CI's `golden` job.
4. Prove the net: bikes allowed on buses on purpose turn CI red.

## Notes

- The dataset could not be a release asset (refused to the agent): it lives in `golden/dataset`, one Tuesday (TBM 6,536 trips, SNCF 433) and the streets around the routes. OSM filtered to streets: 22 MB → 4 MB.
- Its calendars and `feed_info` cover that day only, so the engine loads one day and the result does not depend on today's date.
- `golden.sh` runs in its own Compose project, and rebuilds the pipeline image: it holds the code of the bike rules.
- The net failed on purpose: buses allowed with a bike made GR1 to GR5 red (see the pull request's checks).

**Measure:** the golden job imports a release in 1.3 s and runs the five routes in 0.3 s.
