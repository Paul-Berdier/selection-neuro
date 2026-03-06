from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Cart, Order, OrderItem, Product
from app.models.user import User
from app.schemas.order import OrderListOut, OrderOut

router = APIRouter(prefix="/orders", tags=["orders"])


def order_to_out(order: Order) -> OrderOut:
    items_out = []
    for it in order.items:
        items_out.append(
            {
                "id": it.id,
                "product_id": it.product_id,
                "product_name": it.product_name,
                "unit_price": float(it.unit_price),
                "quantity": it.quantity,
                "line_total": float(it.line_total),
            }
        )

    return OrderOut(
        id=order.id,
        status=order.status,
        payment_status=order.payment_status,
        currency=order.currency,
        total_amount=float(order.total_amount),
        items=items_out,
    )


@router.get("", response_model=OrderListOut)
def list_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    orders = db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()
    return OrderListOut(items=[order_to_out(o) for o in orders])


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    _ = order.items
    return order_to_out(order)


@router.post("", response_model=OrderOut)
def create_order_from_cart(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order = Order(user_id=user.id)
    db.add(order)
    db.flush()

    total = 0.0
    for ci in cart.items:
        product = db.query(Product).filter(Product.id == ci.product_id, Product.is_active == True).first()
        if not product:
            raise HTTPException(status_code=400, detail=f"Product unavailable: {ci.product_id}")

        unit_price = float(getattr(product, "price_month_eur", 0) or 0)
        line_total = unit_price * ci.quantity
        total += line_total

        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                unit_price=unit_price,
                quantity=ci.quantity,
                line_total=line_total,
            )
        )

    order.total_amount = round(total, 2)

    # vide le panier
    for ci in list(cart.items):
        db.delete(ci)

    db.commit()
    db.refresh(order)
    _ = order.items
    return order_to_out(order)