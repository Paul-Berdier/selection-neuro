from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.auth import require_admin_token
from app.db.session import get_db
from app.models.product import Product

router = APIRouter(prefix="/admin/inventory", tags=["admin-inventory"])


class StockUpdateIn(BaseModel):
    stock_qty: int | None = Field(default=None, ge=0)


@router.put("/products/{product_id}")
def admin_set_product_stock(
    product_id: int,
    payload: StockUpdateIn,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin_token),
):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    p.stock_qty = payload.stock_qty
    db.commit()
    return {"ok": True, "product_id": p.id, "stock_qty": p.stock_qty}