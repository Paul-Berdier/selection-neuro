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

    # legacy/simple total (keep for compatibility)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))

    # ✅ professional breakdown
    subtotal_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))
    shipping_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))
    tax_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))
    grand_total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))

    shipping_method: Mapped[str] = mapped_column(String(32), nullable=False, server_default=text("'standard'"))
    tax_rate: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False, server_default=text("0.2000"))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")