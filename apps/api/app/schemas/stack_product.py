from __future__ import annotations

from pydantic import BaseModel


class StackProductOut(BaseModel):
    product_id: int | None = None
    product_slug: str
    product_name: str
    product_short_desc: str = ""
    product_category: str = ""
    product_price_month_eur: float | None = None
    dosage_value: float | None = None
    dosage_unit: str = ""
    note: str = ""

    model_config = {"from_attributes": True}
