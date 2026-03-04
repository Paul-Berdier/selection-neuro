from __future__ import annotations

import re
import unicodedata
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.auth import require_admin_token
from app.db.session import get_db
from app.models import Product, Benefit, ProductBenefit
from app.models.media import Media


router = APIRouter(prefix="/admin", tags=["admin"])


# -----------------------
# Helpers
# -----------------------

def slugify(s: str) -> str:
    s = (s or "").strip().lower()
    s = s.replace("’", "'")
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[`'’]+", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "item"


def sha256_bytes(b: bytes) -> str:
    import hashlib
    return hashlib.sha256(b).hexdigest()


def guess_content_type(filename: str) -> str:
    import mimetypes
    ct, _ = mimetypes.guess_type(filename)
    return ct or "application/octet-stream"


def upsert_media(db: Session, content: bytes, filename: str) -> Media:
    h = sha256_bytes(content)
    obj = db.query(Media).filter(Media.sha256 == h).first()
    if obj:
        return obj

    obj = Media(
        sha256=h,
        filename=filename,
        content_type=guess_content_type(filename),
        bytes=content,
        size_bytes=len(content),
    )
    db.add(obj)
    db.flush()
    return obj


def upsert_benefit(db: Session, name: str) -> Benefit:
    bslug = slugify(name)
    obj = db.query(Benefit).filter(Benefit.slug == bslug).first()
    if obj:
        # on met à jour le name (utile si tu changes l'emoji / libellé)
        obj.name = name
        return obj

    obj = Benefit(
        slug=bslug,
        name=name,
        description="",
        sort_order=100,
        is_active=True,
    )
    db.add(obj)
    db.flush()
    return obj


def upsert_product(db: Session, slug: str, **fields) -> Product:
    obj = db.query(Product).filter(Product.slug == slug).first()
    if obj:
        for k, v in fields.items():
            setattr(obj, k, v)
        return obj

    obj = Product(slug=slug, **fields)
    db.add(obj)
    db.flush()
    return obj


def upsert_product_benefit(db: Session, product_id: int, benefit_id: int) -> None:
    obj = (
        db.query(ProductBenefit)
        .filter(ProductBenefit.product_id == product_id, ProductBenefit.benefit_id == benefit_id)
        .first()
    )
    if obj:
        return
    db.add(
        ProductBenefit(
            product_id=product_id,
            benefit_id=benefit_id,
            note="",
            evidence_level=None,
        )
    )


# -----------------------
# Route: Create/Update Product
# -----------------------
@router.post("/products")
async def admin_create_or_update_product(
    _: None = Depends(require_admin_token),
    db: Session = Depends(get_db),
    # Champs Product
    name: str = Form(...),
    slug: str | None = Form(None),
    short_desc: str = Form(""),
    description_md: str = Form(""),
    category: str = Form(""),
    price_month_eur: str | None = Form(None),
    is_active: bool = Form(True),
    # Benefits via tags (CSV / Notion style) : "⚡..., 🧬..., ..."
    benefits: str = Form(""),
    # Image upload
    image: UploadFile | None = File(None),
):
    # slug auto
    pslug = slugify(slug or name)

    # image => Media
    image_media_id: Optional[int] = None
    if image is not None:
        content = await image.read()
        if content:
            m = upsert_media(db, content, image.filename or "image")
            image_media_id = m.id

    # price parse
    price_val: Optional[float] = None
    if price_month_eur:
        try:
            price_val = float(price_month_eur.replace(",", ".").strip())
        except ValueError:
            raise HTTPException(status_code=400, detail="price_month_eur must be a number")

    # upsert product
    p = upsert_product(
        db,
        pslug,
        name=name,
        short_desc=short_desc,
        description_md=description_md,
        category=category,
        image_path="",  # ton modèle Product a ce champ
        price_month_eur=price_val,
        image_media_id=image_media_id,
        is_active=is_active,
    )

    # benefits: split by comma
    tags = [t.strip() for t in (benefits or "").split(",") if t.strip()]
    for tag in tags:
        b = upsert_benefit(db, tag)
        upsert_product_benefit(db, p.id, b.id)

    db.commit()
    db.refresh(p)

    return {
        "ok": True,
        "product": {
            "id": p.id,
            "slug": p.slug,
            "name": p.name,
            "short_desc": p.short_desc,
            "category": p.category,
            "price_month_eur": float(p.price_month_eur) if p.price_month_eur is not None else None,
            "image_media_id": p.image_media_id,
            "is_active": p.is_active,
        },
        "benefits_added": tags,
    }