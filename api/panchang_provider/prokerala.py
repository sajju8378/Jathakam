"""
Prokerala Astrology API v2 Implementation of PanchangProvider.
Uses OAuth2 Client Credentials Grant, token caching, exponential backoff,
and maps external schemas into our unified format.
"""

import os
import asyncio
from datetime import datetime, date, time, timezone
import zoneinfo
from typing import Dict, Any, Optional
import httpx
import logging

from .base import PanchangProvider

logger = logging.getLogger(__name__)

PROKERALA_TOKEN_URL = "https://api.prokerala.com/token"
PROKERALA_PANCHANG_URL = "https://api.prokerala.com/v2/astrology/panchang"


class ProkeralaProvider(PanchangProvider):
    """
    Prokerala Astrology API v2 adapter.
    """

    def __init__(
        self,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None
    ):
        self.client_id = client_id or os.getenv("PROKERALA_CLIENT_ID", "")
        self.client_secret = client_secret or os.getenv("PROKERALA_CLIENT_SECRET", "")
        self._access_token: Optional[str] = None
        self._token_expires_at: Optional[datetime] = None

    @property
    def name(self) -> str:
        return "prokerala"

    @property
    def is_configured(self) -> bool:
        return bool(self.client_id and self.client_secret)

    async def _get_access_token(self, client: httpx.AsyncClient) -> str:
        """Obtains or refreshes OAuth2 Bearer token from Prokerala API."""
        now = datetime.now(timezone.utc)
        if self._access_token and self._token_expires_at and now < self._token_expires_at:
            return self._access_token

        if not self.is_configured:
            raise ValueError("Prokerala API credentials (PROKERALA_CLIENT_ID / PROKERALA_CLIENT_SECRET) not configured.")

        payload = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
        }

        resp = await client.post(PROKERALA_TOKEN_URL, data=payload, timeout=10.0)
        resp.raise_for_status()
        data = resp.json()

        self._access_token = data.get("access_token")
        expires_in = data.get("expires_in", 3600)
        # Refresh 60 seconds before expiration
        self._token_expires_at = now + datetime.resolution * (expires_in - 60)
        return self._access_token

    async def get_panchang(
        self,
        target_date: date,
        lat: float,
        lon: float,
        tz_str: str
    ) -> Dict[str, Any]:
        """
        Calls Prokerala /v2/astrology/panchang with retry backoff and normalizes response.
        """
        # Form ISO-8601 datetime at 06:00:00 local time
        tz = zoneinfo.ZoneInfo(tz_str)
        local_dt = datetime.combine(target_date, time(6, 0, 0), tzinfo=tz)
        iso_str = local_dt.isoformat()

        coordinates = f"{lat},{lon}"
        # Ayanamsa 1 is Lahiri (Chitra Paksha) in Prokerala API
        params = {
            "datetime": iso_str,
            "coordinates": coordinates,
            "ayanamsa": 1,
            "la": "en"
        }

        async with httpx.AsyncClient() as client:
            token = await self._get_access_token(client)
            headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}

            # Exponential backoff retry
            max_retries = 3
            backoff = 1.0

            for attempt in range(max_retries):
                try:
                    resp = await client.get(
                        PROKERALA_PANCHANG_URL,
                        params=params,
                        headers=headers,
                        timeout=10.0
                    )
                    if resp.status_code == 401:
                        # Force refresh token and retry
                        self._access_token = None
                        token = await self._get_access_token(client)
                        headers["Authorization"] = f"Bearer {token}"
                        resp = await client.get(PROKERALA_PANCHANG_URL, params=params, headers=headers, timeout=10.0)

                    resp.raise_for_status()
                    external_data = resp.json()
                    return self._normalize_response(external_data, target_date, tz_str)

                except (httpx.RequestError, httpx.HTTPStatusError) as e:
                    logger.warning(f"Prokerala attempt {attempt+1} failed: {e}")
                    if attempt == max_retries - 1:
                        raise
                    await asyncio.sleep(backoff)
                    backoff *= 2.0

        raise RuntimeError("Failed to fetch Panchang from Prokerala API.")

    def _normalize_response(self, raw: Dict[str, Any], target_date: date, tz_str: str) -> Dict[str, Any]:
        """Normalizes Prokerala API v2 structure into our unified Panchang schema."""
        data = raw.get("data", raw)

        # Extract tithi
        tithi_list = data.get("tithi", [])
        primary_tithi = tithi_list[0] if tithi_list else {}

        # Extract nakshatra
        nak_list = data.get("nakshatra", [])
        primary_nak = nak_list[0] if nak_list else {}

        # Extract yoga
        yoga_list = data.get("yoga", [])
        primary_yoga = yoga_list[0] if yoga_list else {}

        # Extract karana
        karana_list = data.get("karana", [])
        primary_karana = karana_list[0] if karana_list else {}

        # Extract auspicious/inauspicious periods
        auspicious = data.get("auspicious_period", [])
        inauspicious = data.get("inauspicious_period", [])

        # Find Abhijit
        abhijit = next((p for p in auspicious if "abhijit" in p.get("name", "").lower()), {})
        # Find Rahu Kalam
        rahu = next((p for p in inauspicious if "rahu" in p.get("name", "").lower()), {})
        # Find Yamaganda
        yama = next((p for p in inauspicious if "yamaganda" in p.get("name", "").lower()), {})
        # Find Gulika
        gulika = next((p for p in inauspicious if "gulika" in p.get("name", "").lower()), {})

        # Helper to format HH:MM
        def parse_hhmm(iso_val: Optional[str]) -> str:
            if not iso_val:
                return "--:--"
            try:
                dt = datetime.fromisoformat(iso_val)
                return dt.strftime("%H:%M")
            except Exception:
                return str(iso_val)[:5]

        return {
            "date": target_date.isoformat(),
            "timezone": tz_str,
            "sunrise": parse_hhmm(data.get("sunrise")),
            "sunset": parse_hhmm(data.get("sunset")),
            "vara": {
                "name": data.get("vaara", {}).get("name", "Unknown"),
                "name_sa": data.get("vaara", {}).get("name", "Unknown"),
                "ruler": "External Provider"
            },
            "tithi": {
                "id": primary_tithi.get("id", 1),
                "name": primary_tithi.get("name", "Unknown"),
                "paksha": primary_tithi.get("paksha", "Shukla"),
                "start": parse_hhmm(primary_tithi.get("start")),
                "end": parse_hhmm(primary_tithi.get("end")),
            },
            "nakshatra": {
                "id": primary_nak.get("id", 1),
                "name": primary_nak.get("name", "Unknown"),
                "lord": primary_nak.get("lord", {}).get("name", "Unknown"),
                "start": parse_hhmm(primary_nak.get("start")),
                "end": parse_hhmm(primary_nak.get("end")),
            },
            "yoga": {
                "id": primary_yoga.get("id", 1),
                "name": primary_yoga.get("name", "Unknown"),
                "start": parse_hhmm(primary_yoga.get("start")),
                "end": parse_hhmm(primary_yoga.get("end")),
            },
            "karana": {
                "index": primary_karana.get("id", 1),
                "name": primary_karana.get("name", "Unknown"),
                "start": parse_hhmm(primary_karana.get("start")),
                "end": parse_hhmm(primary_karana.get("end")),
            },
            "muhurats": {
                "abhijit": {
                    "name": "Abhijit Muhurat",
                    "nature": "Highly Auspicious",
                    "start": parse_hhmm(abhijit.get("period", [{}])[0].get("start") if abhijit.get("period") else None),
                    "end": parse_hhmm(abhijit.get("period", [{}])[0].get("end") if abhijit.get("period") else None),
                },
                "rahu_kalam": {
                    "name": "Rahu Kalam",
                    "nature": "Inauspicious",
                    "start": parse_hhmm(rahu.get("period", [{}])[0].get("start") if rahu.get("period") else None),
                    "end": parse_hhmm(rahu.get("period", [{}])[0].get("end") if rahu.get("period") else None),
                },
                "yamaganda": {
                    "name": "Yamaganda",
                    "nature": "Inauspicious",
                    "start": parse_hhmm(yama.get("period", [{}])[0].get("start") if yama.get("period") else None),
                    "end": parse_hhmm(yama.get("period", [{}])[0].get("end") if yama.get("period") else None),
                },
                "gulika": {
                    "name": "Gulika Kalam",
                    "nature": "Neutral",
                    "start": parse_hhmm(gulika.get("period", [{}])[0].get("start") if gulika.get("period") else None),
                    "end": parse_hhmm(gulika.get("period", [{}])[0].get("end") if gulika.get("period") else None),
                }
            },
            "ayanamsa_used": "Lahiri (Chitra Paksha)",
            "computed_locally": False,
            "provider": "prokerala"
        }
