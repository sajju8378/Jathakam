import React, { useState, useEffect } from 'react';
import {
  BirthChartData,
  BirthChartRequest,
  AstroSettings,
  DivisionalChart
} from './types/astro';
import { Header } from './components/Header';
import { BirthForm } from './components/BirthForm';
import { NorthIndianChart } from './components/NorthIndianChart';
import { SouthIndianChart } from './components/SouthIndianChart';
import { PlanetsTable } from './components/PlanetsTable';
import { DashaTimelineView } from './components/DashaTimeline';
import { YogasAndDoshasView } from './components/YogasAndDoshas';
import { InterpretationsTab } from './components/InterpretationsTab';
import { PanchangView } from './components/PanchangView';
import { MatchingView } from './components/MatchingView';
import { LifePredictionsView } from './components/LifePredictionsView';
import { SettingsModal } from './components/SettingsModal';
import { PrivacyModal } from './components/PrivacyModal';
import { exportKundliPDF } from './utils/pdfExport';
import { computeChartClientSide } from './utils/clientAstroEngine';
import { isStaticDeployment, safeFetchWithTimeout } from './utils/environment';
import {
  Sparkles,
  Download,
  Share2,
  SlidersHorizontal,
  Compass,
  Moon,
  Sun,
  Flame,
  Check,
  UserPlus,
  BookOpen
} from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<AstroSettings>({
    ayanamsa: 'lahiri',
    house_system: 'whole_sign',
    node_type: 'mean',
  });

  const [activeTab, setActiveTab] = useState<string>('chart');
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  const [selectedVarga, setSelectedVarga] = useState<string>('D1');
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  const [chartData, setChartData] = useState<BirthChartData | null>(null);
  const [currentRequest, setCurrentRequest] = useState<BirthChartRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Auto-load initial default chart on first mount
  useEffect(() => {
    const defaultReq: BirthChartRequest = {
      name: 'Dr. A.P.J. Abdul Kalam',
      dob: '1931-10-15',
      tob: '01:15',
      place: 'Rameswaram, Tamil Nadu, India',
      latitude: 9.2876,
      longitude: 79.3129,
      timezone: 'Asia/Kolkata',
      time_unknown: false,
      settings: settings,
      consent_given: true,
    };
    handleComputeChart(defaultReq);
  }, []);

  const handleComputeChart = async (req: BirthChartRequest) => {
    setLoading(true);
    setError(null);
    setCurrentRequest(req);

    // If on GitHub Pages or static host, skip network fetch entirely for zero-latency execution
    if (isStaticDeployment()) {
      try {
        const clientData = computeChartClientSide(req);
        setChartData(clientData);
        setActiveTab('chart');
      } catch (clientErr: any) {
        setError(clientErr.message || 'Error computing birth chart');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      const res = await safeFetchWithTimeout(
        `${apiBase}/v1/chart`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req),
        },
        2000
      );

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data: BirthChartData = await res.json();
      setChartData(data);
      setActiveTab('chart');
    } catch (err: any) {
      console.warn('Backend /v1/chart unreachable. Computing client-side...', err);
      try {
        const clientData = computeChartClientSide(req);
        setChartData(clientData);
        setActiveTab('chart');
      } catch (clientErr: any) {
        setError(clientErr.message || 'Error computing birth chart');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = (newSettings: AstroSettings) => {
    setSettings(newSettings);
    if (currentRequest) {
      handleComputeChart({
        ...currentRequest,
        settings: newSettings,
      });
    }
  };

  const handleCopyShareLink = () => {
    if (!currentRequest) return;
    const url = new URL(window.location.href);
    url.searchParams.set('name', currentRequest.name);
    url.searchParams.set('dob', currentRequest.dob);
    if (currentRequest.tob) url.searchParams.set('tob', currentRequest.tob);
    if (currentRequest.place) url.searchParams.set('place', currentRequest.place);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const activeVargaChart: DivisionalChart =
    chartData?.divisional_charts[selectedVarga] ||
    chartData?.divisional_charts['D1'] || {
      division: 1,
      code: 'D1',
      title: 'Rashi',
      description: 'Physical existence',
      planets: [],
      sign_to_planets: {},
      house_to_planets: {},
    };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <Header
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onNewChart={() => {
          setChartData(null);
          setCurrentRequest(null);
          setActiveTab('form');
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error notification banner */}
        {error && (
          <div className="p-4 rounded-xl border border-rose-900/60 bg-rose-950/40 text-rose-300 text-sm flex items-center justify-between shadow-lg">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-xs font-semibold px-2 py-1 rounded bg-rose-900/50 hover:bg-rose-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input Form View (if no chart loaded or explicitly chosen) */}
        {(!chartData || activeTab === 'form') && (
          <div className="py-4">
            <BirthForm
              onSubmit={handleComputeChart}
              settings={settings}
              loading={loading}
              initialRequest={currentRequest}
            />
          </div>
        )}

        {/* Main Chart Loaded View */}
        {chartData && activeTab !== 'form' && (
          <div className="space-y-6">
            {/* Subject Summary Banner */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl font-bold text-amber-400">
                    {chartData.subject.name}
                  </h1>
                  {chartData.meta.is_time_unknown && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
                      Approx 12:00 (Time Unknown)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {chartData.subject.dob} • {chartData.subject.tob || '12:00'} •{' '}
                  {chartData.subject.place} ({chartData.subject.timezone})
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium">
                  {chartData.ascendant && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5" />
                      Lagna: <b>{chartData.ascendant.sign_en}</b> ({chartData.ascendant.degree.toFixed(2)}°)
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700 flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5" />
                    Moon: <b>{chartData.moon.sign_en}</b> ({chartData.moon.nakshatra_name} P{chartData.moon.pada})
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-orange-300 border border-slate-700 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5" />
                    Sun: <b>{chartData.sun.sign_en}</b>
                  </span>
                </div>
              </div>

              {/* Action Buttons: PDF, Share, Settings */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-500/40"
                  title="Enter your own birth details"
                >
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>Enter Your Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportKundliPDF(chartData)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  title="Export Kundli PDF Report"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>PDF Export</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-sky-400" />
                      <span>Share Chart</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer border border-slate-700"
                  title="Astrology Settings"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 overflow-x-auto pb-1">
              {[
                { id: 'chart', label: 'Kundli Charts', icon: Sparkles },
                { id: 'predictions', label: 'Life Predictions (Past • Present • Future)', icon: Compass },
                { id: 'dashas', label: 'Vimshottari Dasha', icon: Moon },
                { id: 'planets', label: 'Planets Table', icon: Sun },
                { id: 'yogas', label: 'Yogas & Doshas', icon: Flame },
                { id: 'interpretations', label: 'Interpretations', icon: BookOpen },
                { id: 'panchang', label: 'Daily Panchang', icon: Sun },
                { id: 'matching', label: 'Kundli Milan (36 Gunas)', icon: Sparkles },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT 1: KUNDLI CHARTS */}
            {activeTab === 'chart' && (
              <div className="space-y-6">
                {/* Chart Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow">
                  {/* Style Toggle: North vs South */}
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setChartStyle('north')}
                      className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        chartStyle === 'north'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      North Indian (Diamond)
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartStyle('south')}
                      className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        chartStyle === 'south'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      South Indian (Square)
                    </button>
                  </div>

                  {/* Divisional Varga Selector */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-slate-500 font-medium mr-1">Varga:</span>
                    {['D1', 'D9', 'D10', 'D7', 'D12'].map((vKey) => (
                      <button
                        key={vKey}
                        type="button"
                        onClick={() => setSelectedVarga(vKey)}
                        className={`px-3 py-1.5 rounded-lg border font-mono transition-colors cursor-pointer ${
                          selectedVarga === vKey
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {vKey}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart Display Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Interactive SVG Chart */}
                  <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
                    <div className="text-center mb-4">
                      <h3 className="font-serif text-lg font-bold text-slate-100">
                        {activeVargaChart.code} — {activeVargaChart.title}
                      </h3>
                      <p className="text-xs text-slate-400">{activeVargaChart.description}</p>
                    </div>

                    {chartStyle === 'north' ? (
                      <NorthIndianChart
                        chart={activeVargaChart}
                        planetsMap={chartData.planets}
                        selectedHouse={selectedHouse}
                        onSelectHouse={(h) => setSelectedHouse(h)}
                        onSelectPlanet={(p) => setSelectedPlanet(p)}
                      />
                    ) : (
                      <SouthIndianChart
                        chart={activeVargaChart}
                        planetsMap={chartData.planets}
                        onSelectPlanet={(p) => setSelectedPlanet(p)}
                      />
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 mt-4">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                        Exalted
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                        Own Sign
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                        Friend / Neutral
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                        Debilitated
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-pink-400 font-bold">(R)</span>
                        Retrograde
                      </span>
                    </div>
                  </div>

                  {/* Side Inspector Panel */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Selected Planet Details */}
                    {selectedPlanet && chartData.planets[selectedPlanet] && (
                      <div className="p-5 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/20 to-slate-900/80 shadow-xl space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif font-bold text-base text-amber-300">
                            {selectedPlanet} ({chartData.planets[selectedPlanet].name_sa})
                          </h4>
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700/60">
                            {chartData.planets[selectedPlanet].dignity}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                          <div>
                            Sign: <b className="text-slate-100">{chartData.planets[selectedPlanet].sign_en}</b>
                          </div>
                          <div>
                            Deg: <b className="text-slate-100">{chartData.planets[selectedPlanet].degree_in_sign.toFixed(2)}°</b>
                          </div>
                          <div>
                            Nakshatra: <b className="text-slate-100">{chartData.planets[selectedPlanet].nakshatra_name}</b>
                          </div>
                          <div>
                            Pada: <b className="text-slate-100">{chartData.planets[selectedPlanet].pada}</b>
                          </div>
                          <div>
                            House: <b className="text-slate-100">{chartData.planets[selectedPlanet].house || '—'}</b>
                          </div>
                          <div>
                            Motion: <b className="text-slate-100">{chartData.planets[selectedPlanet].is_retrograde ? 'Retrograde (R)' : 'Direct'}</b>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick House Cusp Overview */}
                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-3">
                      <h4 className="font-serif font-bold text-sm text-slate-200 flex items-center justify-between">
                        <span>12 Bhava (House) Cusps</span>
                        <span className="text-[11px] text-slate-500 font-sans font-normal">
                          {chartData.meta.house_system_used.replace('_', ' ')}
                        </span>
                      </h4>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 text-xs">
                        {chartData.houses.map((h) => (
                          <div
                            key={h.house}
                            onClick={() => setSelectedHouse(h.house)}
                            className={`py-2 px-2 flex items-center justify-between rounded transition-colors cursor-pointer ${
                              selectedHouse === h.house ? 'bg-amber-950/40 text-amber-200' : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <span className="font-semibold text-slate-300">House {h.house}</span>
                            <span className="text-slate-400">
                              {h.sign_en} ({h.lord})
                            </span>
                            <span className="font-mono text-slate-500">
                              {h.cusp_lon.toFixed(1)}°
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: PLANETS TABLE */}
            {activeTab === 'planets' && (
              <PlanetsTable
                chartData={chartData}
                onSelectPlanet={(p) => {
                  setSelectedPlanet(p);
                  setActiveTab('chart');
                }}
              />
            )}

            {/* TAB CONTENT 2: LIFE PREDICTIONS (PAST, PRESENT, FUTURE) */}
            {activeTab === 'predictions' && (
              <LifePredictionsView chartData={chartData} />
            )}

            {/* TAB CONTENT 3: VIMSHOTTARI DASHA */}
            {activeTab === 'dashas' && (
              <DashaTimelineView timeline={chartData.vimshottari_dasha} />
            )}

            {/* TAB CONTENT 4: YOGAS & DOSHAS */}
            {activeTab === 'yogas' && (
              <YogasAndDoshasView data={chartData.yogas_and_doshas} />
            )}

            {/* TAB CONTENT 5: INTERPRETATIONS */}
            {activeTab === 'interpretations' && (
              <InterpretationsTab data={chartData.interpretations} />
            )}

            {/* TAB CONTENT 6: PANCHANG */}
            {activeTab === 'panchang' && (
              <PanchangView
                initialDate={chartData.subject.dob}
                lat={chartData.subject.latitude}
                lon={chartData.subject.longitude}
                tz={chartData.subject.timezone}
              />
            )}

            {/* TAB CONTENT 7: MATCHING */}
            {activeTab === 'matching' && (
              <MatchingView currentChartRequest={currentRequest || undefined} />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        userName={chartData?.subject.name || 'Native'}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500 space-y-2">
        <p className="font-serif text-slate-400 tracking-wide">
          ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय । मृत्योर्माऽमृतं गमय ॥
        </p>
        <p>
          JyotishVeda Astrology Engine • Powered by Swiss Ephemeris 2.10 (pyswisseph) • Compliant with India DPDP Act 2023.
        </p>
        <p className="text-[11px] text-slate-600 max-w-2xl mx-auto">
          Astrology is traditional belief-based guidance and not a substitute for medical, legal, or financial advice.
        </p>
      </footer>
    </div>
  );
}
