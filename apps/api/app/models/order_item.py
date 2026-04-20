from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, Numeric, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class OrderItem(Base):
    __tablename__ = "order_item"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("product.id", ondelete="RESTRICT"),
        nullable=False,
    )

    product_name: Mapped[str] = mapped_column(String(200), nullable=False, server_default=text("''"))
    variant_months: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("1"))
    variant_label: Mapped[str] = mapped_column(String(32), nullable=False, server_default=text("'1 mois'"))
    variant_qty_g: Mapped[float | None] = mapped_column(Numeric(12, 4), nullable=True)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, server_default=text("0"))
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("1"))
    line_total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))

    order = relationship("Order", back_populates="items")
