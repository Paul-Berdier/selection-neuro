from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.product import ProductListOut, ProductOut
from app.services.product_service import list_products, get_product_by_slug

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=ProductListOut)
def products(db: Session = Depends(get_db)):
    items = list_products(db)
    return ProductListOut(items=items)


@router.get("/{slug}", response_model=ProductOut)
def product(slug: str, db: Session = Depends(get_db)):
    p = get_product_by_slug(db, slug)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p