"""
High-precision Swiss Ephemeris wrapper for Vedic Astrology (Jyotish).
Calculates sidereal planetary longitudes, Ascendant, and Bhavas (House cusps).
"""

from typing import Dict, Any, List, Tuple, Optional
import math
import swisseph as swe

from .constants import (
    RASHIS, RASHI_MAP, NAKSHATRAS, NAKSHATRA_MAP,
    PLANET_KEYS, PLANET_SANSKRIT, SIGN_LORDS
)

# Swiss Ephemeris body IDs
SWE_BODY_MAP = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mars": swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus": swe.VENUS,
    "Saturn": swe.SATURN,
}

# Supported Ayanamsas
AYANAMSA_MAP = {
    "lahiri": swe.SIDM_LAHIRI,           # Chitra Paksha (standard)
    "kp": swe.SIDM_KRISHNAMURTI,         # Krishnamurti Paddhati
    "raman": swe.SIDM_RAMAN,             # B.V. Raman
}


def configure_ephemeris(ayanamsa_name: str = "lahiri") -> Tuple[int, float]:
    """
    Sets the sidereal mode in Swiss Ephemeris to the requested ayanamsa.
    Returns (sid_mode_int, default_ayanamsa_value_if_needed).
    """
    key = ayanamsa_name.lower().strip()
    sid_mode = AYANAMSA_MAP.get(key, swe.SIDM_LAHIRI)
    swe.set_sid_mode(sid_mode)
    return sid_mode


def get_ephemeris_version() -> str:
    """Returns the version of the Swiss Ephemeris library in use."""
    return str(swe.version)


def get_current_ayanamsa(jd_ut: float, ayanamsa_name: str = "lahiri") -> float:
    """Returns the exact ayanamsa value in degrees for the given Julian Day."""
    configure_ephemeris(ayanamsa_name)
    return float(swe.get_ayanamsa_ut(jd_ut))


def calculate_nakshatra_and_pada(lon_deg: float) -> Tuple[int, str, int, str, float]:
    """
    Given a sidereal longitude (0° - 360°), determines:
    - Nakshatra ID (1 to 27)
    - Nakshatra Name
    - Pada (1 to 4)
    - Nakshatra Lord
    - Degrees elapsed within current Nakshatra
    """
    norm_lon = lon_deg % 360.0
    nak_span = 360.0 / 27.0  # 13.333333333333334 degrees (13°20')
    pada_span = nak_span / 4.0  # 3.3333333333333335 degrees (3°20')

    nak_index = int(norm_lon / nak_span)  # 0 to 26
    nak_id = nak_index + 1

    deg_in_nak = norm_lon - (nak_index * nak_span)
    pada = int(deg_in_nak / pada_span) + 1
    if pada > 4:
        pada = 4

    nak_info = NAKSHATRA_MAP.get(nak_id, NAKSHATRAS[0])
    return nak_id, nak_info["name"], pada, nak_info["lord"], deg_in_nak


def calculate_rashi_info(lon_deg: float) -> Tuple[int, str, str, float, str]:
    """
    Given a sidereal longitude (0° - 360°), determines:
    - Sign ID (1 to 12)
    - Sign Name (English)
    - Sign Name (Sanskrit)
    - Degrees within sign (0.0 to 30.0)
    - Sign Lord
    """
    norm_lon = lon_deg % 360.0
    sign_id = int(norm_lon // 30.0) + 1
    deg_in_sign = norm_lon % 30.0
    rashi = RASHI_MAP.get(sign_id, RASHIS[0])
    return sign_id, rashi["name_en"], rashi["name_sa"], deg_in_sign, rashi["lord"]


def calculate_houses(
    jd_ut: float,
    lat: float,
    lon: float,
    ayanamsa_name: str = "lahiri",
    house_system: str = "whole_sign"
) -> Tuple[float, List[Dict[str, Any]]]:
    """
    Computes Ascendant (Lagna) and 12 Bhavas.
    Supported house systems:
    - whole_sign (default Jyotish Whole Sign): House 1 is the entire sign of Lagna.
    - equal: Houses are 30° starting from Lagna longitude.
    - sripati: Porphyry / Sripathi method where quadrants are trisected.
    """
    configure_ephemeris(ayanamsa_name)
    ayanamsa_val = swe.get_ayanamsa_ut(jd_ut)

    # Calculate tropical houses and ascendant using Swiss Ephemeris
    # House system codes in Swiss Ephemeris: 'P' (Placidus), 'W' (Whole sign), 'E' (Equal), 'O' (Porphyry / Sripathi)
    hsys_code = b'P'
    if house_system == "equal":
        hsys_code = b'E'
    elif house_system == "sripati":
        hsys_code = b'O'
    else:  # whole_sign default
        hsys_code = b'W'

    cusps, ascmc = swe.houses(jd_ut, lat, lon, hsys_code)
    tropical_asc = ascmc[0]
    tropical_mc = ascmc[1]

    # Convert Ascendant and MC to sidereal
    sidereal_asc = (tropical_asc - ayanamsa_val) % 360.0
    sidereal_mc = (tropical_mc - ayanamsa_val) % 360.0

    asc_sign_id, asc_sign_en, asc_sign_sa, asc_deg_in_sign, asc_lord = calculate_rashi_info(sidereal_asc)
    asc_nak_id, asc_nak_name, asc_pada, asc_nak_lord, _ = calculate_nakshatra_and_pada(sidereal_asc)

    houses = []

    if house_system == "whole_sign":
        # Whole Sign: House 1 is asc_sign_id, House 2 is asc_sign_id + 1, etc.
        for h in range(1, 13):
            sign_num = ((asc_sign_id - 1 + (h - 1)) % 12) + 1
            rashi = RASHI_MAP[sign_num]
            # Center of the house in whole sign is the midpoint of the sign
            midpoint = ((sign_num - 1) * 30.0 + 15.0) % 360.0
            start_lon = ((sign_num - 1) * 30.0) % 360.0
            end_lon = (start_lon + 30.0) % 360.0
            houses.append({
                "house": h,
                "sign_id": sign_num,
                "sign_en": rashi["name_en"],
                "sign_sa": rashi["name_sa"],
                "lord": rashi["lord"],
                "start_lon": start_lon,
                "midpoint_lon": midpoint,
                "end_lon": end_lon,
                "cusp_lon": sidereal_asc if h == 1 else ((start_lon + asc_deg_in_sign) % 360.0)
            })

    elif house_system == "equal":
        # Equal House: House 1 begins at sidereal_asc, each house is 30°
        for h in range(1, 13):
            cusp_lon = (sidereal_asc + (h - 1) * 30.0) % 360.0
            sign_num, s_en, s_sa, deg_in_s, lord = calculate_rashi_info(cusp_lon)
            houses.append({
                "house": h,
                "sign_id": sign_num,
                "sign_en": s_en,
                "sign_sa": s_sa,
                "lord": lord,
                "start_lon": cusp_lon,
                "midpoint_lon": (cusp_lon + 15.0) % 360.0,
                "end_lon": (cusp_lon + 30.0) % 360.0,
                "cusp_lon": cusp_lon
            })

    else:  # sripati (Porphyry based Sripathi cusps)
        # Convert all 12 cusps returned by swe.houses to sidereal
        # cusps is 1-indexed (index 0 is dummy in swe.houses)
        for h in range(1, 13):
            trop_cusp = cusps[h]
            sid_cusp = (trop_cusp - ayanamsa_val) % 360.0
            sign_num, s_en, s_sa, deg_in_s, lord = calculate_rashi_info(sid_cusp)
            # Sripathi: cusp is bhava madhya (midpoint of house)
            houses.append({
                "house": h,
                "sign_id": sign_num,
                "sign_en": s_en,
                "sign_sa": s_sa,
                "lord": lord,
                "start_lon": (sid_cusp - 15.0) % 360.0,
                "midpoint_lon": sid_cusp,
                "end_lon": (sid_cusp + 15.0) % 360.0,
                "cusp_lon": sid_cusp
            })

    return sidereal_asc, houses


def calculate_planet_positions(
    jd_ut: float,
    ayanamsa_name: str = "lahiri",
    node_type: str = "mean",
    ascendant_lon: Optional[float] = None,
    houses: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Dict[str, Any]]:
    """
    Computes sidereal planetary longitudes, speeds, retrograde status, signs, nakshatras, and houses.
    Planets: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu.
    """
    configure_ephemeris(ayanamsa_name)
    ayanamsa_val = swe.get_ayanamsa_ut(jd_ut)

    # Flags: SEFLG_SWIEPH (high precision) | SEFLG_SPEED
    flags = swe.FLG_SWIEPH | swe.FLG_SPEED

    planets: Dict[str, Dict[str, Any]] = {}

    # 1. Classical 7 Planets (Sun to Saturn)
    for p_name, swe_id in SWE_BODY_MAP.items():
        res, ret_flags = swe.calc_ut(jd_ut, swe_id, flags)
        tropical_lon = res[0]
        speed_lon = res[3]

        sidereal_lon = (tropical_lon - ayanamsa_val) % 360.0
        is_retrograde = speed_lon < 0.0

        sign_id, sign_en, sign_sa, deg_in_sign, sign_lord = calculate_rashi_info(sidereal_lon)
        nak_id, nak_name, pada, nak_lord, deg_in_nak = calculate_nakshatra_and_pada(sidereal_lon)

        planets[p_name] = {
            "name": p_name,
            "name_sa": PLANET_SANSKRIT[p_name],
            "longitude": sidereal_lon,
            "speed": speed_lon,
            "is_retrograde": is_retrograde,
            "sign_id": sign_id,
            "sign_en": sign_en,
            "sign_sa": sign_sa,
            "degree_in_sign": deg_in_sign,
            "nakshatra_id": nak_id,
            "nakshatra_name": nak_name,
            "pada": pada,
            "nakshatra_lord": nak_lord,
            "house": None,  # Computed below
            "dignity": "",  # Computed in dignities.py
        }

    # 2. Lunar Nodes: Rahu and Ketu
    node_flag = swe.MEAN_NODE if node_type.lower() == "mean" else swe.TRUE_NODE
    node_res, _ = swe.calc_ut(jd_ut, node_flag, flags)
    rahu_tropical_lon = node_res[0]
    rahu_speed = node_res[3]
    rahu_sidereal = (rahu_tropical_lon - ayanamsa_val) % 360.0

    # Ketu is exactly 180 degrees opposite Rahu
    ketu_sidereal = (rahu_sidereal + 180.0) % 360.0
    ketu_speed = rahu_speed

    # Rahu & Ketu are virtually always retrograde in mean motion
    rahu_retro = rahu_speed < 0.0 or node_type.lower() == "mean"
    ketu_retro = rahu_retro

    # Rahu info
    r_sign_id, r_sign_en, r_sign_sa, r_deg, _ = calculate_rashi_info(rahu_sidereal)
    r_nak_id, r_nak_name, r_pada, r_nak_lord, _ = calculate_nakshatra_and_pada(rahu_sidereal)
    planets["Rahu"] = {
        "name": "Rahu",
        "name_sa": PLANET_SANSKRIT["Rahu"],
        "longitude": rahu_sidereal,
        "speed": rahu_speed,
        "is_retrograde": rahu_retro,
        "sign_id": r_sign_id,
        "sign_en": r_sign_en,
        "sign_sa": r_sign_sa,
        "degree_in_sign": r_deg,
        "nakshatra_id": r_nak_id,
        "nakshatra_name": r_nak_name,
        "pada": r_pada,
        "nakshatra_lord": r_nak_lord,
        "house": None,
        "dignity": "",
    }

    # Ketu info
    k_sign_id, k_sign_en, k_sign_sa, k_deg, _ = calculate_rashi_info(ketu_sidereal)
    k_nak_id, k_nak_name, k_pada, k_nak_lord, _ = calculate_nakshatra_and_pada(ketu_sidereal)
    planets["Ketu"] = {
        "name": "Ketu",
        "name_sa": PLANET_SANSKRIT["Ketu"],
        "longitude": ketu_sidereal,
        "speed": ketu_speed,
        "is_retrograde": ketu_retro,
        "sign_id": k_sign_id,
        "sign_en": k_sign_en,
        "sign_sa": k_sign_sa,
        "degree_in_sign": k_deg,
        "nakshatra_id": k_nak_id,
        "nakshatra_name": k_nak_name,
        "pada": k_pada,
        "nakshatra_lord": k_nak_lord,
        "house": None,
        "dignity": "",
    }

    # 3. Determine houses for all planets if houses/ascendant are available
    if ascendant_lon is not None and houses:
        asc_sign_id, _, _, _, _ = calculate_rashi_info(ascendant_lon)
        for p_key, p_data in planets.items():
            p_lon = p_data["longitude"]
            p_sign = p_data["sign_id"]
            # For Whole Sign: house = (planet_sign - asc_sign) % 12 + 1
            # If equal or sripati, check house boundaries
            if len(houses) == 12:
                # Whole Sign
                h_num = ((p_sign - asc_sign_id) % 12) + 1
                p_data["house"] = h_num
            else:
                p_data["house"] = 1

    return planets
