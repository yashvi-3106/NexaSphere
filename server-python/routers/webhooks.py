import logging
import os
from typing import Any, Dict
from fastapi import APIRouter, Header, HTTPException, Request
from services.supabase import supabase_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/api/webhooks/google-sheets")
async def handle_google_sheets_webhook(
    request: Request,
    payload: Dict[str, Any],
    x_sheets_secret: str = Header(None, alias="X-Sheets-Secret")
):
    expected_secret = os.getenv("MEMBERSHIP_SECRET")
    if not expected_secret:
        logger.error("MEMBERSHIP_SECRET is not configured on the server")
        raise HTTPException(status_code=500, detail="Server misconfigured")

    if not x_sheets_secret or x_sheets_secret != expected_secret:
        logger.warning("Unauthorized webhook request received")
        raise HTTPException(status_code=401, detail="Unauthorized")

    action = payload.get("action")
    sheet_name = payload.get("sheetName")
    data = payload.get("data", {})

    if action != "sheetRowEdited":
        return {"ok": True, "message": "Action ignored"}

    email = data.get("collegeEmail") or data.get("email")
    if not email:
        logger.warning("No email found in edited row payload")
        return {"ok": False, "message": "Email is required to identify the record"}

    try:
        table_name = None
        if sheet_name == "Membership":
            table_name = "membership_forms"
        elif sheet_name == "Recruitment":
            table_name = "recruitment_forms"
        elif sheet_name == "CoreTeamApplications":
            table_name = "core_team_applications"
        else:
            logger.warning(f"Unknown sheet name in webhook: {sheet_name}")
            return {"ok": False, "message": "Unknown sheet name"}

        update_payload = {}
        for key, val in data.items():
            if key in ["timestamp", "submittedAt", "id"]:
                continue
            update_payload[key] = val

        if not update_payload:
            return {"ok": True, "message": "No fields to update"}

        async with httpx_client() as client:
            url = f"{supabase_service.url}/rest/v1/{table_name}?email=eq.{email}"
            response = await client.patch(url, headers=supabase_service.headers, json=update_payload)
            response.raise_for_status()

        logger.info(f"Successfully synced update from Google Sheets to Supabase for {email}")
        return {"ok": True, "message": "Synchronized successfully"}

    except Exception as e:
        logger.exception("Error handling Google Sheets webhook")
        raise HTTPException(status_code=500, detail=str(e))

def httpx_client():
    import httpx
    return httpx.AsyncClient()
