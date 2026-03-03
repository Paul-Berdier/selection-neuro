from __future__ import annotations

import logging
import os
from alembic import command
from alembic.config import Config

logger = logging.getLogger("app.migrate")


def run_migrations() -> None:
    """
    Run Alembic migrations on startup.

    Railway best-practice for small services:
    - idempotent: running upgrade head multiple times is safe
    - ensures tables exist before handling requests
    """
    cfg = Config("alembic.ini")

    # Optional: override script_location if needed
    # cfg.set_main_option("script_location", "alembic")

    logger.info("Running alembic upgrade head...")
    command.upgrade(cfg, "head")
    logger.info("Alembic upgrade complete.")