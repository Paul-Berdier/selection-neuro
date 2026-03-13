from __future__ import annotations

from fastapi import Depends

from app.core.deps import require_admin
from app.models.user import User


def require_admin_token(user: User = Depends(require_admin)) -> None:
    """
    Compat legacy:
    les anciennes routes qui dépendent encore de require_admin_token
    sont désormais protégées par le vrai JWT admin.
    """
    return None