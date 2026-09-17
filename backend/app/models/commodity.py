from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Commodity(Base):
    __tablename__ = "commodities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, unique=True, index=True)
    category = Column(String(100), nullable=True, default="Agricultural Produce")
    created_at = Column(DateTime, default=datetime.utcnow)

    prices = relationship("MandiPrice", back_populates="commodity", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Commodity(id={self.id}, name='{self.name}')>"
