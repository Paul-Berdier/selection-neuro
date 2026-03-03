from __future__ import annotations

import logging
from alembic import command
from alembic.config import Config
from sqlalchemy import text
from sqlalchemy import create_engine

from app.core.config import settings

logger = logging.getLogger("app.migrate")

# Lock ID arbitraire (mais constant)
MIGRATION_LOCK_ID = 834275901


def run_migrations() -> None:
    """
    Robust migrations:
    - Acquire a Postgres advisory lock to avoid concurrent upgrades.
    - Run `alembic upgrade head`.
    - Release lock.
    - Fail fast with clear logs.
    """
    cfg = Config("alembic.ini")

    # Create a short-lived engine for lock + migration
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        connect_args={"connect_timeout": 10},
    )

    with engine.connect() as conn:
        conn = conn.execution_options(isolation_level="AUTOCOMMIT")

        logger.info("Acquiring migration lock (pg_advisory_lock=%s)...", MIGRATION_LOCK_ID)
        conn.execute(text("SELECT pg_advisory_lock(:id)"), {"id": MIGRATION_LOCK_ID})
        try:
            logger.info("Running alembic upgrade head...")
            command.upgrade(cfg, "head")
            logger.info("Alembic upgrade complete.")
        except Exception:
            logger.exception("Alembic upgrade failed.")
            raise
        finally:
            logger.info("Releasing migration lock (pg_advisory_unlock=%s)...", MIGRATION_LOCK_ID)
            conn.execute(text("SELECT pg_advisory_unlock(:id)"), {"id": MIGRATION_LOCK_ID})

    engine.dispose()