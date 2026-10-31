#!/bin/sh
# Builds a new release of the engine's data, then restarts the engine on it (E2.2). The current release stays on failure.
set -eu
cd "$(dirname "$0")/.."
docker compose run --build --rm pipeline
docker compose restart motis
