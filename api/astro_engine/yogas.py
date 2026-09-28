"""
Vedic Astrology Yogas and Doshas Analyzer:
- Manglik Dosha (Kuja Dosha) with comprehensive cancellation rules
- Kaal Sarp Dosha (Purna & Ardh with 12 classical types)
- Sade Sati & Dhaiya status
- Pancha Mahapurusha & Major Raj Yogas
"""

from typing import Dict, Any, List, Optional
import swisseph as swe
from .constants import RASHI_MAP, SIGN_LORDS


def analyze_manglik_dosha(
    planets: Dict[str, Dict[str, Any]],
    houses: List[Dict[str, Any]],
    ascendant_sign_id: Optional[int]
) -> Dict[str, Any]:
    """
    Evaluates Manglik (Kuja) Dosha from Lagna, Moon, and Venus.
    Applies classical Parashari cancellation (Bhanga) rules.
    """
    if ascendant_sign_id is None:
        return {
            "has_dosha": False,
            "severity": "Unknown (Birth time unknown)",
            "rule_used": "Lagna required to determine exact houses for Manglik Dosha.",
            "cancellations": []
        }

    mars = planets.get("Mars")
    if not mars:
        return {"has_dosha": False, "severity": "None", "rule_used": "Mars position unavailable"}

    mars_sign = mars["sign_id"]
    mars_house = mars["house"]  # From Lagna

    moon = planets.get("Moon")
    venus = planets.get("Venus")
    jupiter = planets.get("Jupiter")

    # Calculate Mars house from Moon and Venus
    mars_from_moon = ((mars_sign - moon["sign_id"]) % 12) + 1 if moon else None
    mars_from_venus = ((mars_sign - venus["sign_id"]) % 12) + 1 if venus else None

    manglik_houses = [1, 2, 4, 7, 8, 12]

    is_lagna_manglik = mars_house in manglik_houses
    is_moon_manglik = mars_from_moon in manglik_houses if mars_from_moon else False
    is_venus_manglik = mars_from_venus in manglik_houses if mars_from_venus else False

    initial_manglik = is_lagna_manglik or is_moon_manglik or is_venus_manglik

    cancellations = []

    # Cancellation 1: Mars in own sign (Aries, Scorpio) or exalted (Capricorn)
    if mars_sign in [1, 8]:
        cancellations.append("Mars is in its own sign (Swakshetra), mitigating harmful energy.")
    elif mars_sign == 10:
        cancellations.append("Mars is exalted in Capricorn (Uchcha), transforming aggressiveness into disciplined courage.")

    # Cancellation 2: Specific house + sign combinations
    if mars_house == 1 and mars_sign == 1:
        cancellations.append("Mars in 1st house in Aries causes no Kuja Dosha (Brihat Parashara).")
    elif mars_house == 4 and mars_sign == 8:
        cancellations.append("Mars in 4th house in Scorpio neutralizes the dosha.")
    elif mars_house == 7 and mars_sign in [10, 4]:
        cancellations.append("Mars in 7th house in Capricorn or Cancer cancels the dosha.")
    elif mars_house == 8 and mars_sign in [9, 12]:
        cancellations.append("Mars in 8th house in Sagittarius or Pisces neutralizes the dosha.")
    elif mars_house == 12 and mars_sign in [2, 7]:
        cancellations.append("Mars in 12th house in Taurus or Libra nullifies the dosha.")

    # Cancellation 3: Mars conjunct or aspected by Jupiter
    if jupiter:
        jup_sign = jupiter["sign_id"]
        # Conjunction:
        if jup_sign == mars_sign:
            cancellations.append("Jupiter is conjunct Mars (Guru-Mangal Yoga), neutralizing malevolence.")
        # Jupiter aspects 5th, 7th, 9th from its position:
        dist_from_jup = ((mars_sign - jup_sign) % 12) + 1
        if dist_from_jup in [5, 7, 9]:
            cancellations.append("Benefic Jupiter casts direct divine aspect on Mars, mitigating the dosha.")

    # Cancellation 4: Mars conjunct Moon
    if moon and moon["sign_id"] == mars_sign:
        cancellations.append("Moon is conjunct Mars forming Chandra-Mangal yoga, softening the dosha.")

    # Final determination
    is_cancelled = len(cancellations) > 0
    final_has_dosha = initial_manglik and not is_cancelled

    severity = "None"
    if initial_manglik:
        if is_cancelled:
            severity = "Cancelled (Bhanga)"
        else:
            count = sum([is_lagna_manglik, is_moon_manglik, is_venus_manglik])
            if count >= 2:
                severity = "High"
            else:
                severity = "Low"

    return {
        "is_manglik": final_has_dosha,
        "is_cancelled": is_cancelled,
        "severity": severity,
        "mars_house": mars_house,
        "mars_sign_en": RASHI_MAP[mars_sign]["name_en"],
        "is_from_lagna": is_lagna_manglik,
        "is_from_moon": is_moon_manglik,
        "is_from_venus": is_venus_manglik,
        "cancellations": cancellations,
        "rule_used": "Mars in 1st, 2nd, 4th, 7th, 8th, or 12th house from Lagna/Moon/Venus creates Kuja Dosha, cancelled by specific signs, exaltation, or Jupiter/Moon benefic aspects."
    }


def analyze_kaal_sarp_dosha(
    planets: Dict[str, Dict[str, Any]],
    houses: List[Dict[str, Any]],
    ascendant_sign_id: Optional[int]
) -> Dict[str, Any]:
    """
    Checks if all classical 7 planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)
    are hemmed between the Rahu-Ketu nodal axis.
    """
    rahu = planets.get("Rahu")
    ketu = planets.get("Ketu")

    if not rahu or not ketu:
        return {"has_dosha": False, "type": "None", "rule_used": "Nodes unavailable"}

    rahu_lon = rahu["longitude"]
    ketu_lon = ketu["longitude"]

    # 7 classical planets
    classical_planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]

    side_a_count = 0  # Between Rahu and Ketu direct
    side_b_count = 0  # Between Ketu and Rahu direct

    # Normalize arc from Rahu to Ketu
    # Direct distance from Rahu to Ketu going counter-clockwise
    arc_rahu_to_ketu = (ketu_lon - rahu_lon) % 360.0

    for p_name in classical_planets:
        p_lon = planets[p_name]["longitude"]
        dist_from_rahu = (p_lon - rahu_lon) % 360.0
        if dist_from_rahu <= arc_rahu_to_ketu:
            side_a_count += 1
        else:
            side_b_count += 1

    total = len(classical_planets)  # 7
    is_full = (side_a_count == total) or (side_b_count == total)
    is_partial = (side_a_count == total - 1) or (side_b_count == total - 1)

    has_dosha = is_full or is_partial

    # Kaal Sarp types based on Rahu's house (1 to 12)
    rahu_house = rahu.get("house", 1) or 1
    type_names = {
        1: ("Anant Kaal Sarp", "Rahu in 1st house, Ketu in 7th. Challenges in marriage and self-identity."),
        2: ("Kulik Kaal Sarp", "Rahu in 2nd house, Ketu in 8th. Challenges in family harmony, speech, and finance."),
        3: ("Vasuki Kaal Sarp", "Rahu in 3rd house, Ketu in 9th. Challenges with siblings, courage, and travel."),
        4: ("Shankhapal Kaal Sarp", "Rahu in 4th house, Ketu in 10th. Challenges with home peace, mother, and assets."),
        5: ("Padma Kaal Sarp", "Rahu in 5th house, Ketu in 11th. Challenges with progeny, higher education, intellect."),
        6: ("Mahapadma Kaal Sarp", "Rahu in 6th house, Ketu in 12th. Victory over enemies but secret anxieties."),
        7: ("Takshak Kaal Sarp", "Rahu in 7th house, Ketu in 1st. Delays or tests in business partnership and marriage."),
        8: ("Karkotak Kaal Sarp", "Rahu in 8th house, Ketu in 2nd. Unexpected transformations and ancestral hurdles."),
        9: ("Shankhachood Kaal Sarp", "Rahu in 9th house, Ketu in 3rd. Tests of faith, fortune, and relations with father."),
        10: ("Ghatak Kaal Sarp", "Rahu in 10th house, Ketu in 4th. High professional ambition with sudden shifts."),
        11: ("Vishdhar Kaal Sarp", "Rahu in 11th house, Ketu in 5th. Fluctuations in social circle and elder siblings."),
        12: ("Sheshnag Kaal Sarp", "Rahu in 12th house, Ketu in 6th. High spiritual inclinations and foreign connections."),
    }

    t_name, t_desc = type_names.get(rahu_house, ("Kaal Sarp", "Planets hemmed between Rahu and Ketu axis."))

    status = "None"
    if is_full:
        status = f"Purna (Full) {t_name}"
    elif is_partial:
        status = f"Ardh (Partial / Khanda) {t_name}"

    return {
        "has_dosha": has_dosha,
        "status": status,
        "is_full": is_full,
        "is_partial": is_partial,
        "rahu_house": rahu_house,
        "name": t_name,
        "description": t_desc if has_dosha else "All planets are not hemmed between Rahu and Ketu.",
        "rule_used": "Formed when all 7 classical planets (Sun to Saturn) are situated on one side of the Rahu-Ketu nodal axis."
    }


def analyze_sade_sati(natal_moon_sign: int) -> Dict[str, Any]:
    """
    Evaluates current Saturn transit relative to natal Moon sign to determine Sade Sati and Dhaiya.
    Current transit of Saturn (2025-2027) is in Pisces (Meena = 12) / transitioning into Aries (1).
    Calculates exact real-time Saturn position using Swiss Ephemeris for today!
    """
    # Calculate today's current transit Saturn sign
    import datetime
    today = datetime.datetime.now()
    jd_now = swe.julday(today.year, today.month, today.day, today.hour, swe.GREG_CAL)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa_now = swe.get_ayanamsa_ut(jd_now)
    sat_res, _ = swe.calc_ut(jd_now, swe.SATURN, swe.FLG_SWIEPH)
    sat_sidereal_lon = (sat_res[0] - ayanamsa_now) % 360.0
    current_saturn_sign = int(sat_sidereal_lon // 30.0) + 1

    # Distance of transit Saturn from natal Moon sign:
    # 1 = In same sign (Peak phase / Janma Shani)
    # 12 = In 12th from Moon (Rising phase / Charana Shani)
    # 2 = In 2nd from Moon (Setting phase / Paada Shani)
    # 4 = Kantaka Shani (Dhaiya in 4th)
    # 8 = Ashtama Shani (Dhaiya in 8th)
    dist = ((current_saturn_sign - natal_moon_sign) % 12) + 1

    is_sade_sati = dist in [12, 1, 2]
    is_dhaiya = dist in [4, 8]

    phase = "None"
    description = "You are currently not undergoing Sade Sati or Small Panoti (Dhaiya)."

    if dist == 12:
        phase = "First Phase (Rising / Charana)"
        description = "Transit Saturn is in the 12th house from natal Moon: emphasizes expenses, mental shifts, and new foundations."
    elif dist == 1:
        phase = "Peak Phase (Janma / Hridaya)"
        description = "Transit Saturn is directly over natal Moon: deep character building, hard work, and emotional maturity."
    elif dist == 2:
        phase = "Final Phase (Setting / Paada)"
        description = "Transit Saturn is in the 2nd house from natal Moon: financial restructuring, family focus, and harvesting lessons."
    elif dist == 4:
        phase = "Kantaka Shani (Small Panoti / 4th House Dhaiya)"
        description = "Transit Saturn is in the 4th house from natal Moon: tests concerning home, domestic peace, and emotional patience (2.5 years)."
    elif dist == 8:
        phase = "Ashtama Shani (Small Panoti / 8th House Dhaiya)"
        description = "Transit Saturn is in the 8th house from natal Moon: sudden transformations, health awareness, and spiritual discipline (2.5 years)."

    return {
        "is_sade_sati": is_sade_sati,
        "is_dhaiya": is_dhaiya,
        "current_saturn_sign_en": RASHI_MAP[current_saturn_sign]["name_en"],
        "natal_moon_sign_en": RASHI_MAP[natal_moon_sign]["name_en"],
        "phase": phase,
        "description": description,
        "rule_used": "Sade Sati is active when transit Saturn transits through the 12th, 1st, or 2nd signs relative to the natal Moon sign (approx 7.5 years total). Dhaiya occurs in 4th and 8th signs (approx 2.5 years)."
    }


def analyze_major_yogas(
    planets: Dict[str, Dict[str, Any]],
    ascendant_sign_id: Optional[int]
) -> List[Dict[str, Any]]:
    """
    Detects major classical auspicious Yogas:
    - Pancha Mahapurusha Yogas (Ruchaka, Bhadra, Hamsa, Malavya, Sasa)
    - Gajakesari Yoga (Jupiter in Kendra 1,4,7,10 from Moon)
    - Budhaditya Yoga (Sun + Mercury)
    - Chandra-Mangal Yoga (Moon + Mars)
    - Amala Yoga (Benefics in 10th from Lagna or Moon)
    """
    yogas = []

    moon = planets.get("Moon")
    sun = planets.get("Sun")
    mercury = planets.get("Mercury")
    mars = planets.get("Mars")
    jupiter = planets.get("Jupiter")
    venus = planets.get("Venus")
    saturn = planets.get("Saturn")

    # 1. Budhaditya Yoga: Sun and Mercury in the same sign
    if sun and mercury and sun["sign_id"] == mercury["sign_id"]:
        orb = abs(sun["longitude"] - mercury["longitude"])
        yogas.append({
            "name": "Budhaditya Yoga",
            "category": "Intellectual & Career",
            "nature": "Auspicious",
            "rule": "Sun and Mercury occupy the same sign.",
            "description": f"Bestows high intelligence, sharp administrative skills, scholarly renown, and eloquence (orb: {round(orb, 2)}° in {RASHI_MAP[sun['sign_id']]['name_en']})."
        })

    # 2. Gajakesari Yoga: Jupiter in Kendra (1, 4, 7, 10) from Moon
    if moon and jupiter:
        dist_moon_jup = ((jupiter["sign_id"] - moon["sign_id"]) % 12) + 1
        if dist_moon_jup in [1, 4, 7, 10]:
            yogas.append({
                "name": "Gajakesari Yoga",
                "category": "Wisdom & Honor",
                "nature": "Highly Auspicious",
                "rule": "Jupiter is in a Kendra (1st, 4th, 7th, 10th) from the Moon.",
                "description": "Grants noble virtues, lasting reputation, virtuous intellect, respected authority, and triumph over adversaries."
            })

    # 3. Chandra-Mangal Yoga: Moon and Mars together
    if moon and mars and moon["sign_id"] == mars["sign_id"]:
        yogas.append({
            "name": "Chandra-Mangal Yoga",
            "category": "Enterprise & Wealth",
            "nature": "Auspicious",
            "rule": "Moon and Mars occupy the same sign.",
            "description": "Confers commercial acumen, great dynamism, persistence in acquiring earnings and material wealth."
        })

    # Kendra placements from Lagna (Pancha Mahapurusha Yogas)
    if ascendant_sign_id:
        kendra_houses = [1, 4, 7, 10]

        # Ruchaka Yoga (Mars)
        if mars and mars["house"] in kendra_houses:
            if mars["sign_id"] in [1, 8, 10]:  # Own (1,8) or exalted (10)
                yogas.append({
                    "name": "Ruchaka Yoga (Pancha Mahapurusha)",
                    "category": "Leadership & Courage",
                    "nature": "Supreme Auspicious",
                    "rule": "Mars is in its own or exalted sign while situated in a Kendra (1, 4, 7, 10).",
                    "description": "A magnificent Pancha Mahapurusha yoga that bestows physical vigor, executive military leadership, bold conviction, and high status."
                })

        # Bhadra Yoga (Mercury)
        if mercury and mercury["house"] in kendra_houses:
            if mercury["sign_id"] in [3, 6]:  # Gemini, Virgo
                yogas.append({
                    "name": "Bhadra Yoga (Pancha Mahapurusha)",
                    "category": "Genius & Communication",
                    "nature": "Supreme Auspicious",
                    "rule": "Mercury is in its own or exalted sign in a Kendra.",
                    "description": "Endows phenomenal intellect, literary excellence, financial genius, diplomacy, and enduring youthfulness."
                })

        # Hamsa Yoga (Jupiter)
        if jupiter and jupiter["house"] in kendra_houses:
            if jupiter["sign_id"] in [4, 9, 12]:  # Cancer (exalted), Sag, Pisces
                yogas.append({
                    "name": "Hamsa Yoga (Pancha Mahapurusha)",
                    "category": "Spiritual Wisdom & Eminence",
                    "nature": "Supreme Auspicious",
                    "rule": "Jupiter is in Cancer (exalted) or Sagittarius/Pisces (own) in a Kendra.",
                    "description": "Grants ethical leadership, divine blessings, reverence from society, purity of thought, and high counsel."
                })

        # Malavya Yoga (Venus)
        if venus and venus["house"] in kendra_houses:
            if venus["sign_id"] in [2, 7, 12]:  # Taurus, Libra, Pisces (exalted)
                yogas.append({
                    "name": "Malavya Yoga (Pancha Mahapurusha)",
                    "category": "Grace, Art & Affluence",
                    "nature": "Supreme Auspicious",
                    "rule": "Venus is in Taurus/Libra (own) or Pisces (exalted) in a Kendra.",
                    "description": "Gives refined aesthetics, marital happiness, luxury conveyances, artistic magnetism, and joyful elegance."
                })

        # Sasa Yoga (Saturn)
        if saturn and saturn["house"] in kendra_houses:
            if saturn["sign_id"] in [7, 10, 11]:  # Libra (exalted), Cap, Aqua
                yogas.append({
                    "name": "Sasa Yoga (Pancha Mahapurusha)",
                    "category": "Authority & Endurance",
                    "nature": "Supreme Auspicious",
                    "rule": "Saturn is in Libra (exalted) or Capricorn/Aquarius (own) in a Kendra.",
                    "description": "Gives commanding authority over institutions or masses, indefatigable discipline, patience, and political acumen."
                })

    return yogas
