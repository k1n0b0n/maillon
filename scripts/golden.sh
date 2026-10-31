#!/bin/sh
# Golden routes (E2.3): a release of the frozen dataset, the engine restarted on it, then golden/routes.yaml.
# A Compose project of its own keeps the development data and ports untouched.
set -eu
cd "$(dirname "$0")/.."
export COMPOSE_PROJECT_NAME=maillon-golden MOTIS_PORT="${GOLDEN_MOTIS_PORT:-18080}" APP_PORT="${GOLDEN_APP_PORT:-14321}"
docker compose run --build --rm -v "$PWD/golden/dataset:/dataset:ro" -e PIPELINE_TODAY="$(cat golden/dataset/day.txt)" \
  -e TBM_GTFS_URL=file:///dataset/tbm -e SNCF_GTFS_URL=file:///dataset/sncf -e OSM_URL=file:///dataset/area.osm.pbf \
  pipeline
docker compose up -d --force-recreate motis
docker compose run --rm --no-deps app npm run golden
