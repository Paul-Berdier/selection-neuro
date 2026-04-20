from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.product import Product


@dataclass(frozen=True)
class ProductVariantData:
    price: float
    qty_g: float | None
    label: str
    months: int


def list_products(db: Session) -> list[Product]:
    stmt = select(Product).where(Product.is_active == True).order_by(Product.name.asc())  # noqa: E712
    return list(db.execute(stmt).scalars().all())


def get_product_by_slug(db: Session, slug: str) -> Product | None:
    stmt = select(Product).where(Product.slug == slug, Product.is_active == True)  # noqa: E712
    return db.execute(stmt).scalars().first()


def build_product_variants(product: Product) -> list[ProductVariantData]:
    variants: list[ProductVariantData] = []

    for price_attr, qty_attr, label, months in [
        ("price_1m", "qty_g_1m", "1 mois", 1),
        ("price_3m", "qty_g_3m", "3 mois", 3),
        ("price_1y", "qty_g_1y", "1 an", 12),
    ]:
        price = getattr(product, price_attr, None)
        qty = getattr(product, qty_attr, None)
        if price is None:
            continue
        variants.append(
            ProductVariantData(
                price=float(price),
                qty_g=float(qty) if qty is not None else None,
                label=label,
                months=months,
            )
        )

    return variants


def resolve_product_variant(product: Product, months: int | None = None) -> ProductVariantData | None:
    variants = build_product_variants(product)
    if variants:
        if months is None:
            return variants[0]
        for variant in variants:
            if variant.months == months:
                return variant
        return variants[0]

    price = getattr(product, "price_month_eur", None)
    if price is None:
        return None

    return ProductVariantData(
        price=float(price),
        qty_g=None,
        label="1 mois",
        months=1,
    )
