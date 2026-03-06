"""product stock

Revision ID: 0007_product_stock
Revises: 0006_addresses
Create Date: 2026-03-06
"""

from alembic import op
import sqlalchemy as sa


revision = "0007_product_stock"
down_revision = "0006_addresses"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("product", sa.Column("stock_qty", sa.Integer(), nullable=True))
    op.create_index("ix_product_stock_qty", "product", ["stock_qty"])


def downgrade():
    op.drop_index("ix_product_stock_qty", table_name="product")
    op.drop_column("product", "stock_qty")