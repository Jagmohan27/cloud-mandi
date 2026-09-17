import logging
from datetime import datetime, date
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.commodity import Commodity
from app.models.mandi import Mandi
from app.models.price import MandiPrice
from app.models.sync_log import SyncLog

logger = logging.getLogger("mandi_cloud.processor")

def parse_date(date_str: Any) -> Optional[date]:
    if not date_str:
        return None
    date_str = str(date_str).strip()
    formats = ["%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d"]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None

def parse_price(val: Any) -> Optional[float]:
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val) if val > 0 else None
    try:
        clean = str(val).replace(",", "").replace("₹", "").strip()
        f_val = float(clean)
        return f_val if f_val > 0 else None
    except (ValueError, TypeError):
        return None

def normalize_text(text: Any) -> str:
    if not text:
        return "Unknown"
    cleaned = " ".join(str(text).strip().split())
    # Title-case for consistency
    return cleaned.title()

class IngestionProcessor:
    def __init__(self, db: Session):
        self.db = db

    def process_records(self, raw_records: List[Dict[str, Any]], source: str = "data.gov.in / AGMARKNET") -> Tuple[int, int, int]:
        """
        Process a list of raw records from data.gov.in
        Returns (inserted_count, updated_count, rejected_count)
        """
        inserted_count = 0
        updated_count = 0
        rejected_count = 0

        # Pre-cache existing commodities and mandis to optimize batch inserts
        commodity_cache: Dict[str, Commodity] = {
            c.name.lower(): c for c in self.db.query(Commodity).all()
        }
        
        # Key: (state.lower(), district.lower(), name.lower())
        mandi_cache: Dict[Tuple[str, str, str], Mandi] = {
            (m.state.lower(), m.district.lower(), m.name.lower()): m for m in self.db.query(Mandi).all()
        }

        for item in raw_records:
            try:
                # Required fields from data.gov.in:
                # state, district, market, commodity, variety, arrival_date, min_price, max_price, modal_price
                raw_state = item.get("state")
                raw_district = item.get("district")
                raw_mandi = item.get("market") or item.get("mandi")
                raw_commodity = item.get("commodity")
                raw_variety = item.get("variety") or "Normal"
                raw_grade = item.get("grade") or "FAQ"
                raw_date = item.get("arrival_date") or item.get("date")

                price_date = parse_date(raw_date)
                min_p = parse_price(item.get("min_price") or item.get("minimum_price"))
                max_p = parse_price(item.get("max_price") or item.get("maximum_price"))
                modal_p = parse_price(item.get("modal_price"))

                # Basic validation
                if not (raw_state and raw_district and raw_mandi and raw_commodity and price_date):
                    rejected_count += 1
                    continue

                if not (modal_p or min_p or max_p):
                    rejected_count += 1
                    continue

                # Default fallback between min/max/modal if one is missing
                modal_p = modal_p or (min_p + max_p) / 2 if (min_p and max_p) else (min_p or max_p)
                min_p = min_p or modal_p
                max_p = max_p or modal_p

                state_norm = normalize_text(raw_state)
                district_norm = normalize_text(raw_district)
                mandi_norm = normalize_text(raw_mandi)
                commodity_norm = normalize_text(raw_commodity)
                variety_norm = normalize_text(raw_variety)
                grade_norm = str(raw_grade).strip()

                # Get or create Commodity
                comm_key = commodity_norm.lower()
                if comm_key in commodity_cache:
                    commodity_obj = commodity_cache[comm_key]
                else:
                    commodity_obj = Commodity(name=commodity_norm, category="Agricultural Produce")
                    self.db.add(commodity_obj)
                    self.db.flush()
                    commodity_cache[comm_key] = commodity_obj

                # Get or create Mandi
                mandi_key = (state_norm.lower(), district_norm.lower(), mandi_norm.lower())
                if mandi_key in mandi_cache:
                    mandi_obj = mandi_cache[mandi_key]
                else:
                    mandi_obj = Mandi(name=mandi_norm, state=state_norm, district=district_norm)
                    self.db.add(mandi_obj)
                    self.db.flush()
                    mandi_cache[mandi_key] = mandi_obj

                # Check for existing price record with unique constraint
                existing_price = self.db.query(MandiPrice).filter(
                    MandiPrice.commodity_id == commodity_obj.id,
                    MandiPrice.mandi_id == mandi_obj.id,
                    MandiPrice.variety == variety_norm,
                    MandiPrice.price_date == price_date
                ).first()

                if existing_price:
                    # Update if prices changed
                    if (existing_price.modal_price != modal_p or
                        existing_price.minimum_price != min_p or
                        existing_price.maximum_price != max_p):
                        existing_price.modal_price = modal_p
                        existing_price.minimum_price = min_p
                        existing_price.maximum_price = max_p
                        existing_price.grade = grade_norm
                        existing_price.source = source
                        existing_price.updated_at = datetime.utcnow()
                        updated_count += 1
                else:
                    new_price = MandiPrice(
                        commodity_id=commodity_obj.id,
                        mandi_id=mandi_obj.id,
                        variety=variety_norm,
                        grade=grade_norm,
                        minimum_price=min_p,
                        maximum_price=max_p,
                        modal_price=modal_p,
                        price_date=price_date,
                        source=source
                    )
                    self.db.add(new_price)
                    inserted_count += 1

            except Exception as e:
                logger.debug(f"Failed to process record item: {e}")
                rejected_count += 1

        self.db.commit()
        return inserted_count, updated_count, rejected_count
