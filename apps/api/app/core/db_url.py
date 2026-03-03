from __future__ import annotations


def normalize_database_url(url: str) -> str:
    """
    Railway/Heroku style: postgres://user:pass@host/db
    SQLAlchemy psycopg3:  postgresql+psycopg://user:pass@host/db
    """
    u = url.strip()
    if u.startswith("postgres://"):
        u = "postgresql+psycopg://" + u[len("postgres://") :]
    return u