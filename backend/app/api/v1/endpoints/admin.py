from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import timedelta, datetime
from typing import Dict, Any
from app.database.session import get_db
from app.core.config import settings
from app.models.user import AdminUser
from app.models.sync_log import SyncLog
from app.auth.security import verify_password, create_access_token, get_current_admin
from app.schemas.common import LoginRequest, TokenResponse, SyncTriggerResponse, SyncStatusResponse, SyncStatusItem
from app.ingestion.scheduler import run_data_sync, is_sync_running

router = APIRouter()

@router.post("/admin/login", response_model=TokenResponse)
def admin_login(creds: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate administrator credentials and return JWT bearer token.
    """
    user = db.query(AdminUser).filter(AdminUser.username == creds.username).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        username=user.username
    )

@router.post("/admin/sync", response_model=SyncTriggerResponse)
async def trigger_manual_sync(
    background_tasks: BackgroundTasks,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Trigger manual data ingestion from official data.gov.in AGMARKNET source.
    Requires Admin Bearer token.
    """
    if is_sync_running:
        return SyncTriggerResponse(
            status="busy",
            message="Data synchronization is already running in the background."
        )

    # Launch ingestion in background
    background_tasks.add_task(run_data_sync, "Manual Admin Trigger (data.gov.in)")

    return SyncTriggerResponse(
        status="initiated",
        message="Mandi price data ingestion successfully initiated from data.gov.in"
    )

@router.get("/admin/sync-status", response_model=SyncStatusResponse)
def get_sync_status(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get current synchronization state and recent sync execution history.
    """
    logs = db.query(SyncLog).order_by(desc(SyncLog.started_at)).limit(limit).all()

    last_log_item = None
    if logs:
        last = logs[0]
        last_log_item = SyncStatusItem(
            id=last.id,
            status=last.status,
            records_fetched=last.records_fetched,
            records_inserted=last.records_inserted,
            records_updated=last.records_updated,
            records_rejected=last.records_rejected,
            error_message=last.error_message,
            started_at=last.started_at,
            completed_at=last.completed_at
        )

    log_items = [
        SyncStatusItem(
            id=l.id,
            status=l.status,
            records_fetched=l.records_fetched,
            records_inserted=l.records_inserted,
            records_updated=l.records_updated,
            records_rejected=l.records_rejected,
            error_message=l.error_message,
            started_at=l.started_at,
            completed_at=l.completed_at
        )
        for l in logs
    ]

    return SyncStatusResponse(
        is_syncing=is_sync_running,
        last_sync=last_log_item,
        recent_logs=log_items
    )
