"""
Abstract Base Class for Panchang Providers.
Allows swapping Prokerala with other providers (e.g. DrikPanchang, Ephemeris, etc.)
by implementing a single class.
"""

from abc import ABC, abstractmethod
from datetime import date
from typing import Dict, Any


class PanchangProvider(ABC):
    """
    Interface for third-party or local Panchang data providers.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Returns the provider's unique identifier."""
        pass

    @abstractmethod
    async def get_panchang(
        self,
        target_date: date,
        lat: float,
        lon: float,
        tz_str: str
    ) -> Dict[str, Any]:
        """
        Retrieves and normalizes Panchang data for the specified date and coordinates.
        Must return data conforming to the unified Panchang schema.
        """
        pass
