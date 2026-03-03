from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.invite import InviteRequest
from app.schemas.invite import InviteIn


def create_invite(db: Session, data: InviteIn) -> InviteRequest:
    req = InviteRequest(
        email=str(data.email).lower(),
        name=data.name.strip(),
        goal=data.goal.strip(),
        message=data.message.strip(),
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req