#!/bin/sh
set -eu

if [ ! -f /app/data/ctf.sqlite ]; then
  mkdir -p /app/data
  cp /app/seed-data/ctf.sqlite /app/data/ctf.sqlite
fi

exec "$@"