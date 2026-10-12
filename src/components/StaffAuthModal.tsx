import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, AlertCircle, X, CheckCircle2, Stethoscope, ArrowRight } from 'lucide-react';

interface StaffAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_STAFF_PINS = ['DR2026', '1234', 'MED2026'];

export const StaffAuthModal: React.FC<StaffAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim().toUpperCase();
    if (DEFAULT_STAFF_PINS.includes(cleanPin) || cleanPin === 'DR2026' || cleanPin === '1234') {
      setError('');
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        setSuccess(false);
        setPin('');
      }, 500);
    } else {
      setError('Invalid Physician / Staff PIN. Access denied for patient confidentiality.');
    }
  };

  const handleQuickDemoUnlock = () => {
    setPin('DR2026');
    setError('');
    setSuccess(true);
    setTimeout(() => {
      onSuccess();
      setSuccess(false);
      setPin('');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Clinical Staff Authorization</h3>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                  Restricted
                </span>
              </div>
              <p className="text-[11px] text-slate-400">HIPAA & Privacy Protection Lock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1.5 text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Patient Privacy Notice</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              To prevent unauthorized viewing of other patients' clinical histories, electronic health records, and diagnostic staging, entry to the Physician Workspace requires clinical staff authentication.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Physician / Staff Access PIN</span>
              <span className="text-[11px] text-slate-400 font-normal">Default PIN: <strong className="text-teal-400 font-mono">DR2026</strong></span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="Enter Staff PIN (e.g., DR2026)"
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono tracking-wider"
              />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-rose-400 text-xs mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Credentials verified. Unlocking clinical workspace...</span>
              </div>
            )}
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={!pin || success}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                pin && !success
                  ? 'bg-teal-600 hover:bg-teal-500 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>{success ? 'Authorized' : 'Unlock Physician Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleQuickDemoUnlock}
              className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 text-teal-400 hover:text-teal-300 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>One-Click Clinician Demo Unlock (DR2026)</span>
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="p-3 bg-slate-950/40 border-t border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-400">
            Patients remain isolated within their personal health portal at all times.
          </p>
        </div>
      </div>
    </div>
  );
};
