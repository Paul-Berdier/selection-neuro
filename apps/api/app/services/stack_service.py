from __future__ import annotations

from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select

from app.models.stack import Stack
from app.models.stack_product import StackProduct


def list_stacks(db: Session) -> list[Stack]:
    stmt = (
        select(Stack)
        .where(Stack.is_active == True)  # noqa: E712
        .options(selectinload(Stack.stack_products).selectinload(StackProduct.product))
        .order_by(Stack.title.asc())
    )
    return list(db.execute(stmt).scalars().all())


def get_stack_by_slug(db: Session, slug: str) -> Stack | None:
    stmt = (
        select(Stack)
        .where(Stack.slug == slug, Stack.is_active == True)  # noqa: E712
        .options(selectinload(Stack.stack_products).selectinload(StackProduct.product))
    )
    return db.execute(stmt).scalars().first()