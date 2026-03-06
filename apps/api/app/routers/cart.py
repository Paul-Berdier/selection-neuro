from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Cart, CartItem, Product
from app.models.user import User
from app.schemas.cart import CartOut, CartItemAddIn, CartItemUpdateIn

router = APIRouter(prefix="/cart", tags=["cart"])


def ensure_cart(db: Session, user_id: int) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if cart:
        return cart
    cart = Cart(user_id=user_id)
    db.add(cart)
    db.flush()
    return cart


def cart_to_out(cart: Cart) -> CartOut:
    items_out = []
    subtotal = 0.0
    total_items = 0

    for it in cart.items:
        price = float(getattr(it.product, "price_month_eur", 0) or 0)
        subtotal += price * it.quantity
        total_items += it.quantity

        image_url = None
        mid = getattr(it.product, "image_media_id", None)
        if mid:
            image_url = f"/media/{mid}"

        items_out.append(
            {
                "id": it.id,
                "product_id": it.product_id,
                "quantity": it.quantity,
                "product_name": it.product.name,
                "unit_price": round(price, 2),
                "image_url": image_url,
            }
        )

    return CartOut(
        id=cart.id,
        items=items_out,
        total_items=total_items,
        subtotal=round(subtotal, 2),
    )


@router.get("", response_model=CartOut)
def get_cart(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cart = ensure_cart(db, user.id)
    _ = cart.items
    return cart_to_out(cart)


@router.post("/items", response_model=CartOut)
def add_item(
    payload: CartItemAddIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    cart = ensure_cart(db, user.id)

    product = (
        db.query(Product)
        .filter(Product.id == payload.product_id, Product.is_active == True)  # noqa: E712
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.product_id == product.id)
        .first()
    )

    desired_qty = payload.quantity if not item else (item.quantity + payload.quantity)

    # ✅ Stock check (None => unlimited)
    if product.stock_qty is not None and desired_qty > product.stock_qty:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    if item:
        item.quantity = min(99, desired_qty)
    else:
        item = CartItem(cart_id=cart.id, product_id=product.id, quantity=payload.quantity)
        db.add(item)

    db.commit()
    db.refresh(cart)
    return cart_to_out(cart)


@router.patch("/items/{item_id}", response_model=CartOut)
def update_item(
    item_id: int,
    payload: CartItemUpdateIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    cart = ensure_cart(db, user.id)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    # ✅ Stock check vs product
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=400, detail="Product unavailable")

    if product.stock_qty is not None and payload.quantity > product.stock_qty:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    item.quantity = payload.quantity
    db.commit()
    db.refresh(cart)
    return cart_to_out(cart)


@router.delete("/items/{item_id}", response_model=CartOut)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    cart = ensure_cart(db, user.id)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()
    db.refresh(cart)
    return cart_to_out(cart)