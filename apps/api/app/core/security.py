from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    expire_minutes = getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 60)
    expire = datetime.utcnow() + timedelta(minutes=int(expire_minutes))

    payload: dict[str, Any] = {"sub": subject, "exp": expire}
    if extra_claims:
        payload.update(extra_claims)

    secret = settings.JWT_SECRET
    alg = getattr(settings, "JWT_ALGORITHM", "HS256")
    return jwt.encode(payload, secret, algorithm=alg)