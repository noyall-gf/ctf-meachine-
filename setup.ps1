$ErrorActionPreference = "Stop"

Write-Host "=== ShopNest CTF Setup ===" -ForegroundColor Green
Write-Host "This script will download Node.js v22 and install project dependencies."

$NodeVersion = "22.13.0"
$NodeTar = "node-v${NodeVersion}-win-x64.zip"
$NodeUrl = "https://nodejs.org/dist/v${NodeVersion}/${NodeTar}"
$NodeDir = Join-Path (Get-Location) "node-v${NodeVersion}-win-x64"

Write-Host "`nDownloading Node.js v${NodeVersion}..." -ForegroundColor Yellow
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-WebRequest -Uri $NodeUrl -OutFile $NodeTar -ErrorAction Stop
} catch {
    Write-Host "Failed to download Node.js. Check your internet connection." -ForegroundColor Red
    exit 1
}

Write-Host "Extracting Node.js..." -ForegroundColor Yellow
Expand-Archive -Path $NodeTar -DestinationPath (Get-Location) -Force
Remove-Item $NodeTar -Force

Write-Host "Installing dependencies..." -ForegroundColor Yellow
$env:Path = "${NodeDir};${NodeDir}\bin;$env:Path"

& "$NodeDir\bin\node.exe" --version
& "$NodeDir\bin\npm.cmd" --version

& "$NodeDir\bin\npm.cmd" ci

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host "Starting CTF application..." -ForegroundColor Yellow
if ([string]::IsNullOrEmpty($env:PORT)) { $env:PORT = "3000" }
Write-Host "Visit: http://localhost:$($env:PORT)`n" -ForegroundColor Cyan

& "$NodeDir\bin\npm.cmd" run dev -- --port $env:PORT
