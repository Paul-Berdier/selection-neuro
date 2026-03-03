from __future__ import annotations

from pydantic import BaseModel, Field


class ProductOut(BaseModel):
    slug: str
    name: str
    short_desc: str = ""
    description: str = ""
    category: str = ""
    price_month_eur: float | None = None

    model_config = {"from_attributes": True}


class ProductListOut(BaseModel):
    items: list[ProductOut] = Field(default_factory=list)