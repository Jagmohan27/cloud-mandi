import httpx
import logging
import asyncio
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger("mandi_cloud.government_api")

class GovernmentApiClient:
    """
    Client for Government of India Open Data API (data.gov.in)
    Mandi Market Prices Resource: AGMARKNET
    """
    def __init__(self, api_key: Optional[str] = None, resource_id: Optional[str] = None):
        self.api_key = api_key or settings.DATA_GOV_API_KEY
        self.resource_id = resource_id or settings.DATA_GOV_RESOURCE_ID
        self.base_url = f"{settings.DATA_GOV_BASE_URL}/{self.resource_id}"
        self.timeout = 30.0
        self.max_retries = 3

    async def fetch_prices(
        self,
        limit: int = 500,
        offset: int = 0,
        filters: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Fetch a single page of price records from data.gov.in with 30s timeout and 3 retries with exponential backoff.
        """
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
            "User-Agent": "MandiPriceCloud/1.0 (Cloud Agriculture Market API; contact@cloudmandi.in)",
            "Accept": "application/json"
        }

        last_exception = None
        for attempt in range(self.max_retries):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    logger.info(
                        f"Connecting to data.gov.in (attempt {attempt + 1}/{self.max_retries}): "
                        f"resource={self.resource_id}, offset={offset}, limit={limit}"
                    )
                    response = await client.get(self.base_url, params=params, headers=headers)
                    response.raise_for_status()
                    data = response.json()

                    status_field = data.get("status", "")
                    if status_field != "ok" and "records" not in data:
                        logger.warning(
                            f"data.gov.in returned non-ok status: {status_field}, message: {data.get('message')}"
                        )

                    return data

            except (httpx.RequestError, httpx.HTTPStatusError) as e:
                last_exception = e
                # Retry only on network errors or 5xx server errors
                is_5xx = isinstance(e, httpx.HTTPStatusError) and e.response.status_code >= 500
                is_net_err = isinstance(e, httpx.RequestError)

                if (is_5xx or is_net_err) and attempt < self.max_retries - 1:
                    backoff_delay = 1.0 * (2 ** attempt)  # 1s, 2s, 4s
                    logger.warning(
                        f"data.gov.in request failed (attempt {attempt + 1}/{self.max_retries}): {e}. "
                        f"Retrying in {backoff_delay:.1f}s..."
                    )
                    await asyncio.sleep(backoff_delay)
                else:
                    logger.error(f"data.gov.in error on attempt {attempt + 1}: {e}")
                    raise e
            except Exception as e:
                logger.error(f"Unexpected error querying data.gov.in: {e}")
                raise e

        if last_exception:
            raise last_exception
        return {}

    async def fetch_all_prices(
        self,
        batch_size: int = 500,
        max_records: Optional[int] = None,
        filters: Optional[Dict[str, str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch records with pagination (limit/offset) until all records are retrieved
        or max_records is reached.
        """
        all_records: List[Dict[str, Any]] = []
        offset = 0

        while True:
            limit = batch_size
            if max_records and (len(all_records) + limit > max_records):
                limit = max_records - len(all_records)

            if limit <= 0:
                break

            try:
                page_data = await self.fetch_prices(limit=limit, offset=offset, filters=filters)
                records = page_data.get("records", [])

                if not records:
                    logger.info(f"Finished paginating data.gov.in. Total records fetched: {len(all_records)}")
                    break

                all_records.extend(records)
                logger.info(f"Retrieved {len(records)} records (total so far: {len(all_records)}) at offset {offset}")

                total_in_response = page_data.get("total")
                if total_in_response is not None and len(all_records) >= int(total_in_response):
                    break

                if len(records) < limit:
                    break

                offset += len(records)

            except Exception as e:
                logger.error(f"Error during pagination at offset {offset}: {e}")
                # Return what was collected so far rather than failing completely
                break

        return all_records
