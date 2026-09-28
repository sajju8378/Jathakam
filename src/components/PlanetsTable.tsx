import React from 'react';
import { PlanetPosition, BirthChartData } from '../types/astro';
import { Flame, ShieldAlert, Sparkles, Orbit } from 'lucide-react';

interface Props {
  chartData: BirthChartData;
  onSelectPlanet?: (planetName: string) => void;
}

const formatDMS = (decimalDeg: number): string => {
  const d = Math.floor(decimalDeg);
  const mFull = (decimalDeg - d) * 60;
  const m = Math.floor(mFull);
  const s = Math.round((mFull - m) * 60);
  return `${d}° ${m.toString().padStart(2, '0')}' ${s.toString().padStart(2, '0')}"`;
};

export const PlanetsTable: React.FC<Props> = ({ chartData, onSelectPlanet }) => {
  const asc = chartData.ascendant;
  const planets = Object.values(chartData.planets);

  const getDignityBadge = (dignity: string) => {
    if (dignity.includes('Exalted')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/60">
          <Sparkles className="w-3 h-3 mr-1" />
          {dignity}
        </span>
      );
    }
    if (dignity.includes('Own') || dignity.includes('Moolatrikona')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-950 text-amber-300 border border-amber-800/60">
          {dignity}
        </span>
      );
    }
    if (dignity.includes('Debilitated')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-950 text-rose-300 border border-rose-800/60">
          <ShieldAlert className="w-3 h-3 mr-1" />
          {dignity}
        </span>
      );
    }
    if (dignity.includes('Friend')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-950 text-blue-300 border border-blue-800/60">
          {dignity}
        </span>
      );
    }
    if (dignity.includes('Enemy')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-950 text-orange-300 border border-orange-800/60">
          {dignity}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800">
        {dignity || 'Neutral'}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-amber-400 border-b border-slate-800">
          <tr>
            <th className="py-3 px-4">Planet (Graha)</th>
            <th className="py-3 px-4">Sign (Rashi)</th>
            <th className="py-3 px-4">Degree in Sign</th>
            <th className="py-3 px-4">Nakshatra & Pada</th>
            <th className="py-3 px-4">House</th>
            <th className="py-3 px-4">Dignity (Avastha)</th>
            <th className="py-3 px-4">Speed / Motion</th>
            <th className="py-3 px-4">Combust</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
          {/* Ascendant (Lagna) Row */}
          {asc && (
            <tr className="bg-amber-950/20 hover:bg-amber-950/30 transition-colors">
              <td className="py-3 px-4 font-sans font-semibold text-amber-300 flex items-center gap-1.5">
                <Orbit className="w-4 h-4 text-amber-400" />
                Lagna (Ascendant)
              </td>
              <td className="py-3 px-4 font-sans">
                {asc.sign_en} <span className="text-slate-500">({asc.sign_sa})</span>
              </td>
              <td className="py-3 px-4 text-amber-200">{formatDMS(asc.degree)}</td>
              <td className="py-3 px-4 font-sans">
                {asc.nakshatra_name} <span className="text-amber-400 font-mono">P{asc.pada}</span>
                <span className="text-slate-500 block text-[10px]">Lord: {asc.nakshatra_lord}</span>
              </td>
              <td className="py-3 px-4 font-bold text-amber-400 font-sans">1st House</td>
              <td className="py-3 px-4 font-sans">
                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-900/50 text-amber-200 border border-amber-700/50">
                  Ascendant Pivot
                </span>
              </td>
              <td className="py-3 px-4 text-slate-400 font-sans">Diurnal East</td>
              <td className="py-3 px-4 text-slate-500 font-sans">—</td>
            </tr>
          )}

          {/* 9 Planets */}
          {planets.map((p) => {
            const isCombust = p.combustion?.is_combust;
            return (
              <tr
                key={p.name}
                onClick={() => onSelectPlanet?.(p.name)}
                className="hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <td className="py-3 px-4 font-sans font-medium text-slate-100 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-200">{p.name}</span>
                  <span className="text-slate-500 text-xs">({p.name_sa})</span>
                </td>
                <td className="py-3 px-4 font-sans">
                  {p.sign_en} <span className="text-slate-500 text-xs">({p.sign_sa})</span>
                </td>
                <td className="py-3 px-4 text-slate-200">{formatDMS(p.degree_in_sign)}</td>
                <td className="py-3 px-4 font-sans">
                  {p.nakshatra_name} <span className="text-amber-400 font-mono">P{p.pada}</span>
                  <span className="text-slate-500 block text-[10px]">Lord: {p.nakshatra_lord}</span>
                </td>
                <td className="py-3 px-4 font-sans font-semibold text-amber-400">
                  {p.house ? `H${p.house}` : '—'}
                </td>
                <td className="py-3 px-4 font-sans">{getDignityBadge(p.dignity)}</td>
                <td className="py-3 px-4 font-sans">
                  {p.is_retrograde ? (
                    <span className="inline-flex items-center text-pink-400 font-semibold">
                      Retrograde (R)
                    </span>
                  ) : (
                    <span className="text-slate-400">Direct</span>
                  )}
                  <span className="text-slate-500 block text-[10px]">
                    {p.speed.toFixed(3)}°/day
                  </span>
                </td>
                <td className="py-3 px-4 font-sans">
                  {isCombust ? (
                    <span className="inline-flex items-center text-xs font-semibold text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800/60">
                      <Flame className="w-3 h-3 mr-1 text-orange-400 animate-pulse" />
                      Combust ({p.combustion?.distance_from_sun}°)
                    </span>
                  ) : (
                    <span className="text-slate-500 text-xs">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
