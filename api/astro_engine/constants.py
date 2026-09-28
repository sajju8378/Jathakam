"""
Astrological constants, tables, and astronomical mappings for Vedic Astrology (Jyotish).
"""

from typing import Dict, List, Tuple

# 12 Rashis (Zodiac Signs)
RASHIS = [
    {"id": 1, "name_sa": "Mesha", "name_en": "Aries", "lord": "Mars", "element": "Fire", "modality": "Movable"},
    {"id": 2, "name_sa": "Vrishabha", "name_en": "Taurus", "lord": "Venus", "element": "Earth", "modality": "Fixed"},
    {"id": 3, "name_sa": "Mithuna", "name_en": "Gemini", "lord": "Mercury", "element": "Air", "modality": "Dual"},
    {"id": 4, "name_sa": "Karka", "name_en": "Cancer", "lord": "Moon", "element": "Water", "modality": "Movable"},
    {"id": 5, "name_sa": "Simha", "name_en": "Leo", "lord": "Sun", "element": "Fire", "modality": "Fixed"},
    {"id": 6, "name_sa": "Kanya", "name_en": "Virgo", "lord": "Mercury", "element": "Earth", "modality": "Dual"},
    {"id": 7, "name_sa": "Tula", "name_en": "Libra", "lord": "Venus", "element": "Air", "modality": "Movable"},
    {"id": 8, "name_sa": "Vrishchika", "name_en": "Scorpio", "lord": "Mars", "element": "Water", "modality": "Fixed"},
    {"id": 9, "name_sa": "Dhanu", "name_en": "Sagittarius", "lord": "Jupiter", "element": "Fire", "modality": "Dual"},
    {"id": 10, "name_sa": "Makara", "name_en": "Capricorn", "lord": "Saturn", "element": "Earth", "modality": "Movable"},
    {"id": 11, "name_sa": "Kumbha", "name_en": "Aquarius", "lord": "Saturn", "element": "Air", "modality": "Fixed"},
    {"id": 12, "name_sa": "Meena", "name_en": "Pisces", "lord": "Jupiter", "element": "Water", "modality": "Dual"},
]

RASHI_MAP = {r["id"]: r for r in RASHIS}
RASHI_NAME_TO_ID = {r["name_en"].lower(): r["id"] for r in RASHIS}
RASHI_SA_TO_ID = {r["name_sa"].lower(): r["id"] for r in RASHIS}

# 27 Nakshatras
# Each nakshatra spans 13°20' (13.333333333333334 degrees) = 800 arcminutes
# 4 padas per nakshatra = 3°20' each = 200 arcminutes
NAKSHATRAS = [
    {"id": 1, "name": "Ashwini", "lord": "Ketu", "deity": "Ashwini Kumaras", "gana": "Deva", "yoni": "Horse", "animal_gender": "M", "nadi": "Adi"},
    {"id": 2, "name": "Bharani", "lord": "Venus", "deity": "Yama", "gana": "Manushya", "yoni": "Elephant", "animal_gender": "F", "nadi": "Madhya"},
    {"id": 3, "name": "Krittika", "lord": "Sun", "deity": "Agni", "gana": "Rakshasa", "yoni": "Sheep", "animal_gender": "F", "nadi": "Antya"},
    {"id": 4, "name": "Rohini", "lord": "Moon", "deity": "Brahma", "gana": "Manushya", "yoni": "Serpent", "animal_gender": "M", "nadi": "Antya"},
    {"id": 5, "name": "Mrigashirsha", "lord": "Mars", "deity": "Soma", "gana": "Deva", "yoni": "Serpent", "animal_gender": "F", "nadi": "Madhya"},
    {"id": 6, "name": "Ardra", "lord": "Rahu", "deity": "Rudra", "gana": "Manushya", "yoni": "Dog", "animal_gender": "F", "nadi": "Adi"},
    {"id": 7, "name": "Punarvasu", "lord": "Jupiter", "deity": "Aditi", "gana": "Deva", "yoni": "Cat", "animal_gender": "F", "nadi": "Adi"},
    {"id": 8, "name": "Pushya", "lord": "Saturn", "deity": "Brihaspati", "gana": "Deva", "yoni": "Sheep", "animal_gender": "M", "nadi": "Madhya"},
    {"id": 9, "name": "Ashlesha", "lord": "Mercury", "deity": "Sarpa", "gana": "Rakshasa", "yoni": "Cat", "animal_gender": "M", "nadi": "Antya"},
    {"id": 10, "name": "Magha", "lord": "Ketu", "deity": "Pitris", "gana": "Rakshasa", "yoni": "Rat", "animal_gender": "M", "nadi": "Antya"},
    {"id": 11, "name": "Purva Phalguni", "lord": "Venus", "deity": "Bhaga", "gana": "Manushya", "yoni": "Rat", "animal_gender": "F", "nadi": "Madhya"},
    {"id": 12, "name": "Uttara Phalguni", "lord": "Sun", "deity": "Aryaman", "gana": "Manushya", "yoni": "Cow", "animal_gender": "M", "nadi": "Adi"},
    {"id": 13, "name": "Hasta", "lord": "Moon", "deity": "Savitr", "gana": "Deva", "yoni": "Buffalo", "animal_gender": "F", "nadi": "Adi"},
    {"id": 14, "name": "Chitra", "lord": "Mars", "deity": "Tvashtar", "gana": "Rakshasa", "yoni": "Tiger", "animal_gender": "F", "nadi": "Madhya"},
    {"id": 15, "name": "Swati", "lord": "Rahu", "deity": "Vayu", "gana": "Deva", "yoni": "Buffalo", "animal_gender": "M", "nadi": "Antya"},
    {"id": 16, "name": "Vishakha", "lord": "Jupiter", "deity": "Indragni", "gana": "Rakshasa", "yoni": "Tiger", "animal_gender": "M", "nadi": "Antya"},
    {"id": 17, "name": "Anuradha", "lord": "Saturn", "deity": "Mitra", "gana": "Deva", "yoni": "Deer", "animal_gender": "F", "nadi": "Madhya"},
    {"id": 18, "name": "Jyeshtha", "lord": "Mercury", "deity": "Indra", "gana": "Rakshasa", "yoni": "Deer", "animal_gender": "M", "nadi": "Adi"},
    {"id": 19, "name": "Mula", "lord": "Ketu", "deity": "Nirriti", "gana": "Rakshasa", "yoni": "Dog", "animal_gender": "M", "nadi": "Adi"},
    {"id": 20, "name": "Purva Ashadha", "lord": "Venus", "deity": "Apas", "gana": "Manushya", "yoni": "Monkey", "animal_gender": "M", "nadi": "Madhya"},
    {"id": 21, "name": "Uttara Ashadha", "lord": "Sun", "deity": "Vishvadevas", "gana": "Manushya", "yoni": "Mongoose", "animal_gender": "M", "nadi": "Antya"},
    {"id": 22, "name": "Shravana", "lord": "Moon", "deity": "Vishnu", "gana": "Deva", "yoni": "Monkey", "animal_gender": "F", "nadi": "Antya"},
    {"id": 23, "name": "Dhanishta", "lord": "Mars", "deity": "Vasus", "gana": "Rakshasa", "yoni": "Lion", "animal_gender": "F", "nadi": "Madhya"},
    {"id": 24, "name": "Shatabhisha", "lord": "Rahu", "deity": "Varuna", "gana": "Rakshasa", "yoni": "Horse", "animal_gender": "F", "nadi": "Adi"},
    {"id": 25, "name": "Purva Bhadrapada", "lord": "Jupiter", "deity": "Aja Ekapada", "gana": "Manushya", "yoni": "Lion", "animal_gender": "M", "nadi": "Adi"},
    {"id": 26, "name": "Uttara Bhadrapada", "lord": "Saturn", "deity": "Ahirbudhnya", "gana": "Manushya", "yoni": "Cow", "animal_gender": "F", "nadi": "Madhya"},
    {"id": 27, "name": "Revati", "lord": "Mercury", "deity": "Pushan", "gana": "Deva", "yoni": "Elephant", "animal_gender": "M", "nadi": "Antya"},
]

NAKSHATRA_MAP = {n["id"]: n for n in NAKSHATRAS}

# Vimshottari Dasha Lord Cycle and Period (in solar years, total 120)
VIMSHOTTARI_CYCLE = [
    {"lord": "Ketu", "years": 7},
    {"lord": "Venus", "years": 20},
    {"lord": "Sun", "years": 6},
    {"lord": "Moon", "years": 10},
    {"lord": "Mars", "years": 7},
    {"lord": "Rahu", "years": 18},
    {"lord": "Jupiter", "years": 16},
    {"lord": "Saturn", "years": 19},
    {"lord": "Mercury", "years": 17},
]

VIMSHOTTARI_LORD_YEARS = {item["lord"]: item["years"] for item in VIMSHOTTARI_CYCLE}
TOTAL_VIMSHOTTARI_YEARS = 120

# 9 Grahas (Planets)
PLANET_KEYS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]

PLANET_SANSKRIT = {
    "Sun": "Surya",
    "Moon": "Chandra",
    "Mars": "Mangal",
    "Mercury": "Budha",
    "Jupiter": "Guru",
    "Venus": "Shukra",
    "Saturn": "Shani",
    "Rahu": "Rahu",
    "Ketu": "Ketu",
    "Ascendant": "Lagna",
}

# Exaltation (Uchcha) and Debilitation (Neecha) signs and deep degrees
# Sign ID 1-12
DIGNITY_RULES = {
    "Sun": {"exalt_sign": 1, "exalt_deg": 10.0, "debilit_sign": 7, "debilit_deg": 10.0, "own_signs": [5], "moolatrikona_sign": 5, "moolatrikona_deg": (0.0, 20.0)},
    "Moon": {"exalt_sign": 2, "exalt_deg": 3.0, "debilit_sign": 8, "debilit_deg": 3.0, "own_signs": [4], "moolatrikona_sign": 2, "moolatrikona_deg": (3.0, 30.0)},
    "Mars": {"exalt_sign": 10, "exalt_deg": 28.0, "debilit_sign": 4, "debilit_deg": 28.0, "own_signs": [1, 8], "moolatrikona_sign": 1, "moolatrikona_deg": (0.0, 12.0)},
    "Mercury": {"exalt_sign": 6, "exalt_deg": 15.0, "debilit_sign": 12, "debilit_deg": 15.0, "own_signs": [3, 6], "moolatrikona_sign": 6, "moolatrikona_deg": (15.0, 20.0)},
    "Jupiter": {"exalt_sign": 4, "exalt_deg": 5.0, "debilit_sign": 10, "debilit_deg": 5.0, "own_signs": [9, 12], "moolatrikona_sign": 9, "moolatrikona_deg": (0.0, 10.0)},
    "Venus": {"exalt_sign": 12, "exalt_deg": 27.0, "debilit_sign": 6, "debilit_deg": 27.0, "own_signs": [2, 7], "moolatrikona_sign": 7, "moolatrikona_deg": (0.0, 15.0)},
    "Saturn": {"exalt_sign": 7, "exalt_deg": 20.0, "debilit_sign": 1, "debilit_deg": 20.0, "own_signs": [10, 11], "moolatrikona_sign": 11, "moolatrikona_deg": (0.0, 20.0)},
    "Rahu": {"exalt_sign": 2, "exalt_deg": 15.0, "debilit_sign": 8, "debilit_deg": 15.0, "own_signs": [11], "moolatrikona_sign": 11, "moolatrikona_deg": (0.0, 30.0)},
    "Ketu": {"exalt_sign": 8, "exalt_deg": 15.0, "debilit_sign": 2, "debilit_deg": 15.0, "own_signs": [8], "moolatrikona_sign": 9, "moolatrikona_deg": (0.0, 30.0)},
}

# Natural Planetary Relationships (Naisargika Maitri)
# 1 = Friend (Mitra), 0 = Neutral (Sama), -1 = Enemy (Shatru)
NATURAL_RELATIONSHIPS: Dict[str, Dict[str, int]] = {
    "Sun": {"Moon": 1, "Mars": 1, "Jupiter": 1, "Mercury": 0, "Venus": -1, "Saturn": -1, "Rahu": -1, "Ketu": -1},
    "Moon": {"Sun": 1, "Mercury": 1, "Mars": 0, "Jupiter": 0, "Venus": 0, "Saturn": 0, "Rahu": -1, "Ketu": -1},
    "Mars": {"Sun": 1, "Moon": 1, "Jupiter": 1, "Venus": 0, "Saturn": 0, "Mercury": -1, "Rahu": -1, "Ketu": 1},
    "Mercury": {"Sun": 1, "Venus": 1, "Mars": 0, "Jupiter": 0, "Saturn": 0, "Moon": -1, "Rahu": 1, "Ketu": 0},
    "Jupiter": {"Sun": 1, "Moon": 1, "Mars": 1, "Saturn": 0, "Mercury": -1, "Venus": -1, "Rahu": 0, "Ketu": 1},
    "Venus": {"Mercury": 1, "Saturn": 1, "Mars": 0, "Jupiter": 0, "Sun": -1, "Moon": -1, "Rahu": 1, "Ketu": 0},
    "Saturn": {"Mercury": 1, "Venus": 1, "Jupiter": 0, "Sun": -1, "Moon": -1, "Mars": -1, "Rahu": 1, "Ketu": -1},
    "Rahu": {"Venus": 1, "Saturn": 1, "Mercury": 1, "Jupiter": 0, "Sun": -1, "Moon": -1, "Mars": -1, "Ketu": 0},
    "Ketu": {"Mars": 1, "Jupiter": 1, "Mercury": 0, "Venus": 0, "Saturn": -1, "Sun": -1, "Moon": -1, "Rahu": 0},
}

# Sign Lord Lookup (1 to 12)
SIGN_LORDS = {
    1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon", 5: "Sun", 6: "Mercury",
    7: "Venus", 8: "Mars", 9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
}

# Combustion orbs in degrees from Sun
COMBUSTION_ORBS = {
    "Moon": 12.0,
    "Mars": 17.0,
    "Mercury": 14.0,  # 12 when retrograde
    "Mercury_retro": 12.0,
    "Jupiter": 11.0,
    "Venus": 10.0,   # 8 when retrograde
    "Venus_retro": 8.0,
    "Saturn": 15.0,
}
