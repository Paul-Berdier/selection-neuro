"""add users table (auth)

Revision ID: 0003_users_auth
Revises: 0002_media_images
Create Date: 2026-03-04
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "0003_users_auth"
down_revision = "0002_media_images"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),

        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),

        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.text("false")),

        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),

        sa.UniqueConstraint("email", name="uq_user_email"),
    )
    op.create_index("ix_user_email", "user", ["email"], unique=True)
    op.create_index("ix_user_active", "user", ["is_active"], unique=False)
    op.create_index("ix_user_admin", "user", ["is_admin"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_user_admin", table_name="user")
    op.drop_index("ix_user_active", table_name="user")
    op.drop_index("ix_user_email", table_name="user")
    op.drop_table("user")