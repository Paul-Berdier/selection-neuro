from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.stack import StackListOut, StackOut
from app.schemas.stack_product import StackProductOut
from app.services.stack_service import list_stacks, get_stack_by_slug

router = APIRouter(prefix="/stacks", tags=["stacks"])


def _stack_to_out(s) -> StackOut:
    products = []
    for sp in (getattr(s, "stack_products", None) or []):
        p = sp.product
        price = getattr(p, "price_month_eur", None)
        products.append(StackProductOut(
            product_id=p.id,
            product_slug=p.slug,
            product_name=p.name,
            product_short_desc=p.short_desc or "",
            product_category=p.category or "",
            product_price_month_eur=float(price) if price is not None else None,
            dosage_value=float(sp.dosage_value) if sp.dosage_value is not None else None,
            dosage_unit=sp.dosage_unit or "",
            note=sp.note or "",
        ))
    return StackOut(
        slug=s.slug,
        title=s.title,
        subtitle=s.subtitle or "",
        description=getattr(s, "description", "") or "",
        products=products,
    )


@router.get("", response_model=StackListOut)
def stacks(db: Session = Depends(get_db)):
    return StackListOut(items=[_stack_to_out(s) for s in list_stacks(db)])


@router.get("/{slug}", response_model=StackOut)
def stack(slug: str, db: Session = Depends(get_db)):
    s = get_stack_by_slug(db, slug)
    if not s:
        raise HTTPException(status_code=404, detail="Stack not found")
    return _stack_to_out(s)
