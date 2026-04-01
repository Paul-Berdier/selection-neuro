from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.product import ProductListOut, ProductOut, ProductVariant
from app.services.product_service import list_products, get_product_by_slug

router = APIRouter(prefix="/products", tags=["products"])


def _build_variants(p) -> list[ProductVariant]:
    result = []
    for price_attr, qty_attr, label, months in [
        ("price_1m", "qty_g_1m", "1 mois",  1),
        ("price_3m", "qty_g_3m", "3 mois",  3),
        ("price_1y", "qty_g_1y", "1 an",   12),
    ]:
        price = getattr(p, price_attr, None)
        qty   = getattr(p, qty_attr,   None)
        if price is not None and qty is not None:
            result.append(ProductVariant(
                price=float(price), qty_g=float(qty),
                label=label, months=months,
            ))
    return result


def to_product_out(p) -> ProductOut:
    price = getattr(p, "price_month_eur", None)
    return ProductOut(
        id=p.id,
        slug=p.slug,
        name=p.name,
        short_desc=getattr(p, "short_desc", "") or "",
        description=getattr(p, "description", "") or "",
        category=getattr(p, "category", "") or "",
        price_month_eur=float(price) if price is not None else None,
        image_url=f"/media/{p.image_media_id}" if getattr(p, "image_media_id", None) else None,
        image_url_2=f"/media/{p.image_media_id_2}" if getattr(p, "image_media_id_2", None) else None,
        variants=_build_variants(p),
    )


@router.get("", response_model=ProductListOut)
def products(db: Session = Depends(get_db)):
    return ProductListOut(items=[to_product_out(p) for p in list_products(db)])


@router.get("/{slug}", response_model=ProductOut)
def product(slug: str, db: Session = Depends(get_db)):
    p = get_product_by_slug(db, slug)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return to_product_out(p)
