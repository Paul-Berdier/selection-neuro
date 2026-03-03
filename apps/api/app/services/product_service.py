from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.product import Product


def list_products(db: Session) -> list[Product]:
    stmt = select(Product).where(Product.is_active == True).order_by(Product.name.asc())  # noqa: E712
    return list(db.execute(stmt).scalars().all())


def get_product_by_slug(db: Session, slug: str) -> Product | None:
    stmt = select(Product).where(Product.slug == slug, Product.is_active == True)  # noqa: E712
    return db.execute(stmt).scalars().first()