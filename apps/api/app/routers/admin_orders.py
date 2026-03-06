from __future__ import annotations

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.auth import require_admin_token
from app.db.session import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product

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


def _order_to_out(o: Order) -> AdminOrderOut:
    return AdminOrderOut(
        id=o.id,
        user_id=o.user_id,
        status=o.status,
        payment_status=o.payment_status,
        currency=o.currency,
        total_amount=float(o.total_amount),
        created_at=getattr(o, "created_at", None),
        updated_at=getattr(o, "updated_at", None),
        shipping_address_id=getattr(o, "shipping_address_id", None),
        billing_address_id=getattr(o, "billing_address_id", None),
        stripe_session_id=getattr(o, "stripe_session_id", None),
        stripe_payment_intent_id=getattr(o, "stripe_payment_intent_id", None),
        paid_at=getattr(o, "paid_at", None),
    )


def _restock_order(db: Session, order: Order) -> None:
    """
    Restock products from an order (used when canceling/refunding, depending on policy).
    Only restocks if product.stock_qty is not None.
    """
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    for it in items:
        p = db.query(Product).filter(Product.id == it.product_id).first()
        if not p:
            continue
        if p.stock_qty is None:
            continue
        p.stock_qty += int(it.quantity)


def _validate_transition(order: Order, new_status: str | None, new_payment_status: str | None) -> None:
    if new_status is not None and new_status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")

    if new_payment_status is not None and new_payment_status not in ALLOWED_PAYMENT_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid payment_status")

    # Business rules
    # shipped requires paid
    if new_status == "shipped" and (new_payment_status or order.payment_status) != "paid":
        raise HTTPException(status_code=400, detail="Cannot ship an unpaid order")

    # delivered requires shipped
    if new_status == "delivered" and order.status != "shipped":
        raise HTTPException(status_code=400, detail="Order must be shipped before delivered")

    # refunded implies payment_status=refunded
    if new_status == "refunded" and (new_payment_status or order.payment_status) != "refunded":
        raise HTTPException(status_code=400, detail="Refunded status requires payment_status=refunded")


@router.get("", response_model=AdminOrderListOut)
def admin_list_orders(
    db: Session = Depends(get_db),
    _: None = Depends(require_admin_token),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    q = db.query(Order)
    total = q.count()
    items = q.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()
    return AdminOrderListOut(total=total, items=[_order_to_out(o) for o in items])


@router.get("/{order_id}", response_model=AdminOrderOut)
def admin_get_order(
    order_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin_token),
):
    o = db.query(Order).filter(Order.id == order_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    return _order_to_out(o)


@router.patch("/{order_id}", response_model=AdminOrderOut)
def admin_update_order(
    order_id: int,
    payload: AdminOrderUpdateIn,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin_token),
):
    o = db.query(Order).filter(Order.id == order_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")

    _validate_transition(o, payload.status, payload.payment_status)

    # If canceling, restock (policy: restock on cancel)
    if payload.status == "canceled" and o.status not in {"canceled"}:
        _restock_order(db, o)

    # If refunding, restock too (policy: restock on refund)
    if payload.status == "refunded" and o.status not in {"refunded"}:
        _restock_order(db, o)
        o.payment_status = "refunded"

    if payload.status is not None:
        o.status = payload.status
    if payload.payment_status is not None:
        o.payment_status = payload.payment_status

    db.commit()
    db.refresh(o)
    return _order_to_out(o)