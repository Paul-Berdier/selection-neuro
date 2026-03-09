"""order totals + shipping

Revision ID: 0008_order_totals_shipping
Revises: 0007_product_stock
Create Date: 2026-03-06
"""

from alembic import op
import sqlalchemy as sa


revision = "0008_order_totals_shipping"
down_revision = "0007_product_stock"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("orders", sa.Column("subtotal_amount", sa.Numeric(12, 2), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("shipping_amount", sa.Numeric(12, 2), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("tax_amount", sa.Numeric(12, 2), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("grand_total_amount", sa.Numeric(12, 2), nullable=False, server_default="0"))

    op.add_column("orders", sa.Column("shipping_method", sa.String(length=32), nullable=False, server_default="standard"))
    op.add_column("orders", sa.Column("tax_rate", sa.Numeric(5, 4), nullable=False, server_default="0.2000"))

    op.create_index("ix_orders_shipping_method", "orders", ["shipping_method"])


def downgrade():
    op.drop_index("ix_orders_shipping_method", table_name="orders")
    op.drop_column("orders", "tax_rate")
    op.drop_column("orders", "shipping_method")
    op.drop_column("orders", "grand_total_amount")
    op.drop_column("orders", "tax_amount")
    op.drop_column("orders", "shipping_amount")
    op.drop_column("orders", "subtotal_amount")