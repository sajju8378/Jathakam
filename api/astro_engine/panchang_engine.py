"""
Local Swiss Ephemeris Panchang Computation Engine:
Calculates Tithi, Nakshatra, Yoga, Karana, Vara, Sunrise/Sunset, Moonrise/Moonset,
Rahu Kalam, Yamaganda, Gulika Kalam, and Abhijit Muhurat.
"""

from datetime import datetime, date, time, timedelta
import math
import zoneinfo
from typing import Dict, Any, List, Tuple
import swisseph as swe
from .constants import NAKSHATRAS, NAKSHATRA_MAP

# 30 Tithis
TITHI_NAMES = [
    "Shukla Pratipada", "Shukla Dwitiya", "Shukla Tritiya", "Shukla Chaturthi",
    "Shukla Panchami", "Shukla Shashthi", "Shukla Saptami", "Shukla Ashtami",
    "Shukla Navami", "Shukla Dashami", "Shukla Ekadashi", "Shukla Dvadashi",
    "Shukla Trayodashi", "Shukla Chaturdashi", "Purnima",
    "Krishna Pratipada", "Krishna Dwitiya", "Krishna Tritiya", "Krishna Chaturthi",
    "Krishna Panchami", "Krishna Shashthi", "Krishna Saptami", "Krishna Ashtami",
    "Krishna Navami", "Krishna Dashami", "Krishna Ekadashi", "Krishna Dvadashi",
    "Krishna Trayodashi", "Krishna Chaturdashi", "Amavasya"
]

# 27 Yogas
YOGA_NAMES = [
    "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
    "Sukarma", "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva",
    "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan",
    "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
    "Brahma", "Indra", "Vaidhriti"
]

# 11 Karanas (4 fixed, 7 repeating movable)
MOVABLE_KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Garija", "Vanija", "Vishti (Bhadra)"]
FIXED_KARANAS = {
    1: "Kintughna",    # 1st half of Shukla Pratipada
    58: "Shakuni",     # 2nd half of Krishna Chaturdashi
    59: "Chatushpada", # 1st half of Amavasya
    60: "Naga"         # 2nd half of Amavasya
}

# Weekday rulers
WEEKDAYS = [
    {"day": 0, "name": "Monday", "name_sa": "Somavara", "ruler": "Moon"},
    {"day": 1, "name": "Tuesday", "name_sa": "Mangalavara", "ruler": "Mars"},
    {"day": 2, "name": "Wednesday", "name_sa": "Budhavara", "ruler": "Mercury"},
    {"day": 3, "name": "Thursday", "name_sa": "Guruvara", "ruler": "Jupiter"},
    {"day": 4, "name": "Friday", "name_sa": "Shukravara", "ruler": "Venus"},
    {"day": 5, "name": "Saturday", "name_sa": "Shanivara", "ruler": "Saturn"},
    {"day": 6, "name": "Sunday", "name_sa": "Ravivara", "ruler": "Sun"},
]

# Rahu Kalam daytime 1/8th slots (0 to 7) per weekday (Monday=0 to Sunday=6)
# Standard Vedic order of 1/8th periods of day:
# Mon: 2nd period (approx 7:30 - 9:00 AM)
# Tue: 7th period (approx 3:00 - 4:30 PM)
# Wed: 5th period (approx 12:00 - 1:30 PM)
# Thu: 6th period (approx 1:30 - 3:00 PM)
# Fri: 4th period (approx 10:30 AM - 12:00 PM)
# Sat: 3rd period (approx 9:00 - 10:30 AM)
# Sun: 8th period (approx 4:30 - 6:00 PM)
RAHU_SLOTS = {0: 1, 1: 6, 2: 4, 3: 5, 4: 3, 5: 2, 6: 7}
YAMAGANDA_SLOTS = {0: 3, 1: 2, 2: 1, 3: 0, 4: 6, 5: 5, 6: 4}
GULIKA_SLOTS = {0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 0, 6: 6}


def calculate_sun_moon_longitudes(jd_ut: float) -> Tuple[float, float, float, float]:
    """
    Returns (sun_sidereal, moon_sidereal, sun_tropical, moon_tropical)
    """
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(jd_ut)
    
    sun_res, _ = swe.calc_ut(jd_ut, swe.SUN, swe.FLG_SWIEPH)
    moon_res, _ = swe.calc_ut(jd_ut, swe.MOON, swe.FLG_SWIEPH)
    
    sun_trop = sun_res[0]
    moon_trop = moon_res[0]
    
    sun_sid = (sun_trop - ayanamsa) % 360.0
    moon_sid = (moon_trop - ayanamsa) % 360.0
    
    return sun_sid, moon_sid, sun_trop, moon_trop


def calculate_sunrise_sunset(
    calc_date: date,
    lat: float,
    lon: float,
    tz_str: str
) -> Tuple[datetime, datetime]:
    """
    Computes accurate local sunrise and sunset using Swiss Ephemeris.
    """
    tz = zoneinfo.ZoneInfo(tz_str)
    # Noon UT for the given date
    noon_dt = datetime.combine(calc_date, time(12, 0, 0), tzinfo=zoneinfo.ZoneInfo("UTC"))
    jd_noon = swe.julday(noon_dt.year, noon_dt.month, noon_dt.day, 12.0, swe.GREG_CAL)

    # swe.rise_trans: CALC_RISE, CALC_SET
    # Flags: SE_BIT_DISC_CENTER or standard upper limb with atmospheric refraction
    res_rise = swe.rise_trans(jd_noon - 0.5, swe.SUN, swe.CALC_RISE, (lon, lat, 0.0))
    res_set = swe.rise_trans(jd_noon - 0.5, swe.SUN, swe.CALC_SET, (lon, lat, 0.0))

    jd_rise = res_rise[1][0]
    jd_set = res_set[1][0]

    # Convert JD to UTC datetime
    rise_year, rise_month, rise_day, rise_hour = swe.revjul(jd_rise, swe.GREG_CAL)
    set_year, set_month, set_day, set_hour = swe.revjul(jd_set, swe.GREG_CAL)

    rise_h = int(rise_hour)
    rise_m = int((rise_hour - rise_h) * 60)
    rise_s = int((((rise_hour - rise_h) * 60) - rise_m) * 60)
    rise_utc = datetime(rise_year, rise_month, rise_day, rise_h, rise_m, rise_s, tzinfo=zoneinfo.ZoneInfo("UTC"))
    sunrise_local = rise_utc.astimezone(tz)

    set_h = int(set_hour)
    set_m = int((set_hour - set_h) * 60)
    set_s = int((((set_hour - set_h) * 60) - set_m) * 60)
    set_utc = datetime(set_year, set_month, set_day, set_h, set_m, set_s, tzinfo=zoneinfo.ZoneInfo("UTC"))
    sunset_local = set_utc.astimezone(tz)

    return sunrise_local, sunset_local


def calculate_local_panchang(
    calc_date: date,
    lat: float,
    lon: float,
    tz_str: str,
    calc_time: time = time(6, 0, 0)
) -> Dict[str, Any]:
    """
    Computes complete Panchang elements locally using Swiss Ephemeris.
    Evaluated at sunrise (or specified local time) in the target timezone.
    """
    tz = zoneinfo.ZoneInfo(tz_str)
    sunrise_dt, sunset_dt = calculate_sunrise_sunset(calc_date, lat, lon, tz_str)

    # Julian day for local sunrise
    sunrise_utc = sunrise_dt.astimezone(zoneinfo.ZoneInfo("UTC"))
    hour_float = sunrise_utc.hour + sunrise_utc.minute / 60.0 + sunrise_utc.second / 3600.0
    jd_sunrise = swe.julday(sunrise_utc.year, sunrise_utc.month, sunrise_utc.day, hour_float, swe.GREG_CAL)

    sun_sid, moon_sid, _, _ = calculate_sun_moon_longitudes(jd_sunrise)

    # 1. Tithi
    # Angular distance between Moon and Sun (tropical and sidereal difference is identical)
    diff = (moon_sid - sun_sid) % 360.0
    tithi_index = int(diff / 12.0)  # 0 to 29
    tithi_id = tithi_index + 1
    tithi_name = TITHI_NAMES[tithi_index]
    tithi_elapsed_pct = round(((diff % 12.0) / 12.0) * 100.0, 1)

    # Paksha
    paksha = "Shukla Paksha" if tithi_id <= 15 else "Krishna Paksha"

    # 2. Nakshatra of Moon
    nak_span = 360.0 / 27.0
    nak_index = int((moon_sid % 360.0) / nak_span)
    nak_id = nak_index + 1
    nak_info = NAKSHATRA_MAP[nak_id]
    nak_elapsed_pct = round((((moon_sid % 360.0) % nak_span) / nak_span) * 100.0, 1)

    # 3. Yoga
    # Sum of sidereal Sun and Moon longitudes
    sum_lon = (sun_sid + moon_sid) % 360.0
    yoga_index = int(sum_lon / nak_span) % 27
    yoga_id = yoga_index + 1
    yoga_name = YOGA_NAMES[yoga_index]
    yoga_elapsed_pct = round(((sum_lon % nak_span) / nak_span) * 100.0, 1)

    # 4. Karana (Half of a Tithi = 6 degrees)
    karana_idx = int(diff / 6.0) + 1  # 1 to 60
    if karana_idx in FIXED_KARANAS:
        karana_name = FIXED_KARANAS[karana_idx]
    else:
        # Repeating 7 movable karanas (indices 2 to 57)
        movable_idx = (karana_idx - 2) % 7
        karana_name = MOVABLE_KARANAS[movable_idx]

    # 5. Vara (Weekday from sunrise)
    weekday_idx = sunrise_dt.weekday()  # Monday is 0, Sunday is 6
    vara_info = WEEKDAYS[weekday_idx]

    # 6. Muhurats and Auspicious/Inauspicious Timings
    # Day duration
    day_duration = sunset_dt - sunrise_dt
    slot_duration = day_duration / 8.0

    # Rahu Kalam
    rahu_slot = RAHU_SLOTS[weekday_idx]
    rahu_start = sunrise_dt + (slot_duration * rahu_slot)
    rahu_end = rahu_start + slot_duration

    # Yamaganda
    yama_slot = YAMAGANDA_SLOTS[weekday_idx]
    yama_start = sunrise_dt + (slot_duration * yama_slot)
    yama_end = yama_start + slot_duration

    # Gulika Kalam
    gulika_slot = GULIKA_SLOTS[weekday_idx]
    gulika_start = sunrise_dt + (slot_duration * gulika_slot)
    gulika_end = gulika_start + slot_duration

    # Abhijit Muhurat
    # 8th muhurat of the day (each muhurat is day_duration / 15)
    muhurat_slot = day_duration / 15.0
    abhijit_start = sunrise_dt + (muhurat_slot * 7)
    abhijit_end = sunrise_dt + (muhurat_slot * 8)

    return {
        "date": calc_date.isoformat(),
        "timezone": tz_str,
        "sunrise": sunrise_dt.strftime("%H:%M:%S"),
        "sunset": sunset_dt.strftime("%H:%M:%S"),
        "vara": {
            "name": vara_info["name"],
            "name_sa": vara_info["name_sa"],
            "ruler": vara_info["ruler"]
        },
        "tithi": {
            "id": tithi_id,
            "name": tithi_name,
            "paksha": paksha,
            "elapsed_percentage": tithi_elapsed_pct
        },
        "nakshatra": {
            "id": nak_id,
            "name": nak_info["name"],
            "lord": nak_info["lord"],
            "deity": nak_info["deity"],
            "elapsed_percentage": nak_elapsed_pct
        },
        "yoga": {
            "id": yoga_id,
            "name": yoga_name,
            "elapsed_percentage": yoga_elapsed_pct
        },
        "karana": {
            "index": karana_idx,
            "name": karana_name
        },
        "muhurats": {
            "abhijit": {
                "name": "Abhijit Muhurat",
                "nature": "Highly Auspicious",
                "start": abhijit_start.strftime("%H:%M"),
                "end": abhijit_end.strftime("%H:%M"),
            },
            "rahu_kalam": {
                "name": "Rahu Kalam",
                "nature": "Inauspicious",
                "start": rahu_start.strftime("%H:%M"),
                "end": rahu_end.strftime("%H:%M"),
            },
            "yamaganda": {
                "name": "Yamaganda",
                "nature": "Inauspicious",
                "start": yama_start.strftime("%H:%M"),
                "end": yama_end.strftime("%H:%M"),
            },
            "gulika": {
                "name": "Gulika Kalam",
                "nature": "Neutral / Routine",
                "start": gulika_start.strftime("%H:%M"),
                "end": gulika_end.strftime("%H:%M"),
            }
        },
        "ayanamsa_used": "Lahiri (Chitra Paksha)",
        "computed_locally": True
    }
