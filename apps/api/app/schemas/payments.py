from __future__ import annotations

from pydantic import BaseModel


class CheckoutSessionIn(BaseModel):
    order_id: int


class CheckoutSessionOut(BaseModel):
    ok: bool
    order_id: int
    session_id: str
    checkout_url: str