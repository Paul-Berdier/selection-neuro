from __future__ import annotations

from dataclasses import dataclass

from app.core.config import settings


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
) -> StripeCheckoutSession:
    """
    Hosted checkout: 1 line item = commande totale (simple, robuste).
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

    session = stripe.checkout.Session.create(
        mode="payment",
        success_url=settings.STRIPE_SUCCESS_URL,
        cancel_url=settings.STRIPE_CANCEL_URL,
        customer_email=customer_email,
        metadata={"order_id": str(order_id)},
        line_items=[
            {
                "quantity": 1,
                "price_data": {
                    "currency": currency.lower(),
                    "unit_amount": int(round(amount_eur * 100)),
                    "product_data": {"name": f"Order #{order_id}"},
                },
            }
        ],
    )

    return StripeCheckoutSession(
        id=session["id"],
        url=session["url"],
        payment_intent=session.get("payment_intent"),
    )