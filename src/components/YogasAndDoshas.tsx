import React from 'react';
import { BirthChartData } from '../types/astro';
import { ShieldCheck, AlertTriangle, Sparkles, Compass, CheckCircle2, Info } from 'lucide-react';

interface Props {
  data: BirthChartData['yogas_and_doshas'];
}

export const YogasAndDoshasView: React.FC<Props> = ({ data }) => {
  const { manglik, kaal_sarp, sade_sati, major_yogas } = data;

  return (
    <div className="space-y-6">
      {/* 3 Core Doshas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Manglik Dosha Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Kuja Dosha
              </span>
              {manglik.is_manglik ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800/60">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Manglik ({manglik.severity})
                </span>
              ) : manglik.is_cancelled ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Cancelled (Bhanga)
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Non-Manglik
                </span>
              )}
            </div>

            <h3 className="font-serif text-lg font-bold text-slate-100 mb-2">
              Manglik Analysis
            </h3>

            <p className="text-xs text-slate-400 mb-3">
              {manglik.mars_house ? `Mars placed in House ${manglik.mars_house} (${manglik.mars_sign_en})` : 'Calculated relative to chart reference points'}
            </p>

            <div className="space-y-1.5 text-xs text-slate-300 mb-4">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>From Lagna:</span>
                <span className={manglik.is_from_lagna ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
                  {manglik.is_from_lagna ? 'Yes (H' + manglik.mars_house + ')' : 'No'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>From Moon:</span>
                <span className={manglik.is_from_moon ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
                  {manglik.is_from_moon ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>From Venus:</span>
                <span className={manglik.is_from_venus ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
                  {manglik.is_from_venus ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {/* Cancellations list */}
            {manglik.cancellations && manglik.cancellations.length > 0 && (
              <div className="mt-3 p-2.5 rounded bg-emerald-950/20 border border-emerald-900/40 text-[11px] text-emerald-300 space-y-1">
                <span className="font-semibold block text-emerald-400">Cancellations Applied:</span>
                {manglik.cancellations.map((c, i) => (
                  <p key={i} className="leading-snug">• {c}</p>
                ))}
              </div>
            )}
          </div>

          <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-800/60">
            Rule: {manglik.rule_used}
          </p>
        </div>

        {/* 2. Kaal Sarp Dosha Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Nodal Axis
              </span>
              {kaal_sarp.has_dosha ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800/60">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {kaal_sarp.is_full ? 'Purna (Full)' : 'Ardh (Partial)'}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  No Kaal Sarp
                </span>
              )}
            </div>

            <h3 className="font-serif text-lg font-bold text-slate-100 mb-2">
              Kaal Sarp Yoga
            </h3>

            <p className="text-sm font-medium text-amber-400 mb-2">
              {kaal_sarp.status}
            </p>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {kaal_sarp.description}
            </p>

            <div className="p-2.5 rounded bg-slate-800/40 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Rahu Station:</span>
                <span className="font-mono text-slate-200">House {kaal_sarp.rahu_house}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Ketu Station:</span>
                <span className="font-mono text-slate-200">
                  House {((kaal_sarp.rahu_house + 5) % 12) + 1}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-800/60">
            Rule: {kaal_sarp.rule_used}
          </p>
        </div>

        {/* 3. Sade Sati & Dhaiya Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Saturn Transit
              </span>
              {sade_sati.is_sade_sati ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                  <Compass className="w-3 h-3 mr-1" />
                  Sade Sati Active
                </span>
              ) : sade_sati.is_dhaiya ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-950 text-purple-300 border border-purple-800/60">
                  <Compass className="w-3 h-3 mr-1" />
                  Dhaiya Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  No Sade Sati
                </span>
              )}
            </div>

            <h3 className="font-serif text-lg font-bold text-slate-100 mb-1">
              Shani Sade Sati
            </h3>

            <p className="text-xs text-indigo-300 font-medium mb-3">
              Phase: {sade_sati.phase}
            </p>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {sade_sati.description}
            </p>

            <div className="p-2.5 rounded bg-slate-800/40 text-xs text-slate-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Natal Moon Sign:</span>
                <span className="text-slate-200">{sade_sati.natal_moon_sign_en}</span>
              </div>
              <div className="flex justify-between">
                <span>Transit Saturn (Now):</span>
                <span className="text-amber-300">{sade_sati.current_saturn_sign_en}</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-800/60">
            Rule: {sade_sati.rule_used}
          </p>
        </div>
      </div>

      {/* Auspicious Major Yogas Section */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif text-base font-bold text-slate-100">
              Auspicious Astrological Yogas Present
            </h3>
          </div>
          <span className="text-xs font-medium text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800/40">
            {major_yogas.length} Yogas Detected
          </span>
        </div>

        {major_yogas.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            No standard major yogas met strict classical criteria in this chart.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {major_yogas.map((yoga, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-amber-600/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-semibold text-sm text-amber-300">{yoga.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                    {yoga.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  {yoga.description}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                  <Info className="w-3 h-3 text-slate-600" />
                  <span>Rule: {yoga.rule}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
