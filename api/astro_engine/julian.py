"""
Historical Timezone conversion and Julian Day calculation using Python zoneinfo and Swiss Ephemeris.
"""

from datetime import datetime, time, date
import zoneinfo
import swisseph as swe
from typing import Tuple, Optional


class TimezoneConversionError(ValueError):
    """Raised when local time is ambiguous or nonexistent in the specified timezone."""
    pass


def parse_and_validate_datetime(
    dob: str,
    tob: Optional[str],
    tz_str: str,
    time_unknown: bool = False
) -> Tuple[datetime, float, bool]:
    """
    Parses date of birth (YYYY-MM-DD), time of birth (HH:MM or HH:MM:SS), and IANA timezone.
    Converts local time to UTC datetime and computes the Julian Day (UT).
    
    Returns:
        (utc_datetime, julian_day_ut, is_time_unknown)
    """
    try:
        birth_date = date.fromisoformat(dob.strip())
    except Exception as e:
        raise ValueError(f"Invalid date format for dob '{dob}'. Expected YYYY-MM-DD.") from e

    if time_unknown or not tob or not tob.strip():
        # Birth time unknown: use 12:00:00 local time as per standard Jyotish convention
        birth_time = time(12, 0, 0)
        is_unknown = True
    else:
        is_unknown = False
        parts = tob.strip().split(":")
        try:
            h = int(parts[0])
            m = int(parts[1]) if len(parts) > 1 else 0
            s = int(parts[2]) if len(parts) > 2 else 0
            birth_time = time(h, m, s)
        except Exception as e:
            raise ValueError(f"Invalid time format for tob '{tob}'. Expected HH:MM or HH:MM:SS.") from e

    try:
        tz = zoneinfo.ZoneInfo(tz_str.strip())
    except Exception as e:
        raise ValueError(f"Unknown or invalid IANA timezone: '{tz_str}'.") from e

    # Create local datetime
    local_dt = datetime.combine(birth_date, birth_time)

    # Check for nonexistent time (e.g. spring forward transition)
    # When fold is set to 0 and 1, check if the UTC conversion behaves properly
    try:
        # Check if time exists in this timezone
        dt_fold0 = local_dt.replace(tzinfo=tz, fold=0)
        dt_fold1 = local_dt.replace(tzinfo=tz, fold=1)
        
        # Test nonexistent time check by converting to UTC and back
        utc0 = dt_fold0.astimezone(zoneinfo.ZoneInfo("UTC"))
        local_back = utc0.astimezone(tz)
        
        if local_back.hour != birth_time.hour or local_back.minute != birth_time.minute:
            # The local time does not exist due to DST gap (e.g. 02:30 jumped to 03:00)
            raise TimezoneConversionError(
                f"Local time '{local_dt}' does not exist in timezone '{tz_str}' "
                f"due to daylight saving spring forward clock change. Please verify the time."
            )

        # Check for ambiguous time (fall back gap where same hour occurs twice)
        if dt_fold0.utcoffset() != dt_fold1.utcoffset():
            # Ambiguous time: default to fold=0 (standard / first occurrence) but log/flag
            utc_dt = dt_fold0.astimezone(zoneinfo.ZoneInfo("UTC"))
        else:
            utc_dt = dt_fold0.astimezone(zoneinfo.ZoneInfo("UTC"))
            
    except TimezoneConversionError:
        raise
    except Exception as e:
        raise TimezoneConversionError(f"Error resolving timezone '{tz_str}' for datetime '{local_dt}': {str(e)}") from e

    # Compute Julian Day (UT) using Swiss Ephemeris
    # hour float = hour + minute / 60.0 + second / 3600.0 + microsecond / 3600000000.0
    hour_float = utc_dt.hour + utc_dt.minute / 60.0 + (utc_dt.second + utc_dt.microsecond / 1e6) / 3600.0
    jd_ut = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, hour_float, swe.GREG_CAL)

    return utc_dt, jd_ut, is_unknown


def get_delta_t(jd_ut: float) -> float:
    """Returns Delta T (difference between Terrestrial Time and Universal Time) in days."""
    # swe.deltat returns delta T in seconds
    return swe.deltat(jd_ut)
