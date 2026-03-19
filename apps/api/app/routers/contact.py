from __future__ import annotations

import logging
from fastapi import APIRouter, File, Form, UploadFile, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("")
async def submit_contact(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(...),
    source: str = Form(default="direct"),
    image: UploadFile | None = File(default=None),
):
    """
    Formulaire de contact.
    - Journalise le lead avec sa source (UTM, QR, referrer)
    - Accepte une image optionnelle
    - Anti-spam : validation côté front (captcha mathématique)
    """
    # Validation basique anti-spam
    if len(message) < 10:
        return JSONResponse(status_code=400, content={"detail": "Message trop court."})
    if len(message) > 5000:
        return JSONResponse(status_code=400, content={"detail": "Message trop long."})

    image_info = None
    if image and image.filename:
        content = await image.read()
        image_info = {"filename": image.filename, "size": len(content), "content_type": image.content_type}

    # Journalisation structurée du lead (extensible vers DB ou email)
    logger.info(
        "contact_lead",
        extra={
            "name": name,
            "email": email,
            "source": source,
            "message_length": len(message),
            "has_image": image_info is not None,
            "image": image_info,
            "ip": request.client.host if request.client else None,
        },
    )

    # TODO: envoyer un email via SMTP ou SendGrid, ou insérer en DB
    # Pour l'instant : log + réponse OK

    return {"ok": True, "message": "Message reçu. Nous vous répondrons dans les meilleurs délais."}
