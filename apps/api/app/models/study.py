from __future__ import annotations

from sqlalchemy import Integer, String, Text, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Study(Base):
    __tablename__ = "study"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(400))

    url: Mapped[str] = mapped_column(String(600), default="")
    authors: Mapped[str] = mapped_column(String(300), default="")
    year: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    journal: Mapped[str] = mapped_column(String(200), default="")
    source_type: Mapped[str] = mapped_column(String(50), default="")
    summary: Mapped[str] = mapped_column(Text, default="")

    product_studies = relationship(
        "ProductStudy",
        back_populates="study",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )