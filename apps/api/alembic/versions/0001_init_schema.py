"""init schema (products, stacks, benefits, studies, invites)

Revision ID: 0001_init_schema
Revises:
Create Date: 2026-03-03
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "0001_init_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # product
    op.create_table(
        "product",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("short_desc", sa.String(length=300), nullable=False, server_default=""),
        sa.Column("description_md", sa.Text(), nullable=False, server_default=""),
        sa.Column("category", sa.String(length=80), nullable=False, server_default=""),
        sa.Column("image_path", sa.String(length=400), nullable=False, server_default=""),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("slug", name="uq_product_slug"),
    )
    op.create_index("ix_product_slug", "product", ["slug"], unique=True)
    op.create_index("ix_product_active", "product", ["is_active"], unique=False)

    # stack
    op.create_table(
        "stack",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("subtitle", sa.String(length=300), nullable=False, server_default=""),
        sa.Column("description_md", sa.Text(), nullable=False, server_default=""),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("slug", name="uq_stack_slug"),
    )
    op.create_index("ix_stack_slug", "stack", ["slug"], unique=True)
    op.create_index("ix_stack_active", "stack", ["is_active"], unique=False)

    # stack_product pivot
    op.create_table(
        "stack_product",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("stack_id", sa.Integer(), sa.ForeignKey("stack.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("product.id", ondelete="CASCADE"), nullable=False),
        sa.Column("dosage_value", sa.Numeric(12, 4), nullable=True),
        sa.Column("dosage_unit", sa.String(length=16), nullable=False, server_default=""),
        sa.Column("note", sa.String(length=200), nullable=False, server_default=""),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="100"),
        sa.UniqueConstraint("stack_id", "product_id", name="uq_stack_product_pair"),
    )
    op.create_index("ix_stack_product_stack_id", "stack_product", ["stack_id"], unique=False)
    op.create_index("ix_stack_product_product_id", "stack_product", ["product_id"], unique=False)

    # benefit
    op.create_table(
        "benefit",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.UniqueConstraint("slug", name="uq_benefit_slug"),
    )
    op.create_index("ix_benefit_slug", "benefit", ["slug"], unique=True)
    op.create_index("ix_benefit_active", "benefit", ["is_active"], unique=False)

    # product_benefit pivot
    op.create_table(
        "product_benefit",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("product.id", ondelete="CASCADE"), nullable=False),
        sa.Column("benefit_id", sa.Integer(), sa.ForeignKey("benefit.id", ondelete="CASCADE"), nullable=False),
        sa.Column("evidence_level", sa.SmallInteger(), nullable=True),
        sa.Column("note", sa.String(length=200), nullable=False, server_default=""),
        sa.UniqueConstraint("product_id", "benefit_id", name="uq_product_benefit"),
    )
    op.create_index("ix_product_benefit_product_id", "product_benefit", ["product_id"], unique=False)
    op.create_index("ix_product_benefit_benefit_id", "product_benefit", ["benefit_id"], unique=False)

    # study
    op.create_table(
        "study",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("title", sa.String(length=400), nullable=False),
        sa.Column("url", sa.String(length=600), nullable=False, server_default=""),
        sa.Column("authors", sa.String(length=300), nullable=False, server_default=""),
        sa.Column("year", sa.SmallInteger(), nullable=True),
        sa.Column("journal", sa.String(length=200), nullable=False, server_default=""),
        sa.Column("source_type", sa.String(length=50), nullable=False, server_default=""),
        sa.Column("summary", sa.Text(), nullable=False, server_default=""),
        sa.UniqueConstraint("slug", name="uq_study_slug"),
    )
    op.create_index("ix_study_slug", "study", ["slug"], unique=True)

    # product_study pivot
    op.create_table(
        "product_study",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("product.id", ondelete="CASCADE"), nullable=False),
        sa.Column("study_id", sa.Integer(), sa.ForeignKey("study.id", ondelete="CASCADE"), nullable=False),
        sa.Column("note", sa.String(length=300), nullable=False, server_default=""),
        sa.UniqueConstraint("product_id", "study_id", name="uq_product_study"),
    )
    op.create_index("ix_product_study_product_id", "product_study", ["product_id"], unique=False)
    op.create_index("ix_product_study_study_id", "product_study", ["study_id"], unique=False)

    # invite_request
    op.create_table(
        "invite_request",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False, server_default=""),
        sa.Column("goal", sa.String(length=200), nullable=False, server_default=""),
        sa.Column("message", sa.Text(), nullable=False, server_default=""),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="new"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_invite_request_email", "invite_request", ["email"], unique=False)
    op.create_index("ix_invite_request_status", "invite_request", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_invite_request_status", table_name="invite_request")
    op.drop_index("ix_invite_request_email", table_name="invite_request")
    op.drop_table("invite_request")

    op.drop_index("ix_product_study_study_id", table_name="product_study")
    op.drop_index("ix_product_study_product_id", table_name="product_study")
    op.drop_table("product_study")

    op.drop_index("ix_study_slug", table_name="study")
    op.drop_table("study")

    op.drop_index("ix_product_benefit_benefit_id", table_name="product_benefit")
    op.drop_index("ix_product_benefit_product_id", table_name="product_benefit")
    op.drop_table("product_benefit")

    op.drop_index("ix_benefit_active", table_name="benefit")
    op.drop_index("ix_benefit_slug", table_name="benefit")
    op.drop_table("benefit")

    op.drop_index("ix_stack_product_product_id", table_name="stack_product")
    op.drop_index("ix_stack_product_stack_id", table_name="stack_product")
    op.drop_table("stack_product")

    op.drop_index("ix_stack_active", table_name="stack")
    op.drop_index("ix_stack_slug", table_name="stack")
    op.drop_table("stack")

    op.drop_index("ix_product_active", table_name="product")
    op.drop_index("ix_product_slug", table_name="product")
    op.drop_table("product")