#!/usr/bin/env sh
set -e

PORT="${HOST_PORT:-9000}"
export HOST_PORT="$PORT"

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
elif sudo docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="sudo docker compose"
elif command -v sudo >/dev/null 2>&1 && sudo docker-compose --version >/dev/null 2>&1; then
  COMPOSE_CMD="sudo docker-compose"
else
  printf "Docker / Docker Compose is not installed or running.\n"
  printf "Run: sudo apt update && sudo apt install -y docker.io docker-compose-plugin && sudo systemctl start docker\n"
  exit 1
fi

$COMPOSE_CMD up --build -d

printf "\n======================================================\n"
printf "  🚀 ShopNest CTF is running successfully!\n"
printf "  🌐 Visit URL: http://localhost:%s\n" "$PORT"
printf "  💾 Database volume: shopnest-data\n"
printf "======================================================\n\n"
