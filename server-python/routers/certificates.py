"""
Certificate Generator & QR Verification Router
Implements endpoints for dynamic event certificate generation and public QR verification.

Routes:
  POST /certificates/generate         — Admin: generate certificates for an event
  GET  /certificates/verify/{id}      — Public: verify a certificate by its unique ID
  GET  /certificates/{id}/download    — Download a generated certificate image
"""

import io
import os
import uuid
import hmac
import hashlib
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Header, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db
from models.certificate import Certificate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/certificates", tags=["certificates"])

# ---------------------------------------------------------------------------
# Database model replaced in-memory store.
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Admin auth helper — simple shared-secret check matching existing project
# pattern. Replace with JWT / session-based auth when available.
# ---------------------------------------------------------------------------
ADMIN_SECRET = os.getenv("ADMIN_SECRET")
if not ADMIN_SECRET:
    raise RuntimeError(
        "ADMIN_SECRET environment variable is required for certificate management. "
        "Set it in your .env file or environment before starting the server."
    )


def _require_admin(x_admin_secret: Optional[str] = Header(default=None)) -> None:
    """Dependency that enforces admin authentication via X-Admin-Secret header."""
    if not hmac.compare_digest(x_admin_secret or "", ADMIN_SECRET):
        raise HTTPException(status_code=401, detail="Unauthorized: invalid admin secret")


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class StudentCertificateRequest(BaseModel):
    student_id: str = Field(..., description="Unique student identifier")
    student_name: str = Field(..., min_length=1, max_length=200)
    email: Optional[str] = Field(default=None, description="Student email for dedup")


class GenerateCertificatesRequest(BaseModel):
    event_id: str = Field(..., description="Unique event identifier")
    event_name: str = Field(..., min_length=1, max_length=300)
    event_date: str = Field(..., description="Human-readable event date, e.g. 'March 15, 2025'")
    students: list[StudentCertificateRequest] = Field(..., min_length=1)
    template_style: Optional[str] = Field(
        default="default",
        description="Certificate template style: 'default' | 'gold' | 'silver'"
    )


class CertificateRecord(BaseModel):
    certificate_id: str
    student_id: str
    student_name: str
    event_id: str
    event_name: str
    issue_date: str
    verification_url: str
    status: str  # "valid" | "revoked"


class GenerateResponse(BaseModel):
    success: bool
    generated: int
    skipped: int  # already issued for this student+event combo
    certificates: list[CertificateRecord]


class VerifyResponse(BaseModel):
    valid: bool
    certificate: Optional[CertificateRecord] = None
    message: str


# ---------------------------------------------------------------------------
# Helpers & Service Imports
# ---------------------------------------------------------------------------
from services.certificates import (
    make_certificate_id,
    build_verification_url,
    generate_certificate_image,
    issue_and_email_certificate,
)

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/generate", response_model=GenerateResponse, status_code=201)
async def generate_certificates(
    body: GenerateCertificatesRequest,
    _: None = Depends(_require_admin),
    db: Session = Depends(get_db),
):
    """
    Admin-only: generate certificates for a list of students for a given event.
    Already-issued certificates (same student_id + event_id) are skipped.
    """
    generated = []
    skipped = 0

    for student in body.students:
        cert_id = make_certificate_id(student.student_id, body.event_id)
        existing = db.query(Certificate).filter(Certificate.certificate_id == cert_id).first()
        if existing:
            skipped += 1
            continue

        try:
            new_cert = issue_and_email_certificate(
                db=db,
                student_id=student.student_id,
                student_name=student.student_name,
                email=student.email or "",
                event_id=body.event_id,
                event_name=body.event_name,
                event_date=body.event_date,
                style=body.template_style or "default",
            )
            generated.append(
                CertificateRecord(
                    certificate_id=new_cert.certificate_id,
                    student_id=new_cert.student_id,
                    student_name=new_cert.student_name,
                    event_id=new_cert.event_id,
                    event_name=new_cert.event_name,
                    issue_date=new_cert.issue_date,
                    verification_url=new_cert.verification_url,
                    status=new_cert.status
                )
            )
        except Exception as e:
            logger.error(f"Error generating certificate for {student.student_id}: {e}")
            skipped += 1

    logger.info(
        "Certificate generation complete",
        extra={"event_id": body.event_id, "generated": len(generated), "skipped": skipped},
    )

    return GenerateResponse(
        success=True,
        generated=len(generated),
        skipped=skipped,
        certificates=generated,
    )


@router.get("/verify/{certificate_id}", response_model=VerifyResponse)
async def verify_certificate(certificate_id: str, db: Session = Depends(get_db)):
    """
    Public endpoint: verify a certificate by its unique ID.
    Safe for unauthenticated access — returns only public fields.
    """
    # Sanitize input
    cert_id = certificate_id.strip().upper()
    if len(cert_id) > 60 or not cert_id.startswith("NS-CERT-"):
        raise HTTPException(status_code=400, detail="Invalid certificate ID format")

    record = db.query(Certificate).filter(Certificate.certificate_id == cert_id).first()

    if not record:
        return VerifyResponse(
            valid=False,
            certificate=None,
            message="Certificate not found. It may have been revoked or does not exist.",
        )

    if record.status == "revoked":
        return VerifyResponse(
            valid=False,
            certificate=None,
            message="This certificate has been revoked.",
        )

    return VerifyResponse(
        valid=True,
        certificate=CertificateRecord(
            certificate_id=record.certificate_id,
            student_id=record.student_id,
            student_name=record.student_name,
            event_id=record.event_id,
            event_name=record.event_name,
            issue_date=record.issue_date,
            verification_url=record.verification_url,
            status=record.status
        ),
        message="Certificate verified successfully.",
    )


@router.get("/{certificate_id}/download")
async def download_certificate(certificate_id: str, db: Session = Depends(get_db)):
    """
    Download the certificate image PNG for a given certificate ID.
    Public endpoint — image contains only non-sensitive display data.
    """
    cert_id = certificate_id.strip().upper()
    record = db.query(Certificate).filter(Certificate.certificate_id == cert_id).first()

    if not record or record.status == "revoked":
        raise HTTPException(status_code=404, detail="Certificate not found")

    img_bytes = generate_certificate_image(
        student_name=record.student_name,
        event_name=record.event_name,
        event_date=record.issue_date,
        cert_id=cert_id,
        verification_url=record.verification_url,
        style=record.template_style,
    )

    safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in record.student_name)
    filename = f"NexaSphere_Certificate_{safe_name}_{cert_id}.png"

    return Response(
        content=img_bytes,
        media_type="image/png",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("", include_in_schema=False)
async def list_certificates_healthcheck(db: Session = Depends(get_db)):
    """Internal: returns certificate store count for health checks."""
    total = db.query(Certificate).count()
    return {"total_certificates": total}
