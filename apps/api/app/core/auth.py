from __future__ import annotations

from fastapi import Header, HTTPException

from app.core.config import settings


def require_admin_token(
    # 🔒 on force explicitement le nom du header attendu
    x_admin_token: str | None = Header(default=None, alias="X-Admin-Token"),
    # 🛟 fallback si un proxy/outil change la casse / nom
    x_admin_token_alt: str | None = Header(default=None, alias="X-ADMIN-TOKEN"),
) -> None:
    expected = settings.ADMIN_TOKEN
    if not expected:
        raise HTTPException(status_code=500, detail="ADMIN_TOKEN not configured")

    provided = x_admin_token or x_admin_token_alt
    if not provided or provided != expected:
        raise HTTPException(status_code=401, detail="Invalid admin token")