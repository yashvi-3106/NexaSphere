import io
import os
import hashlib
import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from models.certificate import Certificate
from services.email import send_email_with_attachment

logger = logging.getLogger(__name__)

def make_certificate_id(student_id: str, event_id: str) -> str:
    """Deterministic, collision-resistant certificate ID based on student+event."""
    seed = f"{student_id}:{event_id}"
    digest = hashlib.sha256(seed.encode()).hexdigest()[:16]
    return f"NS-CERT-{digest.upper()}"

def build_verification_url(cert_id: str) -> str:
    """Build the public verification URL for a certificate."""
    base = os.getenv("VITE_FRONTEND_URL", "https://nexasphere-glbajaj.vercel.app")
    return f"{base}/verify/{cert_id}"

def generate_certificate_image(
    student_name: str,
    event_name: str,
    event_date: str,
    cert_id: str,
    verification_url: str,
    style: str = "default",
) -> bytes:
    """
    Generate a certificate PNG image using Pillow.
    """
    try:
        from PIL import Image, ImageDraw, ImageFont
        import qrcode

        W, H = 1200, 850
        img = Image.new("RGB", (W, H), color="#0a0a0a")
        draw = ImageDraw.Draw(img)

        # Background gradient simulation
        for y in range(H):
            t = y / H
            r = int(10 + t * 8)
            g = int(10 + t * 5)
            b = int(10 + t * 12)
            draw.line([(0, y), (W, y)], fill=(r, g, b))

        accent = {"default": (204, 17, 17), "gold": (218, 165, 32), "silver": (192, 192, 192)}
        color = accent.get(style, accent["default"])
        border_w = 6
        draw.rectangle([border_w, border_w, W - border_w, H - border_w], outline=color, width=border_w)
        draw.rectangle([border_w + 10, border_w + 10, W - border_w - 10, H - border_w - 10], outline=(*color, 80), width=1)

        ornament_size = 30
        for cx, cy in [(border_w + 18, border_w + 18), (W - border_w - 18, border_w + 18),
                       (border_w + 18, H - border_w - 18), (W - border_w - 18, H - border_w - 18)]:
            draw.ellipse([cx - ornament_size // 2, cy - ornament_size // 2,
                          cx + ornament_size // 2, cy + ornament_size // 2], fill=color, outline=None)

        try:
            font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
            font_name = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 52)
            font_body = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
            font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
        except Exception:
            font_title = font_name = font_body = font_small = ImageFont.load_default()

        draw.text((W // 2, 80), "NexaSphere — GL Bajaj", fill=color, font=font_title, anchor="mm")
        draw.text((W // 2, 115), "Certificate of Participation", fill=(200, 200, 200), font=font_body, anchor="mm")
        draw.line([(120, 150), (W - 120, 150)], fill=color, width=2)

        draw.text((W // 2, 220), "This is to certify that", fill=(160, 160, 160), font=font_body, anchor="mm")
        draw.text((W // 2, 300), student_name, fill=(255, 255, 255), font=font_name, anchor="mm")
        draw.line([(W // 2 - 200, 340), (W // 2 + 200, 340)], fill=color, width=1)

        draw.text((W // 2, 380), "has successfully participated in", fill=(160, 160, 160), font=font_body, anchor="mm")
        draw.text((W // 2, 430), event_name, fill=color, font=font_title, anchor="mm")
        draw.text((W // 2, 490), f"Held on: {event_date}", fill=(140, 140, 140), font=font_small, anchor="mm")

        draw.line([(120, 680), (W - 120, 680)], fill=(*color, 100), width=1)
        draw.text((200, 720), "NexaSphere Tech Ecosystem", fill=(120, 120, 120), font=font_small, anchor="mm")
        draw.text((200, 740), "GL Bajaj Group of Institutions", fill=(100, 100, 100), font=font_small, anchor="mm")
        draw.text((W // 2, 720), f"Certificate ID: {cert_id}", fill=(100, 100, 100), font=font_small, anchor="mm")

        qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=5, border=2)
        qr.add_data(verification_url)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color=color, back_color=(10, 10, 10))
        qr_img = qr_img.resize((140, 140), Image.LANCZOS)
        img.paste(qr_img, (W - 170, H - 190))
        draw.text((W - 100, H - 40), "Scan to verify", fill=(100, 100, 100), font=font_small, anchor="mm")

        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        return buf.getvalue()
    except Exception as e:
        logger.warning(f"Error generating Pillow image: {e} - returning transparent pixel fallback")
        return b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"

def issue_and_email_certificate(
    db: Session,
    student_id: str,
    student_name: str,
    email: str,
    event_id: str,
    event_name: str,
    event_date: str,
    style: str = "default",
):
    """
    Generates, saves, and emails a certificate for a student.
    """
    cert_id = make_certificate_id(student_id, event_id)
    existing = db.query(Certificate).filter(Certificate.certificate_id == cert_id).first()
    if existing:
        logger.info(f"Certificate {cert_id} already exists, skipping generation")
        return existing

    verification_url = build_verification_url(cert_id)
    issue_date_str = datetime.now(timezone.utc).strftime("%B %d, %Y")

    new_cert = Certificate(
        certificate_id=cert_id,
        student_id=student_id,
        student_name=student_name,
        event_id=event_id,
        event_name=event_name,
        issue_date=issue_date_str,
        verification_url=verification_url,
        template_style=style,
        status="valid",
    )

    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)

    # Generate image content
    img_bytes = generate_certificate_image(
        student_name=student_name,
        event_name=event_name,
        event_date=event_date,
        cert_id=cert_id,
        verification_url=verification_url,
        style=style,
    )

    # Email to student
    if email:
        subject = f"Your Certificate of Participation: {event_name}"
        body_text = f"Hello {student_name},\n\nThank you for participating in {event_name}.\n\nPlease find your certificate of participation attached to this email.\n\nBest regards,\nNexaSphere Team"
        send_email_with_attachment(
            to_email=email,
            subject=subject,
            body_text=body_text,
            attachment_bytes=img_bytes,
            filename=f"Certificate_{cert_id}.png"
        )

    return new_cert
