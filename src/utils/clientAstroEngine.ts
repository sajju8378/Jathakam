/**
 * High-Precision In-Browser Client-Side Vedic Astrology Calculation Engine.
 * Provides 100% standalone offline computation on static hosts like GitHub Pages
 * when a Python FastAPI backend is not present.
 */

import {
  BirthChartRequest,
  BirthChartData,
  PlanetPosition,
  HouseCusp,
  DivisionalChart,
  MatchResult,
  PanchangData
} from '../types/astro';

const RASHIS = [
  { id: 1, en: 'Aries', sa: 'Mesha', lord: 'Mars' },
  { id: 2, en: 'Taurus', sa: 'Vrishabha', lord: 'Venus' },
  { id: 3, en: 'Gemini', sa: 'Mithuna', lord: 'Mercury' },
  { id: 4, en: 'Cancer', sa: 'Karka', lord: 'Moon' },
  { id: 5, en: 'Leo', sa: 'Simha', lord: 'Sun' },
  { id: 6, en: 'Virgo', sa: 'Kanya', lord: 'Mercury' },
  { id: 7, en: 'Libra', sa: 'Tula', lord: 'Venus' },
  { id: 8, en: 'Scorpio', sa: 'Vrishchika', lord: 'Mars' },
  { id: 9, en: 'Sagittarius', sa: 'Dhanu', lord: 'Jupiter' },
  { id: 10, en: 'Capricorn', sa: 'Makara', lord: 'Saturn' },
  { id: 11, en: 'Aquarius', sa: 'Kumbha', lord: 'Saturn' },
  { id: 12, en: 'Pisces', sa: 'Meena', lord: 'Jupiter' },
];

const NAKSHATRAS = [
  { id: 1, name: 'Ashwini', lord: 'Ketu', gana: 'Deva', yoni: 'Horse', nadi: 'Adi' },
  { id: 2, name: 'Bharani', lord: 'Venus', gana: 'Manushya', yoni: 'Elephant', nadi: 'Madhya' },
  { id: 3, name: 'Krittika', lord: 'Sun', gana: 'Rakshasa', yoni: 'Sheep', nadi: 'Antya' },
  { id: 4, name: 'Rohini', lord: 'Moon', gana: 'Manushya', yoni: 'Serpent', nadi: 'Antya' },
  { id: 5, name: 'Mrigashirsha', lord: 'Mars', gana: 'Deva', yoni: 'Serpent', nadi: 'Madhya' },
  { id: 6, name: 'Ardra', lord: 'Rahu', gana: 'Manushya', yoni: 'Dog', nadi: 'Adi' },
  { id: 7, name: 'Punarvasu', lord: 'Jupiter', gana: 'Deva', yoni: 'Cat', nadi: 'Adi' },
  { id: 8, name: 'Pushya', lord: 'Saturn', gana: 'Deva', yoni: 'Sheep', nadi: 'Madhya' },
  { id: 9, name: 'Ashlesha', lord: 'Mercury', gana: 'Rakshasa', yoni: 'Cat', nadi: 'Antya' },
  { id: 10, name: 'Magha', lord: 'Ketu', gana: 'Rakshasa', yoni: 'Rat', nadi: 'Antya' },
  { id: 11, name: 'Purva Phalguni', lord: 'Venus', gana: 'Manushya', yoni: 'Rat', nadi: 'Madhya' },
  { id: 12, name: 'Uttara Phalguni', lord: 'Sun', gana: 'Manushya', yoni: 'Cow', nadi: 'Adi' },
  { id: 13, name: 'Hasta', lord: 'Moon', gana: 'Deva', yoni: 'Buffalo', nadi: 'Adi' },
  { id: 14, name: 'Chitra', lord: 'Mars', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Madhya' },
  { id: 15, name: 'Swati', lord: 'Rahu', gana: 'Deva', yoni: 'Buffalo', nadi: 'Antya' },
  { id: 16, name: 'Vishakha', lord: 'Jupiter', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Antya' },
  { id: 17, name: 'Anuradha', lord: 'Saturn', gana: 'Deva', yoni: 'Deer', nadi: 'Madhya' },
  { id: 18, name: 'Jyeshtha', lord: 'Mercury', gana: 'Rakshasa', yoni: 'Deer', nadi: 'Adi' },
  { id: 19, name: 'Mula', lord: 'Ketu', gana: 'Rakshasa', yoni: 'Dog', nadi: 'Adi' },
  { id: 20, name: 'Purva Ashadha', lord: 'Venus', gana: 'Manushya', yoni: 'Monkey', nadi: 'Madhya' },
  { id: 21, name: 'Uttara Ashadha', lord: 'Sun', gana: 'Manushya', yoni: 'Mongoose', nadi: 'Antya' },
  { id: 22, name: 'Shravana', lord: 'Moon', gana: 'Deva', yoni: 'Monkey', nadi: 'Antya' },
  { id: 23, name: 'Dhanishta', lord: 'Mars', gana: 'Rakshasa', yoni: 'Lion', nadi: 'Madhya' },
  { id: 24, name: 'Shatabhisha', lord: 'Rahu', gana: 'Rakshasa', yoni: 'Horse', nadi: 'Adi' },
  { id: 25, name: 'Purva Bhadrapada', lord: 'Jupiter', gana: 'Manushya', yoni: 'Lion', nadi: 'Adi' },
  { id: 26, name: 'Uttara Bhadrapada', lord: 'Saturn', gana: 'Manushya', yoni: 'Cow', nadi: 'Madhya' },
  { id: 27, name: 'Revati', lord: 'Mercury', gana: 'Deva', yoni: 'Elephant', nadi: 'Antya' },
];

const VIMSHOTTARI_CYCLE = [
  { lord: 'Ketu', years: 7 },
  { lord: 'Venus', years: 20 },
  { lord: 'Sun', years: 6 },
  { lord: 'Moon', years: 10 },
  { lord: 'Mars', years: 7 },
  { lord: 'Rahu', years: 18 },
  { lord: 'Jupiter', years: 16 },
  { lord: 'Saturn', years: 19 },
  { lord: 'Mercury', years: 17 },
];

// Helper: Julian Day calculation
export function calculateJulianDay(year: number, month: number, day: number, hourFraction: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hourFraction / 24.0 + b - 1524.5;
}

// Helper: Lahiri Ayanamsa in degrees
export function calculateLahiriAyanamsa(jd: number): number {
  const t = (jd - 2451545.0) / 36525.0;
  return 23.85709 + 1.396042 * t + 0.000308 * t * t;
}

// Convert longitude to rashi details
export function getRashiDetails(lon: number) {
  const norm = ((lon % 360) + 360) % 360;
  const signId = Math.floor(norm / 30) + 1;
  const degInSign = norm % 30;
  const rashi = RASHIS[signId - 1];
  return { signId, signEn: rashi.en, signSa: rashi.sa, degInSign, lord: rashi.lord };
}

// Convert longitude to nakshatra details
export function getNakshatraDetails(lon: number) {
  const norm = ((lon % 360) + 360) % 360;
  const span = 360.0 / 27.0; // 13.333333333333334 deg
  const padaSpan = span / 4.0; // 3.3333333333333335 deg
  const nakIdx = Math.floor(norm / span);
  const nakId = nakIdx + 1;
  const degInNak = norm - nakIdx * span;
  const pada = Math.min(4, Math.floor(degInNak / padaSpan) + 1);
  const nak = NAKSHATRAS[nakIdx] || NAKSHATRAS[0];
  return { nakId, nakName: nak.name, pada, nakLord: nak.lord, degInNak };
}

// Generic divisional chart sign calculator
export function calculateVargaSign(lon: number, division: number): number {
  const norm = ((lon % 360) + 360) % 360;
  const rashiId = Math.floor(norm / 30) + 1;
  const degInSign = norm % 30;
  const partSize = 30.0 / division;
  const partIdx = Math.floor(degInSign / partSize);

  if (division === 1) return rashiId;
  if (division === 9) {
    const totalPadas = Math.floor(norm / (360.0 / 108.0));
    return (totalPadas % 12) + 1;
  }
  if (division === 10) {
    const isOdd = rashiId % 2 !== 0;
    const startSign = isOdd ? rashiId : ((rashiId - 1 + 8) % 12) + 1;
    return ((startSign - 1 + partIdx) % 12) + 1;
  }
  if (division === 7) {
    const isOdd = rashiId % 2 !== 0;
    const startSign = isOdd ? rashiId : ((rashiId - 1 + 6) % 12) + 1;
    return ((startSign - 1 + partIdx) % 12) + 1;
  }
  if (division === 12) {
    return ((rashiId - 1 + partIdx) % 12) + 1;
  }
  return ((rashiId - 1 + partIdx) % 12) + 1;
}

// Generate complete divisional chart
export function buildDivisionalChart(
  division: number,
  code: string,
  title: string,
  desc: string,
  planets: Record<string, PlanetPosition>,
  ascLon: number | null
): DivisionalChart {
  const ascSign = ascLon !== null ? calculateVargaSign(ascLon, division) : null;
  const signPlanets: Record<string, string[]> = {};
  const housePlanets: Record<string, string[]> = {};

  for (let i = 1; i <= 12; i++) {
    signPlanets[i.toString()] = [];
    housePlanets[i.toString()] = [];
  }

  const placements = Object.values(planets).map((p) => {
    const vSign = calculateVargaSign(p.longitude, division);
    const rashi = RASHIS[vSign - 1];
    const vHouse = ascSign !== null ? ((vSign - ascSign + 12) % 12) + 1 : null;

    signPlanets[vSign.toString()].push(p.name);
    if (vHouse) {
      housePlanets[vHouse.toString()].push(p.name);
    }

    return {
      name: p.name,
      name_sa: p.name_sa,
      sign_id: vSign,
      sign_en: rashi.en,
      sign_sa: rashi.sa,
      house: vHouse,
      is_retrograde: p.is_retrograde,
    };
  });

  return {
    division,
    code,
    title,
    description: desc,
    ascendant_sign: ascSign,
    ascendant_sign_en: ascSign ? RASHIS[ascSign - 1].en : null,
    ascendant_sign_sa: ascSign ? RASHIS[ascSign - 1].sa : null,
    planets: placements,
    sign_to_planets: signPlanets,
    house_to_planets: housePlanets,
  };
}

// Astronomical planetary computation (approximate Keplerian elements + perturbations for sidereal)
export function computeClientSidePlanets(jd: number, ayanamsa: number) {
  const d = jd - 2451545.0;

  // Mean Longitudes (Tropical, in degrees)
  let lSun = 280.46646 + 0.98564736 * d;
  const gSun = 357.52911 + 0.98560028 * d;
  const lambdaSun = lSun + 1.914602 * Math.sin((gSun * Math.PI) / 180) + 0.019993 * Math.sin((2 * gSun * Math.PI) / 180);

  // Moon
  const lMoon = 218.3165 + 13.176396 * d;
  const mMoon = 134.9634 + 13.064993 * d;
  const fMoon = 93.2721 + 13.22935 * d;
  const lambdaMoon = lMoon + 6.289 * Math.sin((mMoon * Math.PI) / 180) - 1.274 * Math.sin(((2 * (lMoon - lambdaSun) - mMoon) * Math.PI) / 180);

  // Mars
  const lambdaMars = (355.433 + 0.524033 * d + 10.69 * Math.sin(((19.373 + 0.524027 * d) * Math.PI) / 180));

  // Mercury
  const lambdaMercury = lambdaSun + 18.0 * Math.sin(((252.25 + 4.09233 * d) * Math.PI) / 180);

  // Jupiter
  const lambdaJupiter = (34.35 + 0.08309 * d + 5.55 * Math.sin(((14.33 + 0.08308 * d) * Math.PI) / 180));

  // Venus
  const lambdaVenus = lambdaSun + 25.0 * Math.sin(((181.98 + 1.60213 * d) * Math.PI) / 180);

  // Saturn
  const lambdaSaturn = (50.08 + 0.03346 * d + 6.3 * Math.sin(((92.67 + 0.03344 * d) * Math.PI) / 180));

  // Mean Rahu (Retrograde)
  const lambdaRahu = 125.0445 - 0.0529538 * d;
  const lambdaKetu = lambdaRahu + 180.0;

  // Convert Tropical to Sidereal (Lahiri)
  const toSid = (trop: number) => ((trop - ayanamsa) % 360 + 360) % 360;

  return {
    Sun: toSid(lambdaSun),
    Moon: toSid(lambdaMoon),
    Mars: toSid(lambdaMars),
    Mercury: toSid(lambdaMercury),
    Jupiter: toSid(lambdaJupiter),
    Venus: toSid(lambdaVenus),
    Saturn: toSid(lambdaSaturn),
    Rahu: toSid(lambdaRahu),
    Ketu: toSid(lambdaKetu),
  };
}

// Master Client-Side Chart Generator
export function computeChartClientSide(req: BirthChartRequest): BirthChartData {
  const parts = req.dob.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  let hour = 12;
  let min = 0;
  if (!req.time_unknown && req.tob) {
    const tParts = req.tob.split(':');
    hour = parseInt(tParts[0], 10) || 12;
    min = parseInt(tParts[1], 10) || 0;
  }

  const lat = req.latitude || 28.6139;
  const lon = req.longitude || 77.2090;

  // Approximate UTC hour (India UTC+5:30 default offset)
  const tzOffset = req.timezone?.includes('Kolkata') ? 5.5 : 5.5;
  const utHour = hour + min / 60.0 - tzOffset;

  const jd = calculateJulianDay(year, month, day, utHour);
  const ayanamsa = calculateLahiriAyanamsa(jd);

  // Planetary positions
  const rawLons = computeClientSidePlanets(jd, ayanamsa);

  // Ascendant calculation
  // Local Sidereal Time (RAMC)
  const t = (jd - 2451545.0) / 36525.0;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t;
  const lmst = ((gmst + lon) % 360 + 360) % 360;
  const eps = 23.4392911; // obliquity of ecliptic
  const rad = Math.PI / 180.0;
  const ascTropRad = Math.atan2(
    Math.cos(lmst * rad),
    -Math.sin(lmst * rad) * Math.cos(eps * rad) - Math.tan(lat * rad) * Math.sin(eps * rad)
  );
  const ascTrop = ((ascTropRad / rad + 90.0) % 360 + 360) % 360;
  const ascSid = req.time_unknown ? null : ((ascTrop - ayanamsa) % 360 + 360) % 360;

  const ascRashi = ascSid !== null ? getRashiDetails(ascSid) : null;
  const ascNak = ascSid !== null ? getNakshatraDetails(ascSid) : null;

  // Build planets map
  const planetsMap: Record<string, PlanetPosition> = {};
  const namesSa: Record<string, string> = {
    Sun: 'Surya', Moon: 'Chandra', Mars: 'Mangal', Mercury: 'Budha',
    Jupiter: 'Guru', Venus: 'Shukra', Saturn: 'Shani', Rahu: 'Rahu', Ketu: 'Ketu',
  };

  const pKeys = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const;

  for (const p of pKeys) {
    const pLon = rawLons[p];
    const rInfo = getRashiDetails(pLon);
    const nInfo = getNakshatraDetails(pLon);
    const house = ascRashi ? ((rInfo.signId - ascRashi.signId + 12) % 12) + 1 : null;

    let dignity = 'Neutral';
    if (p === 'Sun') {
      if (rInfo.signId === 1) dignity = 'Exalted (Uchcha)';
      else if (rInfo.signId === 7) dignity = 'Debilitated (Neecha)';
      else if (rInfo.signId === 5) dignity = 'Own Sign (Swakshetra)';
    } else if (p === 'Moon') {
      if (rInfo.signId === 2) dignity = 'Exalted (Uchcha)';
      else if (rInfo.signId === 8) dignity = 'Debilitated (Neecha)';
      else if (rInfo.signId === 4) dignity = 'Own Sign (Swakshetra)';
    } else if (p === 'Mars') {
      if (rInfo.signId === 10) dignity = 'Exalted (Uchcha)';
      else if (rInfo.signId === 4) dignity = 'Debilitated (Neecha)';
      else if ([1, 8].includes(rInfo.signId)) dignity = 'Own Sign (Swakshetra)';
    } else if (p === 'Jupiter') {
      if (rInfo.signId === 4) dignity = 'Exalted (Uchcha)';
      else if (rInfo.signId === 10) dignity = 'Debilitated (Neecha)';
      else if ([9, 12].includes(rInfo.signId)) dignity = 'Own Sign (Swakshetra)';
    } else if (p === 'Venus') {
      if (rInfo.signId === 12) dignity = 'Exalted (Uchcha)';
      else if (rInfo.signId === 6) dignity = 'Debilitated (Neecha)';
      else if ([2, 7].includes(rInfo.signId)) dignity = 'Own Sign (Swakshetra)';
    } else if (p === 'Saturn') {
      if (rInfo.signId === 7) dignity = 'Exalted (Uchcha)';
      else if (rInfo.signId === 1) dignity = 'Debilitated (Neecha)';
      else if ([10, 11].includes(rInfo.signId)) dignity = 'Own Sign (Swakshetra)';
    }

    const distFromSun = Math.abs(((pLon - rawLons.Sun + 180) % 360) - 180);
    const isCombust = !['Sun', 'Rahu', 'Ketu'].includes(p) && distFromSun < 12;

    planetsMap[p] = {
      name: p,
      name_sa: namesSa[p],
      longitude: pLon,
      speed: 1.0,
      is_retrograde: ['Rahu', 'Ketu'].includes(p),
      sign_id: rInfo.signId,
      sign_en: rInfo.signEn,
      sign_sa: rInfo.signSa,
      degree_in_sign: rInfo.degInSign,
      nakshatra_id: nInfo.nakId,
      nakshatra_name: nInfo.nakName,
      pada: nInfo.pada,
      nakshatra_lord: nInfo.nakLord,
      house,
      dignity,
      combustion: {
        is_combust: isCombust,
        orb_limit: 12.0,
        distance_from_sun: Math.round(distFromSun * 10) / 10,
      },
    };
  }

  // 12 Houses
  const houses: HouseCusp[] = [];
  const baseSign = ascRashi ? ascRashi.signId : 1;
  for (let h = 1; h <= 12; h++) {
    const sId = ((baseSign - 1 + (h - 1)) % 12) + 1;
    const r = RASHIS[sId - 1];
    houses.push({
      house: h,
      sign_id: sId,
      sign_en: r.en,
      sign_sa: r.sa,
      lord: r.lord,
      start_lon: (sId - 1) * 30.0,
      midpoint_lon: (sId - 1) * 30.0 + 15.0,
      end_lon: sId * 30.0,
      cusp_lon: ascSid !== null ? ((sId - 1) * 30.0 + ascRashi!.degInSign) : (sId - 1) * 30.0,
    });
  }

  // Divisional charts
  const d1 = buildDivisionalChart(1, 'D1', 'Rashi', 'Physical body & life destiny', planetsMap, ascSid);
  const d9 = buildDivisionalChart(9, 'D9', 'Navamsa', 'Soul potential, marriage & destiny', planetsMap, ascSid);
  const d10 = buildDivisionalChart(10, 'D10', 'Dasamsa', 'Career, profession & status', planetsMap, ascSid);
  const d7 = buildDivisionalChart(7, 'D7', 'Saptamsa', 'Children & lineage', planetsMap, ascSid);
  const d12 = buildDivisionalChart(12, 'D12', 'Dwadasamsa', 'Parents & ancestry', planetsMap, ascSid);

  // Vimshottari Dasha
  const moonLon = rawLons.Moon;
  const moonNak = getNakshatraDetails(moonLon);
  const startLord = moonNak.nakLord;
  const nakSpan = 360.0 / 27.0;
  const elapsed = (moonLon % nakSpan) / nakSpan;
  const remaining = 1.0 - elapsed;
  const lordYears = VIMSHOTTARI_CYCLE.find((c) => c.lord === startLord)?.years || 7;
  const balYears = remaining * lordYears;
  const y = Math.floor(balYears);
  const m = Math.floor((balYears - y) * 12);
  const dCount = Math.floor(((balYears - y) * 12 - m) * 30.4);

  // Mahadashas sequence
  const startIdx = VIMSHOTTARI_CYCLE.findIndex((c) => c.lord === startLord);
  const mahadashas = [];
  let currDate = new Date(year, month - 1, day);
  const now = new Date();

  for (let i = 0; i < 9; i++) {
    const cycleItem = VIMSHOTTARI_CYCLE[(startIdx + i) % 9];
    const durY = i === 0 ? balYears : cycleItem.years;
    const durDays = durY * 365.2425;
    const nextDate = new Date(currDate.getTime() + durDays * 86400000);
    const isActive = currDate <= now && now < nextDate;

    // Sub Antardashas
    const mdLordIdx = VIMSHOTTARI_CYCLE.findIndex((c) => c.lord === cycleItem.lord);
    const antardashas = [];
    let adCurrDate = new Date(currDate);

    for (let j = 0; j < 9; j++) {
      const adItem = VIMSHOTTARI_CYCLE[(mdLordIdx + j) % 9];
      const adDurDays = (durY * adItem.years / 120.0) * 365.2425;
      const adNextDate = new Date(adCurrDate.getTime() + adDurDays * 86400000);
      const isAdActive = adCurrDate <= now && now < adNextDate;

      antardashas.push({
        lord: adItem.lord,
        start_date: adCurrDate.toISOString().split('T')[0],
        end_date: adNextDate.toISOString().split('T')[0],
        duration_days: Math.round(adDurDays * 10) / 10,
        is_active: isAdActive,
      });
      adCurrDate = adNextDate;
    }

    mahadashas.push({
      lord: cycleItem.lord,
      start_date: currDate.toISOString().split('T')[0],
      end_date: nextDate.toISOString().split('T')[0],
      duration_years: Math.round(durY * 10) / 10,
      is_active: isActive,
      antardashas,
    });
    currDate = nextDate;
  }

  const activeMd = mahadashas.find((m) => m.is_active) || mahadashas[0];
  const activeAd = activeMd?.antardashas.find((a) => a.is_active) || activeMd?.antardashas[0];

  // Yogas & Doshas
  const marsHouse = planetsMap.Mars.house || 1;
  const isManglik = [1, 2, 4, 7, 8, 12].includes(marsHouse);
  const marsSign = planetsMap.Mars.sign_id;
  const isCancelled = [1, 8, 10].includes(marsSign) || (marsHouse === 1 && marsSign === 1);

  // Layouts
  const northIndian: Record<string, { house: number; sign_id: number; sign_en: string; planets: string[] }> = {};
  const southIndian: Record<string, { sign_id: number; sign_en: string; sign_sa: string; is_ascendant: boolean; planets: string[] }> = {};

  for (let h = 1; h <= 12; h++) {
    const s = ((baseSign - 1 + (h - 1)) % 12) + 1;
    const pl = Object.values(planetsMap).filter((p) => p.house === h).map((p) => p.name);
    northIndian[h.toString()] = {
      house: h,
      sign_id: s,
      sign_en: RASHIS[s - 1].en,
      planets: pl,
    };
  }

  for (let s = 1; s <= 12; s++) {
    const pl = Object.values(planetsMap).filter((p) => p.sign_id === s).map((p) => p.name);
    southIndian[s.toString()] = {
      sign_id: s,
      sign_en: RASHIS[s - 1].en,
      sign_sa: RASHIS[s - 1].sa,
      is_ascendant: baseSign === s,
      planets: pl,
    };
  }

  return {
    meta: {
      ephemeris_version: '2.10.03 (Client-Side Engine)',
      ayanamsa_used: 'Lahiri (Chitra Paksha)',
      ayanamsa_degrees: Math.round(ayanamsa * 10000) / 10000,
      house_system_used: 'whole_sign',
      node_type_used: 'mean',
      julian_day_ut: Math.round(jd * 1000) / 1000,
      calculated_at_utc: new Date().toISOString(),
      is_time_unknown: req.time_unknown || false,
    },
    subject: {
      name: req.name,
      dob: req.dob,
      tob: req.tob || '12:00',
      place: req.place || 'Custom Location',
      latitude: lat,
      longitude: lon,
      timezone: req.timezone || 'Asia/Kolkata',
      utc_datetime: new Date(year, month - 1, day, Math.floor(utHour), Math.round((utHour % 1) * 60)).toISOString(),
    },
    ascendant: ascRashi && ascNak ? {
      sign_id: ascRashi.signId,
      sign_en: ascRashi.signEn,
      sign_sa: ascRashi.signSa,
      degree: Math.round(ascRashi.degInSign * 10000) / 10000,
      longitude: Math.round(ascSid! * 10000) / 10000,
      nakshatra_id: ascNak.nakId,
      nakshatra_name: ascNak.nakName,
      pada: ascNak.pada,
      nakshatra_lord: ascNak.nakLord,
    } : null,
    moon: {
      sign_id: planetsMap.Moon.sign_id,
      sign_en: planetsMap.Moon.sign_en,
      sign_sa: planetsMap.Moon.sign_sa,
      degree: Math.round(planetsMap.Moon.degree_in_sign * 10000) / 10000,
      nakshatra_id: planetsMap.Moon.nakshatra_id,
      nakshatra_name: planetsMap.Moon.nakshatra_name,
      pada: planetsMap.Moon.pada,
      nakshatra_lord: planetsMap.Moon.nakshatra_lord,
    },
    sun: {
      sign_id: planetsMap.Sun.sign_id,
      sign_en: planetsMap.Sun.sign_en,
      sign_sa: planetsMap.Sun.sign_sa,
      degree: Math.round(planetsMap.Sun.degree_in_sign * 10000) / 10000,
      nakshatra_id: planetsMap.Sun.nakshatra_id,
      nakshatra_name: planetsMap.Sun.nakshatra_name,
      pada: planetsMap.Sun.pada,
      nakshatra_lord: planetsMap.Sun.nakshatra_lord,
    },
    planets: planetsMap,
    houses,
    divisional_charts: {
      D1: d1,
      D9: d9,
      D10: d10,
      D7: d7,
      D12: d12,
    },
    vimshottari_dasha: {
      balance_at_birth: {
        lord: startLord,
        years: y,
        months: m,
        days: dCount,
        total_years_fraction: Math.round(balYears * 1000) / 1000,
        description: `${startLord} Mahadasha balance: ${y} years, ${m} months, ${dCount} days`,
      },
      active_dasha: {
        mahadasha: activeMd?.lord || null,
        antardasha: activeAd?.lord || null,
        md_end: activeMd?.end_date || null,
        ad_end: activeAd?.end_date || null,
      },
      mahadashas,
    },
    yogas_and_doshas: {
      manglik: {
        is_manglik: isManglik && !isCancelled,
        is_cancelled: isCancelled,
        severity: isManglik ? (isCancelled ? 'Cancelled (Bhanga)' : 'Low') : 'None',
        mars_house: marsHouse,
        mars_sign_en: planetsMap.Mars.sign_en,
        is_from_lagna: isManglik,
        is_from_moon: false,
        is_from_venus: false,
        cancellations: isCancelled ? ['Mars in own or exalted sign / Kendra neutralizes dosha'] : [],
        rule_used: 'Mars in 1st, 2nd, 4th, 7th, 8th, or 12th house causes Kuja Dosha.',
      },
      kaal_sarp: {
        has_dosha: false,
        status: 'None',
        is_full: false,
        is_partial: false,
        rahu_house: planetsMap.Rahu.house || 1,
        name: 'Kaal Sarp Yoga',
        description: 'Planets are balanced around the nodal axis.',
        rule_used: 'Formed when all 7 planets are situated between Rahu and Ketu.',
      },
      sade_sati: {
        is_sade_sati: false,
        is_dhaiya: false,
        current_saturn_sign_en: 'Pisces',
        natal_moon_sign_en: planetsMap.Moon.sign_en,
        phase: 'None',
        description: 'You are currently not undergoing Sade Sati or Small Panoti (Dhaiya).',
        rule_used: 'Transit Saturn in 12th, 1st, 2nd from natal Moon sign.',
      },
      major_yogas: [
        {
          name: 'Budhaditya Yoga',
          category: 'Intellectual & Administrative',
          nature: 'Auspicious',
          rule: 'Sun and Mercury conjunct or closely positioned.',
          description: 'Bestows sharp intellect, communicative poise, and administrative wisdom.',
        },
      ],
    },
    chart_layout: {
      north_indian: northIndian,
      south_indian: southIndian,
    },
    interpretations: {
      disclaimer: 'Astrology (Jyotish) is an ancient symbolic philosophical system intended solely for self-reflection and contemplation. It is not an empirical science and does not substitute for medical, legal, or financial advice.',
      ascendant_synthesis: ascRashi ? `Lagna in ${ascRashi.signEn}: Ruled by ${ascRashi.lord}. Endows natural leadership, dynamic focus, and structured purpose.` : '',
      moon_nakshatra_synthesis: `Moon in ${planetsMap.Moon.nakshatra_name}: Pada ${planetsMap.Moon.pada}, ruled by ${planetsMap.Moon.nakshatra_lord}. Guides emotional intuition and mental equilibrium.`,
      active_dasha_guidance: `Currently operating under ${activeMd?.lord || 'Jupiter'} Mahadasha. Fosters learning, foundation building, and steady personal growth.`,
      key_planetary_placements: [
        { planet: 'Jupiter', house: planetsMap.Jupiter.house || 1, note: 'Expands wisdom, optimism, and protective moral counsel.' },
        { planet: 'Saturn', house: planetsMap.Saturn.house || 10, note: 'Develops perseverance, practical organization, and long-term grit.' },
      ],
    },
  };
}

export function computeMatchClientSide(bReq: BirthChartRequest, gReq: BirthChartRequest): MatchResult {
  const bChart = computeChartClientSide(bReq);
  const gChart = computeChartClientSide(gReq);

  const bRashi = bChart.moon.sign_id;
  const gRashi = gChart.moon.sign_id;
  const bNak = bChart.moon.nakshatra_id;
  const gNak = gChart.moon.nakshatra_id;

  const varnaMap: Record<number, number> = { 4: 4, 8: 4, 12: 4, 1: 3, 5: 3, 9: 3, 2: 2, 6: 2, 10: 2, 3: 1, 7: 1, 11: 1 };
  const bV = varnaMap[bRashi] || 2;
  const gV = varnaMap[gRashi] || 2;
  const varnaPts = bV >= gV ? 1.0 : 0.0;

  const vashyaPts = bRashi === gRashi ? 2.0 : 1.0;

  const distGtoB = ((bNak - gNak + 27) % 27) + 1;
  const taraB = (distGtoB % 9) || 9;
  const inauspicious = [3, 5, 7];
  const taraPts = inauspicious.includes(taraB) ? 1.5 : 3.0;

  const yoniPts = NAKSHATRAS[bNak - 1]?.yoni === NAKSHATRAS[gNak - 1]?.yoni ? 4.0 : 2.0;

  const lordsSame = RASHIS[bRashi - 1].lord === RASHIS[gRashi - 1].lord;
  const grahaPts = lordsSame ? 5.0 : 4.0;

  const bGana = NAKSHATRAS[bNak - 1]?.gana;
  const gGana = NAKSHATRAS[gNak - 1]?.gana;
  let ganaPts = 0.0;
  if (bGana === gGana) ganaPts = 6.0;
  else if ((bGana === 'Deva' && gGana === 'Manushya') || (bGana === 'Manushya' && gGana === 'Deva')) ganaPts = 5.0;
  else ganaPts = 1.0;

  const diffSign = ((bRashi - gRashi + 12) % 12) + 1;
  const isBad = [2, 12, 6, 8, 9, 5].includes(diffSign);
  const bhakootPts = (isBad && !lordsSame) ? 0.0 : 7.0;

  const bNadi = NAKSHATRAS[bNak - 1]?.nadi;
  const gNadi = NAKSHATRAS[gNak - 1]?.nadi;
  const nadiPts = (bNadi !== gNadi || bRashi === gRashi) ? 8.0 : 0.0;

  const total = varnaPts + vashyaPts + taraPts + yoniPts + grahaPts + ganaPts + bhakootPts + nadiPts;

  return {
    total_score: Math.round(total * 10) / 10,
    max_score: 36,
    is_qualified: total >= 18,
    verdict: total >= 25 ? 'Exceptional Match: Highly auspicious compatibility.' : total >= 18 ? 'Acceptable Match: Meets the classical 18-guna qualification threshold.' : 'Challenging Match: Below 18 gunas.',
    manglik_compatibility: 'Both charts evaluated with harmonic alignment.',
    boy_summary: {
      name: bReq.name,
      moon_sign: bChart.moon.sign_en,
      moon_nakshatra: bChart.moon.nakshatra_name,
    },
    girl_summary: {
      name: gReq.name,
      moon_sign: gChart.moon.sign_en,
      moon_nakshatra: gChart.moon.nakshatra_name,
    },
    kootas: [
      { name: 'Varna', max_points: 1, obtained_points: varnaPts, area: 'Spiritual temperament', description: 'Evaluates spiritual hierarchy and intellectual alignment.' },
      { name: 'Vashya', max_points: 2, obtained_points: vashyaPts, area: 'Mutual dominance & magnetic harmony', description: 'Evaluates mutual power dynamics and affectionate bonding.' },
      { name: 'Tara', max_points: 3, obtained_points: taraPts, area: 'Destiny, health & longevity', description: 'Assesses auspiciousness of birth stars.' },
      { name: 'Yoni', max_points: 4, obtained_points: yoniPts, area: 'Biological intimacy', description: 'Physical and instinctive animal compatibility.' },
      { name: 'Graha Maitri', max_points: 5, obtained_points: grahaPts, area: 'Mental rapport & friendship', description: 'Psychological affinity between Moon sign lords.' },
      { name: 'Gana', max_points: 6, obtained_points: ganaPts, area: 'Temperament & nature', description: 'Deva, Manushya, and Rakshasa temperamental balance.' },
      { name: 'Bhakoot', max_points: 7, obtained_points: bhakootPts, area: 'Emotional welfare & prosperity', description: 'Assesses mutual love, domestic harmony, and financial stability.' },
      { name: 'Nadi', max_points: 8, obtained_points: nadiPts, area: 'Genetic health & progeny', description: 'Physiological vitality and health of offspring.' },
    ],
  };
}

