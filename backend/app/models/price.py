from sqlalchemy import Column, Integer, Float, String, Date, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class MandiPrice(Base):
    __tablename__ = "mandi_prices"

    id = Column(Integer, primary_key=True, index=True)
    commodity_id = Column(Integer, ForeignKey("commodities.id", ondelete="CASCADE"), nullable=False, index=True)
    mandi_id = Column(Integer, ForeignKey("mandis.id", ondelete="CASCADE"), nullable=False, index=True)
    variety = Column(String(100), nullable=False, default="Normal", index=True)
    grade = Column(String(50), nullable=True, default="FAQ")
    minimum_price = Column(Float, nullable=False)
    maximum_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False, index=True)
    price_date = Column(Date, nullable=False, index=True)
    source = Column(String(100), default="data.gov.in / AGMARKNET")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    commodity = relationship("Commodity", back_populates="prices")
    mandi = relationship("Mandi", back_populates="prices")

    __table_args__ = (
        UniqueConstraint("commodity_id", "mandi_id", "variety", "price_date", name="uq_commodity_mandi_variety_date"),
        Index("idx_price_date_commodity", "price_date", "commodity_id"),
    )

    def __repr__(self):
        return f"<MandiPrice(id={self.id}, commodity_id={self.commodity_id}, modal_price={self.modal_price}, date={self.price_date})>"
