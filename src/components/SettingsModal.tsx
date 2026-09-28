import React from 'react';
import { AstroSettings } from '../types/astro';
import { Settings, X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AstroSettings;
  onSave: (newSettings: AstroSettings) => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState<AstroSettings>(settings);

  if (!isOpen) return null;

  const handleApply = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Settings className="w-5 h-5" />
            <h3 className="font-serif font-bold text-lg text-slate-100">Astrology Conventions</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Ayanamsa */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">
              Ayanamsa (Precession Model)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'lahiri', name: 'Lahiri', desc: 'Chitra Paksha (Default)' },
                { id: 'kp', name: 'KP', desc: 'Krishnamurti' },
                { id: 'raman', name: 'Raman', desc: 'B.V. Raman' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, ayanamsa: opt.id })}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    localSettings.ayanamsa === opt.id
                      ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="font-bold block">{opt.name}</span>
                  <span className="text-[10px] text-slate-500 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* House System */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">
              House System (Bhava Chalit)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'whole_sign', name: 'Whole Sign', desc: 'Parashara (Default)' },
                { id: 'equal', name: 'Equal', desc: '30° from Lagna' },
                { id: 'sripati', name: 'Sripati', desc: 'Porphyry Trisection' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, house_system: opt.id })}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    localSettings.house_system === opt.id
                      ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="font-bold block">{opt.name}</span>
                  <span className="text-[10px] text-slate-500 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lunar Node (Rahu/Ketu) */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">
              Lunar Nodes (Rahu & Ketu)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'mean', name: 'Mean Node', desc: 'Average motion (Default)' },
                { id: 'true', name: 'True Node', desc: 'Instantaneous oscillating' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, node_type: opt.id })}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    localSettings.node_type === opt.id
                      ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="font-bold block">{opt.name}</span>
                  <span className="text-[10px] text-slate-500 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 text-[11px] text-slate-400 border border-slate-800">
          Engine: <b className="text-amber-300">Swiss Ephemeris 2.10.03 (pyswisseph)</b>. All planetary longitudes are computed locally using sidereal algorithms without third-party chart APIs.
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Save & Recalculate
          </button>
        </div>
      </div>
    </div>
  );
};
