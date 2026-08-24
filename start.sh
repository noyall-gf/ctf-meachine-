#!/usr/bin/env sh
set -e

docker compose up --build -d
printf '%s\n' 'ShopNest CTF is running at http://localhost:3000'
