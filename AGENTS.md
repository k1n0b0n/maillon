# maillon — agent instructions

## Project

Door-to-door trip planner for Bordeaux that compares walking, cycling, public transport, and public transport with the bike on board (tram outside peak hours, TER, Le Bato; never the bus). Product first: real users, and simplicity is the value. The interface is in French.

Status: M0. The stack is a hypothesis until its ADRs are accepted (`docs/architecture.md`):

- Engine: MOTIS 2 in its own container (ADR-0001).
- App: Astro SSR on Node with Vue 3 islands, TypeScript strict.
- Data: a nightly pipeline (TBM GTFS, SNCF GTFS, OSM Gironde) that applies the bike rules to `bikes_allowed`.
- No database, no Redis.

## Start of a session

1. Read *Current state* in `docs/README.md`.
2. Follow `docs/README.md`: it is the only place where the process rules live (story loop, pull requests, done, milestones).

## Commands

None yet. Each story adds its commands here; everything runs in Docker and nothing else is needed on the host.

## Code rules

- Code, docs, comments and commit messages in English; Conventional Commits.
- TypeScript strict, no `any`. Vue: Composition API only, composables rather than mixins.
- `domain/` is plain TypeScript: no framework, no I/O, no import from `adapters/`.
- Only `adapters/` talks to outside systems (the engine, the geocoder, the data sources).
- The search lives in the URL, never in a store; pages render on the server and work without JavaScript.
- JavaScript ships only in the islands that need it (place autocomplete, map).
- Comments say why, never what; no commented-out code, no `console.log` in a commit.
- Docker images from the official Alpine ones, unless an ADR records a constraint.

## Public repository

Never write the production server's name, address, port, users or paths, nor the other services on it. Say "the server"; the values live in GitHub secrets and variables, or in an ignored local inventory.

## Data

TBM timetables (Licence Ouverte), SNCF timetables (ODbL), OpenStreetMap (ODbL). The facts that shape the product are in `docs/brief.md`.
