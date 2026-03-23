from __future__ import annotations

from pydantic import BaseModel, Field


class ProductVariant(BaseModel):
    """Une variante de vente (1 mois, 3 mois, 1 an)."""
    price: float
    qty_g: float
    label: str          # "1 mois", "3 mois", "1 an"
    months: int         # 1, 3, 12


class ProductOut(BaseModel):
    id: int
    slug: str
    name: str
    short_desc: str = ""
    description_md: str = ""
    category: str = ""
    # Prix mensuel de référence — affiché sur la page Stack uniquement
    price_month_eur: float | None = None
    image_url: str | None = None
    # Variantes de vente sur les fiches produit
    variants: list[ProductVariant] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class ProductListOut(BaseModel):
    items: list[ProductOut] = Field(default_factory=list)
