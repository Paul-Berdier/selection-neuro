from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import require_admin
from app.core.migrate import run_migrations
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/migrate")
def admin_migrate(_: User = Depends(require_admin)):
    try:
        run_migrations()
        return {"ok": True, "message": "migrations applied"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"{type(exc).__name__}: {exc}") from exc