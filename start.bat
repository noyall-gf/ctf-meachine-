@echo off
setlocal

if "%HOST_PORT%"=="" set HOST_PORT=9000

docker compose up --build -d
if errorlevel 1 (
  echo Failed to start ShopNest. Make sure Docker Desktop is running.
  exit /b 1
)

echo.
echo ======================================================
echo   ShopNest CTF is running at http://localhost:%HOST_PORT%
echo   Database volume: shopnest-data
echo ======================================================
echo.
