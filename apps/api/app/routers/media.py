from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.media import Media

router = APIRouter(prefix="/media", tags=["media"])


@router.get("/{media_id}")
def get_media(media_id: int, db: Session = Depends(get_db)):
    m = db.query(Media).filter(Media.id == media_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Media not found")

    headers = {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": f'inline; filename="{m.filename or "image"}"',
    }
    return Response(content=m.bytes, media_type=m.content_type, headers=headers)