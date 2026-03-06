"""addresses + order addresses

Revision ID: 0006_addresses
Revises: 0005_stripe_payments
Create Date: 2026-03-06
"""

from alembic import op
import sqlalchemy as sa


revision = "0006_addresses"
down_revision = "0005_stripe_payments"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "address",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),

        sa.Column("label", sa.String(length=80), nullable=False, server_default=sa.text("'Home'")),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("line1", sa.String(length=200), nullable=False),
        sa.Column("line2", sa.String(length=200), nullable=False, server_default=sa.text("''")),
        sa.Column("city", sa.String(length=120), nullable=False),
        sa.Column("postal_code", sa.String(length=20), nullable=False),
        sa.Column("country", sa.String(length=2), nullable=False, server_default=sa.text("'FR'")),
        sa.Column("phone", sa.String(length=40), nullable=False, server_default=sa.text("''")),

        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),

        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_address_user_id", "address", ["user_id"])

    op.add_column("orders", sa.Column("shipping_address_id", sa.Integer(), nullable=True))
    op.add_column("orders", sa.Column("billing_address_id", sa.Integer(), nullable=True))

    op.create_index("ix_orders_shipping_address_id", "orders", ["shipping_address_id"])
    op.create_index("ix_orders_billing_address_id", "orders", ["billing_address_id"])

    op.create_foreign_key(
        "fk_orders_shipping_address",
        "orders",
        "address",
        ["shipping_address_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_orders_billing_address",
        "orders",
        "address",
        ["billing_address_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade():
    op.drop_constraint("fk_orders_billing_address", "orders", type_="foreignkey")
    op.drop_constraint("fk_orders_shipping_address", "orders", type_="foreignkey")

    op.drop_index("ix_orders_billing_address_id", table_name="orders")
    op.drop_index("ix_orders_shipping_address_id", table_name="orders")

    op.drop_column("orders", "billing_address_id")
    op.drop_column("orders", "shipping_address_id")

    op.drop_index("ix_address_user_id", table_name="address")
    op.drop_table("address")