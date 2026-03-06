from __future__ import annotations

from pydantic import BaseModel, Field


class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    product_name: str
    unit_price: float
    image_url: str | None = None


class CartOut(BaseModel):
    id: int
    items: list[CartItemOut]
    total_items: int
    subtotal: float


class CartItemAddIn(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1, le=99)


class CartItemUpdateIn(BaseModel):
    quantity: int = Field(ge=1, le=99)