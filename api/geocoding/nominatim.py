"""
Nominatim OpenStreetMap Geocoding with TimezoneFinder & Instant Local City Database.
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional
import httpx
from timezonefinder import TimezoneFinder

from .base import GeocodingProvider, GeocodedPlace

logger = logging.getLogger(__name__)

# Pre-seeded popular spiritual and global cities for ultra-fast response
POPULAR_CITIES = [
    {"city": "New Delhi", "display_name": "New Delhi, Delhi, India", "state": "Delhi", "country": "India", "latitude": 28.6139, "longitude": 77.2090, "timezone": "Asia/Kolkata"},
    {"city": "Mumbai", "display_name": "Mumbai, Maharashtra, India", "state": "Maharashtra", "country": "India", "latitude": 19.0760, "longitude": 72.8777, "timezone": "Asia/Kolkata"},
    {"city": "Bengaluru", "display_name": "Bengaluru, Karnataka, India", "state": "Karnataka", "country": "India", "latitude": 12.9716, "longitude": 77.5946, "timezone": "Asia/Kolkata"},
    {"city": "Kolkata", "display_name": "Kolkata, West Bengal, India", "state": "West Bengal", "country": "India", "latitude": 22.5726, "longitude": 88.3639, "timezone": "Asia/Kolkata"},
    {"city": "Chennai", "display_name": "Chennai, Tamil Nadu, India", "state": "Tamil Nadu", "country": "India", "latitude": 13.0827, "longitude": 80.2707, "timezone": "Asia/Kolkata"},
    {"city": "Hyderabad", "display_name": "Hyderabad, Telangana, India", "state": "Telangana", "country": "India", "latitude": 17.3850, "longitude": 78.4867, "timezone": "Asia/Kolkata"},
    {"city": "Ahmedabad", "display_name": "Ahmedabad, Gujarat, India", "state": "Gujarat", "country": "India", "latitude": 23.0225, "longitude": 72.5714, "timezone": "Asia/Kolkata"},
    {"city": "Pune", "display_name": "Pune, Maharashtra, India", "state": "Maharashtra", "country": "India", "latitude": 18.5204, "longitude": 73.8567, "timezone": "Asia/Kolkata"},
    {"city": "Jaipur", "display_name": "Jaipur, Rajasthan, India", "state": "Rajasthan", "country": "India", "latitude": 26.9124, "longitude": 75.7873, "timezone": "Asia/Kolkata"},
    {"city": "Varanasi", "display_name": "Varanasi (Kashi), Uttar Pradesh, India", "state": "Uttar Pradesh", "country": "India", "latitude": 25.3176, "longitude": 82.9739, "timezone": "Asia/Kolkata"},
    {"city": "Ujjain", "display_name": "Ujjain (Avantika), Madhya Pradesh, India", "state": "Madhya Pradesh", "country": "India", "latitude": 23.1765, "longitude": 75.7885, "timezone": "Asia/Kolkata"},
    {"city": "Haridwar", "display_name": "Haridwar, Uttarakhand, India", "state": "Uttarakhand", "country": "India", "latitude": 29.9457, "longitude": 78.1642, "timezone": "Asia/Kolkata"},
    {"city": "Ayodhya", "display_name": "Ayodhya, Uttar Pradesh, India", "state": "Uttar Pradesh", "country": "India", "latitude": 26.7922, "longitude": 82.1998, "timezone": "Asia/Kolkata"},
    {"city": "London", "display_name": "London, Greater London, United Kingdom", "state": "England", "country": "United Kingdom", "latitude": 51.5074, "longitude": -0.1278, "timezone": "Europe/London"},
    {"city": "New York", "display_name": "New York, New York, United States", "state": "New York", "country": "United States", "latitude": 40.7128, "longitude": -74.0060, "timezone": "America/New_York"},
    {"city": "San Francisco", "display_name": "San Francisco, California, United States", "state": "California", "country": "United States", "latitude": 37.7749, "longitude": -122.4194, "timezone": "America/Los_Angeles"},
    {"city": "Dubai", "display_name": "Dubai, United Arab Emirates", "state": "Dubai", "country": "United Arab Emirates", "latitude": 25.2048, "longitude": 55.2708, "timezone": "Asia/Dubai"},
    {"city": "Singapore", "display_name": "Singapore, Singapore", "state": "Singapore", "country": "Singapore", "latitude": 1.3521, "longitude": 103.8198, "timezone": "Asia/Singapore"},
    {"city": "Sydney", "display_name": "Sydney, New South Wales, Australia", "state": "New South Wales", "country": "Australia", "latitude": -33.8688, "longitude": 151.2093, "timezone": "Australia/Sydney"},
    {"city": "Toronto", "display_name": "Toronto, Ontario, Canada", "state": "Ontario", "country": "Canada", "latitude": 43.6532, "longitude": -79.3832, "timezone": "America/Toronto"}
]


class NominatimProvider(GeocodingProvider):
    def __init__(self):
        self.tf = TimezoneFinder()
        self._cache: Dict[str, List[GeocodedPlace]] = {}
        self._last_req_time = 0.0

    async def search(self, query: str) -> List[GeocodedPlace]:
        q = query.strip()
        if not q or len(q) < 2:
            return []

        lower_q = q.lower()

        # 1. Check local in-memory cache
        if lower_q in self._cache:
            return self._cache[lower_q]

        # 2. Match in curated city database first for instantaneous results
        matched = []
        for city in POPULAR_CITIES:
            if lower_q in city["city"].lower() or lower_q in city["display_name"].lower():
                matched.append(GeocodedPlace(**city))

        if len(matched) >= 3:
            self._cache[lower_q] = matched
            return matched

        # 3. Call OpenStreetMap Nominatim API
        try:
            url = "https://nominatim.openstreetmap.org/search"
            params = {
                "q": q,
                "format": "json",
                "addressdetails": 1,
                "limit": 5
            }
            headers = {
                "User-Agent": "JyotishVeda-AstrologyApp/1.0 (astro-contact@jyotishveda.internal)"
            }

            async with httpx.AsyncClient() as client:
                resp = await client.get(url, params=params, headers=headers, timeout=5.0)
                if resp.status_code == 200:
                    items = resp.json()
                    for item in items:
                        lat = float(item["lat"])
                        lon = float(item["lon"])
                        addr = item.get("address", {})
                        city_name = addr.get("city") or addr.get("town") or addr.get("village") or addr.get("county") or item.get("display_name", "").split(",")[0]
                        country_name = addr.get("country", "")
                        state_name = addr.get("state")

                        # Determine timezone
                        tz = self.tf.timezone_at(lng=lon, lat=lat) or "UTC"

                        matched.append(GeocodedPlace(
                            display_name=item.get("display_name", f"{city_name}, {country_name}"),
                            city=city_name,
                            state=state_name,
                            country=country_name,
                            latitude=lat,
                            longitude=lon,
                            timezone=tz
                        ))
        except Exception as e:
            logger.warning(f"Nominatim geocoding error: {e}")

        # Deduplicate and cache
        seen = set()
        deduped = []
        for p in matched:
            key = (round(p.latitude, 2), round(p.longitude, 2))
            if key not in seen:
                seen.add(key)
                deduped.append(p)

        self._cache[lower_q] = deduped[:6]
        return self._cache[lower_q]
