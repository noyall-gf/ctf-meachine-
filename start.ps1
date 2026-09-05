$ErrorActionPreference = "Stop"

if ([string]::IsNullOrEmpty($env:HOST_PORT)) { $env:HOST_PORT = "9000" }

docker compose up --build -d
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to start ShopNest. Make sure Docker Desktop is running."
  exit 1
}

Write-Host "`n======================================================" -ForegroundColor Green
Write-Host "  🚀 ShopNest CTF is running at http://localhost:$($env:HOST_PORT)" -ForegroundColor Cyan
Write-Host "  💾 Database volume: shopnest-data" -ForegroundColor Yellow
Write-Host "======================================================`n" -ForegroundColor Green
