from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date
from app.database.session import get_db
from app.models.commodity import Commodity
from app.models.mandi import Mandi
from app.models.price import MandiPrice
from app.schemas.common import StatisticsResponse

router = APIRouter()

@router.get("/statistics", response_model=StatisticsResponse)
def get_system_statistics(response: Response, db: Session = Depends(get_db)):
    """
    Get aggregated platform statistics: total commodities, mandis, records, updates today, and coverage.
    """
    response.headers["Cache-Control"] = "public, max-age=60, s-maxage=120"
    total_commodities = db.query(Commodity).count()
    total_mandis = db.query(Mandi).count()
    total_price_records = db.query(MandiPrice).count()

    today = date.today()
    records_updated_today = db.query(MandiPrice).filter(
        func.date(MandiPrice.updated_at) == today
    ).count()
    # Or price_date == today
    if records_updated_today == 0:
        records_updated_today = db.query(MandiPrice).filter(MandiPrice.price_date == today).count()

    states_covered = db.query(Mandi.state).distinct().count()
    districts_covered = db.query(Mandi.district).distinct().count()

    latest_date_obj = db.query(func.max(MandiPrice.price_date)).scalar()
    latest_price_date = latest_date_obj.isoformat() if latest_date_obj else None

    # Top commodities by volume of records
    top_comm_query = db.query(
        Commodity.name,
        func.count(MandiPrice.id).label("count"),
        func.avg(MandiPrice.modal_price).label("avg_price")
    ).join(MandiPrice, Commodity.id == MandiPrice.commodity_id)\
     .group_by(Commodity.name)\
     .order_by(desc("count"))\
     .limit(6).all()

    top_commodities = [
        {
            "name": row[0],
            "records": row[1],
            "avg_modal_price": round(float(row[2]), 1) if row[2] else 0.0
        }
        for row in top_comm_query
    ]

    return StatisticsResponse(
        total_commodities=total_commodities,
        total_mandis=total_mandis,
        total_price_records=total_price_records,
        records_updated_today=records_updated_today,
        states_covered=states_covered,
        districts_covered=districts_covered,
        latest_price_date=latest_price_date,
        top_commodities=top_commodities
    )
