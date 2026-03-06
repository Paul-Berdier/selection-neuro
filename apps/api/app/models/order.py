from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(String(32), nullable=False, server_default=text("'created'"))
    payment_status: Mapped[str] = mapped_column(String(32), nullable=False, server_default=text("'unpaid'"))

    currency: Mapped[str] = mapped_column(String(8), nullable=False, server_default=text("'EUR'"))
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")