from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class StatisticsResponse(BaseModel):
    total_commodities: int
    total_mandis: int
    total_price_records: int
    records_updated_today: int
    states_covered: int
    districts_covered: int
    latest_price_date: Optional[str] = None
    top_commodities: List[Dict[str, Any]] = []

class SyncTriggerResponse(BaseModel):
    status: str
    message: str
    job_id: Optional[str] = None

class SyncStatusItem(BaseModel):
    id: int
    status: str
    records_fetched: int
    records_inserted: int
    records_updated: int
    records_rejected: int
    error_message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

class SyncStatusResponse(BaseModel):
    is_syncing: bool
    last_sync: Optional[SyncStatusItem] = None
    recent_logs: List[SyncStatusItem] = []

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    username: str

class LoginRequest(BaseModel):
    username: str
    password: str
