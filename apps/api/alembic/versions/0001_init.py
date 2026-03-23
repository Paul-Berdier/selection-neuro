"""Schéma initial complet — Sélection Neuro

Revision ID: 0001_init
Revises: None
Create Date: 2026-03-23

Schéma de référence : DB fraîche.
Inclut dès le départ :
  - product avec variantes 1m/3m/1an, description (pas description_md), price_month_eur (réf. Stack)
  - stack, stack_product, benefit, product_benefit, study, product_study
  - media, user, cart, cart_item, order, order_item
  - address, stripe_event, invite_request
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:

    # ── media ─────────────────────────────────────────────────────────────────
    op.create_table(
        "media",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("sha256", sa.String(64), nullable=False, unique=True),
        sa.Column("filename", sa.String(300), nullable=False, server_default=""),
        sa.Column("content_type", sa.String(120), nullable=False, server_default=""),
        sa.Column("bytes", sa.LargeBinary(), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_media_sha256", "media", ["sha256"], unique=True)

    # ── product ───────────────────────────────────────────────────────────────
    op.create_table(
        "product",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("slug", sa.String(120), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("short_desc", sa.String(300), nullable=False, server_default=""),
        # description remplace description_md
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("category", sa.String(80), nullable=False, server_default=""),
        sa.Column("image_media_id", sa.Integer(), sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True),
        # Prix mensuel de RÉFÉRENCE — affiché sur la page Stack uniquement
        sa.Column("price_month_eur", sa.Numeric(10, 2), nullable=True),
        # ── Variantes de vente ──────────────────────────────────────────────
        # 1 mois
        sa.Column("price_1m", sa.Numeric(10, 2), nullable=True),
        sa.Column("qty_g_1m", sa.Numeric(12, 4), nullable=True),
        # 3 mois
        sa.Column("price_3m", sa.Numeric(10, 2), nullable=True),
        sa.Column("qty_g_3m", sa.Numeric(12, 4), nullable=True),
        # 1 an
        sa.Column("price_1y", sa.Numeric(10, 2), nullable=True),
        sa.Column("qty_g_1y", sa.Numeric(12, 4), nullable=True),
        # ────────────────────────────────────────────────────────────────────
        sa.Column("stock_qty", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("slug", name="uq_product_slug"),
    )
    op.create_index("ix_product_slug", "product", ["slug"], unique=True)
    op.create_index("ix_product_active", "product", ["is_active"])

    # ── stack ─────────────────────────────────────────────────────────────────
    op.create_table(
        "stack",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("slug", sa.String(120), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("subtitle", sa.String(300), nullable=False, server_default=""),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("slug", name="uq_stack_slug"),
    )
    op.create_index("ix_stack_slug", "stack", ["slug"], unique=True)
    op.create_index("ix_stack_active", "stack", ["is_active"])

    # ── stack_product ──────────────────────────────────────────────────────────
    op.create_table(
        "stack_product",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("stack_id", sa.Integer(), sa.ForeignKey("stack.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("product.id", ondelete="CASCADE"), nullable=False),
        sa.Column("dosage_value", sa.Numeric(12, 4), nullable=True),
        sa.Column("dosage_unit", sa.String(16), nullable=False, server_default=""),
        sa.Column("note", sa.String(300), nullable=False, server_default=""),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="100"),
        sa.UniqueConstraint("stack_id", "product_id", name="uq_stack_product_pair"),
    )
    op.create_index("ix_stack_product_stack_id", "stack_product", ["stack_id"])
    op.create_index("ix_stack_product_product_id", "stack_product", ["product_id"])

    # ── benefit ───────────────────────────────────────────────────────────────
    op.create_table(
        "benefit",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("slug", sa.String(120), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.UniqueConstraint("slug", name="uq_benefit_slug"),
    )
    op.create_index("ix_benefit_slug", "benefit", ["slug"], unique=True)

    # ── product_benefit ────────────────────────────────────────────────────────
    op.create_table(
        "product_benefit",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("product.id", ondelete="CASCADE"), nullable=False),
        sa.Column("benefit_id", sa.Integer(), sa.ForeignKey("benefit.id", ondelete="CASCADE"), nullable=False),
        sa.Column("evidence_level", sa.SmallInteger(), nullable=True),
        sa.Column("note", sa.String(200), nullable=False, server_default=""),
        sa.UniqueConstraint("product_id", "benefit_id", name="uq_product_benefit"),
    )
    op.create_index("ix_product_benefit_product_id", "product_benefit", ["product_id"])
    op.create_index("ix_product_benefit_benefit_id", "product_benefit", ["benefit_id"])

    # ── study ──────────────────────────────────────────────────────────────────
    op.create_table(
        "study",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("slug", sa.String(160), nullable=False),
        sa.Column("title", sa.String(400), nullable=False),
        sa.Column("url", sa.String(600), nullable=False, server_default=""),
        sa.Column("authors", sa.String(300), nullable=False, server_default=""),
        sa.Column("year", sa.SmallInteger(), nullable=True),
        sa.Column("journal", sa.String(200), nullable=False, server_default=""),
        sa.Column("source_type", sa.String(50), nullable=False, server_default=""),
        sa.Column("summary", sa.Text(), nullable=False, server_default=""),
        sa.UniqueConstraint("slug", name="uq_study_slug"),
    )
    op.create_index("ix_study_slug", "study", ["slug"], unique=True)

    # ── product_study ──────────────────────────────────────────────────────────
    op.create_table(
        "product_study",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("product.id", ondelete="CASCADE"), nullable=False),
        sa.Column("study_id", sa.Integer(), sa.ForeignKey("study.id", ondelete="CASCADE"), nullable=False),
        sa.Column("note", sa.String(300), nullable=False, server_default=""),
        sa.UniqueConstraint("product_id", "study_id", name="uq_product_study"),
    )
    op.create_index("ix_product_study_product_id", "product_study", ["product_id"])
    op.create_index("ix_product_study_study_id", "product_study", ["study_id"])

    # ── user ───────────────────────────────────────────────────────────────────
    op.create_table(
        "user",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(200), nullable=False, server_default=""),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("email", name="uq_user_email"),
    )
    op.create_index("ix_user_email", "user", ["email"], unique=True)

    # ── address ────────────────────────────────────────────────────────────────
    op.create_table(
        "address",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id", ondelete="CASCADE"), nullable=False),
        sa.Column("label", sa.String(100), nullable=False, server_default=""),
        sa.Column("full_name", sa.String(200), nullable=False, server_default=""),
        sa.Column("line1", sa.String(300), nullable=False, server_default=""),
        sa.Column("line2", sa.String(300), nullable=False, server_default=""),
        sa.Column("city", sa.String(100), nullable=False, server_default=""),
        sa.Column("postal_code", sa.String(20), nullable=False, server_default=""),
        sa.Column("country", sa.String(2), nullable=False, server_default="FR"),
        sa.Column("phone", sa.String(30), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_address_user_id", "address", ["user_id"])

    # ── cart ───────────────────────────────────────────────────────────────────
    op.create_table(
        "cart",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_cart_user_id", "cart", ["user_id"], unique=True)

    # ── cart_item ──────────────────────────────────────────────────────────────
    op.create_table(
        "cart_items",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("cart_id", sa.Integer(), sa.ForeignKey("cart.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("product.id", ondelete="CASCADE"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("cart_id", "product_id", name="uq_cart_item"),
    )
    op.create_index("ix_cart_items_cart_id", "cart_items", ["cart_id"])

    # ── orders ─────────────────────────────────────────────────────────────────
    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default=sa.text("'created'")),
        sa.Column("payment_status", sa.String(32), nullable=False, server_default=sa.text("'unpaid'")),
        sa.Column("payment_provider", sa.String(32), nullable=True),
        sa.Column("currency", sa.String(8), nullable=False, server_default=sa.text("'EUR'")),
        sa.Column("total_amount", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("subtotal_amount", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("shipping_amount", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("tax_amount", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("grand_total_amount", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("shipping_method", sa.String(32), nullable=False, server_default=sa.text("'standard'")),
        sa.Column("tax_rate", sa.Numeric(5, 4), nullable=False, server_default=sa.text("0.2000")),
        sa.Column("shipping_address_id", sa.Integer(), sa.ForeignKey("address.id", ondelete="SET NULL"), nullable=True),
        sa.Column("billing_address_id", sa.Integer(), sa.ForeignKey("address.id", ondelete="SET NULL"), nullable=True),
        sa.Column("stripe_session_id", sa.String(200), nullable=True),
        sa.Column("stripe_payment_intent_id", sa.String(200), nullable=True),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_orders_user_id", "orders", ["user_id"])
    op.create_index("ix_orders_status", "orders", ["status"])

    # ── order_item ─────────────────────────────────────────────────────────────
    op.create_table(
        "order_item",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("product.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("product_name", sa.String(200), nullable=False, server_default=""),
        sa.Column("unit_price", sa.Numeric(10, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("line_total", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
    )
    op.create_index("ix_order_item_order_id", "order_item", ["order_id"])

    # ── stripe_event ───────────────────────────────────────────────────────────
    op.create_table(
        "stripe_event",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("event_id", sa.String(200), nullable=False, unique=True),
        sa.Column("event_type", sa.String(100), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_stripe_event_event_id", "stripe_event", ["event_id"], unique=True)

    # ── invite_request ─────────────────────────────────────────────────────────
    op.create_table(
        "invite_request",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("name", sa.String(200), nullable=False, server_default=""),
        sa.Column("goal", sa.String(200), nullable=False, server_default=""),
        sa.Column("message", sa.Text(), nullable=False, server_default=""),
        sa.Column("status", sa.String(30), nullable=False, server_default="new"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_invite_request_email", "invite_request", ["email"])
    op.create_index("ix_invite_request_status", "invite_request", ["status"])


def downgrade() -> None:
    for t in [
        "invite_request", "stripe_event", "order_item", "orders",
        "cart_items", "cart", "address", "user",
        "product_study", "product_benefit", "study", "benefit",
        "stack_product", "stack", "product", "media",
    ]:
        op.drop_table(t)
