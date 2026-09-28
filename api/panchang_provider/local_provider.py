"""
Local Swiss Ephemeris Implementation of PanchangProvider.
Conforms to the PanchangProvider interface.
"""

from datetime import date
from typing import Dict, Any
from .base import PanchangProvider
from ..astro_engine.panchang_engine import calculate_local_panchang


class LocalSwissEphProvider(PanchangProvider):
    """
    Panchang calculated locally using pyswisseph (Swiss Ephemeris).
    """

    @property
    def name(self) -> str:
        return "swiss_ephemeris_local"

    async def get_panchang(
        self,
        target_date: date,
        lat: float,
        lon: float,
        tz_str: str
    ) -> Dict[str, Any]:
        result = calculate_local_panchang(target_date, lat, lon, tz_str)
        result["provider"] = self.name
        return result
