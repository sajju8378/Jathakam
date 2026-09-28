export interface AstroSettings {
  ayanamsa: string;
  house_system: string;
  node_type: string;
}

export interface BirthChartRequest {
  name: string;
  dob: string;
  tob?: string | null;
  place?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  time_unknown?: boolean;
  settings?: AstroSettings;
  consent_given?: boolean;
}

export interface CombustionInfo {
  is_combust: boolean;
  orb_limit: number;
  distance_from_sun: number;
}

export interface PlanetPosition {
  name: string;
  name_sa: string;
  longitude: number;
  speed: number;
  is_retrograde: boolean;
  sign_id: number;
  sign_en: string;
  sign_sa: string;
  degree_in_sign: number;
  nakshatra_id: number;
  nakshatra_name: string;
  pada: number;
  nakshatra_lord: string;
  house: number | null;
  dignity: string;
  combustion?: CombustionInfo;
}

export interface HouseCusp {
  house: number;
  sign_id: number;
  sign_en: string;
  sign_sa: string;
  lord: string;
  start_lon: number;
  midpoint_lon: number;
  end_lon: number;
  cusp_lon: number;
}

export interface DivisionalChart {
  division: number;
  code: string;
  title: string;
  description: string;
  ascendant_sign?: number | null;
  ascendant_sign_en?: string | null;
  ascendant_sign_sa?: string | null;
  planets: Array<{
    name: string;
    name_sa: string;
    sign_id: number;
    sign_en: string;
    sign_sa: string;
    house: number | null;
    is_retrograde: boolean;
  }>;
  sign_to_planets: Record<string, string[]>;
  house_to_planets: Record<string, string[]>;
}

export interface Antardasha {
  lord: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  is_active: boolean;
}

export interface Mahadasha {
  lord: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  is_active: boolean;
  antardashas: Antardasha[];
}

export interface DashaTimeline {
  balance_at_birth: {
    lord: string;
    years: number;
    months: number;
    days: number;
    total_years_fraction: number;
    description: string;
  };
  active_dasha: {
    mahadasha: string | null;
    antardasha: string | null;
    md_end: string | null;
    ad_end: string | null;
  };
  mahadashas: Mahadasha[];
}

export interface ManglikAnalysis {
  is_manglik: boolean;
  is_cancelled: boolean;
  severity: string;
  mars_house?: number;
  mars_sign_en?: string;
  is_from_lagna: boolean;
  is_from_moon: boolean;
  is_from_venus: boolean;
  cancellations: string[];
  rule_used: string;
}

export interface KaalSarpAnalysis {
  has_dosha: boolean;
  status: string;
  is_full: boolean;
  is_partial: boolean;
  rahu_house: number;
  name: string;
  description: string;
  rule_used: string;
}

export interface SadeSatiAnalysis {
  is_sade_sati: boolean;
  is_dhaiya: boolean;
  current_saturn_sign_en: string;
  natal_moon_sign_en: string;
  phase: string;
  description: string;
  rule_used: string;
}

export interface MajorYoga {
  name: string;
  category: string;
  nature: string;
  rule: string;
  description: string;
}

export interface BirthChartData {
  meta: {
    ephemeris_version: string;
    ayanamsa_used: string;
    ayanamsa_degrees: number;
    house_system_used: string;
    node_type_used: string;
    julian_day_ut: number;
    calculated_at_utc: string;
    is_time_unknown: boolean;
  };
  subject: {
    name: string;
    dob: string;
    tob: string | null;
    place: string;
    latitude: number;
    longitude: number;
    timezone: string;
    utc_datetime: string;
  };
  ascendant: {
    sign_id: number;
    sign_en: string;
    sign_sa: string;
    degree: number;
    longitude: number;
    nakshatra_id: number;
    nakshatra_name: string;
    pada: number;
    nakshatra_lord: string;
  } | null;
  moon: {
    sign_id: number;
    sign_en: string;
    sign_sa: string;
    degree: number;
    nakshatra_id: number;
    nakshatra_name: string;
    pada: number;
    nakshatra_lord: string;
  };
  sun: {
    sign_id: number;
    sign_en: string;
    sign_sa: string;
    degree: number;
    nakshatra_id: number;
    nakshatra_name: string;
    pada: number;
    nakshatra_lord: string;
  };
  planets: Record<string, PlanetPosition>;
  houses: HouseCusp[];
  divisional_charts: Record<string, DivisionalChart>;
  vimshottari_dasha: DashaTimeline;
  yogas_and_doshas: {
    manglik: ManglikAnalysis;
    kaal_sarp: KaalSarpAnalysis;
    sade_sati: SadeSatiAnalysis;
    major_yogas: MajorYoga[];
  };
  chart_layout: {
    north_indian: Record<string, { house: number; sign_id: number; sign_en: string; planets: string[] }>;
    south_indian: Record<string, { sign_id: number; sign_en: string; sign_sa: string; is_ascendant: boolean; planets: string[] }>;
  };
  interpretations: {
    disclaimer: string;
    ascendant_synthesis: string;
    moon_nakshatra_synthesis: string;
    active_dasha_guidance: string;
    key_planetary_placements: Array<{ planet: string; house: number; note: string }>;
  };
}

export interface GeocodedPlace {
  display_name: string;
  city: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface PanchangData {
  date: string;
  timezone: string;
  sunrise: string;
  sunset: string;
  vara: { name: string; name_sa: string; ruler: string };
  tithi: { id: number; name: string; paksha: string; elapsed_percentage?: number; start?: string; end?: string };
  nakshatra: { id: number; name: string; lord: string; deity?: string; elapsed_percentage?: number; start?: string; end?: string };
  yoga: { id: number; name: string; elapsed_percentage?: number; start?: string; end?: string };
  karana: { index: number; name: string; start?: string; end?: string };
  muhurats: {
    abhijit: { name: string; nature: string; start: string; end: string };
    rahu_kalam: { name: string; nature: string; start: string; end: string };
    yamaganda: { name: string; nature: string; start: string; end: string };
    gulika: { name: string; nature: string; start: string; end: string };
  };
  ayanamsa_used: string;
  computed_locally: boolean;
  provider?: string;
  cross_check?: {
    status: string;
    message?: string;
    discrepancies?: string[];
  };
}

export interface KootaDetail {
  name: string;
  max_points: number;
  obtained_points: number;
  area: string;
  description: string;
}

export interface MatchResult {
  total_score: number;
  max_score: number;
  is_qualified: boolean;
  verdict: string;
  manglik_compatibility: string;
  boy_summary: { name: string; moon_sign: string; moon_nakshatra: string };
  girl_summary: { name: string; moon_sign: string; moon_nakshatra: string };
  kootas: KootaDetail[];
}
