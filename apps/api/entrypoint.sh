#!/bin/sh
set -e

echo "[entrypoint] Running migrations..."
echo "[entrypoint] ENV=$ENV"
echo "[entrypoint] DATABASE_URL=${DATABASE_URL}"
alembic upgrade head

echo "[entrypoint] Starting API..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"