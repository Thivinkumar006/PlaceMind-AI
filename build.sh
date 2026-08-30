#!/usr/bin/env bash
# exit on error
set -o errexit

cd backend
pip install -r requirements.txt
alembic upgrade head
cd ..

# Remove the hacky app wrapper and replace it with a symlink to backend/app
# This ensures that `uvicorn app.main:app` works flawlessly on Render!
rm -rf app
ln -s backend/app app
