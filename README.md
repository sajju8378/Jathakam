# JyotishVeda — Production Vedic Astrology & Panchang Engine

JyotishVeda is a high-precision, production-grade Vedic (Jyotish) astrology platform. It features an in-house **Swiss Ephemeris (`pyswisseph`)** calculation engine for birth charts (Kundli), an extensible adapter service for daily Panchang (defaulting to the Prokerala Astrology API v2 with Swiss Ephemeris cross-check and fallback), and a mobile-first responsive frontend built with React, TypeScript, and Tailwind CSS.

---

## Architecture Overview

```
                      +---------------------------------------+
                      |   Web Frontend (React 19 + Tailwind)  |
                      |   - Interactive SVG Kundli (N/S)      |
                      |   - Planets, Dashas, Yogas, Milan     |
                      +-------------------+-------------------+
                                          |
                              HTTP / JSON Proxy (Port 3000)
                                          |
                      +-------------------v-------------------+
                      |   Astro API (FastAPI, Python 3.11+)   |
                      +-------------------+-------------------+
                                          |
               +--------------------------+--------------------------+
               |                                                     |
+--------------v---------------+                     +---------------v--------------+
|   In-House Astro Engine      |                     |   Panchang Adapter Service   |
|   - Swiss Ephemeris 2.10     |                     |   - PanchangProvider Interface|
|   - Lahiri / KP / Raman      |                     |   - ProkeralaProvider (OAuth2)|
|   - Whole Sign / Sripati     |                     |   - LocalSwissEphProvider     |
|   - D1, D9, D10 Vargas       |                     |   - Cross-check & Verification|
|   - 120-Yr Vimshottari Dasha |                     +---------------+--------------+
|   - Manglik / Kaal Sarp / Sati|                                    |
|   - 36 Guna Ashtakoota Milan |                     +---------------v--------------+
+------------------------------+                     |   Redis (24h Panchang Cache) |
                                                     +------------------------------+
```

1. **Own Astro API (FastAPI, Python 3.11+)**:
   - Computes all birth-chart calculations using Swiss Ephemeris (`pyswisseph`). **No third-party astrology API is used for the chart.**
   - Configurable Ayanamsa: Lahiri (Chitra Paksha, default), KP, Raman.
   - Configurable House System: Whole Sign (default), Equal, Sripati.
   - Configurable Nodes: Mean Node (default), True Node (oscillating); $\text{Ketu} = \text{Rahu} + 180^\circ$.
2. **Panchang Adapter Service**:
   - Calls the external Panchang API (Prokerala Astrology API v2 with OAuth2 client credentials).
   - Normalizes response into our unified schema (tithi, nakshatra, yoga, karana, vara, sunrise, sunset, Rahu Kalam, Yamaganda, Gulika, Abhijit Muhurat).
   - **Cross-check mode**: Evaluates local Swiss Ephemeris algorithms and logs any discrepancy.
   - **Graceful fallback**: If external credentials are not supplied or the remote API is unreachable, automatically serves locally computed Panchang.
3. **Web Frontend (React + TypeScript + Tailwind)**:
   - Mobile-first, responsive Vedic interface with saffron, indigo, and gold accents.
   - Interactive SVG North Indian Diamond and South Indian Square Kundli charts with house/planet click inspectors.
   - Vimshottari Dasha interactive timeline tree (birth balance + current active period).
   - Ashtakoota 36 Guna Milan with full 8-koota score breakdown.
   - Client-side Kundli PDF export via `jsPDF`.
4. **Data Privacy (India DPDP Act 2023)**:
   - Explicit consent tracking, ephemeral compute, no raw birth log recording, and a `POST /v1/privacy/delete` endpoint.

---

## Quickstart (Local Development)

### Prerequisites
- Node.js 20+
- Python 3.11+
- (Optional) Docker & Docker Compose

### 1. Run Directly with Dual Runner
Clone the repository and install dependencies:

```bash
# Install Node dependencies
npm install

# Install Python requirements
pip install -r requirements.txt

# Start both FastAPI backend (port 8001) and Vite dev server (port 3000)
npm run dev
```

Visit `http://localhost:3000` in your browser. The Vite server on port 3000 automatically proxies `/v1/*` requests to the FastAPI backend on `http://127.0.0.1:8001`.

### 2. Run with Docker Compose
To run the full stack with PostgreSQL and Redis:

```bash
docker compose up --build
```

- **Frontend Web UI**: `http://localhost:3000`
- **FastAPI OpenAPI Swagger Docs**: `http://localhost:8001/docs`

---

## Environment Variables (`.env`)

See `.env.example` for all options:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Frontend HTTP port | `3000` |
| `API_PORT` | FastAPI backend port | `8001` |
| `REDIS_URL` | Redis caching connection string | `redis://localhost:6379/0` (in-memory fallback if absent) |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://jyotish_user:jyotish_password@localhost:5432/jyotish_db` |
| `PROKERALA_CLIENT_ID` | Prokerala API v2 client ID | `""` (runs locally if omitted) |
| `PROKERALA_CLIENT_SECRET` | Prokerala API v2 client secret | `""` (runs locally if omitted) |

---

## API Endpoints

### 1. `POST /v1/chart`
Computes complete Vedic Kundli:
```bash
curl -X POST http://localhost:3000/v1/chart \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mahatma Gandhi",
    "dob": "1869-10-02",
    "tob": "07:12",
    "place": "Porbandar, Gujarat, India",
    "latitude": 21.6417,
    "longitude": 69.6293,
    "timezone": "Asia/Kolkata",
    "settings": {
      "ayanamsa": "lahiri",
      "house_system": "whole_sign",
      "node_type": "mean"
    }
  }'
```

**Response includes**:
- `meta`: Ephemeris version, ayanamsa degrees, Julian Day UT, settings used.
- `subject`: Formatted birth parameters and resolved UTC datetime.
- `ascendant`: Lagna degree, sign, nakshatra, and pada.
- `planets`: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu with sidereal longitude, sign, nakshatra, pada, speed, retrograde flag, house, dignity, and combustion info.
- `divisional_charts`: D1 (Rashi), D9 (Navamsa), D10 (Dasamsa), D7, D12.
- `vimshottari_dasha`: Balance at birth, current active Mahadasha/Antardasha, and full 120-year timeline.
- `yogas_and_doshas`: Manglik Dosha (with cancellation rules), Kaal Sarp Yoga, Sade Sati & Dhaiya status, and Major Raj Yogas.
- `chart_layout`: Fixed coordinate mapping for North Indian (Diamond) and South Indian (Square) charts.
- `interpretations`: Synthesized textual layer for Ascendant, Moon, and active dasha.

### 2. `POST /v1/match`
Computes Ashtakoota 36 Guna Milan between two charts:
```bash
curl -X POST http://localhost:3000/v1/match \
  -H "Content-Type: application/json" \
  -d '{
    "boy_chart": { "name": "Boy", "dob": "1992-04-14", "tob": "09:30", "place": "New Delhi", "latitude": 28.6139, "longitude": 77.2090, "timezone": "Asia/Kolkata" },
    "girl_chart": { "name": "Girl", "dob": "1994-08-20", "tob": "15:45", "place": "Mumbai", "latitude": 19.0760, "longitude": 72.8777, "timezone": "Asia/Kolkata" }
  }'
```

### 3. `GET /v1/panchang`
Retrieves daily Panchang with sunrise/sunset, muhurats, and cross-check verification:
```bash
curl "http://localhost:3000/v1/panchang?date=2026-09-28&lat=28.6139&lon=77.2090&tz=Asia/Kolkata"
```

### 4. `GET /v1/geocode`
Autocomplete endpoint resolving location queries to latitude, longitude, and IANA timezone via Nominatim.

### 5. `GET /v1/health` & `GET /v1/meta`
Returns Swiss Ephemeris status, version, and supported astrology settings.

### 6. `POST /v1/privacy/delete`
Compliant with India DPDP Act 2023 for purging user data.

---

## How to Add a New Panchang Provider

The Panchang adapter architecture uses an abstract provider interface. To add a new provider (e.g. `DrikPanchangProvider` or `CustomAstroApi`):

1. Create a new class inheriting from `PanchangProvider` in `api/panchang_provider/`:

```python
# api/panchang_provider/custom_provider.py
from datetime import date
from typing import Dict, Any
from .base import PanchangProvider

class CustomProvider(PanchangProvider):
    @property
    def name(self) -> str:
        return "custom_provider"

    async def get_panchang(self, target_date: date, lat: float, lon: float, tz_str: str) -> Dict[str, Any]:
        # 1. Fetch from your third-party API
        # 2. Normalize into our schema (tithi, nakshatra, yoga, karana, muhurats)
        # 3. Return normalized dictionary
        return {
            "date": target_date.isoformat(),
            "timezone": tz_str,
            "sunrise": "06:15",
            "sunset": "18:20",
            "tithi": { "id": 1, "name": "Shukla Pratipada", "paksha": "Shukla" },
            "nakshatra": { "id": 1, "name": "Ashwini", "lord": "Ketu" },
            "yoga": { "id": 1, "name": "Vishkumbha" },
            "karana": { "index": 1, "name": "Kintughna" },
            "muhurats": {
                "abhijit": { "name": "Abhijit Muhurat", "start": "11:50", "end": "12:40" },
                "rahu_kalam": { "name": "Rahu Kalam", "start": "07:30", "end": "09:00" },
            },
            "provider": self.name,
            "computed_locally": False
        }
```

2. Register your provider in `api/panchang_provider/manager.py`:

```python
self.primary_provider = CustomProvider()
```

The system automatically manages 24-hour Redis caching, cross-checking against local Swiss Ephemeris, logging mismatches, and falling back on errors. **No core calculation code or frontend components require modification.**

---

## Testing & Quality Assurance

Run the test suite covering historical timezones (e.g. India wartime UTC+6:30), ayanamsa models, boundaries, Vimshottari dasha balances, Ashtakoota matching, and 10 golden benchmark charts:

```bash
# Run all Python unit & golden tests
pytest tests/ -v

# Run TypeScript compilation check
npm run build
```

---

## Astrological Decisions Document

Detailed mathematical and traditional rationales are documented in [`docs/ASTROLOGY_DECISIONS.md`](docs/ASTROLOGY_DECISIONS.md).

---

## Postman Collection

A complete Postman v2.1 collection is available at [`docs/postman_collection.json`](docs/postman_collection.json).
