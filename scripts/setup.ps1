Write-Host "======================================"
Write-Host " Setting up DARKPATTERN-AI Project    "
Write-Host "======================================"

# Check for Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed. Please install Docker and try again."
    exit 1
}

Write-Host "[1/4] Setting up environment variables..."
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "Created .env from .env.example. Please review the values."
} else {
    Write-Host ".env file already exists. Skipping."
}

Write-Host "[2/4] Initializing frontend..."
Set-Location frontend
if (Test-Path package.json) {
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        npm install
    } else {
        Write-Host "npm not found, skipping frontend initialization"
    }
} else {
    Write-Host "Frontend not initialized yet, skipping npm install."
}
Set-Location ..

Write-Host "[3/4] Building and starting Docker containers..."
docker compose up -d --build

Write-Host "[4/4] Waiting for database to be ready and running migrations..."
Start-Sleep -Seconds 15
docker compose exec backend flask db upgrade
if ($LASTEXITCODE -ne 0) {
    Write-Host "Migration failed or already up to date. You may need to run 'flask db init' first."
}

Write-Host "======================================"
Write-Host " Setup complete!                      "
Write-Host " Backend running at: http://localhost:5000"
Write-Host " Frontend running at: http://localhost:5173"
Write-Host " MLflow running at: http://localhost:5001"
Write-Host "======================================"
