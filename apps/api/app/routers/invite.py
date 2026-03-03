from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.invite import InviteIn, InviteOut
from app.services.invite_service import create_invite

router = APIRouter(prefix="/invite", tags=["invite"])


@router.post("", response_model=InviteOut)
def invite(payload: InviteIn, db: Session = Depends(get_db)):
    create_invite(db, payload)
    return InviteOut(ok=True)