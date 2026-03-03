from __future__ import annotations

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.product import Product
from app.models.stack import Stack


def upsert_product(db: Session, slug: str, **kwargs) -> None:
    p = db.query(Product).filter(Product.slug == slug).first()
    if p:
        for k, v in kwargs.items():
            setattr(p, k, v)
        return
    db.add(Product(slug=slug, **kwargs))


def upsert_stack(db: Session, slug: str, **kwargs) -> None:
    s = db.query(Stack).filter(Stack.slug == slug).first()
    if s:
        for k, v in kwargs.items():
            setattr(s, k, v)
        return
    db.add(Stack(slug=slug, **kwargs))


def main() -> None:
    db = SessionLocal()
    try:
        upsert_stack(
            db,
            slug="stack-premium",
            title="Stack Premium",
            subtitle="Plasticité · Synaptogenèse · Cognition",
            description="Stack premium (seed) — remplace par tes vrais textes/import Notion.",
            is_active=True,
        )
        upsert_stack(
            db,
            slug="stack-equilibre",
            title="Stack Équilibre",
            subtitle="Stabilité · Clarté · Récupération",
            description="Stack équilibre (seed) — remplace par tes vrais textes/import Notion.",
            is_active=True,
        )

        upsert_product(
            db,
            slug="creatine",
            name="Créatine",
            short_desc="Support énergie / endurance mentale",
            description="Produit seed. À remplacer.",
            category="performance",
            price_month_eur=None,
            is_active=True,
        )
        upsert_product(
            db,
            slug="dha-algues",
            name="DHA (algues)",
            short_desc="Membranes neuronales / synapses",
            description="Produit seed. À remplacer.",
            category="cognition",
            price_month_eur=None,
            is_active=True,
        )

        db.commit()
        print("Seed OK")
    finally:
        db.close()


if __name__ == "__main__":
    main()