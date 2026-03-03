from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging
from app.routers import health_router, products_router, stacks_router, invite_router
from app.core.migrate import run_migrations

setup_logging()

app = FastAPI(
    title="Selection Neuro API",
    version="0.1.0",
)

@app.on_event("startup")
def on_startup():
    run_migrations()

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