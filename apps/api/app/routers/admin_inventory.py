from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.db.session import get_db
from app.models.product import Product
from app.models.user import User

router = APIRouter(prefix="/admin/inventory", tags=["admin-inventory"])


class StockUpdateIn(BaseModel):
    stock_qty: int | None = Field(default=None, ge=0)


@router.put("/products/{product_id}")
def admin_set_product_stock(
    product_id: int,
    payload: StockUpdateIn,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.stock_qty = payload.stock_qty
    db.commit()

    return {"ok": True, "product_id": product.id, "stock_qty": product.stock_qty}