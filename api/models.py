"""
Pydantic Models and Schemas for JyotishVeda API.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class AstroSettings(BaseModel):
    ayanamsa: str = Field(default="lahiri", description="Ayanamsa system: 'lahiri' (Chitra Paksha), 'kp', or 'raman'")
    house_system: str = Field(default="whole_sign", description="House system: 'whole_sign', 'equal', or 'sripati'")
    node_type: str = Field(default="mean", description="Rahu/Ketu calculation: 'mean' or 'true'")


class BirthChartRequest(BaseModel):
    name: str = Field(default="Native", description="Name of the person")
    dob: str = Field(description="Date of birth in YYYY-MM-DD format")
    tob: Optional[str] = Field(default="12:00", description="Time of birth in HH:MM or HH:MM:SS (24-hour format)")
    place: Optional[str] = Field(default=None, description="City / Place of birth name")
    latitude: Optional[float] = Field(default=None, description="Latitude in decimal degrees (-90 to +90)")
    longitude: Optional[float] = Field(default=None, description="Longitude in decimal degrees (-180 to +180)")
    timezone: Optional[str] = Field(default=None, description="IANA timezone name, e.g. 'Asia/Kolkata'")
    time_unknown: bool = Field(default=False, description="Set True if exact birth time is unknown (uses 12:00 and skips Lagna)")
    settings: Optional[AstroSettings] = Field(default_factory=AstroSettings)
    consent_given: bool = Field(default=True, description="Explicit consent under India DPDP Act 2023 for astrological processing")


class CombustionInfo(BaseModel):
    is_combust: bool
    orb_limit: float
    distance_from_sun: float


class PlanetPosition(BaseModel):
    name: str
    name_sa: str
    longitude: float
    speed: float
    is_retrograde: bool
    sign_id: int
    sign_en: str
    sign_sa: str
    degree_in_sign: float
    nakshatra_id: int
    nakshatra_name: str
    pada: int
    nakshatra_lord: str
    house: Optional[int] = None
    dignity: str = ""
    combustion: Optional[CombustionInfo] = None


class HouseCusp(BaseModel):
    house: int
    sign_id: int
    sign_en: str
    sign_sa: str
    lord: str
    start_lon: float
    midpoint_lon: float
    end_lon: float
    cusp_lon: float


class DivisionalChart(BaseModel):
    division: int
    code: str
    title: str
    description: str
    ascendant_sign: Optional[int] = None
    ascendant_sign_en: Optional[str] = None
    ascendant_sign_sa: Optional[str] = None
    planets: List[Dict[str, Any]]
    sign_to_planets: Dict[str, List[str]]
    house_to_planets: Dict[str, List[str]]


class ChartMetadata(BaseModel):
    ephemeris_version: str
    ayanamsa_used: str
    ayanamsa_degrees: float
    house_system_used: str
    node_type_used: str
    julian_day_ut: float
    calculated_at_utc: str
    is_time_unknown: bool


class SubjectInfo(BaseModel):
    name: str
    dob: str
    tob: Optional[str]
    place: str
    latitude: float
    longitude: float
    timezone: str
    utc_datetime: str


class MoonDetails(BaseModel):
    sign_id: int
    sign_en: str
    sign_sa: str
    degree: float
    nakshatra_id: int
    nakshatra_name: str
    pada: int
    nakshatra_lord: str


class AscendantDetails(BaseModel):
    sign_id: int
    sign_en: str
    sign_sa: str
    degree: float
    longitude: float
    nakshatra_id: int
    nakshatra_name: str
    pada: int
    nakshatra_lord: str


class ChartLayoutData(BaseModel):
    north_indian: Dict[str, Any]
    south_indian: Dict[str, Any]


class BirthChartResponse(BaseModel):
    meta: ChartMetadata
    subject: SubjectInfo
    ascendant: Optional[AscendantDetails] = None
    moon: MoonDetails
    sun: Dict[str, Any]
    planets: Dict[str, PlanetPosition]
    houses: List[HouseCusp]
    divisional_charts: Dict[str, DivisionalChart]
    vimshottari_dasha: Dict[str, Any]
    yogas_and_doshas: Dict[str, Any]
    chart_layout: ChartLayoutData
    interpretations: Dict[str, Any]


class MatchRequest(BaseModel):
    boy_chart: BirthChartRequest
    girl_chart: BirthChartRequest


class KootaDetail(BaseModel):
    name: str
    max_points: float
    obtained_points: float
    area: str
    description: str


class MatchResponse(BaseModel):
    total_score: float
    max_score: float = 36.0
    is_qualified: bool
    verdict: str
    manglik_compatibility: str
    boy_summary: Dict[str, str]
    girl_summary: Dict[str, str]
    kootas: List[KootaDetail]


class PanchangRequest(BaseModel):
    date: str
    lat: float
    lon: float
    tz: str = "Asia/Kolkata"


class DeleteDataRequest(BaseModel):
    user_id_or_name: str
    confirm: bool = True


class DeleteDataResponse(BaseModel):
    success: bool
    message: str
