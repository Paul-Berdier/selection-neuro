from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Cart(Base):
    __tablename__ = "carts"
    __table_args__ = (
        UniqueConstraint("user_id", name="uq_carts_user_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )

    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")