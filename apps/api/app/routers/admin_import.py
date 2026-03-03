from __future__ import annotations

import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.auth import require_admin_token
from app.importers.notion_import import run_import

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/import-notion")
def import_notion_zip(
    _: None = Depends(require_admin_token),
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
):
    if not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Upload must be a .zip Notion export")

    with tempfile.TemporaryDirectory() as td:
        zip_path = Path(td) / "notion_export.zip"
        with zip_path.open("wb") as f:
            while True:
                chunk = file.file.read(1024 * 1024)
                if not chunk:
                    break
                f.write(chunk)

        try:
            stats = run_import(db=db, zip_path=zip_path)
            db.commit()
            return {"ok": True, **stats}
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Import failed: {type(e).__name__}") from e