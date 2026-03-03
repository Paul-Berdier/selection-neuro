from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import require_admin_token
from app.core.migrate import run_migrations

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/migrate")
def admin_migrate(_: None = Depends(require_admin_token)):
    run_migrations()
    return {"ok": True, "message": "migrations applied"}