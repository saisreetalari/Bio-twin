import React, { useState } from 'react';
import { VirtualPatient } from '../types/patient';
import {
  Activity,
  Calendar,
  Clock,
  Dna,
  FileSpreadsheet,
  AlertTriangle,
  Pill,
  CheckCircle2,
  ShieldCheck,
  Info,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Check,
  AlertCircle,
  FileText,
  Watch,
  Zap,
  RefreshCw,
  Footprints,
  Heart,
  Droplets,
  Moon,
} from 'lucide-react';

interface LongitudinalWearablesViewProps {
  patient: VirtualPatient;
  onOpenWearableSync?: () => void;
}

export const LongitudinalWearablesView: React.FC<LongitudinalWearablesViewProps> = ({
  patient,
  onOpenWearableSync,
}) => {
  const [highlightSection, setHighlightSection] = useState<string | null>(null);

  const scrollTo = (id: string) => {
    setHighlightSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => setHighlightSection(null), 2500);
  };

  // 24-hour Ambulatory Glucose Profile (AGP) series
  const generateCgmData = () => {
    const points: { hour: number; glucose: number; timeLabel: string }[] = [];
    const baseGlucose = patient.labs.fastingGlucose || 95;
    for (let h = 0; h < 24; h++) {
      let offset = 0;
      if (h >= 7 && h <= 9) offset = 42; // breakfast
      else if (h >= 12 && h <= 14) offset = 55; // lunch
      else if (h >= 18 && h <= 21) offset = 48; // dinner
      else if (h >= 4 && h <= 6) offset = 22; // dawn phenomenon
      else if (h >= 1 && h <= 3) offset = -15; // nocturnal nadir

      const noise = Math.sin(h * 1.5) * 8;
      const glucose = Math.round(baseGlucose + offset + noise);
      points.push({
        hour: h,
        glucose,
        timeLabel: `${h.toString().padStart(2, '0')}:00`,
      });
    }
    return points;
  };

  const cgmPoints = generateCgmData();

  const targetMin = 70;
  const targetMax = 180;
  const inRangeCount = cgmPoints.filter((p) => p.glucose >= targetMin && p.glucose <= targetMax).length;
  const timeInRangePct = Math.round((inRangeCount / cgmPoints.length) * 100);
  const timeAboveRangePct = Math.round(
    (cgmPoints.filter((p) => p.glucose > targetMax).length / cgmPoints.length) * 100
  );
  const meanGlucose = Math.round(
    cgmPoints.reduce((acc, curr) => acc + curr.glucose, 0) / cgmPoints.length
  );
  const estimatedGmi = (3.31 + 0.02392 * meanGlucose).toFixed(1);

  // Pharmacogenomic Drug-Gene Interaction Evaluation
  const drugGeneInteractions = patient.genomics.map((g) => {
    const geneUpper = g.gene.toUpperCase();
    let matchingMeds = patient.medications.filter((m) => {
      const name = m.name.toLowerCase();
      if (geneUpper.includes('CYP2C19')) return name.includes('clopidogrel') || name.includes('plavix') || name.includes('omeprazole');
      if (geneUpper.includes('SLCO1B1')) return name.includes('statin') || name.includes('atorvastatin') || name.includes('simvastatin') || name.includes('rosuvastatin');
      if (geneUpper.includes('VKORC1') || geneUpper.includes('CYP2C9')) return name.includes('warfarin') || name.includes('coumadin');
      if (geneUpper.includes('TCF7L2')) return name.includes('metformin') || name.includes('empagliflozin') || name.includes('glp');
      if (geneUpper.includes('TTN')) return name.includes('carvedilol') || name.includes('metoprolol') || name.includes('sacubitril');
      return false;
    });

    let cpicLevel = 'CPIC Level A (Strong)';
    let cpicAction = g.clinicalSignificance;
    if (geneUpper.includes('CYP2C19')) {
      cpicLevel = 'CPIC Level A (Strongest Evidence)';
      cpicAction = 'CPIC Guideline for Clopidogrel: Intermediate metabolizers display impaired bioactivation. Alternative P2Y12 inhibitor (e.g. prasugrel or ticagrelor) recommended to prevent major adverse cardiovascular events (MACE).';
    } else if (geneUpper.includes('SLCO1B1')) {
      cpicLevel = 'CPIC Level A (Strong Evidence)';
      cpicAction = 'CPIC Guideline for Statins: Decreased OATP1B1 hepatic uptake transporter function increases systemic statin exposure. Prescribe low-to-moderate doses or select rosuvastatin/pravastatin; monitor for myopathy.';
    } else if (geneUpper.includes('VKORC1')) {
      cpicLevel = 'CPIC Level A (Strong Evidence)';
      cpicAction = 'CPIC Guideline for Warfarin: 1639G>A promoter variant confers heightened sensitivity. If oral anticoagulation needed, DOAC (Direct Oral Anticoagulant) is clinically preferred, or reduce initial warfarin dose by 30-50%.';
    } else if (geneUpper.includes('TCF7L2')) {
      cpicLevel = 'CPIC / Precision Diabetes Evidence';
      cpicAction = 'Precision Cardiometabolic Consensus: Impaired beta-cell incretin signaling. Enhanced therapeutic glycemic response to SGLT2 inhibitors and GLP-1 receptor agonists compared to sulfonylureas.';
    } else if (geneUpper.includes('TTN')) {
      cpicLevel = 'ClinGen Expert Panel - Definitive';
      cpicAction = 'Cardiogenomics Guideline: Truncating titin variant associated with high susceptibility to ventricular remodeling. Lifelong guideline-directed medical therapy (GDMT) indicated even following ejection fraction normalization.';
    }

    return {
      ...g,
      cpicLevel,
      cpicAction,
      matchingMeds,
      hasActiveConflict: matchingMeds.length > 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Quick Navigation Anchor Bar */}
      <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 sticky top-14 z-30 shadow-md">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Info className="w-4 h-4 text-teal-400 shrink-0" />
          <span>Quick Jump:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => scrollTo('section-cgm')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Continuous Glucose (CGM)</span>
          </button>

          <button
            onClick={() => scrollTo('section-labs')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            <span>3-Year Lab History ({patient.longitudinalHistory.length})</span>
          </button>

          <button
            onClick={() => scrollTo('section-mar')}
            className="px-3 py-1.5 rounded-lg bg-teal-950/80 hover:bg-teal-900 text-teal-300 hover:text-teal-200 transition-colors flex items-center gap-1.5 border border-teal-700/80 cursor-pointer font-medium"
          >
            <Pill className="w-3.5 h-3.5 text-teal-400" />
            <span>Medication Administration Record (MAR)</span>
            <span className="px-1.5 py-0.2 bg-teal-800 text-white rounded text-[10px] font-mono">
              {patient.medications.length}
            </span>
          </button>

          <button
            onClick={() => scrollTo('section-cpic')}
            className="px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1.5 border border-amber-700/80 cursor-pointer font-medium"
          >
            <Dna className="w-3.5 h-3.5 text-amber-400" />
            <span>CPIC Pharmacogenomics & Dosing</span>
            <span className="px-1.5 py-0.2 bg-amber-800 text-white rounded text-[10px] font-mono">
              {patient.genomics.length}
            </span>
          </button>
        </div>
      </div>

      {/* Ambulatory Wearable Sync Integration Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-teal-800/60 rounded-xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-teal-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm text-white">Ambulatory Wearable & CGM Sensor Stream</span>
                {patient.lastWearableSync ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{patient.lastWearableSync.providerName} Connected</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Standby · Continuous Sensor Telemetry
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Connect continuous interstitial glucose sensors (Dexcom G7 / Freestyle Libre), Apple Watch cardiovascular telemetry, or Fitbit autonomic trackers to calibrate this virtual twin in real-time.
              </p>

              {patient.lastWearableSync && (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-mono bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Droplets className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CGM:</span>
                    <strong className="text-white">{patient.lastWearableSync.reading.glucoseMgDl || patient.labs.fastingGlucose} mg/dL</strong>
                    <span className="text-emerald-400 text-[11px] font-bold">
                      {patient.lastWearableSync.reading.glucoseTrend === 'rapidly_rising' ? '⇈' : patient.lastWearableSync.reading.glucoseTrend === 'rising' ? '↗' : '→'}
                    </span>
                  </div>
                  <span className="text-slate-700">·</span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>Pulse:</span>
                    <strong className="text-white">{patient.lastWearableSync.reading.heartRate || patient.vitals.heartRate} bpm</strong>
                  </div>
                  <span className="text-slate-700">·</span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Activity className="w-3.5 h-3.5 text-teal-400" />
                    <span>HRV SDNN:</span>
                    <strong className="text-white">{patient.lastWearableSync.reading.hrvSdnn || patient.autonomic?.hrvSdnn || 45} ms</strong>
                  </div>
                  <span className="text-slate-700">·</span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Footprints className="w-3.5 h-3.5 text-amber-400" />
                    <span>Steps:</span>
                    <strong className="text-white">{(patient.lastWearableSync.reading.stepsToday || 5200).toLocaleString()}</strong>
                  </div>
                  <span className="text-slate-700">·</span>
                  <span className="text-[11px] text-slate-500">
                    {patient.lastWearableSync.telemetryPointsIngested} epochs synced
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            {onOpenWearableSync && (
              <button
                type="button"
                onClick={onOpenWearableSync}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{patient.lastWearableSync ? 'Re-Sync Wearable Stream' : 'Sync Wearable Device'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 1. 24-Hour Ambulatory Glucose Profile (AGP) */}
      <div
        id="section-cgm"
        className={`p-5 bg-slate-900 border rounded-xl transition-all duration-500 ${
          highlightSection === 'section-cgm'
            ? 'border-emerald-500 ring-2 ring-emerald-500/30'
            : 'border-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-slate-300">Continuous Glucose Monitoring (CGM)</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Ambulatory Glucose Profile</span>
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              24-Hour Sensor Interstitial Glycemic Trace & AGP Consensus Metrics
            </div>
          </div>

          {/* AGP Consensus Metrics */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
            <div>
              <span className="text-slate-400">Time-In-Range (70-180): </span>
              <span
                className={`font-bold tabular-nums ${
                  timeInRangePct >= 70 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {timeInRangePct}%
              </span>
              <span className="text-[10px] text-slate-500 ml-1">(Target &gt;70%)</span>
            </div>
            <div>
              <span className="text-slate-400">TAR (&gt;180): </span>
              <span className="font-bold text-rose-400 tabular-nums">{timeAboveRangePct}%</span>
              <span className="text-[10px] text-slate-500 ml-1">(&lt;25%)</span>
            </div>
            <div>
              <span className="text-slate-400">Mean Glucose: </span>
              <span className="font-bold text-white tabular-nums">{meanGlucose} mg/dL</span>
            </div>
            <div>
              <span className="text-slate-400">GMI: </span>
              <span className="font-bold text-teal-300 tabular-nums">{estimatedGmi}%</span>
            </div>
          </div>
        </div>

        {/* CGM Sensor Canvas */}
        <div className="mt-4 relative h-60 bg-slate-950 rounded-lg border border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
          {/* Target Glycemic Corridor (70-180) */}
          <div className="absolute inset-x-0 top-[28%] bottom-[32%] bg-emerald-500/5 border-y border-emerald-500/20 pointer-events-none" />

          {/* Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-25 pointer-events-none" />

          <div className="relative w-full h-40">
            {(() => {
              const maxG = 280;
              const minG = 50;

              const getY = (val: number) => {
                const ratio = (val - minG) / (maxG - minG);
                return 150 - ratio * 130;
              };

              const getX = (idx: number) => {
                return (idx / (cgmPoints.length - 1)) * 100;
              };

              const pathD = cgmPoints
                .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)}% ${getY(p.glucose)}`)
                .join(' ');

              return (
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  {/* Target Band labels */}
                  <line x1="0%" y1={getY(180)} x2="100%" y2={getY(180)} stroke="#10b981" strokeDasharray="3 3" strokeOpacity="0.4" />
                  <line x1="0%" y1={getY(70)} x2="100%" y2={getY(70)} stroke="#10b981" strokeDasharray="3 3" strokeOpacity="0.4" />

                  {/* Polyline */}
                  <path d={pathD} fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Data Dots */}
                  {cgmPoints.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={`${getX(idx)}%`}
                      cy={getY(p.glucose)}
                      r={p.hour % 6 === 0 ? 3.5 : 2}
                      className={p.glucose > 180 ? 'fill-rose-400' : p.glucose < 70 ? 'fill-amber-400' : 'fill-teal-300'}
                    />
                  ))}
                </svg>
              );
            })()}
          </div>

          <div className="relative flex justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
            <span>00:00 (Midnight)</span>
            <span>06:00 (Dawn)</span>
            <span>12:00 (Midday)</span>
            <span>18:00 (Dinner)</span>
            <span>23:00 (Night)</span>
          </div>
        </div>
      </div>

      {/* 2. Longitudinal Laboratory Trajectory Panels */}
      <div
        id="section-labs"
        className={`p-5 bg-slate-900 border rounded-xl transition-all duration-500 ${
          highlightSection === 'section-labs'
            ? 'border-blue-500 ring-2 ring-blue-500/30'
            : 'border-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-slate-300">Longitudinal Laboratory Trajectory</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Serial Multi-Encounter Panels</span>
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              3-Year Historical Evolution: Glycemic, Renal Filtration & Lipid Profile
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {patient.longitudinalHistory.length} Registered Panels
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 font-mono text-slate-400 text-[11px]">
                <th className="pb-3 font-semibold">PANEL PERIOD / ENCOUNTER</th>
                <th className="pb-3 font-semibold">HbA1c (Ref &lt;5.7%)</th>
                <th className="pb-3 font-semibold">eGFR (Ref ≥60 mL/min)</th>
                <th className="pb-3 font-semibold">BLOOD PRESSURE (mmHg)</th>
                <th className="pb-3 font-semibold">LDL-C (Ref &lt;100 mg/dL)</th>
                <th className="pb-3 font-semibold">hs-CRP (Ref &lt;1.0 mg/L)</th>
                <th className="pb-3 font-semibold">BODY WEIGHT (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono tabular-nums">
              {patient.longitudinalHistory.map((row) => (
                <tr key={row.period} className="hover:bg-slate-950/50 transition-colors">
                  <td className="py-3 font-medium text-white">
                    <div>{row.period}</div>
                    <div className="text-[10px] text-slate-500 font-sans">{row.date}</div>
                  </td>

                  <td className="py-3">
                    <span
                      className={`font-bold ${
                        row.hba1c >= 8.0 ? 'text-rose-400' : row.hba1c >= 7.0 ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      {row.hba1c}%
                    </span>
                    {row.hba1c >= 7.0 && <span className="text-[10px] text-rose-400 ml-1">[H]</span>}
                  </td>

                  <td className="py-3">
                    <span
                      className={`font-bold ${
                        row.egfr < 60 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {row.egfr}
                    </span>
                    {row.egfr < 60 && <span className="text-[10px] text-amber-400 ml-1">[L]</span>}
                  </td>

                  <td className="py-3">
                    <span
                      className={`font-bold ${
                        row.systolicBp >= 140 ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      {row.systolicBp} mmHg
                    </span>
                  </td>

                  <td className="py-3 text-slate-200">
                    {row.ldl} mg/dL
                    {row.ldl > 100 && <span className="text-[10px] text-amber-400 ml-1">[H]</span>}
                  </td>

                  <td className="py-3">
                    <span
                      className={`font-bold ${
                        row.hsCrp > 3.0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {row.hsCrp} mg/L
                    </span>
                  </td>

                  <td className="py-3 text-slate-300">{row.weightKg} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Medication Administration Record (MAR) */}
      <div
        id="section-mar"
        className={`p-5 bg-slate-900 border rounded-xl transition-all duration-500 ${
          highlightSection === 'section-mar'
            ? 'border-teal-500 ring-2 ring-teal-500/40 shadow-lg shadow-teal-950/50'
            : 'border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div>
            <div className="text-xs font-mono uppercase text-teal-400 font-semibold flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-400" />
              <span>MEDICATION ADMINISTRATION RECORD (MAR)</span>
            </div>
            <div className="text-sm font-bold text-white mt-1">
              Active Pharmacotherapy, eMAR Administration Schedule & 5-Rights Verification
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-teal-950/80 border border-teal-700/60 text-teal-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>BCMA · 5-Rights Verified</span>
            </span>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
              {patient.medications.length} Active Prescriptions
            </span>
          </div>
        </div>

        {/* eMAR Grid / Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 font-mono text-slate-400 text-[11px]">
                <th className="pb-3 font-semibold">MEDICATION & CLASS</th>
                <th className="pb-3 font-semibold">DOSE & ROUTE</th>
                <th className="pb-3 font-semibold">ADMINISTRATION SCHEDULE</th>
                <th className="pb-3 font-semibold">CLINICAL INDICATION</th>
                <th className="pb-3 font-semibold text-center">eMAR SCHEDULE SLOTS</th>
                <th className="pb-3 font-semibold text-right">ADHERENCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {patient.medications.map((m) => {
                // Determine mock schedule status
                const isDaily = m.frequency.toLowerCase().includes('daily');
                return (
                  <tr key={m.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3.5 font-medium text-white">
                      <div className="font-bold flex items-center gap-2">
                        <span>{m.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-teal-300 border border-slate-700">
                          {m.category || 'Therapeutic Agent'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                        Rx ID: <span className="font-mono">{m.id}</span> · Order Confirmed
                      </div>
                    </td>

                    <td className="py-3.5">
                      <div className="font-mono font-bold text-white text-xs">{m.dosage}</div>
                      <div className="text-[10px] font-mono text-slate-400">PO (Oral Route)</div>
                    </td>

                    <td className="py-3.5">
                      <div className="text-slate-200 font-medium">{m.frequency}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Routine Administration</div>
                    </td>

                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[11px]">
                        {m.indication}
                      </span>
                    </td>

                    {/* eMAR Timeline Slots */}
                    <td className="py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 flex items-center gap-1" title="08:00 AM Dose Administered">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>08:00</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-400" title="13:00 Midday">
                          13:00
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-950/40 border border-teal-800/40 text-teal-300" title="20:00 PM Scheduled Dose">
                          20:00
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 text-right font-mono">
                      <div className="flex items-center justify-end gap-1.5">
                        <span
                          className={`font-bold tabular-nums text-xs ${
                            m.adherenceRate >= 80 ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {m.adherenceRate}%
                        </span>
                      </div>
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full ml-auto mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            m.adherenceRate >= 80 ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${m.adherenceRate}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <span>Attending Physician Verification: <strong className="text-slate-300">{patient.attendingPhysician}</strong></span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-mono text-[11px]">Real-Time MAR Active & Synchronized</span>
          </div>
        </div>
      </div>

      {/* 4. Clinical Pharmacogenomics & CPIC Dosing Guides */}
      <div
        id="section-cpic"
        className={`p-5 bg-slate-900 border rounded-xl transition-all duration-500 ${
          highlightSection === 'section-cpic'
            ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-lg shadow-amber-950/50'
            : 'border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div>
            <div className="text-xs font-mono uppercase text-amber-400 font-semibold flex items-center gap-2">
              <Dna className="w-4 h-4 text-amber-400" />
              <span>CLINICAL PHARMACOGENOMICS & CPIC DOSING GUIDES</span>
            </div>
            <div className="text-sm font-bold text-white mt-1">
              Genotype-Guided Precision Prescribing · CPIC / PharmGKB Level A & B Guidelines
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-amber-950/80 border border-amber-700/60 text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>CPIC Consensus Standards</span>
            </span>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
              {patient.genomics.length} Documented Alleles
            </span>
          </div>
        </div>

        {/* Clinical Drug-Gene Decision Support Notice */}
        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg mb-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-white">
              Clinical Pharmacogenetics Implementation Consortium (CPIC) Guidelines Active
            </div>
            <p className="text-slate-400 leading-relaxed">
              These guidelines provide peer-reviewed, actionable prescribing recommendations based on germline genetic variants to optimize therapeutic efficacy and prevent severe adverse drug reactions (ADRs).
            </p>
          </div>
        </div>

        {/* Genomic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drugGeneInteractions.map((g) => (
            <div
              key={g.gene}
              className="p-4 bg-slate-950 border border-slate-800/90 rounded-xl space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Header: Gene and CPIC Level */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="font-mono text-teal-300">{g.gene}</span>
                      <span className="text-slate-500 font-normal">|</span>
                      <span className="text-xs font-mono text-slate-300">{g.variant}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Phenotype: <strong className="text-white font-medium">{g.phenotype}</strong>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-700/60 text-amber-300 shrink-0">
                    {g.cpicLevel}
                  </span>
                </div>

                {/* Prescribing Directive */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-teal-400" />
                    <span>CPIC Dosing Recommendation</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800">
                    {g.cpicAction}
                  </p>
                </div>

                {/* Active Regimen Match */}
                {g.matchingMeds.length > 0 && (
                  <div className="mt-3 p-2 rounded bg-amber-950/30 border border-amber-800/50 flex items-start gap-2 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-300">Active Regimen Match: </span>
                      <span className="text-slate-300">
                        {g.matchingMeds.map((m) => `${m.name} (${m.dosage})`).join(', ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                <span>Guideline Source: CPIC / PharmGKB</span>
                <span className="text-teal-400">Validated Guideline</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
