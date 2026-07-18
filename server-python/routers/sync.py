import logging
import httpx
from fastapi import APIRouter, HTTPException, BackgroundTasks
from services.supabase import supabase_service
from services.sync_worker import process_sync_queue

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/api/sync/queue")
async def get_sync_queue():
    try:
        # Fetch all sync tasks from Supabase
        headers = {k: v for k, v in supabase_service.headers.items() if k != "Prefer"}
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{supabase_service.url}/rest/v1/google_sheets_sync_queue?select=*&order=id.desc&limit=50",
                headers=headers,
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.exception("Failed to get sync queue")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/sync/retry/{task_id}")
async def retry_sync_task(task_id: int, background_tasks: BackgroundTasks):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{supabase_service.url}/rest/v1/google_sheets_sync_queue?id=eq.{task_id}",
                headers=supabase_service.headers,
                json={
                    "status": "pending",
                    "retry_count": 0,
                    "last_error": None,
                    "locked_by": None,
                    "locked_at": None,
                },
            )
            response.raise_for_status()
        
        # Trigger background processing
        background_tasks.add_task(process_sync_queue)
        return {"ok": True, "message": "Task queued for retry"}
    except Exception as e:
        logger.exception("Failed to retry sync task")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/sync/resync")
async def trigger_full_resync(background_tasks: BackgroundTasks):
    try:
        headers = {k: v for k, v in supabase_service.headers.items() if k != "Prefer"}
        
        # 1. Fetch and enqueue Membership Forms
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{supabase_service.url}/rest/v1/membership_forms?select=*",
                headers=headers,
            )
            response.raise_for_status()
            memberships = response.json()
            
            for m in memberships:
                await supabase_service.enqueue_sheets_sync("Membership", m)

        # 2. Fetch and enqueue Recruitment Forms
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{supabase_service.url}/rest/v1/recruitment_forms?select=*",
                headers=headers,
            )
            response.raise_for_status()
            recruitments = response.json()
            
            for r in recruitments:
                await supabase_service.enqueue_sheets_sync("Recruitment", r)

        # 3. Fetch and enqueue Core Team Applications
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{supabase_service.url}/rest/v1/core_team_applications?select=*",
                headers=headers,
            )
            response.raise_for_status()
            core_teams = response.json()
            
            for c in core_teams:
                await supabase_service.enqueue_sheets_sync("CoreTeam", c)

        # Trigger background processing
        background_tasks.add_task(process_sync_queue)
        
        return {"ok": True, "message": "Full resync triggered successfully"}
    except Exception as e:
        logger.exception("Failed to trigger full resync")
        raise HTTPException(status_code=500, detail=str(e))
