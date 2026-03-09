from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.address import Address
from app.models.order import Order
from app.models.user import User
from app.schemas.shipping import ShippingRateOut, ShippingRatesOut, SetShippingIn
from app.services.order_pricing import get_shipping_rates, recompute_order_totals

router = APIRouter(tags=["shipping"])


@router.get("/shipping/rates", response_model=ShippingRatesOut)
def list_shipping_rates(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    address_id: int | None = None,
):
    address = None
    if address_id is not None:
        address = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
        if not address:
            raise HTTPException(status_code=404, detail="Address not found")

    rates = get_shipping_rates(address)
    return ShippingRatesOut(
        items=[ShippingRateOut(method=r.method, label=r.label, amount=float(r.amount)) for r in rates]
    )


@router.put("/orders/{order_id}/shipping")
def set_order_shipping_method(
    order_id: int,
    payload: SetShippingIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status in {"shipped", "delivered"}:
        raise HTTPException(status_code=400, detail="Cannot change shipping after shipping")

    order.shipping_method = payload.shipping_method

    _ = order.items

    ship_addr = None
    if getattr(order, "shipping_address_id", None):
        ship_addr = db.query(Address).filter(Address.id == order.shipping_address_id, Address.user_id == user.id).first()

    recompute_order_totals(order, shipping_address=ship_addr)
    db.commit()
    return {"ok": True}