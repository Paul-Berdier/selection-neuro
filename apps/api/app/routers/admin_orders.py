from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.db.session import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User

router = APIRouter(prefix="/admin/orders", tags=["admin-orders"])

ALLOWED_STATUSES = {"created", "confirmed", "shipped", "delivered", "canceled", "refunded"}
ALLOWED_PAYMENT_STATUSES = {"unpaid", "paid", "refunded"}


class AdminOrderOut(BaseModel):
    id: int
    user_id: int
    status: str
    payment_status: str
    currency: str
    total_amount: float
    created_at: datetime | None = None
    updated_at: datetime | None = None
    shipping_address_id: int | None = None
    billing_address_id: int | None = None
    stripe_session_id: str | None = None
    stripe_payment_intent_id: str | None = None
    paid_at: datetime | None = None


class AdminOrderListOut(BaseModel):
    total: int
    items: list[AdminOrderOut]


class AdminOrderUpdateIn(BaseModel):
    status: str | None = Field(default=None)
    payment_status: str | None = Field(default=None)


def _order_to_out(order: Order) -> AdminOrderOut:
    return AdminOrderOut(
        id=order.id,
        user_id=order.user_id,
        status=order.status,
        payment_status=order.payment_status,
        currency=order.currency,
        total_amount=float(order.total_amount),
        created_at=getattr(order, "created_at", None),
        updated_at=getattr(order, "updated_at", None),
        shipping_address_id=getattr(order, "shipping_address_id", None),
        billing_address_id=getattr(order, "billing_address_id", None),
        stripe_session_id=getattr(order, "stripe_session_id", None),
        stripe_payment_intent_id=getattr(order, "stripe_payment_intent_id", None),
        paid_at=getattr(order, "paid_at", None),
    )


def _restock_order(db: Session, order: Order) -> None:
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or product.stock_qty is None:
            continue
        product.stock_qty += int(item.quantity)


def _validate_transition(order: Order, new_status: str | None, new_payment_status: str | None) -> None:
    if new_status is not None and new_status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")

    if new_payment_status is not None and new_payment_status not in ALLOWED_PAYMENT_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid payment_status")

    effective_payment_status = new_payment_status or order.payment_status

    if new_status == "shipped" and effective_payment_status != "paid":
        raise HTTPException(status_code=400, detail="Cannot ship an unpaid order")

    if new_status == "delivered" and order.status != "shipped":
        raise HTTPException(status_code=400, detail="Order must be shipped before delivered")

    if new_status == "refunded" and effective_payment_status != "refunded":
        raise HTTPException(status_code=400, detail="Refunded status requires payment_status=refunded")


@router.get("", response_model=AdminOrderListOut)
def admin_list_orders(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    query = db.query(Order)
    total = query.count()
    items = query.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()
    return AdminOrderListOut(total=total, items=[_order_to_out(order) for order in items])


@router.get("/{order_id}", response_model=AdminOrderOut)
def admin_get_order(
    order_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _order_to_out(order)


@router.patch("/{order_id}", response_model=AdminOrderOut)
def admin_update_order(
    order_id: int,
    payload: AdminOrderUpdateIn,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    _validate_transition(order, payload.status, payload.payment_status)

    if payload.status == "canceled" and order.status != "canceled":
        _restock_order(db, order)

    if payload.status == "refunded" and order.status != "refunded":
        _restock_order(db, order)
        order.payment_status = "refunded"

    if payload.status is not None:
        order.status = payload.status
    if payload.payment_status is not None:
        order.payment_status = payload.payment_status

    db.commit()
    db.refresh(order)
    return _order_to_out(order)