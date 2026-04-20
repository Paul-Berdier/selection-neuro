"""persist selected variants in cart and order items

Revision ID: 0003_cart_order_variants
Revises: 0002_image2
Create Date: 2026-04-20 16:30:00.000000
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "0003_cart_order_variants"
down_revision = "0002_image2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "cart_items",
        sa.Column("variant_months", sa.Integer(), nullable=False, server_default=sa.text("1")),
    )
    op.add_column(
        "cart_items",
        sa.Column("variant_label", sa.String(32), nullable=False, server_default=sa.text("'1 mois'")),
    )
    op.add_column(
        "cart_items",
        sa.Column("variant_qty_g", sa.Numeric(12, 4), nullable=True),
    )
    op.add_column(
        "cart_items",
        sa.Column("unit_price", sa.Numeric(10, 2), nullable=False, server_default=sa.text("0")),
    )

    op.execute(
        """
        UPDATE cart_items AS ci
        SET
            unit_price = COALESCE(p.price_1m, p.price_month_eur, 0),
            variant_qty_g = p.qty_g_1m,
            variant_label = '1 mois',
            variant_months = 1
        FROM product AS p
        WHERE p.id = ci.product_id
        """
    )

    op.drop_constraint("uq_cart_item", "cart_items", type_="unique")
    op.create_unique_constraint(
        "uq_cart_item_variant",
        "cart_items",
        ["cart_id", "product_id", "variant_months"],
    )

    op.add_column(
        "order_item",
        sa.Column("variant_months", sa.Integer(), nullable=False, server_default=sa.text("1")),
    )
    op.add_column(
        "order_item",
        sa.Column("variant_label", sa.String(32), nullable=False, server_default=sa.text("'1 mois'")),
    )
    op.add_column(
        "order_item",
        sa.Column("variant_qty_g", sa.Numeric(12, 4), nullable=True),
    )

    op.execute(
        """
        UPDATE order_item AS oi
        SET
            variant_qty_g = p.qty_g_1m,
            variant_label = '1 mois',
            variant_months = 1
        FROM product AS p
        WHERE p.id = oi.product_id
        """
    )


def downgrade() -> None:
    op.drop_constraint("uq_cart_item_variant", "cart_items", type_="unique")
    op.create_unique_constraint("uq_cart_item", "cart_items", ["cart_id", "product_id"])

    op.drop_column("order_item", "variant_qty_g")
    op.drop_column("order_item", "variant_label")
    op.drop_column("order_item", "variant_months")

    op.drop_column("cart_items", "unit_price")
    op.drop_column("cart_items", "variant_qty_g")
    op.drop_column("cart_items", "variant_label")
    op.drop_column("cart_items", "variant_months")
