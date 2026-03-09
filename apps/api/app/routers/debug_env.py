from __future__ import annotations

import os
from fastapi import APIRouter, Depends

from app.core.auth import require_admin_token
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["admin-debug"])


@router.get("/debug-env")
def debug_env(_: None = Depends(require_admin_token)):
    def mask(v: str | None) -> str | None:
        if not v:
            return v
        if len(v) <= 8:
            return "***"
        return v[:4] + "..." + v[-4:]

    return {
        "ENV": settings.ENV,
        "DATABASE_URL_settings": settings.DATABASE_URL,          # tel que lu par pydantic
        "database_url_normalized": settings.database_url,        # après normalize_database_url
        "DATABASE_URL_osenv": os.getenv("DATABASE_URL"),
        "PORT_osenv": os.getenv("PORT"),
        "STRIPE_SECRET_KEY": mask(os.getenv("STRIPE_SECRET_KEY")),
        "JWT_SECRET": mask(os.getenv("JWT_SECRET")),
    }