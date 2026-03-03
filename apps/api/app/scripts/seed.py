from __future__ import annotations

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.product import Product
from app.models.stack import Stack
from app.models.stack_product import StackProduct


def upsert_product(db: Session, slug: str, **kwargs) -> Product:
    p = db.query(Product).filter(Product.slug == slug).first()
    if p:
        for k, v in kwargs.items():
            setattr(p, k, v)
        return p
    p = Product(slug=slug, **kwargs)
    db.add(p)
    return p


def upsert_stack(db: Session, slug: str, **kwargs) -> Stack:
    s = db.query(Stack).filter(Stack.slug == slug).first()
    if s:
        for k, v in kwargs.items():
            setattr(s, k, v)
        return s
    s = Stack(slug=slug, **kwargs)
    db.add(s)
    return s


def upsert_stack_product(
    db: Session,
    stack: Stack,
    product: Product,
    dosage_value: float | None,
    dosage_unit: str,
    note: str = "",
) -> None:
    sp = (
        db.query(StackProduct)
        .filter(StackProduct.stack_id == stack.id, StackProduct.product_id == product.id)
        .first()
    )
    if sp:
        sp.dosage_value = dosage_value
        sp.dosage_unit = dosage_unit
        sp.note = note
        return

    db.add(
        StackProduct(
            stack=stack,
            product=product,
            dosage_value=dosage_value,
            dosage_unit=dosage_unit,
            note=note,
        )
    )


def main() -> None:
    db = SessionLocal()
    try:
        # stacks
        premium = upsert_stack(
            db,
            slug="stack-premium",
            title="Stack Premium",
            subtitle="Plasticité · Synaptogenèse · Cognition",
            description="Stack premium (seed) — à remplacer par ton import Notion.",
            is_active=True,
        )
        equilibre = upsert_stack(
            db,
            slug="stack-equilibre",
            title="Stack Équilibre",
            subtitle="Stabilité · Clarté · Récupération",
            description="Stack équilibre (seed) — à remplacer par ton import Notion.",
            is_active=True,
        )

        # products
        creatine = upsert_product(
            db,
            slug="creatine",
            name="Créatine",
            short_desc="Support énergie / endurance mentale",
            description="Produit seed. À remplacer.",
            category="performance",
            price_month_eur=None,
            is_active=True,
        )
        dha = upsert_product(
            db,
            slug="dha-algues",
            name="DHA (algues)",
            short_desc="Membranes neuronales / synapses",
            description="Produit seed. À remplacer.",
            category="cognition",
            price_month_eur=None,
            is_active=True,
        )
        bacopa = upsert_product(
            db,
            slug="bacopa",
            name="Bacopa (extrait)",
            short_desc="Mémoire / consolidation",
            description="Produit seed. À remplacer.",
            category="cognition",
            price_month_eur=None,
            is_active=True,
        )

        db.flush()  # ensure ids

        # pivot dosages (exemple)
        upsert_stack_product(db, premium, creatine, 5.0, "g")
        upsert_stack_product(db, premium, dha, 600.0, "mg")
        upsert_stack_product(db, premium, bacopa, 300.0, "mg")

        upsert_stack_product(db, equilibre, creatine, 3.0, "g", note="optionnel")
        upsert_stack_product(db, equilibre, dha, 600.0, "mg")

        db.commit()
        print("Seed OK")
    finally:
        db.close()


if __name__ == "__main__":
    main()