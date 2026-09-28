import { GeocodedPlace } from '../types/astro';
import { searchCitiesLocally, POPULAR_CITIES } from './cities';

/**
 * Universal client-side & backend geocoding service.
 * Supports instant offline local match + Open-Meteo Global Geocoding API + Nominatim fallback.
 * Works seamlessly in both static environments (GitHub Pages) and full-stack servers.
 */

// Cache for geocoding queries
const GEOCODE_CACHE = new Map<string, GeocodedPlace[]>();

export async function searchPlacesGlobally(query: string): Promise<GeocodedPlace[]> {
  const cleanQ = query.trim();
  if (!cleanQ || cleanQ.length < 2) {
    return searchCitiesLocally(cleanQ);
  }

  const cacheKey = cleanQ.toLowerCase();
  if (GEOCODE_CACHE.has(cacheKey)) {
    return GEOCODE_CACHE.get(cacheKey)!;
  }

  // 1. Instant local database matches (Telangana, AP, Pan-India, Global)
  const localMatches = searchCitiesLocally(cleanQ);

  // Check aliases / spelling variants (e.g. Korutla <-> Koratla, Metpally <-> Metpalli)
  const variants: string[] = [cleanQ];
  const lowerQ = cleanQ.toLowerCase();
  if (lowerQ.includes('korutla')) variants.push('koratla');
  if (lowerQ.includes('koratla')) variants.push('korutla');
  if (lowerQ.includes('metpally')) variants.push('metpalli');
  if (lowerQ.includes('metpalli')) variants.push('metpally');
  if (lowerQ.includes('jagtiyal')) variants.push('jagtial');
  if (lowerQ.includes('jagtial')) variants.push('jagtiyal');

  const remoteResults: GeocodedPlace[] = [];

  // 2. Fetch from Open-Meteo Geocoding API (Ultra-fast, CORS-enabled, no API key required, global towns/villages)
  try {
    const fetchPromises = variants.slice(0, 2).map(async (v) => {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(v)}&count=8&language=en&format=json`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2200);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.results || !Array.isArray(data.results)) return [];

      return data.results.map((r: any): GeocodedPlace => {
        const parts: string[] = [r.name];
        if (r.admin2 && r.admin2 !== r.name) parts.push(r.admin2);
        if (r.admin1 && r.admin1 !== r.name) parts.push(r.admin1);
        if (r.country) parts.push(r.country);

        return {
          display_name: parts.join(', '),
          city: r.name,
          state: r.admin1 || '',
          country: r.country || 'India',
          latitude: Math.round(r.latitude * 10000) / 10000,
          longitude: Math.round(r.longitude * 10000) / 10000,
          timezone: r.timezone || (r.country_code === 'IN' || r.country === 'India' ? 'Asia/Kolkata' : 'UTC'),
        };
      });
    });

    const settled = await Promise.allSettled(fetchPromises);
    for (const item of settled) {
      if (item.status === 'fulfilled' && Array.isArray(item.value)) {
        remoteResults.push(...item.value);
      }
    }
  } catch (err) {
    console.debug('Open-Meteo geocoding error or timeout:', err);
  }

  // 3. Fallback to OpenStreetMap Nominatim if remoteResults is still empty
  if (remoteResults.length === 0) {
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQ)}&format=json&limit=6&addressdetails=1`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const nomRes = await fetch(nomUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (nomRes.ok) {
        const nomData = await nomRes.json();
        if (Array.isArray(nomData)) {
          for (const item of nomData) {
            const addr = item.address || {};
            const cityName = addr.town || addr.city || addr.village || addr.municipality || item.name;
            remoteResults.push({
              display_name: item.display_name,
              city: cityName || item.name,
              state: addr.state || '',
              country: addr.country || 'India',
              latitude: Math.round(parseFloat(item.lat) * 10000) / 10000,
              longitude: Math.round(parseFloat(item.lon) * 10000) / 10000,
              timezone: addr.country === 'India' || !addr.country ? 'Asia/Kolkata' : 'UTC',
            });
          }
        }
      }
    } catch {
      // Ignore network errors on Nominatim
    }
  }

  // 4. Merge Local + Remote, prioritizing exact matches and deduplicating by coordinates (0.05 deg ~ 5km)
  const combined = [...localMatches, ...remoteResults];
  const uniqueList: GeocodedPlace[] = [];

  for (const place of combined) {
    const isDuplicate = uniqueList.some(
      (u) =>
        Math.abs(u.latitude - place.latitude) < 0.05 &&
        Math.abs(u.longitude - place.longitude) < 0.05
    );
    if (!isDuplicate) {
      uniqueList.push(place);
    }
  }

  // Store in cache (limit cache size to 50 entries)
  if (GEOCODE_CACHE.size > 50) {
    GEOCODE_CACHE.clear();
  }
  GEOCODE_CACHE.set(cacheKey, uniqueList);

  return uniqueList;
}

/**
 * Resolves a typed place name to coordinates even if user didn't click dropdown item.
 */
export async function resolvePlaceCoordinates(rawQuery: string): Promise<GeocodedPlace> {
  const q = rawQuery.trim();
  if (!q) {
    return POPULAR_CITIES[0];
  }

  const results = await searchPlacesGlobally(q);
  if (results.length > 0) {
    return results[0];
  }

  // Default fallback if completely unrecognized
  return {
    display_name: `${q}, India`,
    city: q,
    country: 'India',
    latitude: 18.8257, // Default central Deccan / Telangana coordinate or Delhi
    longitude: 78.7116,
    timezone: 'Asia/Kolkata',
  };
}
