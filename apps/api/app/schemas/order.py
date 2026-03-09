from __future__ import annotations

from pydantic import BaseModel


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    unit_price: float
    quantity: int
    line_total: float


class OrderOut(BaseModel):
    id: int
    status: str
    payment_status: str
    currency: str

    # legacy (compat)
    total_amount: float

    # ✅ pro breakdown
    subtotal_amount: float
    shipping_amount: float
    tax_amount: float
    grand_total_amount: float
    shipping_method: str
    tax_rate: float

    # optional but useful for front
    shipping_address_id: int | None = None
    billing_address_id: int | None = None

    items: list[OrderItemOut]


class OrderListOut(BaseModel):
    items: list[OrderOut]