from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.migrate import run_migrations

from app.routers.health import router as health_router
from app.routers.products import router as products_router
from app.routers.stacks import router as stacks_router
from app.routers.invite import router as invite_router
from app.routers.media import router as media_router
from app.routers.admin_migrate import router as admin_migrate_router
from app.routers.admin_products import router as admin_products_router
from app.routers.auth import router as auth_router

setup_logging()

app = FastAPI(title="Selection Neuro API", version="0.1.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["meta"])
def root():
    return {"name": "selection-neuro-api", "ok": True, "docs": "/docs"}


app.include_router(health_router)
app.include_router(products_router)
app.include_router(stacks_router)
app.include_router(invite_router)
app.include_router(media_router)
app.include_router(admin_migrate_router)
app.include_router(admin_products_router)
app.include_router(auth_router)