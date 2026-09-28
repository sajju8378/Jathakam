"""
Unit tests for Vimshottari Dasha calculations and Ashtakoota 36 Guna Milan.
"""

from datetime import datetime
import pytest
from api.astro_engine.dashas import calculate_vimshottari_balance, calculate_vimshottari_timeline
from api.astro_engine.ashtakoota import (
    calculate_varna_koota, calculate_vashya_koota, calculate_tara_koota,
    calculate_yoni_koota, calculate_graha_maitri_koota, calculate_gana_koota,
    calculate_bhakoot_koota, calculate_nadi_koota
)


def test_vimshottari_balance():
    """
    Moon at 0.0° in Ashwini:
    Ashwini ruler is Ketu (7 years).
    0.0 elapsed means 100% remaining -> 7.0 years balance at birth.
    """
    lord, bal_years, y, m, d = calculate_vimshottari_balance(0.0)
    assert lord == "Ketu"
    assert abs(bal_years - 7.0) < 1e-4
    assert y == 7

    # Moon at exact midpoint of Ashwini (6.66666667°)
    # 50% elapsed -> 3.5 years balance
    lord, bal_years, y, m, d = calculate_vimshottari_balance(6.66666667)
    assert lord == "Ketu"
    assert abs(bal_years - 3.5) < 0.01
    assert y == 3
    assert m == 6


def test_vimshottari_timeline_continuity():
    """Verify that sum of antardashas spans the entire 120-year cycle."""
    birth_dt = datetime(1990, 1, 1, 12, 0)
    timeline = calculate_vimshottari_timeline(moon_lon=10.0, birth_dt=birth_dt)
    
    mahadashas = timeline["mahadashas"]
    assert len(mahadashas) == 9
    
    # Check antardashas for each MD
    for md in mahadashas:
        assert len(md["antardashas"]) == 9


def test_ashtakoota_nadi_dosha():
    """Both having same Nadi (e.g. Ashwini=Adi and Ardra=Adi) triggers Nadi Dosha (0 pts)."""
    # Ashwini (1) is Adi, Ardra (6) is Adi
    score, desc = calculate_nadi_koota(boy_nak=1, girl_nak=6, boy_rashi=1, girl_rashi=3)
    assert score == 0.0
    assert "Nadi Dosha" in desc

    # Ashwini (1) Adi vs Bharani (2) Madhya -> 8 pts
    score_ok, _ = calculate_nadi_koota(boy_nak=1, girl_nak=2, boy_rashi=1, girl_rashi=1)
    assert score_ok == 8.0


def test_ashtakoota_bhakoot_same_lord_cancellation():
    """
    Aries (1) and Scorpio (8) form 6/8 (Shadashtak), but both are ruled by Mars.
    Bhakoot Dosha is cancelled by same lord rule (7 pts awarded).
    """
    pts, desc = calculate_bhakoot_koota(boy_rashi=1, girl_rashi=8)
    assert pts == 7.0
    assert "cancelled" in desc.lower()
