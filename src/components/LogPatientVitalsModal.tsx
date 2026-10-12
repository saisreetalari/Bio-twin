import React, { useState } from 'react';
import { VirtualPatient } from '../types/patient';
import { X, Check, Heart, Droplets, Scale, Activity } from 'lucide-react';

interface LogPatientVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: VirtualPatient;
  onPatientUpdated: (updatedPatient: VirtualPatient) => void;
}

export const LogPatientVitalsModal: React.FC<LogPatientVitalsModalProps> = ({
  isOpen,
  onClose,
  patient,
  onPatientUpdated,
}) => {
  const [systolic, setSystolic] = useState<number>(patient.vitals.systolicBp);
  const [diastolic, setDiastolic] = useState<number>(patient.vitals.diastolicBp);
  const [heartRate, setHeartRate] = useState<number>(patient.vitals.heartRate);
  const [fastingGlucose, setFastingGlucose] = useState<number>(patient.labs.fastingGlucose);
  const [weightKg, setWeightKg] = useState<number>(patient.weightKg);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/patients/${patient.id}/update-metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: {
            systolicBp: Number(systolic),
            diastolicBp: Number(diastolic),
            fastingGlucose: Number(fastingGlucose),
          },
          reportSummary: `Patient self-reported home log: Blood Pressure ${systolic}/${diastolic} mmHg, Heart Rate ${heartRate} bpm, Fasting Blood Sugar ${fastingGlucose} mg/dL, Weight ${weightKg} kg.`,
          patient,
        }),
      });

      let updated: VirtualPatient;
      if (res.ok) {
        updated = await res.json();
      } else {
        updated = {
          ...patient,
          weightKg: Number(weightKg),
          vitals: {
            ...patient.vitals,
            systolicBp: Number(systolic),
            diastolicBp: Number(diastolic),
            heartRate: Number(heartRate),
          },
          labs: {
            ...patient.labs,
            fastingGlucose: Number(fastingGlucose),
          },
        };
      }
      onPatientUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error updating vitals:', err);
      const updated = {
        ...patient,
        weightKg: Number(weightKg),
        vitals: {
          ...patient.vitals,
          systolicBp: Number(systolic),
          diastolicBp: Number(diastolic),
          heartRate: Number(heartRate),
        },
        labs: {
          ...patient.labs,
          fastingGlucose: Number(fastingGlucose),
        },
      };
      onPatientUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Log Today's Home Health Readings</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Record readings for <span className="text-slate-200 font-medium">{patient.fullName}</span> (MRN: {patient.mrn})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {savedSuccess && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-700 rounded-lg flex items-center gap-2 text-xs text-emerald-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Your home readings have been saved to your personal health record.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3.5">
            {/* Blood Pressure Systolic */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Systolic (Top #)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={80}
                  max={220}
                  value={systolic}
                  onChange={(e) => setSystolic(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-mono">mmHg</span>
              </div>
            </div>

            {/* Blood Pressure Diastolic */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Diastolic (Bottom #)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={40}
                  max={140}
                  value={diastolic}
                  onChange={(e) => setDiastolic(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-mono">mmHg</span>
              </div>
            </div>

            {/* Resting Pulse */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>Resting Heart Rate</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={40}
                  max={180}
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-mono">bpm</span>
              </div>
            </div>

            {/* Morning Fasting Glucose */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>Morning Glucose</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={50}
                  max={450}
                  value={fastingGlucose}
                  onChange={(e) => setFastingGlucose(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-mono">mg/dL</span>
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Body Weight</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min={30}
                  max={250}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-mono">kg (~{(weightKg * 2.20462).toFixed(1)} lbs)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 text-xs font-medium bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save to My Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
