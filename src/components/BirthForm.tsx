import React, { useState, useRef, useEffect } from 'react';
import { BirthChartRequest, GeocodedPlace, AstroSettings } from '../types/astro';
import { searchCitiesLocally, POPULAR_CITIES } from '../utils/cities';
import { searchPlacesGlobally, resolvePlaceCoordinates } from '../utils/geocoding';
import { isStaticDeployment } from '../utils/environment';
import {
  MapPin,
  Clock,
  Calendar,
  User,
  Search,
  Sparkles,
  CheckSquare,
  Square,
  Zap,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';

interface Props {
  onSubmit: (request: BirthChartRequest) => void;
  settings: AstroSettings;
  loading: boolean;
  initialRequest?: BirthChartRequest | null;
}

const PRESETS = [
  {
    label: 'Rahul Sharma (Delhi)',
    name: 'Rahul Sharma',
    dob: '1995-10-24',
    tob: '18:30',
    place: 'New Delhi, Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
  },
  {
    label: 'Priya Patel (Mumbai)',
    name: 'Priya Patel',
    dob: '1998-05-12',
    tob: '08:45',
    place: 'Mumbai, Maharashtra, India',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata',
  },
  {
    label: 'Dr. A.P.J. Abdul Kalam',
    name: 'APJ Abdul Kalam',
    dob: '1931-10-15',
    tob: '01:15',
    place: 'Rameswaram, Tamil Nadu, India',
    latitude: 9.2876,
    longitude: 79.3129,
    timezone: 'Asia/Kolkata',
  },
  {
    label: 'Mahatma Gandhi',
    name: 'Mahatma Gandhi',
    dob: '1869-10-02',
    tob: '07:12',
    place: 'Porbandar, Gujarat, India',
    latitude: 21.6417,
    longitude: 69.6293,
    timezone: 'Asia/Kolkata',
  },
  {
    label: 'Swami Vivekananda',
    name: 'Swami Vivekananda',
    dob: '1863-01-12',
    tob: '06:33',
    place: 'Kolkata, West Bengal, India',
    latitude: 22.5726,
    longitude: 88.3639,
    timezone: 'Asia/Kolkata',
  },
  {
    label: 'Indira Gandhi',
    name: 'Indira Gandhi',
    dob: '1917-11-19',
    tob: '23:11',
    place: 'Allahabad, Uttar Pradesh, India',
    latitude: 25.4358,
    longitude: 81.8463,
    timezone: 'Asia/Kolkata',
  },
  {
    label: 'Albert Einstein',
    name: 'Albert Einstein',
    dob: '1879-03-14',
    tob: '11:30',
    place: 'Ulm, Baden-Wurttemberg, Germany',
    latitude: 48.4011,
    longitude: 9.9876,
    timezone: 'Europe/Berlin',
  },
  {
    label: 'New Delhi (Now)',
    name: 'Consultant Native',
    dob: new Date().toISOString().split('T')[0],
    tob: '12:00',
    place: 'New Delhi, Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
  },
];

export const BirthForm: React.FC<Props> = ({ onSubmit, settings, loading, initialRequest }) => {
  const [name, setName] = useState(initialRequest?.name || 'Rahul Sharma');
  const [dob, setDob] = useState(initialRequest?.dob || '1995-10-24');
  const [tob, setTob] = useState(initialRequest?.tob || '18:30');
  const [timeUnknown, setTimeUnknown] = useState(initialRequest?.time_unknown || false);
  const [placeQuery, setPlaceQuery] = useState(initialRequest?.place || 'New Delhi, Delhi, India');
  const [selectedPlace, setSelectedPlace] = useState<GeocodedPlace>({
    display_name: initialRequest?.place || 'New Delhi, Delhi, India',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: initialRequest?.latitude ?? 28.6139,
    longitude: initialRequest?.longitude ?? 77.2090,
    timezone: initialRequest?.timezone || 'Asia/Kolkata',
  });

  const [placeResults, setPlaceResults] = useState<GeocodedPlace[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [consentGiven, setConsentGiven] = useState(true);

  // Manual Coordinates Override for power users entering custom locations
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [customLat, setCustomLat] = useState<string>(
    initialRequest?.latitude ? initialRequest.latitude.toString() : '28.6139'
  );
  const [customLon, setCustomLon] = useState<string>(
    initialRequest?.longitude ? initialRequest.longitude.toString() : '77.2090'
  );
  const [customTz, setCustomTz] = useState<string>(
    initialRequest?.timezone || 'Asia/Kolkata'
  );

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync when initialRequest changes
  useEffect(() => {
    if (initialRequest) {
      if (initialRequest.name) setName(initialRequest.name);
      if (initialRequest.dob) setDob(initialRequest.dob);
      if (initialRequest.tob !== undefined && initialRequest.tob !== null) setTob(initialRequest.tob);
      if (initialRequest.place) {
        setPlaceQuery(initialRequest.place);
        setSelectedPlace({
          display_name: initialRequest.place,
          city: initialRequest.place.split(',')[0],
          country: 'India',
          latitude: initialRequest.latitude ?? 28.6139,
          longitude: initialRequest.longitude ?? 77.2090,
          timezone: initialRequest.timezone || 'Asia/Kolkata',
        });
        if (initialRequest.latitude) setCustomLat(initialRequest.latitude.toString());
        if (initialRequest.longitude) setCustomLon(initialRequest.longitude.toString());
        if (initialRequest.timezone) setCustomTz(initialRequest.timezone);
      }
    }
  }, [initialRequest]);

  const handleClearForm = () => {
    setName('');
    const today = new Date().toISOString().split('T')[0];
    setDob(today);
    setTob('12:00');
    setTimeUnknown(false);
    setPlaceQuery('');
    setSelectedPlace({
      display_name: 'New Delhi, Delhi, India',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 'Asia/Kolkata',
    });
    setPlaceResults([]);
    setShowDropdown(false);
  };

  const handlePlaceFocus = () => {
    if (placeQuery.trim().length >= 1) {
      const matches = searchCitiesLocally(placeQuery);
      setPlaceResults(matches);
    } else {
      setPlaceResults(POPULAR_CITIES.slice(0, 8));
    }
    setShowDropdown(true);
  };

  const handlePlaceBlur = () => {
    // Delay closing so click event on dropdown item registers first
    setTimeout(() => {
      setShowDropdown(false);
      if (placeQuery.trim() && selectedPlace.display_name !== placeQuery) {
        const matches = searchCitiesLocally(placeQuery);
        if (matches.length > 0) {
          selectPlace(matches[0]);
        }
      }
    }, 250);
  };

  const handlePlaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPlaceQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (val.trim().length >= 1) {
      // 1. Instant local database lookup (zero-latency for Korutla, Metpally, and hundreds of towns)
      const localMatches = searchCitiesLocally(val);
      setPlaceResults(localMatches);
      setShowDropdown(true);

      // 2. Global search across all towns & villages (Open-Meteo + Nominatim) with 200ms debounce
      setIsSearchingPlaces(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const globalResults = await searchPlacesGlobally(val);
          if (globalResults.length > 0) {
            setPlaceResults(globalResults);
            setShowDropdown(true);
          } else if (localMatches.length > 0) {
            setPlaceResults(localMatches);
            setShowDropdown(true);
          }
        } catch (err) {
          console.debug('Place search error:', err);
          if (localMatches.length > 0) {
            setPlaceResults(localMatches);
            setShowDropdown(true);
          }
        } finally {
          setIsSearchingPlaces(false);
        }
      }, 200);
    } else {
      setPlaceResults(POPULAR_CITIES.slice(0, 8));
      setShowDropdown(true);
    }
  };

  const selectPlace = (place: GeocodedPlace) => {
    setSelectedPlace(place);
    setPlaceQuery(place.display_name);
    setCustomLat(place.latitude.toString());
    setCustomLon(place.longitude.toString());
    setCustomTz(place.timezone);
    setShowDropdown(false);
  };

  const applyPresetAndCompute = (preset: typeof PRESETS[0]) => {
    setName(preset.name);
    setDob(preset.dob);
    setTob(preset.tob);
    setTimeUnknown(false);
    setPlaceQuery(preset.place);
    setCustomLat(preset.latitude.toString());
    setCustomLon(preset.longitude.toString());
    setCustomTz(preset.timezone);
    const placeObj: GeocodedPlace = {
      display_name: preset.place,
      city: preset.place.split(',')[0],
      country: 'India',
      latitude: preset.latitude,
      longitude: preset.longitude,
      timezone: preset.timezone,
    };
    setSelectedPlace(placeObj);

    // Immediately trigger calculation for instant response
    onSubmit({
      name: preset.name,
      dob: preset.dob,
      tob: preset.tob,
      place: preset.place,
      latitude: preset.latitude,
      longitude: preset.longitude,
      timezone: preset.timezone,
      time_unknown: false,
      settings,
      consent_given: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      alert('Consent is required under the India DPDP Act 2023 to compute your horoscope.');
      return;
    }

    // Resolve coordinates
    let finalLat = selectedPlace.latitude;
    let finalLon = selectedPlace.longitude;
    let finalTz = selectedPlace.timezone || 'Asia/Kolkata';

    if (showManualCoords) {
      const parsedLat = parseFloat(customLat);
      const parsedLon = parseFloat(customLon);
      if (!isNaN(parsedLat)) finalLat = parsedLat;
      if (!isNaN(parsedLon)) finalLon = parsedLon;
      if (customTz.trim()) finalTz = customTz.trim();
    } else if (placeQuery.trim() && selectedPlace.display_name !== placeQuery) {
      // Check if user typed a city without clicking the dropdown item
      const matches = searchCitiesLocally(placeQuery);
      if (matches.length > 0) {
        finalLat = matches[0].latitude;
        finalLon = matches[0].longitude;
        finalTz = matches[0].timezone;
      } else if (placeResults.length > 0) {
        finalLat = placeResults[0].latitude;
        finalLon = placeResults[0].longitude;
        finalTz = placeResults[0].timezone;
      }
    }

    // Safety checks against NaN/undefined
    if (!Number.isFinite(finalLat)) finalLat = 28.6139;
    if (!Number.isFinite(finalLon)) finalLon = 77.2090;

    onSubmit({
      name: name.trim() || 'Native',
      dob,
      tob: timeUnknown ? null : tob,
      place: placeQuery.trim() || selectedPlace.display_name || 'New Delhi, India',
      latitude: finalLat,
      longitude: finalLon,
      timezone: finalTz,
      time_unknown: timeUnknown,
      settings,
      consent_given: consentGiven,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-amber-500/20 bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Vedic Birth Chart (Kundli)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            High-Precision Swiss Ephemeris • Lahiri Sidereal Zodiac • Whole Sign Bhavas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearForm}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            title="Clear all fields to enter your own birth details"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear / Enter Your Own</span>
          </button>

          <button
            type="button"
            onClick={() => applyPresetAndCompute(PRESETS[0])}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Load Sample Profile</span>
          </button>
        </div>
      </div>

      {/* Preset Pill Bar: One click immediately fills and computes! */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Or pick a quick sample profile:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPresetAndCompute(p)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 hover:border-amber-400 transition-all cursor-pointer font-medium"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              required
            />
          </div>

          {/* Time of Birth */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Time of Birth
              </label>
              <button
                type="button"
                onClick={() => setTimeUnknown(!timeUnknown)}
                className="text-[10px] text-amber-400 hover:underline cursor-pointer"
              >
                {timeUnknown ? 'Enter Exact Time' : 'Time Unknown?'}
              </button>
            </div>
            {timeUnknown ? (
              <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-dashed border-slate-700 text-xs text-slate-400">
                12:00 PM (Lagna skipped)
              </div>
            ) : (
              <input
                type="time"
                value={tob}
                onChange={(e) => setTob(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            )}
          </div>

          {/* Place of Birth Autocomplete */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Place of Birth
            </label>
            <div className="relative">
              <input
                type="text"
                value={placeQuery}
                onChange={handlePlaceChange}
                onFocus={handlePlaceFocus}
                onBlur={handlePlaceBlur}
                className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                placeholder="Enter any town (e.g. Korutla, Metpally, Jagtial...)"
                required
              />
              {isSearchingPlaces ? (
                <Loader2 className="w-4 h-4 text-amber-400 absolute right-2.5 top-2.5 animate-spin pointer-events-none" />
              ) : (
                <Search className="w-4 h-4 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
              )}
            </div>

            {/* Quick Town Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px]">
              <span className="text-slate-500 font-medium mr-1">Popular:</span>
              {[
                POPULAR_CITIES[0], // Korutla
                POPULAR_CITIES[1], // Metpally
                POPULAR_CITIES[2], // Jagtial
                POPULAR_CITIES[3], // Karimnagar
                POPULAR_CITIES[4], // Nizamabad
                POPULAR_CITIES[5], // Armoor
                POPULAR_CITIES.find(c => c.city === 'Hyderabad') || POPULAR_CITIES[0],
                POPULAR_CITIES.find(c => c.city === 'New Delhi') || POPULAR_CITIES[0],
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent blur
                    selectPlace(p);
                  }}
                  className={`px-2 py-0.5 rounded-md border text-[11px] transition-colors cursor-pointer ${
                    selectedPlace.city.toLowerCase() === p.city.toLowerCase()
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-300 hover:border-slate-700'
                  }`}
                >
                  {p.city}
                </button>
              ))}
            </div>

            {/* Geocode Results Dropdown */}
            {showDropdown && (placeResults.length > 0 || isSearchingPlaces) && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-slate-800 bg-slate-950 shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-800">
                {isSearchingPlaces && placeResults.length === 0 && (
                  <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Searching global towns and cities...</span>
                  </div>
                )}
                {placeResults.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectPlace(p)}
                    className="w-full px-3 py-2.5 text-left text-xs text-slate-300 hover:bg-slate-900 transition-colors cursor-pointer flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        {p.city}
                      </span>
                      {p.state && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {p.state}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 pl-4">{p.display_name}</span>
                    <span className="text-[10px] text-slate-500 font-mono pl-4">
                      {p.latitude.toFixed(4)}°N, {p.longitude.toFixed(4)}°E • {p.timezone}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <p className="text-[10px] text-slate-500">
              Type any city, town or mandal name. All towns across India and worldwide are supported.
            </p>
          </div>
        </div>

        {/* Selected Coordinates & Timezone Info Pill */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-4 font-mono">
              <span>Lat: <b className="text-slate-200">{Number(showManualCoords ? customLat : selectedPlace.latitude).toFixed(4)}°</b></span>
              <span>Lon: <b className="text-slate-200">{Number(showManualCoords ? customLon : selectedPlace.longitude).toFixed(4)}°</b></span>
              <span>TZ: <b className="text-amber-300 font-sans">{showManualCoords ? customTz : selectedPlace.timezone}</b></span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowManualCoords(!showManualCoords)}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showManualCoords ? 'Hide Custom Coordinates' : 'Edit Exact Coordinates'}</span>
                {showManualCoords ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <div className="text-[11px] text-slate-500 hidden sm:block">
                Ayanamsa: <b className="text-amber-400 capitalize">{settings.ayanamsa}</b> • House: <b className="text-slate-300 capitalize">{settings.house_system.replace('_', ' ')}</b>
              </div>
            </div>
          </div>

          {/* Manual Coordinates Collapsible Fields */}
          {showManualCoords && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Latitude (°N, positive / °S, negative)</label>
                <input
                  type="number"
                  step="any"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  placeholder="e.g. 28.6139"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Longitude (°E, positive / °W, negative)</label>
                <input
                  type="number"
                  step="any"
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  placeholder="e.g. 77.2090"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">IANA Timezone</label>
                <input
                  type="text"
                  value={customTz}
                  onChange={(e) => setCustomTz(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-sans focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Asia/Kolkata"
                />
              </div>
            </div>
          )}
        </div>

        {/* India DPDP Act 2023 Explicit Consent Checkbox */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setConsentGiven(!consentGiven)}
            className="mt-0.5 text-amber-400 cursor-pointer"
          >
            {consentGiven ? (
              <CheckSquare className="w-4 h-4 text-emerald-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-600" />
            )}
          </button>
          <div className="text-slate-400 text-[11px] leading-relaxed">
            <span className="text-slate-300 font-medium">Digital Personal Data Protection (DPDP) Act 2023 Consent:</span>{' '}
            I consent to the ephemeral processing of my birth details solely for astrological computations. No personal birth records are logged or shared with third parties.
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={loading || !consentGiven}
            className="w-full sm:w-auto px-10 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-serif font-bold text-base shadow-xl shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? 'Computing Swiss Ephemeris Kundli...' : 'Generate Vedic Kundli'}
          </button>
        </div>
      </form>
    </div>
  );
};
