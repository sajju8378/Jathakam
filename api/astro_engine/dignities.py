"""
Planetary Dignities, Relationships (Panchadha Maitri), and Combustion for Vedic Astrology.
"""

from typing import Dict, Any, List
from .constants import (
    DIGNITY_RULES, NATURAL_RELATIONSHIPS, SIGN_LORDS, COMBUSTION_ORBS,
    RASHIS, RASHI_MAP
)


def calculate_dignity(
    planet_name: str,
    sign_id: int,
    degree_in_sign: float,
    all_planets: Dict[str, Dict[str, Any]]
) -> str:
    """
    Computes classical Vedic dignity:
    - Exalted (Uchcha)
    - Debilitated (Neecha)
    - Moolatrikona
    - Own Sign (Swakshetra)
    - Great Friend (Adhi Mitra)
    - Friend (Mitra)
    - Neutral (Sama)
    - Enemy (Shatru)
    - Great Enemy (Adhi Shatru)
    """
    rule = DIGNITY_RULES.get(planet_name)
    if not rule:
        return "Neutral"

    # 1. Exaltation Check
    if sign_id == rule["exalt_sign"]:
        diff = abs(degree_in_sign - rule["exalt_deg"])
        if diff < 1.0:
            return "Deeply Exalted (Paramochcha)"
        return "Exalted (Uchcha)"

    # 2. Debilitation Check
    if sign_id == rule["debilit_sign"]:
        diff = abs(degree_in_sign - rule["debilit_deg"])
        if diff < 1.0:
            return "Deeply Debilitated (Paramaneecha)"
        return "Debilitated (Neecha)"

    # 3. Moolatrikona Check
    mt_sign = rule.get("moolatrikona_sign")
    mt_range = rule.get("moolatrikona_deg", (0.0, 30.0))
    if sign_id == mt_sign and mt_range[0] <= degree_in_sign <= mt_range[1]:
        return "Moolatrikona"

    # 4. Own Sign Check
    if sign_id in rule.get("own_signs", []):
        return "Own Sign (Swakshetra)"

    # 5. Compound Relationship (Panchadha Maitri)
    # Determine the lord of the current sign
    sign_lord = SIGN_LORDS.get(sign_id)
    if not sign_lord or sign_lord == planet_name:
        return "Own Sign"

    # Natural relationship: 1=friend, 0=neutral, -1=enemy
    natural_rel = NATURAL_RELATIONSHIPS.get(planet_name, {}).get(sign_lord, 0)

    # Temporary relationship (Tatkalika Maitri):
    # Planets situated in 2nd, 3rd, 4th, 10th, 11th, 12th from the planet are temporary friends (+1)
    # Planets situated in 1st, 5th, 6th, 7th, 8th, 9th are temporary enemies (-1)
    temp_rel = -1
    sign_lord_planet_data = all_planets.get(sign_lord)
    if sign_lord_planet_data:
        lord_sign = sign_lord_planet_data["sign_id"]
        # Distance from planet's sign to lord's sign
        dist = ((lord_sign - sign_id) % 12) + 1  # 1 to 12
        if dist in [2, 3, 4, 10, 11, 12]:
            temp_rel = 1
        else:
            temp_rel = -1

    # Compound score: natural_rel + temp_rel
    # +2: Great Friend (Adhi Mitra)
    # +1: Friend (Mitra)
    #  0: Neutral (Sama)
    # -1: Enemy (Shatru)
    # -2: Great Enemy (Adhi Shatru)
    compound = natural_rel + temp_rel
    if compound >= 2:
        return "Great Friend (Adhi Mitra)"
    elif compound == 1:
        return "Friend (Mitra)"
    elif compound == 0:
        return "Neutral (Sama)"
    elif compound == -1:
        return "Enemy (Shatru)"
    else:
        return "Great Enemy (Adhi Shatru)"


def check_combustion(
    planet_name: str,
    planet_lon: float,
    is_retrograde: bool,
    sun_lon: float
) -> Dict[str, Any]:
    """
    Checks if a planet is combust (Astangata) by the Sun.
    Rahu and Ketu do not combust. Sun cannot combust itself.
    """
    if planet_name in ["Sun", "Rahu", "Ketu"]:
        return {"is_combust": False, "orb": 0.0, "distance_from_sun": 0.0}

    # Shortest angular distance on circle
    diff = abs((planet_lon - sun_lon + 180.0) % 360.0 - 180.0)

    orb_key = f"{planet_name}_retro" if is_retrograde and f"{planet_name}_retro" in COMBUSTION_ORBS else planet_name
    limit = COMBUSTION_ORBS.get(orb_key, 12.0)

    is_combust = diff <= limit
    return {
        "is_combust": is_combust,
        "orb_limit": limit,
        "distance_from_sun": round(diff, 2)
    }


def enrich_planets_with_dignities(planets: Dict[str, Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """
    Computes dignity and combustion for all planets.
    """
    sun_lon = planets["Sun"]["longitude"]

    for p_name, p_data in planets.items():
        # Dignity
        dignity = calculate_dignity(
            p_name,
            p_data["sign_id"],
            p_data["degree_in_sign"],
            planets
        )
        p_data["dignity"] = dignity

        # Combustion
        combust_info = check_combustion(
            p_name,
            p_data["longitude"],
            p_data.get("is_retrograde", False),
            sun_lon
        )
        p_data["combustion"] = combust_info

    return planets
