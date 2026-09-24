from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timezone
from app.database.session import get_db
from app.ingestion.scheduler import is_sync_running
from app.models.price import MandiPrice
from app.models.sync_log import SyncLog

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint reporting overall system, database status,
    active price record counts, and latest data sync timestamps.
    """
    db_status = "connected"
    total_records = 0
    last_sync = None
    try:
        db.execute(text("SELECT 1"))
        total_records = db.query(MandiPrice).count()
        latest_log = db.query(SyncLog).order_by(SyncLog.id.desc()).first()
        if latest_log and latest_log.completed_at:
            last_sync = latest_log.completed_at.isoformat()
    except Exception as e:
        db_status = f"unhealthy: {str(e)[:100]}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "sync_in_progress": is_sync_running,
        "total_price_records": total_records,
        "last_sync_timestamp": last_sync,
        "service": "Cloud Mandi API",
        "version": "1.2.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
