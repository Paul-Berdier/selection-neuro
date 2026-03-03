from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.stack import Stack


def list_stacks(db: Session) -> list[Stack]:
    stmt = select(Stack).where(Stack.is_active == True).order_by(Stack.title.asc())  # noqa: E712
    return list(db.execute(stmt).scalars().all())


def get_stack_by_slug(db: Session, slug: str) -> Stack | None:
    stmt = select(Stack).where(Stack.slug == slug, Stack.is_active == True)  # noqa: E712
    return db.execute(stmt).scalars().first()