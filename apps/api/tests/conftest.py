from __future__ import annotations

import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# --- Test env (utilise ton Postgres Docker existant) ---
os.environ.setdefault("ENV", "test")
os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5434/selection_neuro")
os.environ.setdefault("ADMIN_TOKEN", "supersecret123")
os.environ.setdefault("JWT_SECRET", "change_me_super_long_random")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
os.environ.setdefault("REFRESH_TOKEN_EXPIRE_DAYS", "30")

TEST_DB_URL = os.environ["DATABASE_URL"]

engine = create_engine(TEST_DB_URL, pool_pre_ping=True)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _alembic_upgrade_head():
    """Apply alembic migrations on the test DB."""
    from alembic import command
    from alembic.config import Config

    cfg = Config("alembic.ini")  # apps/api/alembic.ini
    cfg.set_main_option("sqlalchemy.url", TEST_DB_URL)
    command.upgrade(cfg, "head")


def _truncate_all_tables():
    """
    Nettoyage DB entre tests.
    On TRUNCATE toutes les tables du schema public (sauf alembic_version).
    """
    with engine.begin() as conn:
        tables = conn.execute(
            text(
                """
                SELECT tablename
                FROM pg_tables
                WHERE schemaname='public'
                  AND tablename <> 'alembic_version'
                """
            )
        ).fetchall()
        table_names = [t[0] for t in tables]
        if not table_names:
            return

        # TRUNCATE ... CASCADE remet tout à zéro
        joined = ", ".join(f'"{t}"' for t in table_names)
        conn.execute(text(f"TRUNCATE {joined} RESTART IDENTITY CASCADE"))


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    # Assure que la DB a le schéma à jour
    _alembic_upgrade_head()
    yield


@pytest.fixture(autouse=True)
def clean_db_between_tests():
    # Nettoie avant chaque test pour être déterministe
    _truncate_all_tables()
    yield
    _truncate_all_tables()


@pytest.fixture()
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
        db.commit()
    finally:
        db.close()


@pytest.fixture()
def client(db_session):
    from app.main import app
    from app.db.session import get_db

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture()
def admin_token() -> str:
    return os.environ["ADMIN_TOKEN"]


def admin_headers(token: str) -> dict[str, str]:
    return {"X-Admin-Token": token}


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}