from __future__ import annotations

from sqlalchemy import String, Text, Integer, Boolean, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Product(Base):
    __tablename__ = "product"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    short_desc: Mapped[str] = mapped_column(String(300), default="")

    # description remplace description_md
    description: Mapped[str] = mapped_column(Text, default="")

    category: Mapped[str] = mapped_column(String(80), default="")
    image_media_id: Mapped[int | None] = mapped_column(
        ForeignKey("media.id", ondelete="SET NULL"), nullable=True
    )
    image_media = relationship("Media", lazy="joined")

    # Prix mensuel de RÉFÉRENCE — affiché sur la page Stack uniquement
    price_month_eur: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)

    # ── Variantes de vente (1 mois / 3 mois / 1 an) ─────────────────────────
    price_1m: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    qty_g_1m: Mapped[float | None] = mapped_column(Numeric(12, 4), nullable=True)

    price_3m: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    qty_g_3m: Mapped[float | None] = mapped_column(Numeric(12, 4), nullable=True)

    price_1y: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    qty_g_1y: Mapped[float | None] = mapped_column(Numeric(12, 4), nullable=True)
    # ─────────────────────────────────────────────────────────────────────────

    stock_qty: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    stack_products = relationship(
        "StackProduct", back_populates="product",
        cascade="all, delete-orphan", passive_deletes=True,
    )
