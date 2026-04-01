"""add image_media_id_2 to product

Revision ID: 0002_image2
Revises: 0001_init
Create Date: 2025-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_image2"
down_revision = "0001_init"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "product",
        sa.Column("image_media_id_2", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_product_image2",
        "product",
        "media",
        ["image_media_id_2"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_product_image2", "product", type_="foreignkey")
    op.drop_column("product", "image_media_id_2")
