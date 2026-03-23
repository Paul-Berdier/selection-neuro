from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Address(Base):
    __tablename__ = "address"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    label: Mapped[str] = mapped_column(String(100), nullable=False, server_default=text("''"))
    full_name: Mapped[str] = mapped_column(String(200), nullable=False, server_default=text("''"))
    line1: Mapped[str] = mapped_column(String(300), nullable=False, server_default=text("''"))
    line2: Mapped[str] = mapped_column(String(300), nullable=False, server_default=text("''"))
    city: Mapped[str] = mapped_column(String(100), nullable=False, server_default=text("''"))
    postal_code: Mapped[str] = mapped_column(String(20), nullable=False, server_default=text("''"))
    country: Mapped[str] = mapped_column(String(2), nullable=False, server_default=text("'FR'"))
    phone: Mapped[str] = mapped_column(String(30), nullable=False, server_default=text("''"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )
