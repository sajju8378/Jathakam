import React, { useState, useEffect, useRef } from 'react';
import { BirthChartRequest, GeocodedPlace, AstroSettings } from '../types/astro';
import { MapPin, Clock, Calendar, User, Search, Sparkles, CheckSquare, Square, Info } from 'lucide-react';

interface Props {
  onSubmit: (request: BirthChartRequest) => void;
  settings: AstroSettings;
  loading: boolean;
}

const PRESETS = [
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

export const BirthForm: React.FC<Props> = ({ onSubmit, settings, loading }) => {
  const [name, setName] = useState('Native');
  const [dob, setDob] = useState('1995-10-24');
  const [tob, setTob] = useState('18:30');
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [placeQuery, setPlaceQuery] = useState('New Delhi, Delhi, India');
  const [selectedPlace, setSelectedPlace] = useState<GeocodedPlace>({
    display_name: 'New Delhi, Delhi, India',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
  });

  const [placeResults, setPlaceResults] = useState<GeocodedPlace[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [consentGiven, setConsentGiven] = useState(true);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPlaceQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (val.trim().length >= 2) {
      setIsSearchingPlaces(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/v1/geocode?q=${encodeURIComponent(val)}`);
          if (res.ok) {
            const data = await res.json();
            setPlaceResults(data.results || []);
            setShowDropdown(true);
          }
        } catch (err) {
          console.error('Geocode search failed', err);
        } finally {
          setIsSearchingPlaces(false);
        }
      }, 350);
    } else {
      setPlaceResults([]);
      setShowDropdown(false);
    }
  };

  const selectPlace = (place: GeocodedPlace) => {
    setSelectedPlace(place);
    setPlaceQuery(place.display_name);
    setShowDropdown(false);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setName(preset.name);
    setDob(preset.dob);
    setTob(preset.tob);
    setTimeUnknown(false);
    setPlaceQuery(preset.place);
    setSelectedPlace({
      display_name: preset.place,
      city: preset.place.split(',')[0],
      country: 'India',
      latitude: preset.latitude,
      longitude: preset.longitude,
      timezone: preset.timezone,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      alert('Consent is required under the India DPDP Act 2023 to compute your horoscope.');
      return;
    }

    onSubmit({
      name,
      dob,
      tob: timeUnknown ? null : tob,
      place: selectedPlace.display_name,
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
      timezone: selectedPlace.timezone,
      time_unknown: timeUnknown,
      settings,
      consent_given: consentGiven,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-amber-500/20 bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Vedic Birth Chart (Kundli)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Computed with Swiss Ephemeris • Lahiri Sidereal Zodiac • Whole Sign Bhavas
          </p>
        </div>

        {/* Quick Presets Dropdown/Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-500 font-medium">Test Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
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
                onFocus={() => placeResults.length > 0 && setShowDropdown(true)}
                className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                placeholder="Search city / town..."
                required
              />
              <Search className="w-4 h-4 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Geocode Results Dropdown */}
            {showDropdown && placeResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-slate-800 bg-slate-950 shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-800">
                {placeResults.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectPlace(p)}
                    className="w-full px-3 py-2.5 text-left text-xs text-slate-300 hover:bg-slate-900 transition-colors cursor-pointer flex flex-col"
                  >
                    <span className="font-semibold text-slate-100">{p.display_name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {p.latitude.toFixed(2)}°N, {p.longitude.toFixed(2)}°E • {p.timezone}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Coordinates & Timezone Info Pill */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-4 font-mono">
            <span>Lat: <b className="text-slate-200">{selectedPlace.latitude.toFixed(4)}°</b></span>
            <span>Lon: <b className="text-slate-200">{selectedPlace.longitude.toFixed(4)}°</b></span>
            <span>TZ: <b className="text-amber-300 font-sans">{selectedPlace.timezone}</b></span>
          </div>

          <div className="text-[11px] text-slate-500">
            Ayanamsa: <b className="text-amber-400 capitalize">{settings.ayanamsa}</b> • House: <b className="text-slate-300 capitalize">{settings.house_system.replace('_', ' ')}</b>
          </div>
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
