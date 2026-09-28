"""
Unit tests for Julian Day calculation and historical timezone handling.
"""

import pytest
from datetime import datetime, date
import zoneinfo
import swisseph as swe
from api.astro_engine.julian import parse_and_validate_datetime, TimezoneConversionError


def test_julian_day_known_epoch():
    """J2000.0 epoch: 2000-01-01 12:00:00 UTC corresponds to Julian Day 2451545.0."""
    utc_dt, jd_ut, is_unknown = parse_and_validate_datetime(
        dob="2000-01-01",
        tob="12:00:00",
        tz_str="UTC"
    )
    assert abs(jd_ut - 2451545.0) < 1e-6
    assert not is_unknown


def test_india_historical_wartime_timezone():
    """
    During World War II (Sept 1, 1942 to Oct 15, 1945), India observed Daylight Saving Time
    at UTC+6:30 instead of UTC+5:30.
    Python's zoneinfo + tzdata maintains this historical database accurately.
    """
    tz = zoneinfo.ZoneInfo("Asia/Kolkata")
    
    # 1. During wartime: 1943-07-01 at 12:00:00 local time
    utc_dt_war, jd_war, _ = parse_and_validate_datetime(
        dob="1943-07-01",
        tob="12:00:00",
        tz_str="Asia/Kolkata"
    )
    # 12:00 local with +6:30 offset is 05:30 UTC
    assert utc_dt_war.hour == 5
    assert utc_dt_war.minute == 30

    # 2. Modern era: 2024-07-01 at 12:00:00 local time
    utc_dt_mod, jd_mod, _ = parse_and_validate_datetime(
        dob="2024-07-01",
        tob="12:00:00",
        tz_str="Asia/Kolkata"
    )
    # 12:00 local with +5:30 offset is 06:30 UTC
    assert utc_dt_mod.hour == 6
    assert utc_dt_mod.minute == 30


def test_spring_forward_nonexistent_time():
    """In US Eastern Time, on 2024-03-10, clocks jump from 02:00 to 03:00. 02:30 does not exist."""
    with pytest.raises(TimezoneConversionError):
        parse_and_validate_datetime(
            dob="2024-03-10",
            tob="02:30:00",
            tz_str="America/New_York"
        )


def test_birth_time_unknown_mode():
    """Birth time unknown sets time to 12:00:00 and flags is_unknown."""
    utc_dt, jd, is_unknown = parse_and_validate_datetime(
        dob="1995-10-20",
        tob=None,
        tz_str="Asia/Kolkata",
        time_unknown=True
    )
    assert is_unknown is True
    assert utc_dt.hour == 6  # 12:00 - 5:30 = 06:30
    assert utc_dt.minute == 30
