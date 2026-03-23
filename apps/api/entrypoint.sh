#!/bin/sh
set -e

echo "[entrypoint] ENV=$ENV"
echo "[entrypoint] Running migrations..."
alembic upgrade head

echo "[entrypoint] Running seed..."
python -m app.scripts.seed

echo "[entrypoint] Starting API..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
