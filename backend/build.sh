#!/usr/bin/env bash
# exit on error
set -o errexit

echo "==> Installing dependencies..."
pip install -r requirements.txt

echo "==> Checking database URL..."
if [ -z "$SQLALCHEMY_DATABASE_URI" ]; then
    echo "ERROR: SQLALCHEMY_DATABASE_URI is not set in environment variables!"
    exit 1
fi
echo "==> Database URL is set (starts with: ${SQLALCHEMY_DATABASE_URI:0:30}...)"

echo "==> Running database migrations..."
alembic upgrade head

echo "==> Build complete!"
