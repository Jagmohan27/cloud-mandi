from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.database.session import Base

class SyncLog(Base):
    __tablename__ = "sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(50), nullable=False, default="RUNNING")  # SUCCESS, FAILED, RUNNING
    records_fetched = Column(Integer, default=0)
    records_inserted = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    records_rejected = Column(Integer, default=0)
    source = Column(String(100), default="data.gov.in / AGMARKNET")
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<SyncLog(id={self.id}, status='{self.status}', inserted={self.records_inserted})>"
