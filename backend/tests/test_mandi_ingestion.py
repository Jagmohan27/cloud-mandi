import pytest
from datetime import date
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app
from app.database.session import SessionLocal
from app.models.commodity import Commodity
from app.models.mandi import Mandi
from app.models.price import MandiPrice
from app.ingestion.processor import parse_date, parse_price, normalize_text, IngestionProcessor

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    yield db
    db.close()

# -------------------------------------------------------------
# 1. Tests for Data Cleaning Logic
# -------------------------------------------------------------

def test_parse_date():
    # Valid DD/MM/YYYY
    assert parse_date("23/10/2026") == date(2026, 10, 23)
    # Valid YYYY-MM-DD
    assert parse_date("2026-10-23") == date(2026, 10, 23)
    # Valid DD-MM-YYYY
    assert parse_date("23-10-2026") == date(2026, 10, 23)
    # Invalid strings
    assert parse_date("invalid-date") is None
    assert parse_date("") is None
    assert parse_date(None) is None

def test_parse_price():
    # Numbers
    assert parse_price(2500) == 2500.0
    assert parse_price(2500.75) == 2500.75
    # Strings with commas, currency symbol, and whitespace
    assert parse_price(" 2,500 ") == 2500.0
    assert parse_price("₹2,450.50") == 2450.50
    # Zero or negative prices should return None
    assert parse_price(0) is None
    assert parse_price("0") is None
    assert parse_price(-150) is None
    # Invalid formats
    assert parse_price("N/A") is None
    assert parse_price("") is None
    assert parse_price(None) is None

def test_normalize_text():
    # Whitespace and title case
    assert normalize_text("  wheat   ") == "Wheat"
    assert normalize_text("KOTA MANDI") == "Kota Mandi"
    assert normalize_text("paddy (dhan)") == "Paddy (Dhan)"
    # None or empty fallback
    assert normalize_text(None) == "Unknown"
    assert normalize_text("") == "Unknown"

# -------------------------------------------------------------
# 2. Tests for Deduplication and Upsert Logic
# -------------------------------------------------------------

def test_ingestion_processor_deduplication_and_upsert(db_session):
    def cleanup_test_data():
        comm = db_session.query(Commodity).filter(Commodity.name == "Mustard Test Crop").first()
        if comm:
            db_session.query(MandiPrice).filter(MandiPrice.commodity_id == comm.id).delete()
            db_session.delete(comm)
            db_session.commit()

    cleanup_test_data()
    try:
        processor = IngestionProcessor(db_session)

        raw_item = {
            "state": "Rajasthan",
            "district": "Kota",
            "market": "Kota Grain Mandi",
            "commodity": "Mustard Test Crop",
            "variety": "Desi",
            "grade": "FAQ",
            "arrival_date": "23/10/2026",
            "min_price": "5200",
            "max_price": "5600",
            "modal_price": "5400"
        }

        # First insert: 1 inserted, 0 updated, 0 rejected
        inserted, updated, rejected = processor.process_records([raw_item])
        assert inserted == 1
        assert updated == 0
        assert rejected == 0

        # Verify record in DB
        comm = db_session.query(Commodity).filter(Commodity.name == "Mustard Test Crop").first()
        assert comm is not None
        mandi = db_session.query(Mandi).filter(Mandi.name == "Kota Grain Mandi").first()
        assert mandi is not None

        price_rows = db_session.query(MandiPrice).filter(
            MandiPrice.commodity_id == comm.id,
            MandiPrice.mandi_id == mandi.id,
            MandiPrice.variety == "Desi",
            MandiPrice.price_date == date(2026, 10, 23)
        ).all()
        assert len(price_rows) == 1
        assert price_rows[0].modal_price == 5400.0

        # Second insert with IDENTICAL data: should be ignored, no duplicates created
        ins2, upd2, rej2 = processor.process_records([raw_item])
        assert ins2 == 0
        assert upd2 == 0
        assert rej2 == 0

        price_rows_after = db_session.query(MandiPrice).filter(
            MandiPrice.commodity_id == comm.id,
            MandiPrice.mandi_id == mandi.id,
            MandiPrice.variety == "Desi",
            MandiPrice.price_date == date(2026, 10, 23)
        ).all()
        assert len(price_rows_after) == 1

        # Third insert with UPDATED price (5550 instead of 5400): should update existing record (upsert)
        updated_item = dict(raw_item)
        updated_item["modal_price"] = "5550"
        ins3, upd3, rej3 = processor.process_records([updated_item])
        assert ins3 == 0
        assert upd3 == 1
        assert rej3 == 0

        updated_row = db_session.query(MandiPrice).filter(
            MandiPrice.commodity_id == comm.id,
            MandiPrice.mandi_id == mandi.id,
            MandiPrice.variety == "Desi",
            MandiPrice.price_date == date(2026, 10, 23)
        ).first()
        assert updated_row.modal_price == 5550.0
    finally:
        cleanup_test_data()

# -------------------------------------------------------------
# 3. Tests for Endpoints (GET /prices, /markets, /prices/trends)
# -------------------------------------------------------------

def test_get_markets_endpoint(client):
    response = client.get("/api/markets")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        first = data[0]
        assert "name" in first
        assert "state" in first
        assert "district" in first

def test_get_prices_with_market_filter(client):
    response = client.get("/api/prices?market=Kota&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert "count" in data

def test_get_prices_trends_endpoint(client):
    response = client.get("/api/prices/trends?commodity=Wheat&days=30")
    assert response.status_code == 200
    data = response.json()
    assert "commodity" in data
    assert "range_days" in data
    assert data["range_days"] == 30
    assert "history" in data
    assert isinstance(data["history"], list)
