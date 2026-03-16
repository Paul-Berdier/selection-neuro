from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.product import ProductListOut, ProductOut
from app.services.product_service import list_products, get_product_by_slug

router = APIRouter(prefix="/products", tags=["products"])


def to_product_out(p) -> ProductOut:
    price = getattr(p, "price_month_eur", None)
    return ProductOut(
        id=p.id,                          # ← ajouter
        slug=p.slug,
        name=p.name,
        short_desc=getattr(p, "short_desc", "") or "",
        description_md=getattr(p, "description_md", "") or "",
        category=getattr(p, "category", "") or "",
        price_month_eur=float(price) if price is not None else None,
        image_url=f"/media/{p.image_media_id}" if getattr(p, "image_media_id", None) else None,
    )


@router.get("", response_model=ProductListOut)
def products(db: Session = Depends(get_db)):
    items = [to_product_out(p) for p in list_products(db)]
    return ProductListOut(items=items)


@router.get("/{slug}", response_model=ProductOut)
def product(slug: str, db: Session = Depends(get_db)):
    p = get_product_by_slug(db, slug)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return to_product_out(p)