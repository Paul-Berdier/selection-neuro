from __future__ import annotations

from pydantic import BaseModel, Field


class AddressIn(BaseModel):
    label: str = Field(default="Home", max_length=80)
    full_name: str = Field(min_length=2, max_length=120)

    line1: str = Field(min_length=2, max_length=200)
    line2: str = Field(default="", max_length=200)

    city: str = Field(min_length=2, max_length=120)
    postal_code: str = Field(min_length=2, max_length=20)

    country: str = Field(default="FR", min_length=2, max_length=2)
    phone: str = Field(default="", max_length=40)


class AddressOut(AddressIn):
    id: int


class OrderAddressesIn(BaseModel):
    shipping_address_id: int
    billing_address_id: int | None = None