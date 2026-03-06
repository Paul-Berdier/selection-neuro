"""cart + orders

Revision ID: 0004_cart_orders
Revises: 0003_users_auth
Create Date: 2026-03-05
"""

from alembic import op
import sqlalchemy as sa


revision = "0004_cart_orders"
down_revision = "0003_users_auth"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "carts",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("user_id", name="uq_carts_user_id"),
    )
    op.create_index("ix_carts_user_id", "carts", ["user_id"], unique=True)

    op.create_table(
        "cart_items",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("cart_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["cart_id"], ["carts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["product_id"], ["product.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("cart_id", "product_id", name="uq_cart_items_cart_product"),
    )
    op.create_index("ix_cart_items_cart_id", "cart_items", ["cart_id"])
    op.create_index("ix_cart_items_product_id", "cart_items", ["product_id"])

    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default=sa.text("'created'")),
        sa.Column("payment_status", sa.String(length=32), nullable=False, server_default=sa.text("'unpaid'")),
        sa.Column("currency", sa.String(length=8), nullable=False, server_default=sa.text("'EUR'")),
        sa.Column("total_amount", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="RESTRICT"),
    )
    op.create_index("ix_orders_user_id", "orders", ["user_id"])

    op.create_table(
        "order_items",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("product_name", sa.String(length=255), nullable=False),
        sa.Column("unit_price", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("line_total", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["product_id"], ["product.id"], ondelete="RESTRICT"),
    )
    op.create_index("ix_order_items_order_id", "order_items", ["order_id"])
    op.create_index("ix_order_items_product_id", "order_items", ["product_id"])


def downgrade():
    op.drop_index("ix_order_items_product_id", table_name="order_items")
    op.drop_index("ix_order_items_order_id", table_name="order_items")
    op.drop_table("order_items")

    op.drop_index("ix_orders_user_id", table_name="orders")
    op.drop_table("orders")

    op.drop_index("ix_cart_items_product_id", table_name="cart_items")
    op.drop_index("ix_cart_items_cart_id", table_name="cart_items")
    op.drop_table("cart_items")

    op.drop_index("ix_carts_user_id", table_name="carts")
    op.drop_table("carts")