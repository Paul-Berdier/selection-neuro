"""stripe payments

Revision ID: 0005_stripe_payments
Revises: 0004_cart_orders
Create Date: 2026-03-06
"""

from alembic import op
import sqlalchemy as sa


revision = "0005_stripe_payments"
down_revision = "0004_cart_orders"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("orders", sa.Column("payment_provider", sa.String(length=32), nullable=False, server_default="stripe"))
    op.add_column("orders", sa.Column("stripe_session_id", sa.String(length=255), nullable=True))
    op.add_column("orders", sa.Column("stripe_payment_intent_id", sa.String(length=255), nullable=True))
    op.add_column("orders", sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True))

    op.create_index("ix_orders_stripe_session_id", "orders", ["stripe_session_id"], unique=False)
    op.create_index("ix_orders_stripe_payment_intent_id", "orders", ["stripe_payment_intent_id"], unique=False)

    op.create_table(
        "stripe_event",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_id", sa.String(length=255), nullable=False),
        sa.Column("event_type", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("event_id", name="uq_stripe_event_event_id"),
    )
    op.create_index("ix_stripe_event_event_id", "stripe_event", ["event_id"], unique=True)


def downgrade():
    op.drop_index("ix_stripe_event_event_id", table_name="stripe_event")
    op.drop_table("stripe_event")

    op.drop_index("ix_orders_stripe_payment_intent_id", table_name="orders")
    op.drop_index("ix_orders_stripe_session_id", table_name="orders")
    op.drop_column("orders", "paid_at")
    op.drop_column("orders", "stripe_payment_intent_id")
    op.drop_column("orders", "stripe_session_id")
    op.drop_column("orders", "payment_provider")