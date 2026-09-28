import React from 'react';
import { Sparkles, Settings, ShieldCheck, Sun, Heart, PlusCircle } from 'lucide-react';
import { AstroSettings } from '../types/astro';

interface Props {
  settings: AstroSettings;
  onOpenSettings: () => void;
  onOpenPrivacy: () => void;
  onNewChart: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<Props> = ({
  settings,
  onOpenSettings,
  onOpenPrivacy,
  onNewChart,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-amber-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('chart')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40">
            <Sun className="w-6 h-6 text-slate-950 animate-[spin_60s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
                JyotishVeda
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/30">
                SwissEph 2.10
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans tracking-wide">
              ज्योतिषं वेदानां चक्षुः • Vedic Kundli & Panchang Engine
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onNewChart}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Chart</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('panchang')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'panchang'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Daily Panchang</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matching')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'matching'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Matching (36 Gunas)</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-colors cursor-pointer"
            title="Astrology Settings (Ayanamsa, Houses, Nodes)"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>

          <button
            type="button"
            onClick={onOpenPrivacy}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-xs transition-colors cursor-pointer"
            title="Privacy & India DPDP Act 2023"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
