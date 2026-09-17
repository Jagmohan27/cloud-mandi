from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func
from typing import Optional, List
from datetime import datetime, date, timedelta
from app.database.session import get_db
from app.models.commodity import Commodity
from app.models.mandi import Mandi
from app.models.price import MandiPrice
from app.schemas.price import PriceDetail, PriceListResponse, PriceHistoryResponse, PriceHistoryPoint

router = APIRouter()

def format_price_detail(p: MandiPrice) -> PriceDetail:
    return PriceDetail(
        id=p.id,
        commodity=p.commodity.name if p.commodity else "Unknown",
        variety=p.variety or "Normal",
        grade=p.grade or "FAQ",
        state=p.mandi.state if p.mandi else "Unknown",
        district=p.mandi.district if p.mandi else "Unknown",
        mandi=p.mandi.name if p.mandi else "Unknown",
        minimum_price=float(p.minimum_price),
        maximum_price=float(p.maximum_price),
        modal_price=float(p.modal_price),
        date=p.price_date.isoformat(),
        source=p.source or "data.gov.in / AGMARKNET",
        created_at=p.created_at
    )

@router.get("/prices", response_model=PriceListResponse)
def get_prices(
    state: Optional[str] = Query(None, description="Filter by Indian State"),
    district: Optional[str] = Query(None, description="Filter by District"),
    mandi: Optional[str] = Query(None, description="Filter by Mandi/Market name"),
    commodity: Optional[str] = Query(None, description="Filter by Commodity"),
    variety: Optional[str] = Query(None, description="Filter by Variety"),
    date: Optional[str] = Query(None, description="Filter by exact date (YYYY-MM-DD or DD/MM/YYYY)"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    search: Optional[str] = Query(None, description="Global text search across commodity, mandi, district"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("date_desc", description="Sort order: date_desc, date_asc, price_desc, price_asc"),
    db: Session = Depends(get_db)
):
    """
    Search and filter agricultural mandi prices with pagination and multi-attribute filters.
    """
    query = db.query(MandiPrice).join(Commodity, MandiPrice.commodity_id == Commodity.id).join(Mandi, MandiPrice.mandi_id == Mandi.id)

    if state:
        query = query.filter(Mandi.state.ilike(f"%{state.strip()}%"))
    if district:
        query = query.filter(Mandi.district.ilike(f"%{district.strip()}%"))
    if mandi:
        query = query.filter(Mandi.name.ilike(f"%{mandi.strip()}%"))
    if commodity:
        query = query.filter(Commodity.name.ilike(f"%{commodity.strip()}%"))
    if variety:
        query = query.filter(MandiPrice.variety.ilike(f"%{variety.strip()}%"))

    if date:
        try:
            if "/" in date:
                d_obj = datetime.strptime(date, "%d/%m/%Y").date()
            else:
                d_obj = datetime.strptime(date, "%Y-%m-%d").date()
            query = query.filter(MandiPrice.price_date == d_obj)
        except ValueError:
            pass

    if start_date:
        try:
            sd = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(MandiPrice.price_date >= sd)
        except ValueError:
            pass

    if end_date:
        try:
            ed = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(MandiPrice.price_date <= ed)
        except ValueError:
            pass

    if search:
        s_term = f"%{search.strip()}%"
        query = query.filter(
            (Commodity.name.ilike(s_term)) |
            (Mandi.name.ilike(s_term)) |
            (Mandi.district.ilike(s_term)) |
            (Mandi.state.ilike(s_term)) |
            (MandiPrice.variety.ilike(s_term))
        )

    # Sorting
    if sort_by == "date_asc":
        query = query.order_by(asc(MandiPrice.price_date), asc(MandiPrice.id))
    elif sort_by == "price_desc":
        query = query.order_by(desc(MandiPrice.modal_price))
    elif sort_by == "price_asc":
        query = query.order_by(asc(MandiPrice.modal_price))
    else:  # date_desc
        query = query.order_by(desc(MandiPrice.price_date), desc(MandiPrice.id))

    total_count = query.count()
    total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1
    offset = (page - 1) * limit

    records = query.offset(offset).limit(limit).all()

    return PriceListResponse(
        count=total_count,
        page=page,
        limit=limit,
        total_pages=total_pages,
        results=[format_price_detail(r) for r in records]
    )

@router.get("/prices/latest", response_model=List[PriceDetail])
def get_latest_prices(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    """
    Get most recently recorded market prices across commodities.
    """
    records = db.query(MandiPrice).join(Commodity).join(Mandi).order_by(
        desc(MandiPrice.price_date), desc(MandiPrice.created_at)
    ).limit(limit).all()

    return [format_price_detail(r) for r in records]

@router.get("/prices/history", response_model=PriceHistoryResponse)
def get_price_history(
    commodity: str = Query(..., description="Commodity name (e.g., Wheat, Onion, Tomato)"),
    mandi: Optional[str] = Query(None, description="Optional Mandi/Market filter"),
    district: Optional[str] = Query(None, description="Optional District filter"),
    state: Optional[str] = Query(None, description="Optional State filter"),
    days: int = Query(30, ge=7, le=365, description="Lookback period in days: 7, 30, 90, 365"),
    db: Session = Depends(get_db)
):
    """
    Retrieve price trends for charts over 7, 30, 90, or 365 days.
    """
    comm = db.query(Commodity).filter(Commodity.name.ilike(commodity.strip())).first()
    if not comm:
        # Return empty history rather than failing
        return PriceHistoryResponse(
            commodity=commodity,
            mandi=mandi,
            district=district,
            state=state,
            range_days=days,
            history=[]
        )

    end_d = date.today()
    start_d = end_d - timedelta(days=days)

    query = db.query(
        MandiPrice.price_date,
        func.avg(MandiPrice.modal_price).label("avg_modal"),
        func.min(MandiPrice.minimum_price).label("min_p"),
        func.max(MandiPrice.maximum_price).label("max_p")
    ).join(Mandi).filter(
        MandiPrice.commodity_id == comm.id,
        MandiPrice.price_date >= start_d,
        MandiPrice.price_date <= end_d
    )

    if mandi:
        query = query.filter(Mandi.name.ilike(f"%{mandi.strip()}%"))
    if district:
        query = query.filter(Mandi.district.ilike(f"%{district.strip()}%"))
    if state:
        query = query.filter(Mandi.state.ilike(f"%{state.strip()}%"))

    points = query.group_by(MandiPrice.price_date).order_by(asc(MandiPrice.price_date)).all()

    history_list = [
        PriceHistoryPoint(
            date=row.price_date.isoformat(),
            modal_price=round(float(row.avg_modal), 2),
            minimum_price=round(float(row.min_p), 2),
            maximum_price=round(float(row.max_p), 2)
        )
        for row in points
    ]

    return PriceHistoryResponse(
        commodity=comm.name,
        mandi=mandi,
        district=district,
        state=state,
        range_days=days,
        history=history_list
    )

@router.get("/prices/{id}", response_model=PriceDetail)
def get_price_by_id(id: int, db: Session = Depends(get_db)):
    """
    Get detailed price record by ID.
    """
    price = db.query(MandiPrice).filter(MandiPrice.id == id).first()
    if not price:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Price record #{id} not found")
    return format_price_detail(price)
