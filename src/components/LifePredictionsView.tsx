import React, { useState } from 'react';
import { BirthChartData } from '../types/astro';
import { generateLifePredictions, LifeAgePeriod, DashaEraPeriod, PeriodStatus } from '../utils/lifePredictions';
import {
  Sparkles,
  Calendar,
  Clock,
  Briefcase,
  Coins,
  Heart,
  Users,
  Compass,
  Flame,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Star,
  Award,
  Zap,
} from 'lucide-react';

interface Props {
  chartData: BirthChartData;
}

export const LifePredictionsView: React.FC<Props> = ({ chartData }) => {
  const predictions = generateLifePredictions(chartData);

  const [activeFilter, setActiveFilter] = useState<'all' | 'past' | 'present' | 'future'>('all');
  const [viewMode, setViewMode] = useState<'decades' | 'dashaEras'>('decades');
  const [expandedPeriodId, setExpandedPeriodId] = useState<string | null>(
    predictions.currentPhase.id
  );

  const togglePeriod = (id: string) => {
    setExpandedPeriodId(expandedPeriodId === id ? null : id);
  };

  const filteredPeriods = predictions.periods.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.status === activeFilter;
  });

  const filteredEras = predictions.dashaEras.filter((e) => {
    if (activeFilter === 'all') return true;
    return e.status === activeFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Hero: Complete Life Astrology Overview Banner */}
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-indigo-950/40 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Life Astrology Timeline • Birth to 100+ Years</span>
            </div>

            <h2 className="font-serif text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-2">
              <span>{predictions.personName}'s Life Predictions</span>
            </h2>

            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Detailed astrological timeline mapping past experiences, present planetary influences,
              and future life milestones across each 10-year age decade and major Vimshottari Mahadashas.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
                Birth: <b className="text-amber-400">{predictions.birthDate}</b>
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Current Age: <b className="text-sky-300 font-bold">{predictions.currentAgeYears} Years</b>
                {predictions.currentAgeMonths > 0 && ` (${predictions.currentAgeMonths} mos)`}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Active Era: <b className="text-emerald-200">Age {predictions.currentPhase.ageStart}–{predictions.currentPhase.ageEnd}</b>
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-300">
                Active Dasha: <b className="text-indigo-200">{predictions.activeMahadashaLord} / {predictions.activeAntardashaLord}</b>
              </span>
            </div>
          </div>

          {/* Quick Life Stats Counter Cards */}
          <div className="grid grid-cols-3 gap-2.5 shrink-0 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Past</span>
              <span className="text-lg font-bold text-slate-200">{predictions.pastCount}</span>
              <span className="text-[10px] text-slate-500 block">Decades</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-950/50 border border-amber-500/40">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Present</span>
              <span className="text-lg font-bold text-amber-300">Active</span>
              <span className="text-[10px] text-amber-400/80 block">Age {predictions.currentAgeYears}</span>
            </div>
            <div className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/40">
              <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">Future</span>
              <span className="text-lg font-bold text-indigo-300">{predictions.futureCount}</span>
              <span className="text-[10px] text-indigo-400/80 block">Ahead</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle & Status Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 shadow">
        {/* View Mode Selector: 10-Year Decades vs Dasha Eras */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('decades')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'decades'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>10-Year Age Decades (0-10, 10-20...)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('dashaEras')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'dashaEras'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Planetary Mahadasha Cycles</span>
          </button>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-500 mr-1 hidden lg:inline flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Life Periods' },
            { id: 'past', label: 'Previous / Past' },
            { id: 'present', label: 'Present (Active Now)' },
            { id: 'future', label: 'Future Predictions' },
          ].map((tab) => {
            const isSel = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSel
                    ? 'bg-slate-800 text-amber-300 border-amber-500/50 shadow'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: 10-YEAR AGE DECADES TIMELINE */}
      {viewMode === 'decades' && (
        <div className="space-y-4">
          {filteredPeriods.map((period) => {
            const isExpanded = expandedPeriodId === period.id;
            const isCurrent = period.isCurrent;
            const isPast = period.status === 'past';
            const isFuture = period.status === 'future';

            return (
              <div
                key={period.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-lg ${
                  isCurrent
                    ? 'border-amber-500 bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-900 shadow-amber-500/10 ring-2 ring-amber-500/30'
                    : isFuture
                    ? 'border-indigo-900/60 bg-slate-900/70 hover:border-indigo-800'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                {/* Period Header Row */}
                <div
                  onClick={() => togglePeriod(period.id)}
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
                    isCurrent
                      ? 'bg-amber-950/40 hover:bg-amber-950/50'
                      : 'hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Period Status Badge Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border font-mono font-bold ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : isFuture
                          ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold leading-none">Age</span>
                      <span className="text-sm font-extrabold leading-tight">
                        {period.ageStart}-{period.ageEnd}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif font-bold text-base md:text-lg text-slate-100">
                          {period.title}
                        </h3>

                        {/* Status Label Pill */}
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 shadow-sm animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 inline-block" />
                            CURRENT LIFE PERIOD (Age {predictions.currentAgeYears})
                          </span>
                        ) : isPast ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Completed Phase
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">
                            <Sparkles className="w-3 h-3 text-sky-400" />
                            Future Prediction
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-amber-300/80 font-medium">
                        {period.sanskritStage} • Calendar Years:{' '}
                        <b className="text-slate-200">{period.startYear} – {period.endYear}</b>
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-slate-400">
                        <span>Governing Dasha:</span>
                        {period.mahadashasActive.map((lord) => (
                          <span
                            key={lord}
                            className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-semibold"
                          >
                            {lord} Mahadasha
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Toggle expand button */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                      {isExpanded ? 'Hide Details' : 'View Full Prediction'}
                    </span>
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-800/80 space-y-5 animate-in fade-in duration-200">
                    {/* General Period Overview */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                        <Compass className="w-4 h-4" />
                        <span>Core Astrological Theme & Life Trajectory</span>
                      </div>
                      <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                        {period.overview}
                      </p>
                    </div>

                    {/* 4 Pillars Grid: Career, Wealth, Health, Relationships */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Career & Profession */}
                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                        <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-sm">
                          <Briefcase className="w-4 h-4" />
                          <span>Career, Enterprise & Status (Karma)</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {period.careerAndStatus}
                        </p>
                      </div>

                      {/* Wealth & Property */}
                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-serif font-bold text-sm">
                          <Coins className="w-4 h-4" />
                          <span>Wealth, Assets & Finances (Artha)</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {period.wealthAndFinances}
                        </p>
                      </div>

                      {/* Health & Vitality */}
                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                        <div className="flex items-center gap-2 text-rose-400 font-serif font-bold text-sm">
                          <Heart className="w-4 h-4" />
                          <span>Health, Vitality & Longevity (Arogya)</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {period.healthAndVitality}
                        </p>
                      </div>

                      {/* Family & Relationships */}
                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                        <div className="flex items-center gap-2 text-sky-400 font-serif font-bold text-sm">
                          <Users className="w-4 h-4" />
                          <span>Family, Marriage & Social Circle (Kutumba)</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {period.familyAndRelationships}
                        </p>
                      </div>
                    </div>

                    {/* Spiritual & Remedies Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Spiritual Evolution */}
                      <div className="p-4 rounded-xl border border-indigo-900/50 bg-indigo-950/20 space-y-2">
                        <div className="flex items-center gap-2 text-indigo-300 font-serif font-bold text-sm">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <span>Spiritual Growth & Wisdom (Dharma)</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {period.spiritualAndPersonal}
                        </p>
                        <div className="pt-1 text-xs text-indigo-200/90 font-mono">
                          Favorable Milestone Years:{' '}
                          <span className="text-amber-300 font-bold">
                            {period.favorableYears.join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Prescribed Remedies & Chants */}
                      <div className="p-4 rounded-xl border border-amber-900/50 bg-amber-950/20 space-y-2.5">
                        <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm">
                          <Flame className="w-4 h-4 text-amber-400" />
                          <span>Prescribed Vedic Remedies & Daily Guidance</span>
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                          {period.cautionsAndRemedies.map((rem, rIdx) => (
                            <li key={rIdx} className="leading-relaxed">
                              {rem}
                            </li>
                          ))}
                        </ul>

                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            Lucky Color: <b className="text-amber-300">{period.luckyColor}</b>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            Gemstone: <b className="text-sky-300">{period.luckyGem}</b>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: PLANETARY MAHADASHAS CYCLE ERAS */}
      {viewMode === 'dashaEras' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-slate-300 flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
            <p>
              The 120-year Vimshottari Dasha system reflects the astronomical progression of Moon’s
              nakshatra through 9 planetary periods. Below is your sequential timeline from birth to
              advanced age with domain-specific predictions for each ruling planet.
            </p>
          </div>

          <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow">
            {filteredEras.map((era) => {
              const isCurrent = era.isCurrent;
              return (
                <div
                  key={era.lord}
                  className={`p-5 transition-colors ${
                    isCurrent
                      ? 'bg-amber-950/30 border-l-4 border-l-amber-500'
                      : 'hover:bg-slate-850'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shrink-0 ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-800 text-slate-200 border-slate-700'
                        }`}
                      >
                        {era.lord.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-base text-slate-100">
                            {era.theme}
                          </h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                              CURRENTLY RUNNING
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          Period: <b className="text-amber-300">{era.startDate}</b> to{' '}
                          <b className="text-amber-300">{era.endDate}</b> •{' '}
                          <span className="text-sky-300 font-medium">{era.ageSpan}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold self-start md:self-center uppercase text-[10px] tracking-wider ${
                        era.status === 'past'
                          ? 'bg-slate-800 text-slate-400'
                          : era.status === 'present'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-500/40'
                      }`}
                    >
                      {era.status === 'past' ? 'Past Period' : era.status === 'present' ? 'Present Era' : 'Future Era'}
                    </span>
                  </div>

                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-3">
                    {era.prediction}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="font-bold text-amber-300 block mb-0.5">Professional Trajectory</span>
                      <p className="text-slate-400">{era.careerImpact}</p>
                    </div>
                    <div>
                      <span className="font-bold text-rose-300 block mb-0.5">Physical Well-Being</span>
                      <p className="text-slate-400">{era.healthImpact}</p>
                    </div>
                    <div>
                      <span className="font-bold text-sky-300 block mb-0.5">Vedic Remedy</span>
                      <p className="text-slate-400">{era.remedy}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Synthesis & Astrological Counseling Footer Note */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-slate-400 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-300">Vedic Ephemeris & Time Measurement Principle</span>
          <p className="leading-relaxed">
            All periods are calculated via classical Lahiri Chitra Paksha Ayanamsa and exact 120-year
            Vimshottari solar-calendar mathematical cycles. Planetary influences are modified by your
            personal ascendant (Lagna) and natal moon house dispositors.
          </p>
        </div>
      </div>
    </div>
  );
};
