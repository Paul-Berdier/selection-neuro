from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.address import Address
from app.models.user import User
from app.schemas.address import AddressIn, AddressOut

router = APIRouter(prefix="/addresses", tags=["addresses"])


def _to_out(a: Address) -> AddressOut:
    return AddressOut(
        id=a.id,
        label=a.label,
        full_name=a.full_name,
        line1=a.line1,
        line2=a.line2 or "",
        city=a.city,
        postal_code=a.postal_code,
        country=a.country,
        phone=a.phone or "",
    )


@router.get("", response_model=list[AddressOut])
def list_addresses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items = db.query(Address).filter(Address.user_id == user.id).order_by(Address.id.desc()).all()
    return [_to_out(a) for a in items]


@router.post("", response_model=AddressOut)
def create_address(payload: AddressIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = Address(user_id=user.id, **payload.model_dump())
    db.add(a)
    db.commit()
    db.refresh(a)
    return _to_out(a)


@router.get("/{address_id}", response_model=AddressOut)
def get_address(address_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Address not found")
    return _to_out(a)


@router.put("/{address_id}", response_model=AddressOut)
def update_address(address_id: int, payload: AddressIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Address not found")
    for k, v in payload.model_dump().items():
        setattr(a, k, v)
    db.commit()
    db.refresh(a)
    return _to_out(a)


@router.delete("/{address_id}")
def delete_address(address_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(a)
    db.commit()
    return {"ok": True}