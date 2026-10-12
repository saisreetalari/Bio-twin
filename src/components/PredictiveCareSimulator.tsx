import React, { useState, useEffect } from 'react';
import {
  VirtualPatient,
  SimulationIntervention,
  SimulationResult,
} from '../types/patient';
import {
  Play,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Shield,
  Layers,
  Heart,
  Droplet,
  Sliders,
  FileCheck,
  CheckCircle2,
  Stethoscope,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';

interface PredictiveCareSimulatorProps {
  patient: VirtualPatient;
}

export const PredictiveCareSimulator: React.FC<PredictiveCareSimulatorProps> = ({ patient }) => {
  // Intervention Configuration
  const [selectedMeds, setSelectedMeds] = useState<{ name: string; dosage: string; frequency: string; category: string }[]>([
    { name: 'Empagliflozin', dosage: '10 mg', frequency: 'Daily morning', category: 'SGLT2 Inhibitor' },
  ]);
  const [targetSodium, setTargetSodium] = useState<number>(2000);
  const [targetExercise, setTargetExercise] = useState<number>(150);
  const [smokingCessation, setSmokingCessation] = useState<boolean>(true);
  const [adherence, setAdherence] = useState<number>(90);
  const [horizon, setHorizon] = useState<3 | 6 | 12 | 60>(60);

  // Active Metric for Trajectory Graph
  const [activeChartMetric, setActiveChartMetric] = useState<'maceRisk' | 'hba1c' | 'egfr' | 'systolicBp' | 'uacr'>('maceRisk');

  // Simulation Results
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Evidence-based candidate medications with clinical trial citations
  const candidateMeds = [
    {
      name: 'Empagliflozin',
      dosage: '10 mg',
      frequency: 'Once Daily',
      category: 'SGLT2 Inhibitor',
      evidence: 'EMPA-REG OUTCOME / DAPA-CKD',
      benefit: 'Renal preservation & CV death reduction',
    },
    {
      name: 'Semaglutide',
      dosage: '1.0 mg',
      frequency: 'Once Weekly SC',
      category: 'GLP-1 RA',
      evidence: 'SELECT / FLOW / SUSTAIN-6',
      benefit: 'Weight loss, HbA1c lowering, 20% MACE reduction',
    },
    {
      name: 'Finerenone',
      dosage: '20 mg',
      frequency: 'Once Daily',
      category: 'Non-steroidal MRA',
      evidence: 'FIDELIO-DKD / FIGARO-DKD',
      benefit: 'Anti-albuminuric & cardiorenal slowdown',
    },
    {
      name: 'Rosuvastatin',
      dosage: '20 mg',
      frequency: 'Once Daily QHS',
      category: 'High-intensity Statin',
      evidence: 'JUPITER / ACC/AHA 2025',
      benefit: 'Atherosclerotic plaque stabilization',
    },
    {
      name: 'Ezetimibe',
      dosage: '10 mg',
      frequency: 'Once Daily',
      category: 'Cholesterol Absorption Inhibitor',
      evidence: 'IMPROVE-IT',
      benefit: 'Further LDL-C suppression < 55 mg/dL',
    },
    {
      name: 'Lisinopril',
      dosage: '20 mg',
      frequency: 'Once Daily',
      category: 'ACE Inhibitor',
      evidence: 'AIPRD / ALLHAT',
      benefit: 'Afterload reduction & renal capillary protection',
    },
  ];

  const toggleMed = (med: typeof candidateMeds[0]) => {
    if (selectedMeds.some((m) => m.name === med.name)) {
      setSelectedMeds(selectedMeds.filter((m) => m.name !== med.name));
    } else {
      setSelectedMeds([
        ...selectedMeds,
        { name: med.name, dosage: med.dosage, frequency: med.frequency, category: med.category },
      ]);
    }
  };

  const runSimulation = async () => {
    setSimulating(true);
    const interventionPayload: SimulationIntervention = {
      medicationsToAdd: selectedMeds,
      medicationsToModify: [],
      medicationsToRemove: [],
      lifestyleChanges: {
        targetSodiumMg: targetSodium,
        targetExerciseMin: targetExercise,
        dietaryAdherenceImprovement: 25,
        smokingCessation,
      },
      overallAdherenceRate: adherence,
      projectionHorizonMonths: horizon,
    };

    try {
      const res = await fetch('/api/predictive-care/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient.id, intervention: interventionPayload, patient }),
      });
      const data = await res.json();
      setSimResult(data);
    } catch (err) {
      console.error('Error running clinical simulation:', err);
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [patient.id]);

  const metricConfigs = {
    maceRisk: { label: '5-Year MACE Cardiovascular Risk', unit: '%', baselineVal: patient.maceFiveYearRisk },
    hba1c: { label: 'Glycated Hemoglobin (HbA1c)', unit: '%', baselineVal: patient.labs.hba1c },
    egfr: { label: 'Estimated Glomerular Filtration (eGFR)', unit: 'mL/min', baselineVal: patient.labs.egfr },
    systolicBp: { label: 'Systolic Blood Pressure', unit: 'mmHg', baselineVal: patient.vitals.systolicBp },
    uacr: { label: 'Urine Albumin-to-Creatinine (UACR)', unit: 'mg/g', baselineVal: patient.labs.uacr },
  };

  return (
    <div className="space-y-6">
      {/* Top Clinical Simulation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-slate-400">
              IN-SILICO CLINICAL CARE SIMULATOR & GDMT OPTIMIZER
            </div>
            <div className="text-sm font-bold text-white">
              Treatment Trajectory & Outcome Forecasting for {patient.fullName} ({patient.mrn})
            </div>
          </div>
        </div>

        <button
          onClick={runSimulation}
          disabled={simulating}
          className="flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-md text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${simulating ? 'animate-pulse' : ''}`} />
          <span>{simulating ? 'Calculating Trajectories...' : 'Execute In-Silico Forecast'}</span>
        </button>
      </div>

      {/* Safety Advisory Banner */}
      <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl flex items-start gap-3 text-xs text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-amber-300 font-bold">Predictive Model Advisory: </strong>
          In-silico treatment trajectories and drug response forecasts are computational estimations. AI models and mathematical approximations are <strong>not 100% correct and may make mistakes</strong>.
          Simulation results must not replace individualized clinical trials, physician evaluations, or official guideline dosing protocols.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Clinical Intervention Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
                TREATMENT PROTOCOL CONFIGURATION
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                Pharmacological & Lifestyle Escalation
              </div>
            </div>

            {/* Candidate Medication Toggles with Clinical Trial Evidence */}
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase mb-2 flex items-center justify-between font-semibold">
                <span>EVIDENCE-BASED PHARMACOTHERAPY</span>
                <span className="text-[11px] text-teal-400 font-mono">
                  {selectedMeds.length} Agents Selected
                </span>
              </div>
              <div className="space-y-2">
                {candidateMeds.map((med) => {
                  const isSelected = selectedMeds.some((m) => m.name === med.name);
                  return (
                    <button
                      key={med.name}
                      onClick={() => toggleMed(med)}
                      className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-teal-950/60 border-teal-600 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          <span>{med.name}</span>
                          <span className="text-[11px] font-mono text-teal-300 font-normal">
                            ({med.dosage} · {med.frequency})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {med.category} · <span className="text-slate-300">{med.benefit}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Evidence: {med.evidence}
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-2 ${
                          isSelected
                            ? 'bg-teal-500 border-teal-500 text-slate-950 font-bold text-[10px]'
                            : 'border-slate-700'
                        }`}
                      >
                        {isSelected && '✓'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lifestyle Target Parameters */}
            <div className="space-y-4 pt-3 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400 uppercase font-semibold">
                LIFESTYLE & COMPLIANCE MODIFIERS
              </div>

              {/* Dietary sodium slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">Target Dietary Sodium:</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {targetSodium} mg/day
                  </span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="4000"
                  step="100"
                  value={targetSodium}
                  onChange={(e) => setTargetSodium(Number(e.target.value))}
                  className="w-full accent-teal-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>1200 mg (DASH)</span>
                  <span>Baseline: {patient.lifestyle.dietarySodiumMg} mg</span>
                  <span>4000 mg</span>
                </div>
              </div>

              {/* Exercise slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">Target Weekly Aerobic Exercise:</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {targetExercise} min/week
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="15"
                  value={targetExercise}
                  onChange={(e) => setTargetExercise(Number(e.target.value))}
                  className="w-full accent-teal-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>Sedentary</span>
                  <span>Target 150 min</span>
                  <span>300 min</span>
                </div>
              </div>

              {/* Adherence Rate slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">Predicted Medication Adherence:</span>
                  <span className="font-mono font-bold text-teal-300 tabular-nums">
                    {adherence}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={adherence}
                  onChange={(e) => setAdherence(Number(e.target.value))}
                  className="w-full accent-teal-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>50% Suboptimal</span>
                  <span>80% Average</span>
                  <span>100% Full</span>
                </div>
              </div>

              {/* Simulation Horizon */}
              <div>
                <div className="text-xs text-slate-300 mb-1.5">Simulation Forecast Horizon:</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {([3, 6, 12, 60] as const).map((h) => (
                    <button
                      key={h}
                      onClick={() => setHorizon(h)}
                      className={`py-1.5 text-xs font-mono rounded border transition-colors cursor-pointer text-center ${
                        horizon === h
                          ? 'bg-slate-800 border-teal-500 text-teal-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {h === 60 ? '5 Years' : `${h} Mo`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Curves & Clinical SOAP Care Plan (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {simResult && (
            <>
              {/* Outcome Delta Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                    5-YR MACE REDUCTION
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                      {simResult.projectedMetrics.maceRiskDelta}%
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {simResult.projectedMetrics.baselineMaceFiveYear}% →{' '}
                    <span className="text-white font-bold">
                      {simResult.projectedMetrics.simulatedMaceFiveYear}%
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                    CKD STAGE 4/5 DECEL.
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                      {simResult.projectedMetrics.ckdRiskDelta}%
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {simResult.projectedMetrics.baselineCkdProgressionRisk}% →{' '}
                    <span className="text-white font-bold">
                      {simResult.projectedMetrics.simulatedCkdProgressionRisk}%
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                    ACUTE ADMISSION REDUCTION
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                      {simResult.projectedMetrics.hospitalizationRiskDelta}%
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {simResult.projectedMetrics.baselineHospitalizationRisk}% →{' '}
                    <span className="text-white font-bold">
                      {simResult.projectedMetrics.simulatedHospitalizationRisk}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Trajectory Comparison Chart */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
                      LONGITUDINAL CLINICAL TRAJECTORY CURVE
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {metricConfigs[activeChartMetric].label}
                    </div>
                  </div>

                  {/* Metric Switcher */}
                  <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded border border-slate-800">
                    {(Object.keys(metricConfigs) as (keyof typeof metricConfigs)[]).map((mk) => (
                      <button
                        key={mk}
                        onClick={() => setActiveChartMetric(mk)}
                        className={`px-2 py-1 text-[11px] font-mono rounded transition-colors cursor-pointer ${
                          activeChartMetric === mk
                            ? 'bg-slate-800 text-teal-300 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {mk.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Curve Canvas */}
                <div className="mt-4 relative h-64 bg-slate-950 rounded-lg border border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-25 pointer-events-none" />

                  <div className="relative w-full h-44">
                    {(() => {
                      const points = simResult.trajectoryPoints;
                      const baselineVals = points.map((p) => p.baseline[activeChartMetric]);
                      const simVals = points.map((p) => p.simulated[activeChartMetric]);
                      const allVals = [...baselineVals, ...simVals];
                      const minVal = Math.min(...allVals) * 0.9;
                      const maxVal = Math.max(...allVals) * 1.1 || 100;

                      const getY = (val: number) => {
                        const ratio = (val - minVal) / (maxVal - minVal || 1);
                        return 150 - ratio * 130;
                      };

                      const getX = (idx: number) => {
                        return 40 + idx * 110;
                      };

                      const baselinePath = points
                        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.baseline[activeChartMetric])}`)
                        .join(' ');

                      const simPath = points
                        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.simulated[activeChartMetric])}`)
                        .join(' ');

                      return (
                        <svg className="w-full h-full" viewBox="0 0 520 180" preserveAspectRatio="none">
                          <path
                            d={baselinePath}
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="2.5"
                            strokeDasharray="4 4"
                          />
                          <path
                            d={simPath}
                            fill="none"
                            stroke="#0d9488"
                            strokeWidth="3"
                          />

                          {points.map((p, i) => (
                            <g key={i}>
                              <circle
                                cx={getX(i)}
                                cy={getY(p.baseline[activeChartMetric])}
                                r="4"
                                fill="#f43f5e"
                              />
                              <circle
                                cx={getX(i)}
                                cy={getY(p.simulated[activeChartMetric])}
                                r="5"
                                fill="#0d9488"
                              />
                            </g>
                          ))}
                        </svg>
                      );
                    })()}
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800 z-10">
                    {simResult.trajectoryPoints.map((p) => (
                      <div key={p.label} className="text-center">
                        <div className="font-medium text-slate-300">{p.label}</div>
                        <div className="text-[10px] text-teal-400 font-bold tabular-nums">
                          {p.simulated[activeChartMetric]} {metricConfigs[activeChartMetric].unit}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="absolute top-3 right-4 flex items-center gap-4 text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded z-10">
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <span className="w-3 h-0.5 bg-rose-400 border-b border-dashed" />
                      <span>Natural History Baseline Drift</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
                      <span className="w-3 h-1 bg-teal-500 rounded-full" />
                      <span>Escalated GDMT Protocol</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guideline Alignment Audit (ADA, ACC/AHA, KDIGO) */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-xs font-mono uppercase text-slate-400 font-semibold mb-3">
                  CLINICAL GUIDELINE ALIGNMENT AUDIT
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                      <span>ADA 2026 Standards</span>
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          simResult.guidelineCompliance.adaDiabetes2026.status === 'compliant'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {simResult.guidelineCompliance.adaDiabetes2026.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {simResult.guidelineCompliance.adaDiabetes2026.notes}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                      <span>ACC/AHA 2025</span>
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          simResult.guidelineCompliance.accAhaCardio2025.status === 'compliant'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {simResult.guidelineCompliance.accAhaCardio2025.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {simResult.guidelineCompliance.accAhaCardio2025.notes}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                      <span>KDIGO Renal 2024</span>
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          simResult.guidelineCompliance.kdigoRenal2024.status === 'compliant'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {simResult.guidelineCompliance.kdigoRenal2024.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {simResult.guidelineCompliance.kdigoRenal2024.notes}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personalized Clinical Action Plan & Orders */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-teal-400" />
                    <div>
                      <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
                        CLINICAL ORDER SET & SOAP MANAGEMENT PLAN
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        Attending Care Directives & Milestone Orders
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400 font-mono">
                    Physician: {patient.attendingPhysician.split(' (')[0]}
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  {simResult.aiCarePlan.summary}
                </p>

                {/* Prioritized Key Clinical Actions */}
                <div className="space-y-2.5">
                  <div className="text-xs font-mono text-slate-400 uppercase font-semibold">
                    RECOMMENDED CLINICAL ORDERS
                  </div>
                  {simResult.aiCarePlan.keyRecommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{rec.title}</span>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-medium ${
                            rec.priority === 'Urgent'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : rec.priority === 'High'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-teal-950 text-teal-300 border border-teal-800'
                          }`}
                        >
                          {rec.priority} Priority
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-300 leading-relaxed">
                        {rec.rationale}
                      </div>
                      <div className="mt-1.5 text-xs text-emerald-400 font-medium">
                        Projected Endpoint: {rec.expectedOutcome}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Laboratory Monitoring Milestones */}
                <div className="pt-3 border-t border-slate-800">
                  <div className="text-xs font-mono text-slate-400 uppercase mb-2 font-semibold">
                    LABORATORY MONITORING ORDERS
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {simResult.aiCarePlan.monitoringMilestones.map((m, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                        <div className="text-[10px] font-mono text-teal-400 font-bold">{m.timeframe}</div>
                        <div className="text-xs font-semibold text-white mt-0.5">{m.action}</div>
                        <div className="text-[11px] text-slate-400 mt-1">{m.targetMetric}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety Precautions & Sick-Day Guidance */}
                {simResult.aiCarePlan.safetyWarnings.length > 0 && (
                  <div className="pt-3 border-t border-slate-800">
                    <div className="text-xs font-mono text-rose-400 uppercase mb-1.5 flex items-center gap-1.5 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>CLINICAL SAFETY PRECAUTIONS & SICK-DAY RULES</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside bg-slate-950 p-3 rounded-lg border border-slate-800">
                      {simResult.aiCarePlan.safetyWarnings.map((w, idx) => (
                        <li key={idx} className="leading-relaxed">{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
