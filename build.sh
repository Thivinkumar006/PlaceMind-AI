#!/usr/bin/env bash
# exit on error
set -o errexit

echo "==> [1/4] Installing Node.js frontend dependencies..."
cd frontend
npm install

echo "==> [2/4] Building Next.js frontend (static export → frontend/out/)..."
npm run build
cd ..

echo "==> [3/4] Installing Python backend dependencies..."
cd backend
pip install -r requirements.txt

echo "==> [4/4] Running Alembic database migrations..."
if [ -z "$SQLALCHEMY_DATABASE_URI" ]; then
    echo "ERROR: SQLALCHEMY_DATABASE_URI is not set in environment variables!"
    exit 1
fi
echo "==> Database URL is set (starts with: ${SQLALCHEMY_DATABASE_URI:0:30}...)"
alembic upgrade head
cd ..

echo "==> Build complete! Frontend static files in frontend/out/"
