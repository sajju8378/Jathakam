"""
Vimshottari Dasha Engine for Vedic Astrology (Jyotish).
Calculates birth balance, 120-year Mahadasha sequence, and exact Antardasha start/end dates.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
from .constants import VIMSHOTTARI_CYCLE, VIMSHOTTARI_LORD_YEARS, TOTAL_VIMSHOTTARI_YEARS, NAKSHATRAS, NAKSHATRA_MAP

DAYS_PER_YEAR = 365.2425


def calculate_vimshottari_balance(moon_lon: float) -> Tuple[str, float, int, int, int]:
    """
    Computes the Vimshottari balance at birth.
    Returns:
        (lord_name, balance_years_float, years, months, days)
    """
    nak_span = 360.0 / 27.0  # 13.333333333333334 degrees
    norm_lon = moon_lon % 360.0
    nak_idx = int(norm_lon / nak_span)
    nak_id = nak_idx + 1

    deg_in_nak = norm_lon - (nak_idx * nak_span)
    fraction_elapsed = deg_in_nak / nak_span
    fraction_remaining = 1.0 - fraction_elapsed

    nak_info = NAKSHATRA_MAP[nak_id]
    lord = nak_info["lord"]
    total_years = VIMSHOTTARI_LORD_YEARS[lord]

    balance_years = fraction_remaining * total_years
    y = int(balance_years)
    rem_months = round((balance_years - y) * 12.0, 4)
    m = int(rem_months)
    d = int(round((rem_months - m) * 30.437))

    return lord, balance_years, y, m, d


def calculate_vimshottari_timeline(
    moon_lon: float,
    birth_dt: datetime,
    target_dt: datetime = None
) -> Dict[str, Any]:
    """
    Generates the complete Vimshottari Mahadasha and Antardasha timeline.
    Also identifies the currently active Mahadasha and Antardasha.
    """
    # Normalize birth_dt to timezone-naive UTC for consistent datetime arithmetic
    if birth_dt.tzinfo is not None:
        birth_dt = birth_dt.astimezone(datetime.now().astimezone().tzinfo).replace(tzinfo=None)

    if target_dt is None:
        target_dt = datetime.now()
    elif target_dt.tzinfo is not None:
        target_dt = target_dt.replace(tzinfo=None)

    first_lord, balance_years, bal_y, bal_m, bal_d = calculate_vimshottari_balance(moon_lon)

    # Locate starting index in VIMSHOTTARI_CYCLE
    cycle_lords = [item["lord"] for item in VIMSHOTTARI_CYCLE]
    start_index = cycle_lords.index(first_lord)

    mahadashas = []
    current_start = birth_dt

    for i in range(len(VIMSHOTTARI_CYCLE)):
        cycle_idx = (start_index + i) % len(VIMSHOTTARI_CYCLE)
        md_info = VIMSHOTTARI_CYCLE[cycle_idx]
        md_lord = md_info["lord"]
        full_years = md_info["years"]

        # First Mahadasha uses the balance; subsequent use full periods
        duration_years = balance_years if i == 0 else full_years
        duration_days = duration_years * DAYS_PER_YEAR
        current_end = current_start + timedelta(days=duration_days)

        # Calculate Antardashas (9 sub-periods)
        # Antardasha starts with the MD lord, then proceeds in cycle
        md_lord_idx = cycle_lords.index(md_lord)
        antardashas = []
        ad_start = current_start

        for j in range(len(VIMSHOTTARI_CYCLE)):
            ad_idx = (md_lord_idx + j) % len(VIMSHOTTARI_CYCLE)
            ad_info = VIMSHOTTARI_CYCLE[ad_idx]
            ad_lord = ad_info["lord"]
            ad_years = ad_info["years"]

            # Standard formula: AD_duration = (MD_duration * AD_years) / 120.0
            ad_duration_years = (duration_years * ad_years) / TOTAL_VIMSHOTTARI_YEARS
            ad_duration_days = ad_duration_years * DAYS_PER_YEAR
            ad_end = ad_start + timedelta(days=ad_duration_days)

            is_ad_active = ad_start <= target_dt < ad_end

            antardashas.append({
                "lord": ad_lord,
                "start_date": ad_start.strftime("%Y-%m-%d"),
                "end_date": ad_end.strftime("%Y-%m-%d"),
                "duration_days": round(ad_duration_days, 1),
                "is_active": is_ad_active
            })
            ad_start = ad_end

        is_md_active = current_start <= target_dt < current_end

        mahadashas.append({
            "lord": md_lord,
            "start_date": current_start.strftime("%Y-%m-%d"),
            "end_date": current_end.strftime("%Y-%m-%d"),
            "duration_years": round(duration_years, 2),
            "is_active": is_md_active,
            "antardashas": antardashas
        })

        current_start = current_end

    # Find currently active lords
    active_md = next((m for m in mahadashas if m["is_active"]), None)
    active_ad = None
    if active_md:
        active_ad = next((a for a in active_md["antardashas"] if a["is_active"]), None)

    return {
        "balance_at_birth": {
            "lord": first_lord,
            "years": bal_y,
            "months": bal_m,
            "days": bal_d,
            "total_years_fraction": round(balance_years, 3),
            "description": f"{first_lord} Mahadasha balance: {bal_y} years, {bal_m} months, {bal_d} days"
        },
        "active_dasha": {
            "mahadasha": active_md["lord"] if active_md else None,
            "antardasha": active_ad["lord"] if active_ad else None,
            "md_end": active_md["end_date"] if active_md else None,
            "ad_end": active_ad["end_date"] if active_ad else None,
        },
        "mahadashas": mahadashas
    }
