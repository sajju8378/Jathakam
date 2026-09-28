"""
Interpretation layer loader and synthesis engine.
Keeps astrological text content separate from computational logic.
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from ..astro_engine.constants import RASHI_MAP, NAKSHATRA_MAP

RULES_PATH = Path(__file__).parent / "rules.json"


class AstrologicalInterpreter:
    def __init__(self):
        self.rules: Dict[str, Any] = {}
        self._load_rules()

    def _load_rules(self):
        try:
            with open(RULES_PATH, "r", encoding="utf-8") as f:
                self.rules = json.load(f)
        except Exception as e:
            self.rules = {
                "disclaimer": "Astrology guidance is traditional and belief-based. Consult professionals for life decisions.",
                "ascendants": {},
                "planet_in_house": {},
                "mahadasha_guidance": {}
            }

    def generate_chart_interpretations(
        self,
        ascendant_sign_id: Optional[int],
        planets: Dict[str, Dict[str, Any]],
        active_dasha_lord: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Synthesizes structured interpretations for Ascendant, key planets, and current active Dasha.
        """
        # Ascendant
        asc_text = ""
        if ascendant_sign_id:
            asc_text = self.rules.get("ascendants", {}).get(str(ascendant_sign_id), "")

        # Planetary placements
        house_notes = []
        for p_name, p_data in planets.items():
            h = p_data.get("house")
            if h is not None:
                key = f"{p_name}_{h}"
                note = self.rules.get("planet_in_house", {}).get(key)
                if note:
                    house_notes.append({
                        "planet": p_name,
                        "house": h,
                        "note": note
                    })

        # Moon Nakshatra
        moon = planets.get("Moon")
        nak_note = ""
        if moon:
            nak_id = moon.get("nakshatra_id")
            nak_info = NAKSHATRA_MAP.get(nak_id, {})
            nak_note = f"{nak_info.get('name', 'Moon')}: Deity {nak_info.get('deity', '')}, {nak_info.get('gana', '')} Gana, {nak_info.get('yoni', '')} Yoni. Ruled by {nak_info.get('lord', '')}."

        # Dasha guide
        dasha_note = ""
        if active_dasha_lord:
            dasha_note = self.rules.get("mahadasha_guidance", {}).get(active_dasha_lord, "")

        return {
            "disclaimer": self.rules.get("disclaimer", ""),
            "ascendant_synthesis": asc_text,
            "moon_nakshatra_synthesis": nak_note,
            "active_dasha_guidance": dasha_note,
            "key_planetary_placements": house_notes
        }
