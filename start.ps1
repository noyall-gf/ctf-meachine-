$ErrorActionPreference = "Stop"

docker compose up --build -d
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to start ShopNest. Make sure Docker Desktop is running."
  exit 1
}

Write-Host "ShopNest CTF is running at http://localhost:3000"
Write-Host "The SQLite database is stored in the Docker volume: shopnest-data"
