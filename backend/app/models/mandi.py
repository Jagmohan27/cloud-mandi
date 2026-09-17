from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Mandi(Base):
    __tablename__ = "mandis"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    prices = relationship("MandiPrice", back_populates="mandi", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_mandi_state_district_name", "state", "district", "name", unique=True),
    )

    def __repr__(self):
        return f"<Mandi(id={self.id}, name='{self.name}', district='{self.district}', state='{self.state}')>"
