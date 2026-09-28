"""
Panchang Service Coordinator:
- Swappable PanchangProvider interface
- 24-hour Redis caching (with in-memory dictionary fallback)
- Cross-check verification between external API and local Swiss Ephemeris
- Mismatch logging beyond tolerance
- Graceful local fallback on external network/auth failure
"""

import json
import logging
import os
from datetime import date
from typing import Dict, Any, Optional, List

from .base import PanchangProvider
from .prokerala import ProkeralaProvider
from .local_provider import LocalSwissEphProvider

logger = logging.getLogger(__name__)

# In-memory cache fallback (key -> (timestamp, data))
_IN_MEMORY_CACHE: Dict[str, Dict[str, Any]] = {}


class PanchangManager:
    """
    Manages fetching, caching, cross-checking, and falling back for Panchang data.
    """

    def __init__(self, primary_provider: Optional[PanchangProvider] = None):
        self.primary_provider = primary_provider or ProkeralaProvider()
        self.local_provider = LocalSwissEphProvider()
        self._redis_client = None
        self._init_redis()

    def _init_redis(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        try:
            import redis
            self._redis_client = redis.from_url(redis_url, socket_timeout=1.5)
            # Ping test
            self._redis_client.ping()
            logger.info("Connected to Redis for Panchang caching.")
        except Exception:
            logger.info("Redis not available. Using high-performance in-memory cache for Panchang.")
            self._redis_client = None

    def _cache_key(self, target_date: date, lat: float, lon: float) -> str:
        # Precision rounded to 3 decimal places (~100m) for caching
        return f"panchang:{target_date.isoformat()}:{round(lat, 3)}:{round(lon, 3)}"

    def _get_from_cache(self, key: str) -> Optional[Dict[str, Any]]:
        if self._redis_client:
            try:
                cached = self._redis_client.get(key)
                if cached:
                    return json.loads(cached)
            except Exception as e:
                logger.warning(f"Redis get error: {e}")

        # In-memory fallback
        return _IN_MEMORY_CACHE.get(key)

    def _set_in_cache(self, key: str, data: Dict[str, Any], ttl_seconds: int = 86400):
        if self._redis_client:
            try:
                self._redis_client.setex(key, ttl_seconds, json.dumps(data))
                return
            except Exception as e:
                logger.warning(f"Redis set error: {e}")

        # In-memory fallback
        _IN_MEMORY_CACHE[key] = data

    async def get_panchang(
        self,
        target_date: date,
        lat: float,
        lon: float,
        tz_str: str,
        enable_cross_check: bool = True
    ) -> Dict[str, Any]:
        """
        Retrieves panchang:
        1. Checks cache (TTL 24h)
        2. Tries primary provider (e.g. Prokerala)
        3. Runs cross-check against local Swiss Ephemeris
        4. If external fails or unconfigured, falls back to local Swiss Ephemeris cleanly
        """
        cache_key = self._cache_key(target_date, lat, lon)
        cached_result = self._get_from_cache(cache_key)
        if cached_result:
            cached_result["is_cached"] = True
            return cached_result

        result = None
        cross_check_notes = []

        # 1. Attempt primary provider if configured
        can_call_primary = False
        if isinstance(self.primary_provider, ProkeralaProvider):
            can_call_primary = self.primary_provider.is_configured
        else:
            can_call_primary = True

        if can_call_primary:
            try:
                result = await self.primary_provider.get_panchang(target_date, lat, lon, tz_str)
                logger.info(f"Successfully fetched panchang from {self.primary_provider.name}")
            except Exception as e:
                logger.warning(f"Primary Panchang provider '{self.primary_provider.name}' failed: {e}. Falling back to local Swiss Ephemeris.")
                cross_check_notes.append(f"External provider ({self.primary_provider.name}) error: {str(e)}. Fallback to local computation.")

        # 2. Compute local Swiss Ephemeris version
        local_result = await self.local_provider.get_panchang(target_date, lat, lon, tz_str)

        if not result:
            # Fallback to local
            result = local_result
            result["computed_locally"] = True
            result["fallback_reason"] = "Primary provider credentials missing or endpoint unavailable."
        elif enable_cross_check:
            # 3. Cross-Check Mode: compare primary vs local Swiss Ephemeris
            discrepancies = self._cross_check(result, local_result)
            if discrepancies:
                logger.warning(f"Panchang Cross-Check Discrepancies on {target_date}: {discrepancies}")
                result["cross_check"] = {
                    "status": "Mismatch Detected",
                    "discrepancies": discrepancies,
                    "local_values": {
                        "tithi": local_result["tithi"]["name"],
                        "nakshatra": local_result["nakshatra"]["name"],
                        "yoga": local_result["yoga"]["name"],
                        "karana": local_result["karana"]["name"]
                    }
                }
            else:
                result["cross_check"] = {
                    "status": "Verified",
                    "message": "Primary provider matches local Swiss Ephemeris computation."
                }

        # Save in cache (TTL 24 hours)
        self._set_in_cache(cache_key, result, ttl_seconds=86400)
        return result

    def _cross_check(self, ext: Dict[str, Any], loc: Dict[str, Any]) -> List[str]:
        """Compares external vs local Panchang elements."""
        mismatches = []

        ext_tithi = str(ext.get("tithi", {}).get("name", "")).lower()
        loc_tithi = str(loc.get("tithi", {}).get("name", "")).lower()
        if ext_tithi and loc_tithi and ext_tithi not in loc_tithi and loc_tithi not in ext_tithi:
            mismatches.append(f"Tithi mismatch: external='{ext_tithi}', local='{loc_tithi}'")

        ext_nak = str(ext.get("nakshatra", {}).get("name", "")).lower()
        loc_nak = str(loc.get("nakshatra", {}).get("name", "")).lower()
        if ext_nak and loc_nak and ext_nak not in loc_nak and loc_nak not in ext_nak:
            mismatches.append(f"Nakshatra mismatch: external='{ext_nak}', local='{loc_nak}'")

        ext_yoga = str(ext.get("yoga", {}).get("name", "")).lower()
        loc_yoga = str(loc.get("yoga", {}).get("name", "")).lower()
        if ext_yoga and loc_yoga and ext_yoga not in loc_yoga and loc_yoga not in ext_yoga:
            mismatches.append(f"Yoga mismatch: external='{ext_yoga}', local='{loc_yoga}'")

        return mismatches
