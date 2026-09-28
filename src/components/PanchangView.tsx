import React, { useState, useEffect } from 'react';
import { PanchangData } from '../types/astro';
import { Sun, Moon, Clock, Calendar, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  initialDate?: string;
  lat?: number;
  lon?: number;
  tz?: string;
}

export const PanchangView: React.FC<Props> = ({
  initialDate = new Date().toISOString().split('T')[0],
  lat = 28.6139,
  lon = 77.2090,
  tz = 'Asia/Kolkata'
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPanchang = async (dateStr: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/v1/panchang?date=${dateStr}&lat=${lat}&lon=${lon}&tz=${encodeURIComponent(tz)}`);
      if (!res.ok) {
        throw new Error(`Panchang request failed (${res.status})`);
      }
      const data = await res.json();
      setPanchang(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load panchang');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPanchang(selectedDate);
  }, [selectedDate, lat, lon, tz]);

  return (
    <div className="space-y-6">
      {/* Date Header Controls & Cross-check Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-serif font-bold text-base text-slate-100">
              Vedic Daily Panchang
            </h3>
            <span className="text-xs text-slate-400">
              Coordinates: {lat.toFixed(2)}°N, {lon.toFixed(2)}°E ({tz})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
          />

          {panchang && (
            <div>
              {panchang.computed_locally ? (
                <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  Swiss Ephemeris Local
                </span>
              ) : panchang.cross_check?.status === 'Verified' ? (
                <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Prokerala (Cross-Verified)
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-medium bg-amber-950 text-amber-300 border border-amber-800/60">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  Provider Output
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center text-slate-400 animate-pulse text-sm">
          Calculating planetary transits and astronomical muhurats...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-rose-900/50 bg-rose-950/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {panchang && !loading && (
        <div className="space-y-6">
          {/* Sunrise, Sunset, Vara Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
              <Sun className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wide block">Sunrise</span>
                <span className="text-base font-bold font-mono text-slate-100">{panchang.sunrise}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
              <Moon className="w-8 h-8 text-sky-400 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wide block">Sunset</span>
                <span className="text-base font-bold font-mono text-slate-100">{panchang.sunset}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-indigo-400 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wide block">Vara (Day Lord)</span>
                <span className="text-sm font-bold text-slate-100">{panchang.vara.name}</span>
                <span className="text-[10px] text-slate-400 block font-sans">({panchang.vara.name_sa})</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
              <Clock className="w-8 h-8 text-amber-500 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wide block">Ayanamsa</span>
                <span className="text-xs font-semibold text-amber-300">{panchang.ayanamsa_used}</span>
              </div>
            </div>
          </div>

          {/* 5 Core Limbs of Panchang (Pancha-Anga) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Tithi */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                1. Tithi (Lunar Day)
              </span>
              <div className="text-sm font-semibold text-slate-100">{panchang.tithi.name}</div>
              <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                {panchang.tithi.paksha}
              </span>
              {panchang.tithi.elapsed_percentage !== undefined && (
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{ width: `${panchang.tithi.elapsed_percentage}%` }}
                  />
                </div>
              )}
            </div>

            {/* Nakshatra */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                2. Nakshatra (Constellation)
              </span>
              <div className="text-sm font-semibold text-slate-100">{panchang.nakshatra.name}</div>
              <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                Ruler: {panchang.nakshatra.lord}
              </span>
              {panchang.nakshatra.elapsed_percentage !== undefined && (
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-sky-400 h-full rounded-full"
                    style={{ width: `${panchang.nakshatra.elapsed_percentage}%` }}
                  />
                </div>
              )}
            </div>

            {/* Yoga */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                3. Yoga (Luni-Solar)
              </span>
              <div className="text-sm font-semibold text-slate-100">{panchang.yoga.name}</div>
              <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                Station #{panchang.yoga.id}
              </span>
              {panchang.yoga.elapsed_percentage !== undefined && (
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${panchang.yoga.elapsed_percentage}%` }}
                  />
                </div>
              )}
            </div>

            {/* Karana */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                4. Karana (Half-Tithi)
              </span>
              <div className="text-sm font-semibold text-slate-100">{panchang.karana.name}</div>
              <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                Karana #{panchang.karana.index}
              </span>
            </div>
          </div>

          {/* Muhurats Grid */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow space-y-4">
            <h4 className="font-serif font-bold text-base text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Auspicious & Inauspicious Muhurats (Calculated from Sunrise)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Abhijit */}
              <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Abhijit Muhurat
                </span>
                <span className="text-xs text-emerald-200 block">Highly Auspicious</span>
                <span className="text-sm font-mono font-bold text-slate-100 block mt-1">
                  {panchang.muhurats.abhijit.start} - {panchang.muhurats.abhijit.end}
                </span>
              </div>

              {/* Rahu Kalam */}
              <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
                  Rahu Kalam
                </span>
                <span className="text-xs text-rose-300 block">Inauspicious (Avoid new starts)</span>
                <span className="text-sm font-mono font-bold text-slate-100 block mt-1">
                  {panchang.muhurats.rahu_kalam.start} - {panchang.muhurats.rahu_kalam.end}
                </span>
              </div>

              {/* Yamaganda */}
              <div className="p-4 rounded-lg bg-orange-950/20 border border-orange-900/40 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 block">
                  Yamaganda
                </span>
                <span className="text-xs text-orange-300 block">Challenging Timing</span>
                <span className="text-sm font-mono font-bold text-slate-100 block mt-1">
                  {panchang.muhurats.yamaganda.start} - {panchang.muhurats.yamaganda.end}
                </span>
              </div>

              {/* Gulika Kalam */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Gulika Kalam
                </span>
                <span className="text-xs text-slate-400 block">Routine Actions</span>
                <span className="text-sm font-mono font-bold text-slate-100 block mt-1">
                  {panchang.muhurats.gulika.start} - {panchang.muhurats.gulika.end}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
