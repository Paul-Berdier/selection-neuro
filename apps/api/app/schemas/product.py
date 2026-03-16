from __future__ import annotations

from pydantic import BaseModel, Field


class ProductOut(BaseModel):
    id: int
    slug: str
    name: str
    short_desc: str = ""
    description_md: str = ""
    category: str = ""
    price_month_eur: float | None = None
    image_url: str | None = None

    model_config = {"from_attributes": True}


class ProductListOut(BaseModel):
    items: list[ProductOut] = Field(default_factory=list)