from __future__ import annotations

from sqlalchemy import Integer, ForeignKey, String, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class StackProduct(Base):
    __tablename__ = "stack_product"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    stack_id: Mapped[int] = mapped_column(ForeignKey("stack.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("product.id", ondelete="CASCADE"), index=True)

    dosage_value: Mapped[float | None] = mapped_column(Numeric(12, 4), nullable=True)
    dosage_unit: Mapped[str] = mapped_column(String(16), default="")
    note: Mapped[str] = mapped_column(String(200), default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=100)

    stack = relationship("Stack", back_populates="stack_products")
    product = relationship("Product", back_populates="stack_products")