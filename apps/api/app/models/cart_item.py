from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, Numeric, String, UniqueConstraint, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = (
        UniqueConstraint("cart_id", "product_id", "variant_months", name="uq_cart_item_variant"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    cart_id: Mapped[int] = mapped_column(
        ForeignKey("cart.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("product.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    variant_months: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("1"))
    variant_label: Mapped[str] = mapped_column(String(32), nullable=False, server_default=text("'1 mois'"))
    variant_qty_g: Mapped[float | None] = mapped_column(Numeric(12, 4), nullable=True)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, server_default=text("0"))
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("1"))

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", lazy="joined")
