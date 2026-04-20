from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.order import Order
from app.models.stripe_event import StripeEvent
from app.schemas.payments import CheckoutSessionIn, CheckoutSessionOut
from app.services.stripe_service import create_checkout_session, StripeLineItem

router = APIRouter(prefix="/payments/stripe", tags=["payments"])


@router.post("/checkout-session", response_model=CheckoutSessionOut)
def stripe_checkout_session(
    payload: CheckoutSessionIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == payload.order_id, Order.user_id == user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.payment_status == "paid":
        raise HTTPException(status_code=400, detail="Order already paid")

    amount = float(order.total_amount)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Order amount invalid")

    # Build detailed line items for Stripe receipt
    _ = order.items  # ensure loaded
    line_items = []
    for it in order.items:
        variant_bits = [getattr(it, "variant_label", None)]
        variant_qty = getattr(it, "variant_qty_g", None)
        if variant_qty is not None:
            variant_bits.append(f"{float(variant_qty):g} g")

        line_items.append(StripeLineItem(
            name=" · ".join(part for part in [it.product_name, " | ".join(bit for bit in variant_bits if bit)] if part),
            amount_eur=float(it.unit_price),
            quantity=it.quantity,
        ))

    # Add tax as a visible line item if applicable
    tax_amount = float(order.tax_amount or 0)
    if tax_amount > 0:
        line_items.append(StripeLineItem(
            name="TVA (20%)",
            amount_eur=tax_amount,
            quantity=1,
        ))

    shipping_amount = float(order.shipping_amount or 0)

    sess = create_checkout_session(
        order_id=order.id,
        amount_eur=amount,
        currency=order.currency or "EUR",
        customer_email=user.email,
        line_items=line_items,
        shipping_amount=shipping_amount,
    )

    order.payment_provider = "stripe"
    order.stripe_session_id = sess.id
    if sess.payment_intent:
        order.stripe_payment_intent_id = sess.payment_intent

    db.commit()

    return CheckoutSessionOut(
        ok=True,
        order_id=order.id,
        session_id=sess.id,
        checkout_url=sess.url,
    )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str | None = Header(default=None, alias="Stripe-Signature"),
    db: Session = Depends(get_db),
):
    payload = await request.body()

    if settings.STRIPE_MOCK:
        # en tests, on accepte un JSON simple sans signature
        event = await request.json()
    else:
        if not settings.STRIPE_WEBHOOK_SECRET:
            raise HTTPException(status_code=500, detail="STRIPE_WEBHOOK_SECRET not configured")
        if not stripe_signature:
            raise HTTPException(status_code=400, detail="Missing Stripe-Signature")

        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY

        try:
            event = stripe.Webhook.construct_event(
                payload=payload,
                sig_header=stripe_signature,
                secret=settings.STRIPE_WEBHOOK_SECRET,
            )
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    event_id = event["id"]
    event_type = event["type"]

    # idempotence
    exists = db.query(StripeEvent).filter(StripeEvent.event_id == event_id).first()
    if exists:
        return {"ok": True, "duplicate": True}

    db.add(StripeEvent(event_id=event_id, event_type=event_type))
    db.flush()

    # On traite checkout.session.completed (le plus standard)
    if event_type == "checkout.session.completed":
        session_obj = event["data"]["object"]
        session_id = session_obj.get("id")
        payment_intent = session_obj.get("payment_intent")
        metadata = session_obj.get("metadata") or {}
        order_id = metadata.get("order_id")

        if not order_id:
            # fallback: retrouver par stripe_session_id
            order = db.query(Order).filter(Order.stripe_session_id == session_id).first()
        else:
            order = db.query(Order).filter(Order.id == int(order_id)).first()

        if order and order.payment_status != "paid":
            order.payment_status = "paid"
            order.status = "confirmed"
            order.paid_at = datetime.utcnow()
            if session_id:
                order.stripe_session_id = session_id
            if payment_intent:
                order.stripe_payment_intent_id = payment_intent

    db.commit()
    return {"ok": True}
