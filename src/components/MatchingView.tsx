import React, { useState } from 'react';
import { MatchResult, BirthChartRequest } from '../types/astro';
import { Heart, Users, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface Props {
  currentChartRequest?: BirthChartRequest;
}

export const MatchingView: React.FC<Props> = ({ currentChartRequest }) => {
  const [boy, setBoy] = useState<BirthChartRequest>({
    name: 'Groom',
    dob: '1992-04-14',
    tob: '09:30',
    place: 'New Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
    consent_given: true,
  });

  const [girl, setGirl] = useState<BirthChartRequest>({
    name: 'Bride',
    dob: '1994-08-20',
    tob: '15:45',
    place: 'Mumbai',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata',
    consent_given: true,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/v1/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boy_chart: boy, girl_chart: girl })
      });
      if (!res.ok) {
        throw new Error(`Match calculation failed (${res.status})`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error computing compatibility');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentAsBoy = () => {
    if (currentChartRequest) {
      setBoy({ ...currentChartRequest, name: currentChartRequest.name || 'Groom' });
    }
  };

  const loadCurrentAsGirl = () => {
    if (currentChartRequest) {
      setGirl({ ...currentChartRequest, name: currentChartRequest.name || 'Bride' });
    }
  };

  const applyPairAndMatch = async (b: BirthChartRequest, g: BirthChartRequest) => {
    setBoy(b);
    setGirl(g);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/v1/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boy_chart: b, girl_chart: g })
      });
      if (!res.ok) {
        throw new Error(`Match calculation failed (${res.status})`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error computing compatibility');
    } finally {
      setLoading(false);
    }
  };

  const SAMPLE_PAIRS = [
    {
      label: 'Sample: Favorable Match (28+ Gunas)',
      boy: { name: 'Aarav (Groom)', dob: '1992-04-14', tob: '09:30', place: 'New Delhi', latitude: 28.6139, longitude: 77.2090, timezone: 'Asia/Kolkata', consent_given: true },
      girl: { name: 'Ananya (Bride)', dob: '1994-08-20', tob: '15:45', place: 'Mumbai', latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata', consent_given: true }
    },
    {
      label: 'Sample: Traditional Match (Kolkata & Varanasi)',
      boy: { name: 'Vikram', dob: '1990-11-05', tob: '06:15', place: 'Kolkata', latitude: 22.5726, longitude: 88.3639, timezone: 'Asia/Kolkata', consent_given: true },
      girl: { name: 'Pooja', dob: '1993-02-18', tob: '11:20', place: 'Varanasi', latitude: 25.3176, longitude: 82.9739, timezone: 'Asia/Kolkata', consent_given: true }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Sample Pairs Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200">
            One-Click Matching Samples (Auto-enters values & matches):
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SAMPLE_PAIRS.map((pair, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPairAndMatch(pair.boy, pair.girl)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 transition-all font-medium cursor-pointer"
            >
              {pair.label}
            </button>
          ))}
        </div>
      </div>

      {/* Forms Section: Boy & Girl Birth Details */}
      <form onSubmit={handleMatch} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Boy's Details */}
          <div className="p-5 rounded-xl border border-sky-950/60 bg-sky-950/20 shadow space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-sky-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                Boy's Birth Details (Var)
              </h3>
              {currentChartRequest && (
                <button
                  type="button"
                  onClick={loadCurrentAsBoy}
                  className="text-[11px] px-2 py-0.5 rounded bg-sky-900/50 hover:bg-sky-900 text-sky-200 border border-sky-700/50"
                >
                  Use Current Chart
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Name</label>
                <input
                  type="text"
                  value={boy.name}
                  onChange={(e) => setBoy({ ...boy, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Place</label>
                <input
                  type="text"
                  value={boy.place || ''}
                  onChange={(e) => setBoy({ ...boy, place: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={boy.dob}
                  onChange={(e) => setBoy({ ...boy, dob: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Time of Birth</label>
                <input
                  type="time"
                  value={boy.tob || ''}
                  onChange={(e) => setBoy({ ...boy, tob: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Girl's Details */}
          <div className="p-5 rounded-xl border border-rose-950/60 bg-rose-950/20 shadow space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-rose-300 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                Girl's Birth Details (Kanya)
              </h3>
              {currentChartRequest && (
                <button
                  type="button"
                  onClick={loadCurrentAsGirl}
                  className="text-[11px] px-2 py-0.5 rounded bg-rose-900/50 hover:bg-rose-900 text-rose-200 border border-rose-700/50"
                >
                  Use Current Chart
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Name</label>
                <input
                  type="text"
                  value={girl.name}
                  onChange={(e) => setGirl({ ...girl, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Place</label>
                <input
                  type="text"
                  value={girl.place || ''}
                  onChange={(e) => setGirl({ ...girl, place: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={girl.dob}
                  onChange={(e) => setGirl({ ...girl, dob: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Time of Birth</label>
                <input
                  type="time"
                  value={girl.tob || ''}
                  onChange={(e) => setGirl({ ...girl, tob: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Match Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? 'Evaluating Ashtakoota 36 Gunas...' : 'Calculate Kundli Milan (36 Gunas)'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl border border-rose-900/50 bg-rose-950/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6 pt-4 border-t border-slate-800">
          {/* Main Score Hero Card */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 shadow text-center space-y-4">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block">
              Ashtakoota Milan Compatibility Score
            </span>

            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-black font-serif text-amber-400">
                {result.total_score}
              </span>
              <span className="text-2xl text-slate-500 font-light">/ {result.max_score} Gunas</span>
            </div>

            {/* Score Progress Meter */}
            <div className="max-w-md mx-auto w-full bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  result.total_score >= 21
                    ? 'bg-emerald-400'
                    : result.total_score >= 18
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${(result.total_score / result.max_score) * 100}%` }}
              />
            </div>

            {/* Verdict Badge */}
            <div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  result.is_qualified
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {result.is_qualified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                )}
                {result.verdict}
              </span>
            </div>

            {/* Summaries & Manglik */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-3 border-t border-slate-800/80 text-xs">
              <div className="p-2.5 rounded bg-slate-950">
                <span className="text-slate-500 block">Groom ({result.boy_summary.name})</span>
                <span className="font-semibold text-slate-200">
                  {result.boy_summary.moon_sign} • {result.boy_summary.moon_nakshatra}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-950">
                <span className="text-slate-500 block">Bride ({result.girl_summary.name})</span>
                <span className="font-semibold text-slate-200">
                  {result.girl_summary.moon_sign} • {result.girl_summary.moon_nakshatra}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-950">
                <span className="text-slate-500 block">Manglik Compatibility</span>
                <span className="font-semibold text-amber-300">
                  {result.manglik_compatibility}
                </span>
              </div>
            </div>
          </div>

          {/* 8 Koota Breakdown Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Koota</th>
                  <th className="py-3 px-4 font-semibold">Life Area</th>
                  <th className="py-3 px-4 font-semibold text-center">Max Pts</th>
                  <th className="py-3 px-4 font-semibold text-center">Score</th>
                  <th className="py-3 px-4 font-semibold">Astrological Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {result.kootas.map((k) => (
                  <tr key={k.name} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-100">{k.name}</td>
                    <td className="py-3 px-4 text-slate-400">{k.area}</td>
                    <td className="py-3 px-4 text-center font-mono">{k.max_points}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      <span
                        className={
                          k.obtained_points === k.max_points
                            ? 'text-emerald-400'
                            : k.obtained_points > 0
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                      >
                        {k.obtained_points}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-xs leading-relaxed">
                      {k.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
