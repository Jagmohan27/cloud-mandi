from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime

class CommodityBase(BaseModel):
    name: str
    category: Optional[str] = "Agricultural Produce"

class CommodityOut(CommodityBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class MandiBase(BaseModel):
    name: str
    state: str
    district: str

class MandiOut(MandiBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PriceDetail(BaseModel):
    id: int
    commodity: str
    variety: str
    grade: Optional[str] = "FAQ"
    state: str
    district: str
    mandi: str
    minimum_price: float
    maximum_price: float
    modal_price: float
    date: str
    source: str
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PriceListResponse(BaseModel):
    count: int
    page: int
    limit: int
    total_pages: int
    results: List[PriceDetail]

class PriceHistoryPoint(BaseModel):
    date: str
    modal_price: float
    minimum_price: float
    maximum_price: float

class PriceHistoryResponse(BaseModel):
    commodity: str
    mandi: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    range_days: int
    history: List[PriceHistoryPoint]
