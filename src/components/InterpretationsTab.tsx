import React from 'react';
import { BirthChartData } from '../types/astro';
import { BookOpen, AlertCircle, Compass, Moon, Sparkles } from 'lucide-react';

interface Props {
  data: BirthChartData['interpretations'];
}

export const InterpretationsTab: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Prominent Legal & Astrological Disclaimer Banner */}
      <div className="p-4 rounded-xl border border-amber-900/50 bg-amber-950/20 text-amber-200 flex items-start gap-3 shadow">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed space-y-1">
          <span className="font-bold text-amber-300 uppercase tracking-wide block">
            Astrological Guidance Disclaimer
          </span>
          <p className="text-amber-200/90">{data.disclaimer}</p>
        </div>
      </div>

      {/* Ascendant & Moon Synthesis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Ascendant Synthesis */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Compass className="w-5 h-5" />
            <h3 className="font-serif font-bold text-base text-slate-100">
              Ascendant (Lagna) Foundation
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {data.ascendant_synthesis || 'Ascendant synthesis unavailable for approximate birth times.'}
          </p>
        </div>

        {/* Moon Nakshatra & Deity */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow space-y-3">
          <div className="flex items-center gap-2 text-sky-400">
            <Moon className="w-5 h-5" />
            <h3 className="font-serif font-bold text-base text-slate-100">
              Chandra Nakshatra & Inner Nature
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {data.moon_nakshatra_synthesis}
          </p>
        </div>
      </div>

      {/* Active Dasha Guidance */}
      {data.active_dasha_guidance && (
        <div className="p-5 rounded-xl border border-indigo-900/50 bg-gradient-to-r from-indigo-950/30 to-slate-900/60 shadow space-y-3">
          <div className="flex items-center gap-2 text-indigo-300">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="font-serif font-bold text-base text-slate-100">
              Current Planetary Period Guidance
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {data.active_dasha_guidance}
          </p>
        </div>
      )}

      {/* Key Planetary Placements */}
      {data.key_planetary_placements && data.key_planetary_placements.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow space-y-4">
          <div className="flex items-center gap-2 text-slate-200">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif font-bold text-base">Key Bhava Placements</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.key_planetary_placements.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">
                    {item.planet} in House {item.house}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
