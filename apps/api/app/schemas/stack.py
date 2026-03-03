from __future__ import annotations

from pydantic import BaseModel


class StackOut(BaseModel):
    slug: str
    title: str
    subtitle: str = ""
    description: str = ""

    model_config = {"from_attributes": True}


class StackListOut(BaseModel):
    items: list[StackOut]