"""
Geocoding Provider Interface and Models.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class GeocodedPlace(BaseModel):
    display_name: str
    city: str
    state: Optional[str] = None
    country: str
    latitude: float
    longitude: float
    timezone: str


class GeocodingProvider(ABC):
    @abstractmethod
    async def search(self, query: str) -> List[GeocodedPlace]:
        """Searches for places matching query, returning lat, lon, and IANA timezone."""
        pass
