from fastapi import APIRouter
from app.api.v1.endpoints import health, prices, metadata, statistics, admin

api_router = APIRouter()

# Health
api_router.include_router(health.router, tags=["Health"])

# Prices
api_router.include_router(prices.router, tags=["Mandi Prices"])

# Metadata
api_router.include_router(metadata.router, tags=["Metadata & Locations"])

# Statistics
api_router.include_router(statistics.router, tags=["Statistics"])

# Administration & Ingestion
api_router.include_router(admin.router, tags=["Admin & Ingestion"])
