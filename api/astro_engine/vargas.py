"""
Generic Divisional Chart (Varga) Engine for Vedic Astrology (Jyotish).
Supports D1, D9 (Navamsa), D10 (Dasamsa), D2, D3, D4, D7, D12, D16, D20, D24, D27, D30, D60.
"""

from typing import Dict, Any, List, Optional
from .constants import RASHIS, RASHI_MAP, PLANET_KEYS, PLANET_SANSKRIT


def calculate_varga_sign(lon_deg: float, division: int) -> int:
    """
    Computes the resulting Rashi (sign 1 to 12) for a given sidereal longitude and division number.
    Uses classical Maharishi Parashara rules for key vargas, and general divisional mapping.
    """
    norm_lon = lon_deg % 360.0
    rashi_id = int(norm_lon // 30.0) + 1  # 1 to 12
    deg_in_sign = norm_lon % 30.0
    part_size = 30.0 / division
    part_index = int(deg_in_sign / part_size)  # 0 to division - 1

    if division == 1:
        # D1: Rashi Chart
        return rashi_id

    elif division == 9:
        # D9: Navamsa Chart
        # 1/9th division (3°20' per navamsa)
        # Movable (1, 4, 7, 10): starts from the sign itself
        # Fixed (2, 5, 8, 11): starts from the 9th from the sign
        # Dual (3, 6, 9, 12): starts from the 5th from the sign
        # Mathematically equivalent to continuous nakshatra-pada mapping:
        total_padas = int(norm_lon / (360.0 / 108.0))  # 108 padas
        return (total_padas % 12) + 1

    elif division == 10:
        # D10: Dasamsa (Career, Status, Achievements)
        # 1/10th division (3° per dasamsa)
        # Odd signs: starts from the sign itself
        # Even signs: starts from the 9th from the sign
        is_odd = (rashi_id % 2) != 0
        if is_odd:
            start_sign = rashi_id
        else:
            start_sign = ((rashi_id - 1 + 8) % 12) + 1  # 9th from rashi
        return ((start_sign - 1 + part_index) % 12) + 1

    elif division == 2:
        # D2: Hora (Wealth, Prosperity)
        # 15° each: odd signs (1st half Sun=Leo 5, 2nd half Moon=Cancer 4)
        # even signs (1st half Moon=Cancer 4, 2nd half Sun=Leo 5)
        is_odd = (rashi_id % 2) != 0
        if is_odd:
            return 5 if part_index == 0 else 4
        else:
            return 4 if part_index == 0 else 5

    elif division == 3:
        # D3: Drekkana (Siblings, Courage, Vitality)
        # 10° each: 1st decan is same sign, 2nd is 5th from it, 3rd is 9th from it
        if part_index == 0:
            return rashi_id
        elif part_index == 1:
            return ((rashi_id - 1 + 4) % 12) + 1  # 5th
        else:
            return ((rashi_id - 1 + 8) % 12) + 1  # 9th

    elif division == 4:
        # D4: Chaturthamsa (Property, Vehicles, Destiny)
        # Starts from sign itself for movable, 4th for fixed, 7th for dual, etc.
        # Parashara: starts from sign itself (odd/movable standard: odd from Aries/Cancer, etc.)
        # Standard: starts from rashi itself
        return ((rashi_id - 1 + part_index) % 12) + 1

    elif division == 7:
        # D7: Saptamsa (Children, Progeny, Lineage)
        # Odd signs: starts from the sign itself
        # Even signs: starts from the 7th from the sign
        is_odd = (rashi_id % 2) != 0
        start_sign = rashi_id if is_odd else (((rashi_id - 1 + 6) % 12) + 1)
        return ((start_sign - 1 + part_index) % 12) + 1

    elif division == 12:
        # D12: Dwadasamsa (Parents, Heritage, Past life karma)
        # Starts from the sign itself and runs consecutively for 12 parts of 2°30'
        return ((rashi_id - 1 + part_index) % 12) + 1

    elif division == 16:
        # D16: Shodashamsa (Vehicles, Happiness, Conveyances)
        # Movable: starts from Aries (1); Fixed: starts from Leo (5); Dual: starts from Sagittarius (9)
        mod = rashi_id % 3
        if mod == 1:  # Movable (1, 4, 7, 10)
            start_sign = 1
        elif mod == 2:  # Fixed (2, 5, 8, 11)
            start_sign = 5
        else:  # Dual (3, 6, 9, 12)
            start_sign = 9
        return ((start_sign - 1 + part_index) % 12) + 1

    elif division == 60:
        # D60: Shashtiamsa (Micro Karma, Past Life)
        # Continuous calculation or sign-based: Parashara rule:
        # Starts from sign itself in odd signs, starts from 7th in even signs
        is_odd = (rashi_id % 2) != 0
        start_sign = rashi_id if is_odd else (((rashi_id - 1 + 6) % 12) + 1)
        return ((start_sign - 1 + part_index) % 12) + 1

    else:
        # General division fallback
        # Starts from sign itself and cycles through the 12 signs
        return ((rashi_id - 1 + part_index) % 12) + 1


def generate_divisional_chart(
    division: int,
    planets: Dict[str, Dict[str, Any]],
    ascendant_lon: Optional[float] = None
) -> Dict[str, Any]:
    """
    Builds a complete divisional chart (e.g. D1, D9 Navamsa, D10 Dasamsa).
    Returns planet sign placements and house placements relative to the varga Lagna.
    """
    varga_name_map = {
        1: ("D1", "Rashi", "Physical body, overall life"),
        2: ("D2", "Hora", "Wealth and prosperity"),
        3: ("D3", "Drekkana", "Siblings, courage, vitality"),
        4: ("D4", "Chaturthamsa", "Property, fortune, residence"),
        7: ("D7", "Saptamsa", "Children, lineage, creative fruit"),
        9: ("D9", "Navamsa", "Marriage, spouse, inner potential, soul destiny"),
        10: ("D10", "Dasamsa", "Career, profession, social impact, status"),
        12: ("D12", "Dwadasamsa", "Parents, ancestry, ancestral karma"),
        16: ("D16", "Shodashamsa", "Conveyances, inner happiness"),
        20: ("D20", "Vimsamsa", "Spiritual inclination, upasana"),
        24: ("D24", "Chaturvimsamsa", "Higher learning, academic skills"),
        27: ("D27", "Saptavimsamsa", "Strengths and weaknesses, stamina"),
        30: ("D30", "Trimsamsa", "Misfortunes, evils, health challenges"),
        60: ("D60", "Shashtiamsa", "Past life karma, all matters"),
    }

    code, title, desc = varga_name_map.get(division, (f"D{division}", f"Varga {division}", "Divisional chart"))

    varga_asc_sign = None
    if ascendant_lon is not None:
        varga_asc_sign = calculate_varga_sign(ascendant_lon, division)

    planet_placements = []
    sign_planets_map: Dict[int, List[str]] = {i: [] for i in range(1, 13)}

    for p_name, p_data in planets.items():
        varga_sign = calculate_varga_sign(p_data["longitude"], division)
        rashi = RASHI_MAP[varga_sign]
        
        # Calculate house relative to varga ascendant if available
        v_house = None
        if varga_asc_sign is not None:
            v_house = ((varga_sign - varga_asc_sign) % 12) + 1

        sign_planets_map[varga_sign].append(p_name)

        planet_placements.append({
            "name": p_name,
            "name_sa": PLANET_SANSKRIT.get(p_name, p_name),
            "sign_id": varga_sign,
            "sign_en": rashi["name_en"],
            "sign_sa": rashi["name_sa"],
            "house": v_house,
            "is_retrograde": p_data.get("is_retrograde", False)
        })

    # North and South Indian chart mapping
    # North Indian: houses 1-12 are fixed positions, signs move
    # South Indian: signs 1-12 (Aries to Pisces) are fixed positions, planets move
    house_planets_map: Dict[int, List[str]] = {h: [] for h in range(1, 13)}
    if varga_asc_sign is not None:
        for p in planet_placements:
            if p["house"]:
                house_planets_map[p["house"]].append(p["name"])

    return {
        "division": division,
        "code": code,
        "title": title,
        "description": desc,
        "ascendant_sign": varga_asc_sign,
        "ascendant_sign_en": RASHI_MAP[varga_asc_sign]["name_en"] if varga_asc_sign else None,
        "ascendant_sign_sa": RASHI_MAP[varga_asc_sign]["name_sa"] if varga_asc_sign else None,
        "planets": planet_placements,
        "sign_to_planets": sign_planets_map,
        "house_to_planets": house_planets_map,
    }
