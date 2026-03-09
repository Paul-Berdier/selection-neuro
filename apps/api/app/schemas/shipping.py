from __future__ import annotations

from pydantic import BaseModel, Field


class ShippingRateOut(BaseModel):
    method: str
    label: str
    amount: float


class ShippingRatesOut(BaseModel):
    items: list[ShippingRateOut]


class SetShippingIn(BaseModel):
    shipping_method: str = Field(min_length=3, max_length=32)