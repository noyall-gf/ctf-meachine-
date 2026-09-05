#!/usr/bin/env sh
set -e

PORT="${HOST_PORT:-9000}"
export HOST_PORT="$PORT"

# Check if non-root user can connect to docker socket, otherwise use sudo
if docker ps >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1 && docker-compose ps >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
elif command -v sudo >/dev/null 2>&1 && sudo docker ps >/dev/null 2>&1; then
  if sudo docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="sudo docker compose"
  else
    COMPOSE_CMD="sudo docker-compose"
  fi
else
  printf "Docker daemon is not running or accessible.\n"
  printf "Try running: sudo systemctl start docker\n"
  exit 1
fi

# Stop any previous container using the same port or name
if command -v docker >/dev/null 2>&1; then
  docker rm -f ctf-meachine--shopnest-1 2>/dev/null || true
elif command -v sudo >/dev/null 2>&1; then
  sudo docker rm -f ctf-meachine--shopnest-1 2>/dev/null || true
fi

$COMPOSE_CMD up --build -d

printf "\n======================================================\n"
printf "  🚀 ShopNest CTF is running successfully!\n"
printf "  🌐 Visit URL: http://localhost:%s\n" "$PORT"
printf "  💾 Database volume: shopnest-data\n"
printf "======================================================\n\n"
