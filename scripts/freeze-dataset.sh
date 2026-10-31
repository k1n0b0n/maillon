#!/bin/sh
# Rebuilds golden/dataset (E2.3) from the data volume's last downloads: one service day of each feed, and the
# golden routes' areas of OSM, Bordeaux and Thenon, streets only: the golden routes give coordinates, not names.
# Run scripts/refresh-data.sh first; osmium runs in a Debian container (ADR-0004).
set -eu
day=${1:?usage: freeze-dataset.sh YYYY-MM-DD}
cd "$(dirname "$0")/.."
rm -rf golden/dataset
mkdir -p golden/dataset
docker compose run --rm -v "$PWD/golden/dataset:/dataset" pipeline node src/pipeline/freeze.ts "$day" /dataset
docker run --rm -v "${COMPOSE_PROJECT_NAME:-maillon}_data:/data:ro" -v "$PWD/golden/dataset:/dataset" debian:trixie-slim sh -c \
  'apt-get -qq update && apt-get -qq install -y osmium-tool > /dev/null \
    && osmium extract --strategy complete_ways --bbox -0.70,44.78,-0.50,44.90 /data/downloads/area.osm.pbf --output /tmp/bordeaux.osm.pbf \
    && osmium extract --strategy complete_ways --bbox 1.03,45.12,1.10,45.18 /data/downloads/area.osm.pbf --output /tmp/thenon.osm.pbf \
    && osmium merge /tmp/bordeaux.osm.pbf /tmp/thenon.osm.pbf --output /tmp/area.osm.pbf \
    && osmium tags-filter /tmp/area.osm.pbf nwr/highway nwr/public_transport nwr/railway=platform r/type=restriction \
      nwr/amenity=ferry_terminal w/route=ferry --output /dataset/area.osm.pbf'
echo "$day" > golden/dataset/day.txt
