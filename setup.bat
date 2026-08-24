@echo off
setlocal enabledelayedexpansion

echo === ShopNest CTF Setup ===
echo This script will download Node.js v22 and install project dependencies.

set NODE_VERSION=22.0.0
set NODE_TAR=node-v%NODE_VERSION%-win-x64.zip
set NODE_URL=https://nodejs.org/dist/v%NODE_VERSION%/%NODE_TAR%
set NODE_DIR=%CD%\node-v%NODE_VERSION%-win-x64

echo Downloading Node.js v%NODE_VERSION%...
powershell -Command "& { (New-Object System.Net.ServicePointManager).SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%NODE_TAR%' }" || (
    echo Failed to download Node.js. Check your internet connection.
    exit /b 1
)

echo Extracting Node.js...
powershell -Command "& { Expand-Archive -Path '%NODE_TAR%' -DestinationPath '%CD%' }"
del %NODE_TAR%

echo Installing dependencies...
set PATH=%NODE_DIR%;%NODE_DIR%\bin;%PATH%

call node --version
call npm --version

call npm ci --legacy-peer-deps

echo.
echo === Setup Complete ===
echo Starting CTF application...
echo Visit: http://localhost:3000
echo.

call npm run dev
pause
