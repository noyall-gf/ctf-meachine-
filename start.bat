@echo off
setlocal

docker compose up --build -d
if errorlevel 1 (
  echo Failed to start ShopNest. Make sure Docker Desktop is running.
  exit /b 1
)

echo ShopNest CTF is running at http://localhost:3000
