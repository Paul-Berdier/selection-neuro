from __future__ import annotations
from pydantic import BaseModel, Field


class ProductVariant(BaseModel):
    """Variante de vente — prix et quantité réels."""
    price: float
    qty_g: float
    label: str   # "1 mois", "3 mois", "1 an"
    months: int  # 1, 3, 12


class ProductOut(BaseModel):
    id: int
    slug: str
    name: str
    short_desc: str = ""
    description: str = ""
    category: str = ""
    # Prix mensuel de référence — page Stack uniquement
    price_month_eur: float | None = None
    image_url: str | None = None
    image_url_2: str | None = None
    # Variantes de vente exposées sur les fiches produit
    variants: list[ProductVariant] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class ProductListOut(BaseModel):
    items: list[ProductOut] = Field(default_factory=list)
