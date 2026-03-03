"""stack_product pivot

Revision ID: 0002_stack_product
Revises: 0001_init
Create Date: 2026-03-03
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "0002_stack_product"
down_revision = "0001_init"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "stack_product",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("stack_id", sa.Integer(), sa.ForeignKey("stack.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("product.id", ondelete="CASCADE"), nullable=False),
        sa.Column("dosage_value", sa.Numeric(12, 4), nullable=True),
        sa.Column("dosage_unit", sa.String(length=16), nullable=False, server_default=""),
        sa.Column("note", sa.String(length=200), nullable=False, server_default=""),
    )
    op.create_index("ix_stack_product_stack_id", "stack_product", ["stack_id"], unique=False)
    op.create_index("ix_stack_product_product_id", "stack_product", ["product_id"], unique=False)
    op.create_unique_constraint("uq_stack_product_pair", "stack_product", ["stack_id", "product_id"])


def downgrade() -> None:
    op.drop_constraint("uq_stack_product_pair", "stack_product", type_="unique")
    op.drop_index("ix_stack_product_product_id", table_name="stack_product")
    op.drop_index("ix_stack_product_stack_id", table_name="stack_product")
    op.drop_table("stack_product")