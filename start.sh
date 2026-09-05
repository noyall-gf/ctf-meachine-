#!/usr/bin/env sh
set -e

PORT="${HOST_PORT:-9000}"
export HOST_PORT="$PORT"

if command -v docker >/dev/null 2>&1; then
  DOCKER_CMD="docker"
elif command -v sudo >/dev/null 2>&1 && sudo docker --version >/dev/null 2>&1; then
  DOCKER_CMD="sudo docker"
else
  printf "Docker is not installed. Please install Docker first.\n"
  exit 1
fi

$DOCKER_CMD compose up --build -d

printf "\n======================================================\n"
printf "  🚀 ShopNest CTF is running successfully!\n"
printf "  🌐 Visit URL: http://localhost:%s\n" "$PORT"
printf "  💾 Database volume: shopnest-data\n"
printf "======================================================\n\n"
