"""
Unit tests for Ayanamsa options and Rashi/Nakshatra/Pada boundaries.
"""

import pytest
import swisseph as swe
from api.astro_engine.ephemeris import (
    get_current_ayanamsa, calculate_nakshatra_and_pada,
    calculate_rashi_info
)
from api.astro_engine.vargas import calculate_varga_sign


def test_ayanamsa_values():
    """Julian day 2451545.0 (2000-01-01): verify Lahiri, KP, and Raman values."""
    jd = 2451545.0
    lahiri = get_current_ayanamsa(jd, "lahiri")
    kp = get_current_ayanamsa(jd, "kp")
    raman = get_current_ayanamsa(jd, "raman")

    # Lahiri in Jan 2000 is ~23°51' (23.85° - 23.86°)
    assert 23.84 < lahiri < 23.88

    # KP is very close to Lahiri (within 0.15 deg)
    assert abs(kp - lahiri) < 0.15

    # Raman is approximately 1.4 degrees lower than Lahiri
    assert raman < lahiri
    assert 1.2 < (lahiri - raman) < 1.6


def test_rashi_boundaries():
    """Verify 30-degree boundary transitions between signs."""
    # 29.999° is Aries (Mesha)
    sign_id, en, sa, deg, lord = calculate_rashi_info(29.999)
    assert sign_id == 1
    assert en == "Aries"
    assert abs(deg - 29.999) < 1e-4

    # 30.001° is Taurus (Vrishabha)
    sign_id, en, sa, deg, lord = calculate_rashi_info(30.001)
    assert sign_id == 2
    assert en == "Taurus"
    assert abs(deg - 0.001) < 1e-4


def test_nakshatra_and_pada_boundaries():
    """
    Each nakshatra is 13°20' (13.333333°).
    Each pada is 3°20' (3.333333°).
    """
    # 0.5°: Ashwini pada 1 (Ketu)
    nak_id, name, pada, lord, _ = calculate_nakshatra_and_pada(0.5)
    assert nak_id == 1
    assert name == "Ashwini"
    assert pada == 1
    assert lord == "Ketu"

    # 4.0°: Ashwini pada 2
    nak_id, name, pada, lord, _ = calculate_nakshatra_and_pada(4.0)
    assert nak_id == 1
    assert pada == 2

    # 13.5°: Bharani pada 1 (Venus)
    nak_id, name, pada, lord, _ = calculate_nakshatra_and_pada(13.5)
    assert nak_id == 2
    assert name == "Bharani"
    assert pada == 1
    assert lord == "Venus"

    # 359.9°: Revati pada 4 (Mercury)
    nak_id, name, pada, lord, _ = calculate_nakshatra_and_pada(359.9)
    assert nak_id == 27
    assert name == "Revati"
    assert pada == 4
    assert lord == "Mercury"


def test_navamsa_varga_continuous_mapping():
    """
    Verify Navamsa (D9) rules:
    - 0° Aries -> 1st Navamsa of Aries = Aries (1)
    - 3°20' Aries -> 2nd Navamsa = Taurus (2)
    - 30° Taurus -> 1st Navamsa of Taurus (fixed sign begins at 9th from Taurus = Capricorn 10)
    """
    assert calculate_varga_sign(1.0, 9) == 1   # Aries
    assert calculate_varga_sign(4.0, 9) == 2   # Taurus
    assert calculate_varga_sign(31.0, 9) == 10 # Capricorn (9th from Taurus)
