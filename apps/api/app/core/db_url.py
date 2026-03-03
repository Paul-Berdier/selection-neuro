from __future__ import annotations


def normalize_database_url(url: str) -> str:
    """
    Normalize Railway/Heroku URLs to SQLAlchemy psycopg3 driver.

    Inputs we may see:
      - postgres://user:pass@host:port/db
      - postgresql://user:pass@host:port/db

    Output:
      - postgresql+psycopg://user:pass@host:port/db
    """
    u = url.strip()

    if u.startswith("postgresql+psycopg://"):
        return u

    if u.startswith("postgres://"):
        return "postgresql+psycopg://" + u[len("postgres://"):]

    if u.startswith("postgresql://"):
        return "postgresql+psycopg://" + u[len("postgresql://"):]

    return u