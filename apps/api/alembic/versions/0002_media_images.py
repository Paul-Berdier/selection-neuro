"""add media table + product.image_media_id

Revision ID: 0002_media_images
Revises: 0001_init_schema
Create Date: 2026-03-03
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "0002_media_images"
down_revision = "0001_init_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "media",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("sha256", sa.String(length=64), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("content_type", sa.String(length=100), nullable=False, server_default="application/octet-stream"),
        sa.Column("bytes", sa.LargeBinary(), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("sha256", name="uq_media_sha256"),
    )
    op.create_index("ix_media_sha256", "media", ["sha256"], unique=True)

    op.add_column("product", sa.Column("image_media_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_product_image_media",
        "product",
        "media",
        ["image_media_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("ix_product_image_media_id", "product", ["image_media_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_product_image_media_id", table_name="product")
    op.drop_constraint("fk_product_image_media", "product", type_="foreignkey")
    op.drop_column("product", "image_media_id")

    op.drop_index("ix_media_sha256", table_name="media")
    op.drop_table("media")