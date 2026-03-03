from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class InviteIn(BaseModel):
    email: EmailStr
    name: str = Field(default="", max_length=200)
    goal: str = Field(default="", max_length=200)
    message: str = Field(default="", max_length=3000)


class InviteOut(BaseModel):
    ok: bool