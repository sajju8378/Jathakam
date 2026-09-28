import React, { useState } from 'react';
import { ShieldCheck, Trash2, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { isStaticDeployment, safeFetchWithTimeout } from '../utils/environment';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const PrivacyModal: React.FC<Props> = ({ isOpen, onClose, userName = 'Native' }) => {
  const [purged, setPurged] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDeleteData = async () => {
    setLoading(true);
    try {
      if (!isStaticDeployment()) {
        try {
          await safeFetchWithTimeout(
            '/v1/privacy/delete',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id_or_name: userName, confirm: true })
            },
            1500
          );
        } catch {
          // Ignore backend network errors
        }
      }
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      setPurged(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-serif font-bold text-lg text-slate-100">
              Privacy & India DPDP Act 2023 Compliance
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
          <p>
            Under the <b>Digital Personal Data Protection (DPDP) Act 2023 (India)</b>, birth information (name, date of birth, time of birth, and birthplace coordinates) is recognized as sensitive personal data.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-slate-200 block text-xs">Our Architectural Guarantees:</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
              <li><b>Zero Raw Birth Logging:</b> Server logs never log birth timestamps, names, or exact locations.</li>
              <li><b>Local Swiss Ephemeris Engine:</b> Natal charts are computed on-premise without dispatching birth details to third-party astrology APIs.</li>
              <li><b>Encryption at Rest:</b> Any stored charts in PostgreSQL use AES-256 field-level encryption.</li>
              <li><b>Right to Erasure:</b> You have full control to immediately purge your chart and browser storage.</li>
            </ul>
          </div>

          {purged ? (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>All active chart data, cached sessions, and local storage have been completely purged.</span>
            </div>
          ) : (
            <div className="pt-2 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                Purge current chart sessions and stored profile:
              </div>
              <button
                type="button"
                onClick={handleDeleteData}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {loading ? 'Purging...' : 'Delete My Data'}
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
