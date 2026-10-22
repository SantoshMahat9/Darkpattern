#!/bin/bash
set -e

echo "======================================"
echo " Setting up DARKPATTERN-AI Project    "
echo "======================================"

# Check for Docker
if ! command -v docker &> /dev/null
then
    echo "Docker is not installed. Please install Docker and try again."
    exit 1
fi

echo "[1/4] Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env from .env.example. Please review the values."
else
    echo ".env file already exists. Skipping."
fi

echo "[2/4] Initializing frontend..."
cd frontend
if [ ! -f package.json ]; then
    echo "Frontend not initialized yet, skipping npm install."
else
    npm install
fi
cd ..

echo "[3/4] Building and starting Docker containers..."
docker compose up -d --build

echo "[4/4] Waiting for database to be ready and running migrations..."
# Simple wait loop for db
sleep 15
docker compose exec backend flask db upgrade || echo "Migration failed or already up to date. You may need to run 'flask db init' first."

echo "======================================"
echo " Setup complete!                      "
echo " Backend running at: http://localhost:5000"
echo " Frontend running at: http://localhost:5173"
echo " MLflow running at: http://localhost:5001"
echo "======================================"
