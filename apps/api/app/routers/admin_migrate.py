from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import require_admin_token
from app.core.migrate import run_migrations

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/migrate")
def admin_migrate(_: None = Depends(require_admin_token)):
    try:
        run_migrations()
        return {"ok": True, "message": "migrations applied"}
    except Exception as e:
        # TEMP: on renvoie le type + message pour debug
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")