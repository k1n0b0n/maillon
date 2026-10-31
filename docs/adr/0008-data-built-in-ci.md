# ADR-0008: Data built in CI, sent to the server

- **Status:** Accepted
- **Date:** 2026-10-31

## Context

ADR-0004 imports on the server, capped at 1.6 GB, and kept "import in CI, ship the data as an image" as the way out. Nouvelle-Aquitaine needs 3 GB (ADR-0007). GitHub's runners give a public repository 4 CPUs and 16 GB for free. Measured on 2026-10-28 on 2 CPUs: the region's import takes 92 s (streets 35 s, geocoder 47 s, timetables 3 s); its release weighs 944 MB, 374 MB compressed. A public image would distribute the database itself: the SNCF trips we change, OSM and the regional feed, under ODbL's share-alike and transport.data.gouv.fr's republication terms. The app's `/health` reads the release's `release.json` from the engine's volume. GitHub pauses the scheduled workflows of a public repository after 60 days without activity.

## Decision

- **A `data` workflow builds the release each night** with the pipeline's code as it is: downloads, validation, bike rules, import. OSM comes from the `osm-area` asset; the regional feed's last good copy lives in the Actions cache (ADR-0007).
- **A smoke search before sending**: the engine starts on the new release in CI, and Bordeaux → Thenon must find a TER with the bike.
- **Sent as one compressed archive over SSH**, to a key whose forced command is `maillon-data`, as balise's deploy key: `receive <id>` unpacks into `releases/<id>`, switches `current` and restarts the engine; `current` prints `release.json`, for the trip counts the validation compares; `rollback` switches back. The server keeps the previous release, never imports, and loses the pipeline service.
- **Nothing is published**: the archive is never an image nor a workflow artifact, which anyone signed in could download. ADR-0004's ODbL reasoning holds.
- **The server's nightly timer starts the workflow** through `workflow_dispatch`, with a token limited to this repository's Actions, and starts the `freshness` check the same way: a quiet repository cannot stop the data, and a failure notifies the maintainer, the token's owner.
- **The `data` environment** holds the key and the host, with no reviewer, for `main` only.
- **On the Mac**, `scripts/refresh-data.sh` still builds locally; the pipeline's memory cap rises to fit the region.

This amends ADR-0004: the import leaves the server, and the OSM is merged instead of clipped.

## Alternatives considered

| Option | Why not |
|---|---|
| An image on GHCR, pulled by the server | A public image distributes the database; `/health` loses `release.json`; a switch of 2 to 3 s; private packages have quotas |
| The server pulls a workflow artifact | Artifacts of a public repository can be downloaded by anyone signed in |
| Import on the server with swap | Slower each night, with memory the server shares |
| GitHub's schedule | Paused after 60 days without activity, and often late |

## Consequences

- Easier: any area the runner fits; a release is tested before it serves; the server's memory goes to serving.
- Harder: the data depends on GitHub Actions (a night without it keeps yesterday's data, and the 48 h alert covers it); two credentials to keep, the key and the token; 375 MB sent each night; E1.2's SSH deploy comes first.
- Revisit if the release outgrows the runner (16 GB of memory, 14 GB of disk) or the nightly transfer gets slow.
