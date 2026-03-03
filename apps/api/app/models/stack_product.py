from __future__ import annotations

from sqlalchemy import Integer, ForeignKey, String, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class StackProduct(Base):
    """
    Pivot Stack <-> Product
    - dosage_value + dosage_unit pour afficher une prise journalière.
    - note: optionnel
    """
    __tablename__ = "stack_product"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    stack_id: Mapped[int] = mapped_column(ForeignKey("stack.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("product.id", ondelete="CASCADE"), index=True)

    dosage_value: Mapped[float | None] = mapped_column(Numeric(12, 4), nullable=True)
    dosage_unit: Mapped[str] = mapped_column(String(16), default="")  # "mg", "g", "µg", etc.
    note: Mapped[str] = mapped_column(String(200), default="")

    # optional relationships (convenience)
    stack = relationship("Stack", back_populates="stack_products")
    product = relationship("Product", back_populates="stack_products")