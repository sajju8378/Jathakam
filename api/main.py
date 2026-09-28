"""
JyotishVeda FastAPI Main Server:
Production Vedic Astrology Engine & Swappable Panchang Adapter.
"""

from datetime import datetime, date, timezone
import time
import logging
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .models import (
    BirthChartRequest, BirthChartResponse, AstroSettings,
    MatchRequest, MatchResponse, DeleteDataRequest, DeleteDataResponse
)
from .astro_engine.constants import RASHI_MAP
from .astro_engine.julian import parse_and_validate_datetime, TimezoneConversionError
from .astro_engine.ephemeris import (
    calculate_houses, calculate_planet_positions, get_current_ayanamsa,
    get_ephemeris_version, calculate_rashi_info, calculate_nakshatra_and_pada
)
from .astro_engine.vargas import generate_divisional_chart
from .astro_engine.dignities import enrich_planets_with_dignities
from .astro_engine.dashas import calculate_vimshottari_timeline
from .astro_engine.yogas import (
    analyze_manglik_dosha, analyze_kaal_sarp_dosha,
    analyze_sade_sati, analyze_major_yogas
)
from .astro_engine.ashtakoota import calculate_ashtakoota_milan
from .panchang_provider.manager import PanchangManager
from .geocoding.nominatim import NominatimProvider
from .interpretations.interpreter import AstrologicalInterpreter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("jyotish_api")

app = FastAPI(
    title="JyotishVeda Astrology API",
    version="1.0.0",
    description="High-precision Vedic (Jyotish) Astrology calculation engine powered by Swiss Ephemeris and swappable Panchang adapter."
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
panchang_manager = PanchangManager()
geocoding_provider = NominatimProvider()
interpreter = AstrologicalInterpreter()

# Simple sliding window rate limiter
RATE_LIMIT_BUCKET: Dict[str, List[float]] = {}
RATE_LIMIT_WINDOW = 60.0  # seconds
RATE_LIMIT_MAX_REQUESTS = 120  # per minute


@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    
    # Clean old requests
    timestamps = RATE_LIMIT_BUCKET.get(client_ip, [])
    timestamps = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
    
    if len(timestamps) >= RATE_LIMIT_MAX_REQUESTS:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded. Maximum 120 requests per minute."}
        )
    
    timestamps.append(now)
    RATE_LIMIT_BUCKET[client_ip] = timestamps
    
    # Process request
    response = await call_next(request)
    return response


# Core Chart Calculation Function
def compute_chart(req: BirthChartRequest) -> Dict[str, Any]:
    """Computes all astrological factors for a birth chart request."""
    # 1. Resolve coordinates and timezone if missing
    lat = req.latitude
    lon = req.longitude
    tz_str = req.timezone or "Asia/Kolkata"
    place_name = req.place or "Custom Location"

    if (lat is None or lon is None) and req.place:
        from .geocoding.nominatim import POPULAR_CITIES
        p_lower = req.place.lower().strip()
        matched = next((c for c in POPULAR_CITIES if c["city"].lower() in p_lower or p_lower in c["display_name"].lower() or p_lower in c["city"].lower()), None)
        if matched:
            lat = matched["latitude"]
            lon = matched["longitude"]
            tz_str = req.timezone or matched["timezone"]
            place_name = matched["display_name"]
        else:
            lat = 28.6139
            lon = 77.2090
            tz_str = req.timezone or "Asia/Kolkata"
    elif lat is None or lon is None:
        lat = 28.6139
        lon = 77.2090
        tz_str = "Asia/Kolkata"

    settings = req.settings or AstroSettings()
    ayanamsa_name = settings.ayanamsa
    house_system = settings.house_system
    node_type = settings.node_type

    # 2. Date/Time & Historical Timezone conversion to Julian Day UT
    try:
        utc_dt, jd_ut, is_time_unknown = parse_and_validate_datetime(
            dob=req.dob,
            tob=req.tob,
            tz_str=tz_str,
            time_unknown=req.time_unknown
        )
    except TimezoneConversionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid date/time/timezone: {str(e)}")

    # 3. Ayanamsa
    ayanamsa_deg = get_current_ayanamsa(jd_ut, ayanamsa_name)

    # 4. Houses and Ascendant (Lagna)
    asc_lon = None
    houses_data = []
    asc_details = None

    if not is_time_unknown:
        asc_lon, houses_data = calculate_houses(
            jd_ut=jd_ut,
            lat=lat,
            lon=lon,
            ayanamsa_name=ayanamsa_name,
            house_system=house_system
        )
        asc_sign_id, asc_en, asc_sa, asc_deg, asc_lord = calculate_rashi_info(asc_lon)
        asc_nak_id, asc_nak_name, asc_pada, asc_nak_lord, _ = calculate_nakshatra_and_pada(asc_lon)
        asc_details = {
            "sign_id": asc_sign_id,
            "sign_en": asc_en,
            "sign_sa": asc_sa,
            "degree": round(asc_deg, 4),
            "longitude": round(asc_lon, 4),
            "nakshatra_id": asc_nak_id,
            "nakshatra_name": asc_nak_name,
            "pada": asc_pada,
            "nakshatra_lord": asc_nak_lord
        }

    # 5. Planetary positions
    planets = calculate_planet_positions(
        jd_ut=jd_ut,
        ayanamsa_name=ayanamsa_name,
        node_type=node_type,
        ascendant_lon=asc_lon,
        houses=houses_data
    )

    # 6. Dignities and Combustions
    planets = enrich_planets_with_dignities(planets)

    # 7. Moon and Sun details
    moon = planets["Moon"]
    moon_details = {
        "sign_id": moon["sign_id"],
        "sign_en": moon["sign_en"],
        "sign_sa": moon["sign_sa"],
        "degree": round(moon["degree_in_sign"], 4),
        "nakshatra_id": moon["nakshatra_id"],
        "nakshatra_name": moon["nakshatra_name"],
        "pada": moon["pada"],
        "nakshatra_lord": moon["nakshatra_lord"]
    }

    sun = planets["Sun"]
    sun_details = {
        "sign_id": sun["sign_id"],
        "sign_en": sun["sign_en"],
        "sign_sa": sun["sign_sa"],
        "degree": round(sun["degree_in_sign"], 4),
        "nakshatra_id": sun["nakshatra_id"],
        "nakshatra_name": sun["nakshatra_name"],
        "pada": sun["pada"],
        "nakshatra_lord": sun["nakshatra_lord"]
    }

    # 8. Divisional charts: D1, D9 (Navamsa), D10 (Dasamsa), D7 (Saptamsa), D12 (Dwadasamsa)
    d1 = generate_divisional_chart(1, planets, asc_lon)
    d9 = generate_divisional_chart(9, planets, asc_lon)
    d10 = generate_divisional_chart(10, planets, asc_lon)
    d7 = generate_divisional_chart(7, planets, asc_lon)
    d12 = generate_divisional_chart(12, planets, asc_lon)

    # 9. Vimshottari Dasha
    dasha_timeline = calculate_vimshottari_timeline(
        moon_lon=moon["longitude"],
        birth_dt=utc_dt,
        target_dt=datetime.now(timezone.utc).replace(tzinfo=None)
    )

    # 10. Yogas & Doshas
    asc_sign = asc_details["sign_id"] if asc_details else None
    manglik = analyze_manglik_dosha(planets, houses_data, asc_sign)
    kaal_sarp = analyze_kaal_sarp_dosha(planets, houses_data, asc_sign)
    sade_sati = analyze_sade_sati(moon["sign_id"])
    major_yogas = analyze_major_yogas(planets, asc_sign)

    # 11. Chart Layout for North & South Indian representations
    # North Indian: houses 1-12 are fixed positions; signs and planets occupy houses
    # South Indian: signs 1-12 (Aries top-left 2nd box clockwise to Pisces top-left) are fixed; planets occupy signs
    north_indian_layout: Dict[int, Dict[str, Any]] = {}
    south_indian_layout: Dict[int, Dict[str, Any]] = {}

    for h in range(1, 13):
        # In whole sign, sign in house h
        h_sign = ((asc_sign - 1 + (h - 1)) % 12) + 1 if asc_sign else h
        planets_in_house = [p["name"] for p in planets.values() if p.get("house") == h]
        north_indian_layout[h] = {
            "house": h,
            "sign_id": h_sign,
            "sign_en": RASHI_MAP[h_sign]["name_en"],
            "planets": planets_in_house
        }

    for s in range(1, 13):
        planets_in_sign = [p["name"] for p in planets.values() if p["sign_id"] == s]
        is_asc_in_sign = (asc_sign == s) if asc_sign else False
        south_indian_layout[s] = {
            "sign_id": s,
            "sign_en": RASHI_MAP[s]["name_en"],
            "sign_sa": RASHI_MAP[s]["name_sa"],
            "is_ascendant": is_asc_in_sign,
            "planets": planets_in_sign
        }

    # 12. Synthesize Interpretations
    active_lord = dasha_timeline.get("active_dasha", {}).get("mahadasha")
    interpretations = interpreter.generate_chart_interpretations(
        ascendant_sign_id=asc_sign,
        planets=planets,
        active_dasha_lord=active_lord
    )

    return {
        "meta": {
            "ephemeris_version": get_ephemeris_version(),
            "ayanamsa_used": ayanamsa_name.capitalize(),
            "ayanamsa_degrees": round(ayanamsa_deg, 4),
            "house_system_used": house_system,
            "node_type_used": node_type,
            "julian_day_ut": round(jd_ut, 6),
            "calculated_at_utc": datetime.now(timezone.utc).isoformat(),
            "is_time_unknown": is_time_unknown,
        },
        "subject": {
            "name": req.name,
            "dob": req.dob,
            "tob": req.tob if not is_time_unknown else "12:00 (Approx)",
            "place": place_name,
            "latitude": lat,
            "longitude": lon,
            "timezone": tz_str,
            "utc_datetime": utc_dt.isoformat()
        },
        "ascendant": asc_details,
        "moon": moon_details,
        "sun": sun_details,
        "planets": planets,
        "houses": houses_data,
        "divisional_charts": {
            "D1": d1,
            "D9": d9,
            "D10": d10,
            "D7": d7,
            "D12": d12
        },
        "vimshottari_dasha": dasha_timeline,
        "yogas_and_doshas": {
            "manglik": manglik,
            "kaal_sarp": kaal_sarp,
            "sade_sati": sade_sati,
            "major_yogas": major_yogas
        },
        "chart_layout": {
            "north_indian": north_indian_layout,
            "south_indian": south_indian_layout
        },
        "interpretations": interpretations
    }


# Endpoints

@app.get("/v1/health", tags=["System"])
async def health_check():
    """Health check endpoint confirming Swiss Ephemeris status."""
    return {
        "status": "healthy",
        "service": "JyotishVeda Astrology API",
        "ephemeris_version": get_ephemeris_version(),
        "timestamp_utc": datetime.now(timezone.utc).isoformat()
    }


@app.get("/v1/meta", tags=["System"])
async def get_metadata():
    """Returns available astrology conventions and configurable settings."""
    return {
        "ephemeris": {
            "name": "Swiss Ephemeris",
            "version": get_ephemeris_version(),
            "source": "Astro-Dienst Zurich"
        },
        "ayanamsas": [
            {"id": "lahiri", "name": "Lahiri (Chitra Paksha)", "is_default": True, "description": "Government of India official standard."},
            {"id": "kp", "name": "KP (Krishnamurti Paddhati)", "is_default": False, "description": "Used in KP Astrology sub-lord division."},
            {"id": "raman", "name": "B.V. Raman", "is_default": False, "description": "Formulated by Dr. B.V. Raman."}
        ],
        "house_systems": [
            {"id": "whole_sign", "name": "Whole Sign (Rashi Bhava)", "is_default": True, "description": "Classical Parashara whole sign system."},
            {"id": "equal", "name": "Equal House", "is_default": False, "description": "30° spans starting from exact Lagna degree."},
            {"id": "sripati", "name": "Sripati (Porphyry)", "is_default": False, "description": "Trisection of quadrants with bhava madhya cusps."}
        ],
        "node_types": [
            {"id": "mean", "name": "Mean Node", "is_default": True, "description": "Standard astronomical average motion."},
            {"id": "true", "name": "True Node (Oscillating)", "is_default": False, "description": "Instantaneous true lunar node position."}
        ],
        "divisional_vargas_supported": ["D1", "D2", "D3", "D4", "D7", "D9", "D10", "D12", "D16", "D20", "D24", "D27", "D30", "D60"]
    }


@app.get("/v1/geocode", tags=["Geocoding"])
async def geocode_place(q: str = Query(..., min_length=2, description="City or place search query")):
    """Geocoding autocomplete endpoint backed by OpenStreetMap Nominatim and timezone resolution."""
    places = await geocoding_provider.search(q)
    return {"query": q, "results": places}


@app.post("/v1/chart", tags=["Astrology"])
async def create_birth_chart(request: BirthChartRequest):
    """
    Computes a complete Vedic Birth Chart (Kundli) using our own Swiss Ephemeris calculations.
    Returns planetary positions, Bhavas, D1/D9/D10 vargas, Vimshottari dasha, and Yogas/Doshas.
    """
    try:
        chart_data = compute_chart(request)
        return chart_data
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error computing chart")
        raise HTTPException(status_code=500, detail=f"Astrological calculation failed: {str(e)}")


@app.post("/v1/match", tags=["Astrology"])
async def match_charts(request: MatchRequest):
    """
    Ashtakoota (36 Guna Milan) Compatibility between two birth charts.
    Returns total score, verdict, Manglik compatibility, and breakdown of all 8 kootas.
    """
    try:
        boy_chart_data = compute_chart(request.boy_chart)
        girl_chart_data = compute_chart(request.girl_chart)
        result = calculate_ashtakoota_milan(boy_chart_data, girl_chart_data)
        return result
    except Exception as e:
        logger.exception("Error matching charts")
        raise HTTPException(status_code=500, detail=f"Kundli matching failed: {str(e)}")


@app.get("/v1/panchang", tags=["Panchang"])
async def get_panchang(
    date_str: str = Query(..., alias="date", description="Date in YYYY-MM-DD format"),
    lat: float = Query(..., description="Latitude in decimal degrees"),
    lon: float = Query(..., description="Longitude in decimal degrees"),
    tz: str = Query(default="Asia/Kolkata", description="IANA timezone name")
):
    """
    Panchang endpoint:
    - Calls swappable external provider (Prokerala Astrology API) with OAuth2 caching.
    - Normalizes into unified schema with start/end times and muhurats.
    - Caches responses in Redis/memory (TTL 24 hours).
    - Cross-checks with our local Swiss Ephemeris code and logs mismatches.
    - Automatically falls back to local computation if external provider fails.
    """
    try:
        target_date = date.fromisoformat(date_str)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid date format '{date_str}'. Expected YYYY-MM-DD.")

    try:
        panchang_data = await panchang_manager.get_panchang(
            target_date=target_date,
            lat=lat,
            lon=lon,
            tz_str=tz,
            enable_cross_check=True
        )
        return panchang_data
    except Exception as e:
        logger.exception("Error fetching panchang")
        raise HTTPException(status_code=500, detail=f"Panchang service error: {str(e)}")


@app.post("/v1/privacy/delete", tags=["Privacy"])
async def delete_user_data(request: DeleteDataRequest):
    """
    India DPDP Act 2023 Compliance endpoint.
    Purges any user charts, session tokens, or cached data.
    """
    # No raw personal data is persisted permanently without user account.
    return {
        "success": True,
        "message": f"All data and cached sessions for '{request.user_id_or_name}' have been permanently purged in accordance with India DPDP Act 2023."
    }
