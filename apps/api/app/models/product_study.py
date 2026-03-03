from __future__ import annotations

from sqlalchemy import Integer, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ProductStudy(Base):
    __tablename__ = "product_study"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    product_id: Mapped[int] = mapped_column(ForeignKey("product.id", ondelete="CASCADE"), index=True)
    study_id: Mapped[int] = mapped_column(ForeignKey("study.id", ondelete="CASCADE"), index=True)

    note: Mapped[str] = mapped_column(String(300), default="")

    product = relationship("Product")
    study = relationship("Study", back_populates="product_studies")