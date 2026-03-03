from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.stack_product import StackProductOut


class StackOut(BaseModel):
    slug: str
    title: str
    subtitle: str = ""
    description: str = ""
    products: list[StackProductOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class StackListOut(BaseModel):
    items: list[StackOut]