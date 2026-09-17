import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app
from app.database.init_db import init_db
from app.core.config import settings

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    init_db(seed_sample_if_empty=True)

@pytest.fixture
def client():
    return TestClient(app)

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "database" in data
    assert "timestamp" in data

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "docs_url" in data

def test_prices_list_and_pagination(client):
    response = client.get("/api/prices?page=1&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
    assert "page" in data
    assert "results" in data
    assert len(data["results"]) <= 5
    if len(data["results"]) > 0:
        first = data["results"][0]
        assert "commodity" in first
        assert "mandi" in first
        assert "modal_price" in first
        assert "date" in first

def test_prices_filtering(client):
    # Filter by commodity
    response = client.get("/api/prices?commodity=Wheat")
    assert response.status_code == 200
    data = response.json()
    for item in data["results"]:
        assert "wheat" in item["commodity"].lower()

def test_price_history(client):
    response = client.get("/api/prices/history?commodity=Wheat&days=30")
    assert response.status_code == 200
    data = response.json()
    assert data["commodity"] == "Wheat"
    assert "history" in data
    assert isinstance(data["history"], list)

def test_metadata_endpoints(client):
    # Commodities
    res_c = client.get("/api/commodities")
    assert res_c.status_code == 200
    assert isinstance(res_c.json(), list)

    # States
    res_s = client.get("/api/states")
    assert res_s.status_code == 200
    assert isinstance(res_s.json(), list)

    # Mandis
    res_m = client.get("/api/mandis")
    assert res_m.status_code == 200
    assert isinstance(res_m.json(), list)

def test_statistics(client):
    response = client.get("/api/statistics")
    assert response.status_code == 200
    data = response.json()
    assert "total_commodities" in data
    assert "total_mandis" in data
    assert "total_price_records" in data
    assert data["total_commodities"] >= 0

def test_admin_auth_and_unauthorized_sync(client):
    # Unauthorized sync should fail with 401
    res_unauth = client.post("/api/admin/sync")
    assert res_unauth.status_code == 401

    # Login with admin credentials
    res_login = client.post("/api/admin/login", json={
        "username": settings.ADMIN_USERNAME,
        "password": settings.ADMIN_PASSWORD
    })
    assert res_login.status_code == 200
    token_data = res_login.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Authorized sync with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    res_auth = client.post("/api/admin/sync", headers=headers)
    assert res_auth.status_code == 200
    assert res_auth.json()["status"] in ["initiated", "busy"]

def test_sync_status(client):
    response = client.get("/api/admin/sync-status")
    assert response.status_code == 200
    data = response.json()
    assert "is_syncing" in data
    assert "recent_logs" in data
