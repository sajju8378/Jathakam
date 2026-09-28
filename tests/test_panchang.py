"""
Unit tests for Panchang provider interface, normalization, and local cross-check.
"""

import pytest
import asyncio
from datetime import date
from unittest.mock import AsyncMock, patch

from api.panchang_provider.base import PanchangProvider
from api.panchang_provider.manager import PanchangManager
from api.panchang_provider.prokerala import ProkeralaProvider
from api.astro_engine.panchang_engine import calculate_local_panchang


class MockExternalProvider(PanchangProvider):
    @property
    def name(self) -> str:
        return "mock_provider"

    async def get_panchang(self, target_date: date, lat: float, lon: float, tz_str: str):
        return {
            "date": target_date.isoformat(),
            "timezone": tz_str,
            "sunrise": "06:15",
            "sunset": "18:15",
            "vara": {"name": "Monday", "name_sa": "Somavara", "ruler": "Moon"},
            "tithi": {"id": 1, "name": "Shukla Pratipada", "paksha": "Shukla"},
            "nakshatra": {"id": 1, "name": "Ashwini", "lord": "Ketu"},
            "yoga": {"id": 1, "name": "Vishkumbha"},
            "karana": {"index": 1, "name": "Kintughna"},
            "muhurats": {
                "abhijit": {"name": "Abhijit Muhurat", "start": "11:50", "end": "12:40"},
                "rahu_kalam": {"name": "Rahu Kalam", "start": "07:45", "end": "09:15"},
            },
            "provider": "mock_provider",
            "computed_locally": False
        }


@pytest.mark.asyncio
async def test_panchang_manager_with_mock_provider():
    mock_prov = MockExternalProvider()
    mgr = PanchangManager(primary_provider=mock_prov)

    # Disable cross check for direct fetch
    data = await mgr.get_panchang(
        target_date=date(2025, 1, 1),
        lat=28.6139,
        lon=77.2090,
        tz_str="Asia/Kolkata",
        enable_cross_check=False
    )
    assert data["provider"] == "mock_provider"
    assert data["tithi"]["name"] == "Shukla Pratipada"
    assert "rahu_kalam" in data["muhurats"]


@pytest.mark.asyncio
async def test_panchang_fallback_when_external_fails():
    failing_prov = AsyncMock(spec=PanchangProvider)
    failing_prov.name = "failing_external"
    failing_prov.get_panchang.side_effect = TimeoutError("External API timed out")

    mgr = PanchangManager(primary_provider=failing_prov)
    data = await mgr.get_panchang(
        target_date=date(2026, 9, 28),
        lat=28.6139,
        lon=77.2090,
        tz_str="Asia/Kolkata",
        enable_cross_check=True
    )
    # Should fall back to local computation gracefully
    assert data["computed_locally"] is True
    assert "tithi" in data
    assert "nakshatra" in data
    assert "sunrise" in data


def test_local_panchang_elements():
    """Verify Swiss Ephemeris local calculation produces valid Panchang elements."""
    p = calculate_local_panchang(
        calc_date=date(2026, 9, 28),
        lat=28.6139,
        lon=77.2090,
        tz_str="Asia/Kolkata"
    )
    assert 1 <= p["tithi"]["id"] <= 30
    assert 1 <= p["nakshatra"]["id"] <= 27
    assert 1 <= p["yoga"]["id"] <= 27
    assert p["muhurats"]["rahu_kalam"]["start"] < p["muhurats"]["rahu_kalam"]["end"]
