import React, { useEffect, useState } from 'react';
import { VirtualPatient } from '../types/patient';
import { Heart, Activity, Droplets, Wind, AlertCircle } from 'lucide-react';

interface TelemetryVitalsStripProps {
  patient: VirtualPatient;
  liveStreaming: boolean;
}

export const TelemetryVitalsStrip: React.FC<TelemetryVitalsStripProps> = ({ patient, liveStreaming }) => {
  const [pulseOffset, setPulseOffset] = useState(0);
  const [currentHr, setCurrentHr] = useState(patient.vitals.heartRate);
  const [currentSbp, setCurrentSbp] = useState(patient.vitals.systolicBp);

  useEffect(() => {
    setCurrentHr(patient.vitals.heartRate);
    setCurrentSbp(patient.vitals.systolicBp);
  }, [patient.vitals.heartRate, patient.vitals.systolicBp]);

  useEffect(() => {
    if (!liveStreaming) return;
    const interval = setInterval(() => {
      setPulseOffset((prev) => (prev + 1) % 100);
      const hrJitter = Math.floor(Math.random() * 3) - 1;
      setCurrentHr(patient.vitals.heartRate + hrJitter);
      const bpJitter = Math.floor(Math.random() * 3) - 1;
      setCurrentSbp(patient.vitals.systolicBp + bpJitter);
    }, 1200);

    return () => clearInterval(interval);
  }, [liveStreaming, patient.vitals.heartRate, patient.vitals.systolicBp]);

  // Standard calibrated ECG Lead II curve
  const ecgPoints = [
    [0, 20], [14, 20], [18, 18], [22, 20], // P wave
    [32, 20], [35, 23], [39, 3], [43, 33], [47, 20], // QRS complex
    [58, 20], [66, 14], [74, 20], // T wave
    [100, 20]
  ];

  return (
    <div className="bg-slate-950 border-b border-slate-800 px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* ECG Lead II Bedside Monitor */}
        <div className="flex items-center gap-3 shrink-0 bg-slate-900 border border-slate-800 rounded px-3 py-1.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Heart className={`w-3.5 h-3.5 ${liveStreaming ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-[11px] font-mono font-semibold">LEAD II</span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">25mm/s · 10mm/mV</span>
          </div>

          <div className="w-36 h-9 bg-slate-950 rounded border border-slate-800 relative overflow-hidden flex items-center">
            {/* Standard ECG grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:6px_6px] opacity-40" />
            <svg className="w-full h-full" viewBox="0 0 100 35" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke={liveStreaming ? '#10b981' : '#64748b'}
                strokeWidth="1.5"
                points={ecgPoints.map(([x, y]) => `${x},${y}`).join(' ')}
              />
            </svg>
            {liveStreaming && (
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-emerald-400/50"
                style={{ left: `${pulseOffset}%` }}
              />
            )}
          </div>

          <div className="text-right pl-1">
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-400 leading-none">
              {currentHr}
            </div>
            <div className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">BPM · Sinus</div>
          </div>
        </div>

        {/* Clinical Reference Range Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
          {/* Blood Pressure & MAP */}
          <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>NIBP (mmHg)</span>
              <span className={currentSbp >= 140 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                {currentSbp >= 140 ? 'Stage 2 HTN' : 'Normal'}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold font-mono tabular-nums text-white">
                {currentSbp}/{patient.vitals.diastolicBp}
              </span>
              <span className="text-[10px] font-mono text-slate-400">MAP {patient.vitals.meanArterialPressure}</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono">Ref: &lt;120/80 mmHg</div>
          </div>

          {/* Cardiac Function (LVEF) */}
          <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>ECHO LVEF (%)</span>
              <span className={patient.vitals.ejectionFraction < 50 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                {patient.vitals.ejectionFraction < 50 ? 'Mildly Reduced' : 'Preserved'}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold font-mono tabular-nums text-white">
                {patient.vitals.ejectionFraction}%
              </span>
              <span className="text-[10px] font-mono text-slate-400">SV {patient.vitals.strokeVolume}mL</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono">Ref: 52 - 72%</div>
          </div>

          {/* Renal Clearance (eGFR) */}
          <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>eGFR CKD-EPI</span>
              <span className={patient.labs.egfr < 60 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                {patient.labs.egfr < 45 ? 'Stage 3b' : patient.labs.egfr < 60 ? 'Stage 3a' : 'Normal'}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold font-mono tabular-nums text-white">
                {patient.labs.egfr}
              </span>
              <span className="text-[10px] font-mono text-slate-400">mL/min/1.73m²</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono">
              Cr: {patient.labs.creatinine} mg/dL (Ref: ≥60)
            </div>
          </div>

          {/* Glycated Hemoglobin (HbA1c) */}
          <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>HbA1c GLYCEMIC</span>
              <span className={patient.labs.hba1c >= 7.0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {patient.labs.hba1c >= 7.0 ? 'High' : 'Controlled'}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold font-mono tabular-nums text-white">
                {patient.labs.hba1c}%
              </span>
              <span className="text-[10px] font-mono text-slate-400">FBG {patient.labs.fastingGlucose} mg/dL</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono">ADA Target: &lt;7.0%</div>
          </div>

          {/* Albuminuria & Vascular Inflammation */}
          <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>UACR / hs-CRP</span>
              <span className={patient.labs.uacr > 30 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                {patient.labs.uacr > 30 ? 'Microalbuminuria' : 'Normal'}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold font-mono tabular-nums text-white">
                {patient.labs.uacr}
              </span>
              <span className="text-[10px] font-mono text-slate-400">mg/g · CRP {patient.labs.hsCrp}</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono">UACR Ref: &lt;30 mg/g</div>
          </div>
        </div>
      </div>
    </div>
  );
};
