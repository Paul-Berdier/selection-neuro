from __future__ import annotations

import re
import unicodedata
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.core.sanitize import sanitize_html
from app.db.session import get_db
from app.models import Benefit, Product, ProductBenefit
from app.models.media import Media
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


def slugify(s: str) -> str:
    s = (s or "").strip().lower()
    s = s.replace("'", "'")
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[`'']+", "", s)
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


def parse_float_or_none(s: str | None) -> float | None:
    if s is None:
        return None
    v = s.strip()
    if not v:
        return None
    try:
        return float(v.replace(",", "."))
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Valeur invalide : {s!r}")


def split_tags(s: str) -> list[str]:
    return [t.strip() for t in (s or "").split(",") if t.strip()]


def upsert_media(db: Session, content: bytes, filename: str) -> Media:
    h = sha256_bytes(content)
    obj = db.query(Media).filter(Media.sha256 == h).first()
    if obj:
        return obj
    obj = Media(
        sha256=h, filename=filename,
        content_type=guess_content_type(filename),
        bytes=content, size_bytes=len(content),
    )
    db.add(obj)
    db.flush()
    return obj


def upsert_benefit(db: Session, name: str) -> Benefit:
    bslug = slugify(name)
    obj = db.query(Benefit).filter(Benefit.slug == bslug).first()
    if obj:
        obj.name = name
        return obj
    obj = Benefit(slug=bslug, name=name, description="", sort_order=100, is_active=True)
    db.add(obj)
    db.flush()
    return obj


def upsert_product(db: Session, slug: str, **fields) -> Product:
    obj = db.query(Product).filter(Product.slug == slug).first()
    if obj:
        for k, v in fields.items():
            if v is not None or k in ("image_media_id", "image_media_id_2"):
                setattr(obj, k, v)
        return obj
    obj = Product(slug=slug, **fields)
    db.add(obj)
    db.flush()
    return obj


def ensure_product(db: Session, slug: str) -> Product:
    obj = db.query(Product).filter(Product.slug == slug).first()
    if not obj:
        raise HTTPException(status_code=404, detail=f"Produit introuvable : {slug}")
    return obj


def add_product_benefits(db: Session, product_id: int, tags: list[str], mode: str) -> None:
    if mode not in ("append", "replace"):
        raise HTTPException(status_code=400, detail="benefits_mode doit être 'append' ou 'replace'")
    if mode == "replace":
        db.query(ProductBenefit).filter(ProductBenefit.product_id == product_id).delete(synchronize_session=False)
    for tag in tags:
        benefit = upsert_benefit(db, tag)
        exists = db.query(ProductBenefit).filter(
            ProductBenefit.product_id == product_id,
            ProductBenefit.benefit_id == benefit.id,
        ).first()
        if not exists:
            db.add(ProductBenefit(product_id=product_id, benefit_id=benefit.id, note="", evidence_level=None))


def product_to_dict(p: Product) -> dict:
    def _f(v): return float(v) if v is not None else None
    return {
        "id": p.id,
        "slug": p.slug,
        "name": p.name,
        "short_desc": p.short_desc,
        "description": p.description,
        "category": p.category,
        "price_month_eur": _f(p.price_month_eur),
        "image_media_id": p.image_media_id,
        "image_media_id_2": p.image_media_id_2,
        "is_active": p.is_active,
        "stock_qty": p.stock_qty,
        # Variantes de vente
        "price_1m": _f(p.price_1m), "qty_g_1m": _f(p.qty_g_1m),
        "price_3m": _f(p.price_3m), "qty_g_3m": _f(p.qty_g_3m),
        "price_1y": _f(p.price_1y), "qty_g_1y": _f(p.qty_g_1y),
    }


@router.post("/products")
async def admin_create_product(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
    name: str = Form(...),
    slug: str | None = Form(None),
    short_desc: str = Form(""),
    description: str = Form(""),
    category: str = Form(""),
    # Prix mensuel de référence — Stack uniquement
    price_month_eur: str | None = Form(None),
    # Variantes de vente
    price_1m: str | None = Form(None),
    qty_g_1m: str | None = Form(None),
    price_3m: str | None = Form(None),
    qty_g_3m: str | None = Form(None),
    price_1y: str | None = Form(None),
    qty_g_1y: str | None = Form(None),
    is_active: bool = Form(True),
    benefits: str = Form(""),
    benefits_mode: str = Form("append"),
    image: UploadFile | None = File(None),
    image2: UploadFile | None = File(None),
):
    pslug = slugify(slug or name)

    image_media_id: Optional[int] = None
    if image is not None:
        content = await image.read()
        if content:
            media = upsert_media(db, content, image.filename or "image")
            image_media_id = media.id

    image_media_id_2: Optional[int] = None
    if image2 is not None:
        content2 = await image2.read()
        if content2:
            media2 = upsert_media(db, content2, image2.filename or "image2")
            image_media_id_2 = media2.id

    product = upsert_product(
        db, pslug,
        name=name,
        short_desc=short_desc,
        description=sanitize_html(description),
        category=category,
        price_month_eur=parse_float_or_none(price_month_eur),
        price_1m=parse_float_or_none(price_1m), qty_g_1m=parse_float_or_none(qty_g_1m),
        price_3m=parse_float_or_none(price_3m), qty_g_3m=parse_float_or_none(qty_g_3m),
        price_1y=parse_float_or_none(price_1y), qty_g_1y=parse_float_or_none(qty_g_1y),
        image_media_id=image_media_id,
        image_media_id_2=image_media_id_2,
        is_active=is_active,
    )

    tags = split_tags(benefits)
    if tags:
        add_product_benefits(db, product.id, tags, benefits_mode)

    db.commit()
    db.refresh(product)
    return {"ok": True, "product": product_to_dict(product)}


@router.get("/products")
def admin_list_products(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
    q: str | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    query = db.query(Product)
    if q:
        ql = f"%{q.strip().lower()}%"
        query = query.filter((Product.slug.ilike(ql)) | (Product.name.ilike(ql)))
    if is_active is not None:
        query = query.filter(Product.is_active == is_active)
    total = query.count()
    items = query.order_by(Product.name.asc()).offset(offset).limit(limit).all()
    return {"ok": True, "total": total, "limit": limit, "offset": offset, "items": [product_to_dict(p) for p in items]}


@router.get("/products/{slug}")
def admin_get_product(slug: str, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    return {"ok": True, "product": product_to_dict(ensure_product(db, slug))}


@router.put("/products/{slug}")
async def admin_update_product(
    slug: str,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
    name: str | None = Form(None),
    short_desc: str | None = Form(None),
    description: str | None = Form(None),
    category: str | None = Form(None),
    price_month_eur: str | None = Form(None),
    price_1m: str | None = Form(None),
    qty_g_1m: str | None = Form(None),
    price_3m: str | None = Form(None),
    qty_g_3m: str | None = Form(None),
    price_1y: str | None = Form(None),
    qty_g_1y: str | None = Form(None),
    is_active: bool | None = Form(None),
    benefits: str = Form(""),
    benefits_mode: str = Form("append"),
    image: UploadFile | None = File(None),
    image2: UploadFile | None = File(None),
):
    product = ensure_product(db, slug)

    if name is not None:         product.name = name
    if short_desc is not None:   product.short_desc = short_desc
    if description is not None:  product.description = sanitize_html(description)
    if category is not None:     product.category = category
    if price_month_eur is not None:
        product.price_month_eur = parse_float_or_none(price_month_eur)
    if is_active is not None:    product.is_active = is_active

    for attr, val in [
        ("price_1m", price_1m), ("qty_g_1m", qty_g_1m),
        ("price_3m", price_3m), ("qty_g_3m", qty_g_3m),
        ("price_1y", price_1y), ("qty_g_1y", qty_g_1y),
    ]:
        if val is not None:
            setattr(product, attr, parse_float_or_none(val))

    if image is not None:
        content = await image.read()
        if content:
            media = upsert_media(db, content, image.filename or "image")
            product.image_media_id = media.id

    if image2 is not None:
        content2 = await image2.read()
        if content2:
            media2 = upsert_media(db, content2, image2.filename or "image2")
            product.image_media_id_2 = media2.id

    tags = split_tags(benefits)
    if tags:
        add_product_benefits(db, product.id, tags, benefits_mode)

    db.commit()
    db.refresh(product)
    return {"ok": True, "product": product_to_dict(product)}


@router.delete("/products/{slug}")
def admin_soft_delete_product(slug: str, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    product = ensure_product(db, slug)
    product.is_active = False
    db.commit()
    return {"ok": True, "slug": slug, "is_active": False}
