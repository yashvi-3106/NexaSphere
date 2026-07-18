import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.ethereal.email")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
SMTP_SECURE = os.getenv("SMTP_SECURE", "false").lower() == "true"
EMAIL_FROM = os.getenv("EMAIL_FROM", "NexaSphere Team <noreply@nexasphere.com>")

def send_email_with_attachment(to_email: str, subject: str, body_text: str, attachment_bytes: bytes, filename: str):
    """
    Sends an email with a file attachment using SMTP configured via environment variables.
    """
    if not SMTP_USER or not SMTP_PASS:
        logger.warning(f"[Email Service - Simulated] SMTP credentials not set. Would email to {to_email} with attachment {filename}")
        return True

    try:
        msg = MIMEMultipart()
        msg["From"] = EMAIL_FROM
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body_text, "plain"))

        part = MIMEBase("application", "octet-stream")
        part.set_payload(attachment_bytes)
        encoders.encode_base64(part)
        part.add_header(
            "Content-Disposition",
            f"attachment; filename= {filename}",
        )
        msg.attach(part)

        if SMTP_SECURE:
            server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT)
        else:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
            server.starttls()

        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(EMAIL_FROM, to_email, msg.as_string())
        server.quit()
        logger.info(f"Email successfully sent to {to_email} with attachment {filename}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False
