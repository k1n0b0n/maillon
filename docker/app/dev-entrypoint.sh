#!/bin/sh
# Installs the dependencies when the node_modules volume lacks them or package-lock.json changed, for every command.
set -eu
stamp=node_modules/.package-lock.sha256
lock=$(sha256sum package-lock.json | cut -d ' ' -f 1)
if [ "$(cat "$stamp" 2> /dev/null)" != "$lock" ]; then
  npm ci --no-fund --no-audit
  echo "$lock" > "$stamp"
fi
exec "$@"
