from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from app.database.session import get_db
from app.models.commodity import Commodity
from app.models.mandi import Mandi
from app.models.price import MandiPrice

router = APIRouter()

@router.get("/commodities")
def get_commodities(response: Response, db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """
    Get all distinct commodities with active market price count.
    """
    response.headers["Cache-Control"] = "public, max-age=300, s-maxage=600"
    results = db.query(
        Commodity.id,
        Commodity.name,
        Commodity.category,
        func.count(MandiPrice.id).label("price_count")
    ).outerjoin(MandiPrice, Commodity.id == MandiPrice.commodity_id)\
     .group_by(Commodity.id, Commodity.name, Commodity.category)\
     .order_by(Commodity.name.asc()).all()

    return [
        {
            "id": r.id,
            "name": r.name,
            "category": r.category,
            "price_count": r.price_count
        }
        for r in results
    ]

@router.get("/states")
def get_states(db: Session = Depends(get_db)) -> List[str]:
    """
    Get all distinct states having market data.
    """
    states = db.query(Mandi.state).distinct().order_by(Mandi.state.asc()).all()
    return [s[0] for s in states if s[0]]

@router.get("/districts")
def get_districts(
    state: Optional[str] = Query(None, description="Filter districts by state"),
    db: Session = Depends(get_db)
) -> List[str]:
    """
    Get distinct districts, optionally filtered by state.
    """
    query = db.query(Mandi.district).distinct()
    if state:
        query = query.filter(Mandi.state.ilike(f"%{state.strip()}%"))
    districts = query.order_by(Mandi.district.asc()).all()
    return [d[0] for d in districts if d[0]]

@router.get("/mandis")
def get_mandis(
    state: Optional[str] = Query(None, description="Filter by state"),
    district: Optional[str] = Query(None, description="Filter by district"),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Get mandis/markets with their location information.
    """
    query = db.query(Mandi)
    if state:
        query = query.filter(Mandi.state.ilike(f"%{state.strip()}%"))
    if district:
        query = query.filter(Mandi.district.ilike(f"%{district.strip()}%"))
    mandis = query.order_by(Mandi.name.asc()).all()
    return [
        {
            "id": m.id,
            "name": m.name,
            "state": m.state,
            "district": m.district
        }
        for m in mandis
    ]
