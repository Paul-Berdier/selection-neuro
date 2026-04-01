from __future__ import annotations

from dataclasses import dataclass

from app.core.config import settings


@dataclass
class StripeLineItem:
    name: str
    amount_eur: float
    quantity: int = 1


@dataclass
class StripeCheckoutSession:
    id: str
    url: str
    payment_intent: str | None = None


def create_checkout_session(
    *,
    order_id: int,
    amount_eur: float,
    currency: str,
    customer_email: str,
    line_items: list[StripeLineItem] | None = None,
    shipping_amount: float = 0,
) -> StripeCheckoutSession:
    """
    Hosted checkout with detailed line items + shipping.
    Falls back to single lump-sum if no line_items provided.
    """
    if settings.STRIPE_MOCK:
        return StripeCheckoutSession(
            id=f"cs_test_mock_{order_id}",
            url=f"http://mock.stripe.local/checkout/{order_id}",
            payment_intent=f"pi_test_mock_{order_id}",
        )

    if not settings.STRIPE_SECRET_KEY:
        raise RuntimeError("STRIPE_SECRET_KEY not configured")

    import stripe  # lazy import

    stripe.api_key = settings.STRIPE_SECRET_KEY

    # Build line items for Stripe
    stripe_line_items = []
    if line_items:
        for li in line_items:
            stripe_line_items.append({
                "quantity": li.quantity,
                "price_data": {
                    "currency": currency.lower(),
                    "unit_amount": int(round(li.amount_eur * 100)),
                    "product_data": {"name": li.name},
                },
            })
    else:
        # Fallback: single line item
        stripe_line_items.append({
            "quantity": 1,
            "price_data": {
                "currency": currency.lower(),
                "unit_amount": int(round(amount_eur * 100)),
                "product_data": {"name": f"Order #{order_id}"},
            },
        })

    # Shipping as a separate visible cost in Stripe checkout
    shipping_options = []
    if shipping_amount > 0:
        shipping_options.append({
            "shipping_rate_data": {
                "type": "fixed_amount",
                "fixed_amount": {
                    "amount": int(round(shipping_amount * 100)),
                    "currency": currency.lower(),
                },
                "display_name": "Livraison",
            }
        })
    elif line_items:
        # Free shipping
        shipping_options.append({
            "shipping_rate_data": {
                "type": "fixed_amount",
                "fixed_amount": {"amount": 0, "currency": currency.lower()},
                "display_name": "Livraison offerte",
            }
        })

    create_kwargs = dict(
        mode="payment",
        success_url=settings.STRIPE_SUCCESS_URL,
        cancel_url=settings.STRIPE_CANCEL_URL,
        customer_email=customer_email,
        metadata={"order_id": str(order_id)},
        line_items=stripe_line_items,
    )
    if shipping_options:
        create_kwargs["shipping_options"] = shipping_options

    session = stripe.checkout.Session.create(**create_kwargs)

    return StripeCheckoutSession(
        id=session["id"],
        url=session["url"],
        payment_intent=session.get("payment_intent"),
    )