#!/bin/sh
# Smoke test of a running app, in CI and after every deploy: health answers, the home page credits its data (NFR6).
set -eu
base=${1:?usage: smoke.sh <base url>}

tries=0
until curl -sf --max-time 5 -o /dev/null "$base/health"; do
  tries=$((tries + 1))
  [ "$tries" -lt 30 ] || { echo "smoke: no answer from $base/health" >&2; exit 1; }
  sleep 1
done
curl -sf --max-time 10 "$base/" | grep -q 'OpenStreetMap' || { echo "smoke: the home page does not credit its data" >&2; exit 1; }
echo "smoke: $base answers"
