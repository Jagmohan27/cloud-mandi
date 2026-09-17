from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from app.database.session import get_db
from app.ingestion.scheduler import is_sync_running

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint reporting overall system, database, and scheduler status.
    """
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)[:100]}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "sync_in_progress": is_sync_running,
        "service": "Cloud Mandi API",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
