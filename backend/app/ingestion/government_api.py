import httpx
import logging
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger("mandi_cloud.government_api")

class GovernmentApiClient:
    """
    Client for Government of India Open Data API (data.gov.in)
    Mandi Market Prices Resource
    """
    def __init__(self, api_key: Optional[str] = None, resource_id: Optional[str] = None):
        self.api_key = api_key or settings.DATA_GOV_API_KEY
        self.resource_id = resource_id or settings.DATA_GOV_RESOURCE_ID
        self.base_url = f"{settings.DATA_GOV_BASE_URL}/{self.resource_id}"

    async def fetch_prices(
        self,
        limit: int = 500,
        offset: int = 0,
        filters: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        params = {
            "api-key": self.api_key,
            "format": "json",
            "limit": limit,
            "offset": offset
        }
        if filters:
            for k, v in filters.items():
                params[f"filters[{k}]"] = v

        headers = {
            "User-Agent": "MandiPriceCloud/1.0 (Cloud Agriculture Market API; mailto:contact@mandipricecloud.gov.in)",
            "Accept": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                logger.info(f"Connecting to data.gov.in: resource={self.resource_id}, offset={offset}, limit={limit}")
                response = await client.get(self.base_url, params=params, headers=headers)
                response.raise_for_status()
                data = response.json()
                
                status_field = data.get("status", "")
                if status_field != "ok" and "records" not in data:
                    logger.warning(f"data.gov.in returned non-ok status: {status_field}, message: {data.get('message')}")
                
                return data
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error from data.gov.in: {e.response.status_code} - {e.response.text[:200]}")
            raise
        except httpx.RequestError as e:
            logger.error(f"Network error connecting to data.gov.in: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error querying data.gov.in: {e}")
            raise
