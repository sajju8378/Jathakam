"""
Ashtakoota (36 Guna Milan) Compatibility Engine for Kundli Matching.
Calculates Varna (1), Vashya (2), Tara (3), Yoni (4), Graha Maitri (5), Gana (6), Bhakoot (7), Nadi (8).
"""

from typing import Dict, Any, List, Tuple
from .constants import (
    RASHI_MAP, NAKSHATRAS, NAKSHATRA_MAP, SIGN_LORDS, NATURAL_RELATIONSHIPS
)

# Varna: Brahmin (4), Kshatriya (3), Vaishya (2), Shudra (1)
RASHI_VARNA = {
    4: 4, 8: 4, 12: 4,   # Water = Brahmin
    1: 3, 5: 3, 9: 3,    # Fire = Kshatriya
    2: 2, 6: 2, 10: 2,   # Earth = Vaishya
    3: 1, 7: 1, 11: 1,   # Air = Shudra
}
VARNA_NAMES = {4: "Brahmin", 3: "Kshatriya", 2: "Vaishya", 1: "Shudra"}

# Vashya categories: Chatushpada (1), Manava (2), Jalachara (3), Vanachara (4), Keeta (5)
RASHI_VASHYA = {
    1: 1, 2: 1,          # Aries, Taurus = Chatushpada
    3: 2, 6: 2, 7: 2, 11: 2,  # Gemini, Virgo, Libra, Aquarius = Manava
    4: 3, 10: 1, 12: 3,  # Cancer = Jalachara, Capricorn (1st half Chatushpada, 2nd Jalachara), Pisces = Jalachara
    5: 4,                # Leo = Vanachara
    8: 5, 9: 2           # Scorpio = Keeta, Sagittarius (1st half Manava, 2nd Chatushpada)
}

# 14 Animal Yonis with Sworn Enemies
YONI_ENEMIES = {
    "Horse": "Buffalo",
    "Buffalo": "Horse",
    "Elephant": "Lion",
    "Lion": "Elephant",
    "Sheep": "Monkey",
    "Monkey": "Sheep",
    "Serpent": "Mongoose",
    "Mongoose": "Serpent",
    "Dog": "Deer",
    "Deer": "Dog",
    "Cat": "Rat",
    "Rat": "Cat",
    "Cow": "Tiger",
    "Tiger": "Cow",
}


def calculate_varna_koota(boy_rashi: int, girl_rashi: int) -> Tuple[float, str]:
    b_v = RASHI_VARNA[boy_rashi]
    g_v = RASHI_VARNA[girl_rashi]
    if b_v >= g_v:
        return 1.0, f"Compatible: Boy ({VARNA_NAMES[b_v]}) is equal to or higher spiritual grade than Girl ({VARNA_NAMES[g_v]})."
    else:
        return 0.0, f"Varna imbalance: Boy ({VARNA_NAMES[b_v]}) has lower grade than Girl ({VARNA_NAMES[g_v]})."


def calculate_vashya_koota(boy_rashi: int, girl_rashi: int) -> Tuple[float, str]:
    b_vashya = RASHI_VASHYA.get(boy_rashi, 2)
    g_vashya = RASHI_VASHYA.get(girl_rashi, 2)

    if b_vashya == g_vashya:
        return 2.0, "Excellent mutual harmony: Same Vashya nature."

    # Specific friendly pairs
    friendly_pairs = [
        (2, 1), (2, 3), (1, 3)
    ]
    if (b_vashya, g_vashya) in friendly_pairs or (g_vashya, b_vashya) in friendly_pairs:
        return 1.0, "Moderate control and mutual affinity."

    # Leo (Vanachara) dominates others except Keeta
    if b_vashya == 4 and g_vashya != 5:
        return 1.0, "One-way dominance: Boy easily leads."

    if b_vashya == 5 or g_vashya == 5:
        return 0.5, "Keeta (Scorpio) nature requires patient understanding."

    return 0.0, "Different Vashya temperaments."


def calculate_tara_koota(boy_nak: int, girl_nak: int) -> Tuple[float, str]:
    # Count girl to boy
    dist_g_to_b = ((boy_nak - girl_nak) % 27) + 1
    tara_b = (dist_g_to_b % 9) or 9

    # Count boy to girl
    dist_b_to_g = ((girl_nak - boy_nak) % 27) + 1
    tara_g = (dist_b_to_g % 9) or 9

    # Auspicious taras: 1 (Janma), 2 (Sampat), 4 (Kshema), 6 (Sadhana), 8 (Mitra), 9 (Parama Mitra)
    # Inauspicious: 3 (Vipat), 5 (Pratyak), 7 (Naidhana/Vadha)
    inauspicious = [3, 5, 7]

    b_ok = tara_b not in inauspicious
    g_ok = tara_g not in inauspicious

    if b_ok and g_ok:
        return 3.0, "Superb: Both Taras are mutually beneficial, fostering prosperity and health."
    elif b_ok or g_ok:
        return 1.5, "Partial Tara compatibility: One partner's Tara is favorable."
    else:
        return 0.0, "Tara Dosha: Both distance metrics fall in challenging stations (Vipat/Pratyak/Naidhana)."


def calculate_yoni_koota(boy_nak: int, girl_nak: int) -> Tuple[float, str]:
    b_yoni = NAKSHATRA_MAP[boy_nak]["yoni"]
    g_yoni = NAKSHATRA_MAP[girl_nak]["yoni"]

    if b_yoni == g_yoni:
        return 4.0, f"Perfect physical and biological affinity: Both share {b_yoni} Yoni."

    # Check sworn enemies
    if YONI_ENEMIES.get(b_yoni) == g_yoni:
        return 0.0, f"Sworn Yoni enmity ({b_yoni} vs {g_yoni}): Biological or instinctive friction."

    # Friendly or neutral pairs
    return 2.0, f"Acceptable physical alignment ({b_yoni} and {g_yoni})."


def calculate_graha_maitri_koota(boy_rashi: int, girl_rashi: int) -> Tuple[float, str]:
    b_lord = SIGN_LORDS[boy_rashi]
    g_lord = SIGN_LORDS[girl_rashi]

    if b_lord == g_lord:
        return 5.0, f"Supreme planetary harmony: Both ruled by {b_lord}."

    rel_b_to_g = NATURAL_RELATIONSHIPS.get(b_lord, {}).get(g_lord, 0)
    rel_g_to_b = NATURAL_RELATIONSHIPS.get(g_lord, {}).get(b_lord, 0)

    if rel_b_to_g == 1 and rel_g_to_b == 1:
        return 5.0, f"Mutual friends ({b_lord} & {g_lord}): Deep emotional and psychological bonding."
    elif (rel_b_to_g == 1 and rel_g_to_b == 0) or (rel_b_to_g == 0 and rel_g_to_b == 1):
        return 4.0, f"Friendly and neutral ({b_lord} & {g_lord}): Cordial relations."
    elif rel_b_to_g == 0 and rel_g_to_b == 0:
        return 3.0, f"Mutual neutral ({b_lord} & {g_lord}): Stable, reasonable relationship."
    elif (rel_b_to_g == 1 and rel_g_to_b == -1) or (rel_b_to_g == -1 and rel_g_to_b == 1):
        return 1.0, f"One-sided affinity with underlying friction ({b_lord} & {g_lord})."
    elif (rel_b_to_g == 0 and rel_g_to_b == -1) or (rel_b_to_g == -1 and rel_g_to_b == 0):
        return 0.5, f"Neutral to enemy relationship ({b_lord} & {g_lord})."
    else:
        return 0.0, f"Mutual planetary enemies ({b_lord} & {g_lord}): Psychological clash."


def calculate_gana_koota(boy_nak: int, girl_nak: int) -> Tuple[float, str]:
    b_gana = NAKSHATRA_MAP[boy_nak]["gana"]
    g_gana = NAKSHATRA_MAP[girl_nak]["gana"]

    if b_gana == g_gana:
        return 6.0, f"Excellent temperamental alignment: Both {b_gana} Gana."

    if b_gana == "Deva" and g_gana == "Manushya":
        return 5.0, "Good compatibility: Deva boy and Manushya girl foster mutual kindness."
    elif b_gana == "Manushya" and g_gana == "Deva":
        return 6.0, "Highly favorable: Manushya boy and Deva girl bring high balance."
    elif b_gana == "Rakshasa" and g_gana == "Deva":
        return 1.0, "Temperamental tension: Rakshasa boy and Deva girl."
    elif b_gana == "Deva" and g_gana == "Rakshasa":
        return 0.0, "Gana Dosha: Deva boy and Rakshasa girl can encounter clash of temperaments."
    elif b_gana == "Rakshasa" and g_gana == "Manushya":
        return 0.0, "Gana Dosha: Rakshasa boy and Manushya girl."
    else:  # Manushya boy, Rakshasa girl
        return 0.0, "Gana Dosha: Manushya boy and Rakshasa girl."


def calculate_bhakoot_koota(boy_rashi: int, girl_rashi: int) -> Tuple[float, str]:
    # Difference in signs
    dist = ((boy_rashi - girl_rashi) % 12) + 1

    # Inauspicious combinations: 2/12 (Dwirdwadash), 6/8 (Shadashtak), 9/5 (Navapancham)
    is_dwirdwadash = dist in [2, 12]
    is_shadashtak = dist in [6, 8]
    is_navapancham = dist in [5, 9]

    # Check Parashari cancellations
    b_lord = SIGN_LORDS[boy_rashi]
    g_lord = SIGN_LORDS[girl_rashi]

    # Cancellation: same lord (e.g. Aries and Scorpio both Mars; Taurus and Libra both Venus)
    lords_same = b_lord == g_lord
    lords_friends = NATURAL_RELATIONSHIPS.get(b_lord, {}).get(g_lord, 0) == 1 and NATURAL_RELATIONSHIPS.get(g_lord, {}).get(b_lord, 0) == 1

    if not (is_dwirdwadash or is_shadashtak or is_navapancham):
        return 7.0, f"Favorable Bhakoot ({dist} houses apart): Healthy financial and emotional harmony."

    if lords_same:
        return 7.0, f"Bhakoot Dosha cancelled: Both rashis share the same planetary ruler ({b_lord})."

    if lords_friends:
        return 7.0, f"Bhakoot Dosha mitigated: Planetary rulers ({b_lord} and {g_lord}) are mutual friends."

    if is_shadashtak:
        return 0.0, "Shadashtak Dosha (6/8 relationship): Health, temperament, and marital friction unless remedies are performed."
    elif is_dwirdwadash:
        return 0.0, "Dwirdwadash Dosha (2/12 relationship): Financial strain or uneven expenses."
    else:
        return 0.0, "Navapancham Dosha (9/5 relationship): Differences regarding offspring or philosophical outlook."


def calculate_nadi_koota(boy_nak: int, girl_nak: int, boy_rashi: int, girl_rashi: int) -> Tuple[float, str]:
    b_nadi = NAKSHATRA_MAP[boy_nak]["nadi"]
    g_nadi = NAKSHATRA_MAP[girl_nak]["nadi"]

    if b_nadi != g_nadi:
        return 8.0, f"Superb Nadi match ({b_nadi} and {g_nadi}): Genetic and physiological vitality for progeny."

    # Same Nadi = Nadi Dosha. Check cancellations:
    # 1. Same Rashi but different Nakshatras
    if boy_rashi == girl_rashi and boy_nak != girl_nak:
        return 8.0, f"Nadi Dosha cancelled: Same Rashi with distinct Nakshatras ({NAKSHATRA_MAP[boy_nak]['name']} & {NAKSHATRA_MAP[girl_nak]['name']})."

    # 2. Same Nakshatra but different Rashis (e.g. Krittika, Mrigashirsha, etc.)
    if boy_nak == girl_nak and boy_rashi != girl_rashi:
        return 8.0, f"Nadi Dosha cancelled: Same Nakshatra crossing different Rashis."

    return 0.0, f"Nadi Dosha present: Both partners have {b_nadi} Nadi. May affect physiological harmony or progeny without spiritual remedy."


def calculate_ashtakoota_milan(
    boy_chart: Dict[str, Any],
    girl_chart: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Computes full 36 Guna Milan between two charts.
    Requires Moon sign and Moon nakshatra for each chart.
    """
    b_moon = boy_chart["planets"]["Moon"]
    g_moon = girl_chart["planets"]["Moon"]

    b_rashi = b_moon["sign_id"]
    g_rashi = g_moon["sign_id"]
    b_nak = b_moon["nakshatra_id"]
    g_nak = g_moon["nakshatra_id"]

    varna_pts, varna_desc = calculate_varna_koota(b_rashi, g_rashi)
    vashya_pts, vashya_desc = calculate_vashya_koota(b_rashi, g_rashi)
    tara_pts, tara_desc = calculate_tara_koota(b_nak, g_nak)
    yoni_pts, yoni_desc = calculate_yoni_koota(b_nak, g_nak)
    graha_pts, graha_desc = calculate_graha_maitri_koota(b_rashi, g_rashi)
    gana_pts, gana_desc = calculate_gana_koota(b_nak, g_nak)
    bhakoot_pts, bhakoot_desc = calculate_bhakoot_koota(b_rashi, g_rashi)
    nadi_pts, nadi_desc = calculate_nadi_koota(b_nak, g_nak, b_rashi, g_rashi)

    total_score = (
        varna_pts + vashya_pts + tara_pts + yoni_pts +
        graha_pts + gana_pts + bhakoot_pts + nadi_pts
    )

    kootas = [
        {"name": "Varna", "max_points": 1, "obtained_points": varna_pts, "area": "Spiritual temperament", "description": varna_desc},
        {"name": "Vashya", "max_points": 2, "obtained_points": vashya_pts, "area": "Mutual dominance & magnetic attraction", "description": vashya_desc},
        {"name": "Tara", "max_points": 3, "obtained_points": tara_pts, "area": "Destiny, health & longevity", "description": tara_desc},
        {"name": "Yoni", "max_points": 4, "obtained_points": yoni_pts, "area": "Biological & physical intimacy", "description": yoni_desc},
        {"name": "Graha Maitri", "max_points": 5, "obtained_points": graha_pts, "area": "Mental rapport & friendship", "description": graha_desc},
        {"name": "Gana", "max_points": 6, "obtained_points": gana_pts, "area": "Temperament & nature", "description": gana_desc},
        {"name": "Bhakoot", "max_points": 7, "obtained_points": bhakoot_pts, "area": "Emotional happiness & prosperity", "description": bhakoot_desc},
        {"name": "Nadi", "max_points": 8, "obtained_points": nadi_pts, "area": "Genetic health & progeny", "description": nadi_desc},
    ]

    is_qualified = total_score >= 18.0

    verdict = ""
    if total_score >= 28:
        verdict = "Exceptional Match: Highly auspicious alignment across psychological, biological, and karmic levels."
    elif total_score >= 21:
        verdict = "Very Good Match: Harmonious partnership with solid foundational compatibility."
    elif total_score >= 18:
        verdict = "Acceptable Match: Meets the classical 18-guna qualification threshold."
    else:
        verdict = "Challenging Match: Below 18 gunas. Astrological remedies and deep personal understanding recommended."

    # Manglik comparison
    b_manglik = boy_chart.get("yogas_and_doshas", {}).get("manglik", {}).get("is_manglik", False)
    g_manglik = girl_chart.get("yogas_and_doshas", {}).get("manglik", {}).get("is_manglik", False)

    manglik_status = "Both are non-Manglik"
    if b_manglik and g_manglik:
        manglik_status = "Both are Manglik: Dosha is mutually neutralized."
    elif b_manglik and not g_manglik:
        manglik_status = "Boy is Manglik, Girl is Non-Manglik: Astrological consultation recommended."
    elif not b_manglik and g_manglik:
        manglik_status = "Girl is Manglik, Boy is Non-Manglik: Astrological consultation recommended."

    return {
        "total_score": round(total_score, 1),
        "max_score": 36,
        "is_qualified": is_qualified,
        "verdict": verdict,
        "manglik_compatibility": manglik_status,
        "boy_summary": {
            "name": boy_chart.get("name", "Boy"),
            "moon_sign": RASHI_MAP[b_rashi]["name_en"],
            "moon_nakshatra": NAKSHATRA_MAP[b_nak]["name"]
        },
        "girl_summary": {
            "name": girl_chart.get("name", "Girl"),
            "moon_sign": RASHI_MAP[g_rashi]["name_en"],
            "moon_nakshatra": NAKSHATRA_MAP[g_nak]["name"]
        },
        "kootas": kootas
    }
