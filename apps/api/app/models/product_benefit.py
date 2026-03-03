from __future__ import annotations

from sqlalchemy import Integer, ForeignKey, String, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ProductBenefit(Base):
    __tablename__ = "product_benefit"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    product_id: Mapped[int] = mapped_column(ForeignKey("product.id", ondelete="CASCADE"), index=True)
    benefit_id: Mapped[int] = mapped_column(ForeignKey("benefit.id", ondelete="CASCADE"), index=True)

    evidence_level: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    note: Mapped[str] = mapped_column(String(200), default="")

    product = relationship("Product")
    benefit = relationship("Benefit", back_populates="product_benefits")