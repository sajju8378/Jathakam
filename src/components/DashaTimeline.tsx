import React, { useState } from 'react';
import { DashaTimeline, Mahadasha } from '../types/astro';
import { Clock, ChevronDown, ChevronRight, Sparkles, Calendar } from 'lucide-react';

interface Props {
  timeline: DashaTimeline;
}

export const DashaTimelineView: React.FC<Props> = ({ timeline }) => {
  const [expandedLord, setExpandedLord] = useState<string | null>(
    timeline.active_dasha.mahadasha || timeline.mahadashas[0]?.lord || null
  );

  const toggleLord = (lord: string) => {
    setExpandedLord(expandedLord === lord ? null : lord);
  };

  const balance = timeline.balance_at_birth;
  const active = timeline.active_dasha;

  return (
    <div className="space-y-6">
      {/* Top Cards: Balance at Birth & Current Active Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Balance at Birth Card */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-serif font-semibold text-base">Vimshottari Balance at Birth</h3>
          </div>
          <p className="text-slate-300 text-sm mb-1">{balance.description}</p>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-2">
            <span className="bg-slate-800 px-2 py-1 rounded">Years: <b className="text-amber-300">{balance.years}</b></span>
            <span className="bg-slate-800 px-2 py-1 rounded">Months: <b className="text-amber-300">{balance.months}</b></span>
            <span className="bg-slate-800 px-2 py-1 rounded">Days: <b className="text-amber-300">{balance.days}</b></span>
          </div>
        </div>

        {/* Current Active Dasha Card */}
        <div className="p-4 rounded-xl border border-indigo-900/60 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 shadow">
          <div className="flex items-center gap-2 text-indigo-300 mb-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="font-serif font-semibold text-base">Current Active Period (2026)</h3>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-slate-400 block">Mahadasha</span>
              <span className="text-lg font-bold text-amber-400">{active.mahadasha || '—'}</span>
            </div>
            <div className="text-slate-600 text-xl font-light">/</div>
            <div>
              <span className="text-xs text-slate-400 block">Antardasha</span>
              <span className="text-lg font-bold text-sky-400">{active.antardasha || '—'}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Antardasha ends on: <span className="font-mono text-slate-200">{active.ad_end || '—'}</span> (MD ends:{' '}
            <span className="font-mono text-slate-200">{active.md_end || '—'}</span>)
          </p>
        </div>
      </div>

      {/* 120-Year Mahadasha Accordion */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow">
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h4 className="font-serif font-semibold text-slate-200 flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-amber-400" />
            120-Year Vimshottari Mahadasha & Antardasha Cycle
          </h4>
          <span className="text-xs text-slate-500">Click to expand sub-periods</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {timeline.mahadashas.map((md) => {
            const isExpanded = expandedLord === md.lord;
            return (
              <div key={md.lord} className="transition-colors">
                {/* Mahadasha Header Row */}
                <button
                  type="button"
                  onClick={() => toggleLord(md.lord)}
                  className={`w-full px-5 py-3.5 flex items-center justify-between text-left transition-colors ${
                    md.is_active
                      ? 'bg-amber-950/30 hover:bg-amber-950/40 text-amber-200'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-amber-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                    <div>
                      <span className="font-bold text-sm text-slate-100 mr-2">{md.lord} Mahadasha</span>
                      {md.is_active && (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-amber-500 text-slate-950">
                          Active Now
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs font-mono text-slate-400">
                    <span>
                      {md.start_date} <span className="text-slate-600">→</span> {md.end_date}
                    </span>
                    <span className="bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                      {md.duration_years} yrs
                    </span>
                  </div>
                </button>

                {/* Sub Antardasha Table */}
                {isExpanded && (
                  <div className="px-5 py-3 bg-slate-950/40 border-t border-slate-800/60">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-slate-300">
                        <thead>
                          <tr className="text-slate-500 border-b border-slate-800 pb-1">
                            <th className="py-1.5 font-medium">Antardasha Lord</th>
                            <th className="py-1.5 font-medium">Start Date</th>
                            <th className="py-1.5 font-medium">End Date</th>
                            <th className="py-1.5 font-medium">Duration</th>
                            <th className="py-1.5 font-medium text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 font-mono">
                          {md.antardashas.map((ad) => (
                            <tr
                              key={ad.lord}
                              className={ad.is_active ? 'bg-sky-950/30 text-sky-200' : 'hover:bg-slate-900/40'}
                            >
                              <td className="py-2 font-sans font-medium text-slate-200">
                                {md.lord} - {ad.lord}
                              </td>
                              <td className="py-2 text-slate-400">{ad.start_date}</td>
                              <td className="py-2 text-slate-400">{ad.end_date}</td>
                              <td className="py-2 text-slate-500">{ad.duration_days} days</td>
                              <td className="py-2 text-right">
                                {ad.is_active ? (
                                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500 text-slate-950 font-sans">
                                    Current
                                  </span>
                                ) : (
                                  <span className="text-slate-600 font-sans">—</span>
                                )}
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
          })}
        </div>
      </div>
    </div>
  );
};
