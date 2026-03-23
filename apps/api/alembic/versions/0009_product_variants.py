"""product_variants

Revision ID: 0009
Revises: 0008
Create Date: 2026-03-23

Ajoute les colonnes de variantes 1 mois / 3 mois / 1 an sur la table product.
- price_Xm : prix de vente pour la variante
- qty_g_Xm  : quantité en grammes livrée pour la variante
"""
from alembic import op
import sqlalchemy as sa

revision = "0009_product_variants"
down_revision = "0008_order_totals_shipping"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("product", sa.Column("price_1m",  sa.Numeric(10, 2), nullable=True))
    op.add_column("product", sa.Column("qty_g_1m",  sa.Numeric(12, 4), nullable=True))
    op.add_column("product", sa.Column("price_3m",  sa.Numeric(10, 2), nullable=True))
    op.add_column("product", sa.Column("qty_g_3m",  sa.Numeric(12, 4), nullable=True))
    op.add_column("product", sa.Column("price_1y",  sa.Numeric(10, 2), nullable=True))
    op.add_column("product", sa.Column("qty_g_1y",  sa.Numeric(12, 4), nullable=True))


def downgrade() -> None:
    for col in ("price_1m", "qty_g_1m", "price_3m", "qty_g_3m", "price_1y", "qty_g_1y"):
        op.drop_column("product", col)
