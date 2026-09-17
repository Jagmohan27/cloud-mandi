import logging
import asyncio
from datetime import datetime, date, timedelta
import random
from typing import Optional, Dict, Any
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.core.config import settings
from app.database.session import SessionLocal
from app.models.sync_log import SyncLog
from app.ingestion.government_api import GovernmentApiClient
from app.ingestion.processor import IngestionProcessor

logger = logging.getLogger("mandi_cloud.scheduler")

scheduler: Optional[AsyncIOScheduler] = None
is_sync_running = False

async def run_data_sync(source_label: str = "data.gov.in / AGMARKNET") -> Dict[str, Any]:
    """
    Executes the ingestion sync pipeline:
    1. Fetch from Government API
    2. Process, validate, clean, deduplicate
    3. Update sync log
    """
    global is_sync_running
    if is_sync_running:
        return {"status": "already_running", "message": "A data synchronization job is already running"}

    is_sync_running = True
    db = SessionLocal()
    sync_log = SyncLog(status="RUNNING", source=source_label, started_at=datetime.utcnow())
    db.add(sync_log)
    db.commit()
    db.refresh(sync_log)

    try:
        client = GovernmentApiClient()
        # Fetch initial page of up to 1000 records
        api_data = await client.fetch_prices(limit=1000, offset=0)
        records = api_data.get("records", [])

        if not records:
            logger.warning("No records returned from data.gov.in")

        processor = IngestionProcessor(db)
        inserted, updated, rejected = processor.process_records(records, source=source_label)

        sync_log.status = "SUCCESS"
        sync_log.records_fetched = len(records)
        sync_log.records_inserted = inserted
        sync_log.records_updated = updated
        sync_log.records_rejected = rejected
        sync_log.completed_at = datetime.utcnow()
        db.commit()

        logger.info(f"Sync complete: fetched={len(records)}, inserted={inserted}, updated={updated}, rejected={rejected}")

        return {
            "status": "success",
            "log_id": sync_log.id,
            "records_fetched": len(records),
            "records_inserted": inserted,
            "records_updated": updated,
            "records_rejected": rejected
        }

    except Exception as e:
        logger.exception(f"Data sync failed: {e}")
        sync_log.status = "FAILED"
        sync_log.error_message = str(e)[:1000]
        sync_log.completed_at = datetime.utcnow()
        db.commit()
        return {
            "status": "failed",
            "log_id": sync_log.id,
            "error": str(e)
        }
    finally:
        is_sync_running = False
        db.close()

def start_scheduler():
    global scheduler
    if not settings.ENABLE_SCHEDULER:
        logger.info("Background scheduler is disabled by configuration.")
        return

    if scheduler is None:
        scheduler = AsyncIOScheduler()
        scheduler.add_job(
            run_data_sync,
            trigger=IntervalTrigger(hours=settings.SYNC_INTERVAL_HOURS),
            id="mandi_price_sync_job",
            name="Scheduled Mandi Price Synchronization",
            replace_existing=True
        )
        scheduler.start()
        logger.info(f"Background scheduler started. Sync interval: every {settings.SYNC_INTERVAL_HOURS} hours.")

def stop_scheduler():
    global scheduler
    if scheduler and scheduler.running:
        scheduler.shutdown()
        logger.info("Background scheduler stopped.")
