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
    total_amount: float
    items: list[OrderItemOut]


class OrderListOut(BaseModel):
    items: list[OrderOut]