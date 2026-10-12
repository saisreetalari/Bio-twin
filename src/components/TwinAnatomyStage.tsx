import React, { useState } from 'react';
import { VirtualPatient, OrganSystemModel } from '../types/patient';
import {
  Heart,
  Activity,
  Droplets,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sliders,
  Stethoscope,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Gauge,
  Flame,
  TestTube2,
  Zap,
} from 'lucide-react';

interface TwinAnatomyStageProps {
  patient: VirtualPatient;
  liveStreaming: boolean;
  onOpenPredictiveCare: () => void;
  initialViewMode?: 'pathophysiology' | 'hemodynamics' | 'biomarkers';
}

export const TwinAnatomyStage: React.FC<TwinAnatomyStageProps> = ({
  patient,
  liveStreaming,
  onOpenPredictiveCare,
  initialViewMode = 'pathophysiology',
}) => {
  const [selectedSystemKey, setSelectedSystemKey] = useState<string>('cardiovascular');
  const [viewMode, setViewMode] = useState<'pathophysiology' | 'hemodynamics' | 'biomarkers'>(initialViewMode);
  const [biomarkerFilter, setBiomarkerFilter] = useState<'all' | 'flagged' | 'cardiorenal'>('all');

  const selectedSystem: OrganSystemModel =
    patient.organSystems.find((s) => s.systemKey === selectedSystemKey) || patient.organSystems[0];

  // Calculate Body Surface Area & Cardiac Index
  const hasBsa = (patient.heightCm || 0) > 0 && (patient.weightKg || 0) > 0;
  const bsa = hasBsa ? Math.sqrt((patient.heightCm * patient.weightKg) / 3600) : 1.73;
  const cardiacIndex = (patient.vitals.cardiacOutput && bsa > 0) ? (patient.vitals.cardiacOutput / bsa).toFixed(2) : '2.80';
  const pulsePressure = (patient.vitals.systolicBp || 120) - (patient.vitals.diastolicBp || 80);

  // Complete categorized biomarker inventory
  const allBiomarkers = [
    // Glycemic & Metabolic
    { key: 'hba1c', name: 'Glycated Hemoglobin (HbA1c)', value: `${patient.labs.hba1c}%`, ref: '< 5.7%', organ: 'Metabolic / Pancreas', status: patient.labs.hba1c >= 7.0 ? 'critical' : patient.labs.hba1c > 5.6 ? 'warning' : 'normal', note: 'Microvascular glucotoxicity risk' },
    { key: 'fastingGlucose', name: 'Fasting Plasma Glucose', value: `${patient.labs.fastingGlucose} mg/dL`, ref: '70 - 99 mg/dL', organ: 'Metabolic / Liver', status: patient.labs.fastingGlucose >= 126 ? 'critical' : patient.labs.fastingGlucose >= 100 ? 'warning' : 'normal', note: 'Hepatic gluconeogenesis uncoupling' },
    
    // Renal & Electrolytes
    { key: 'egfr', name: 'eGFR (CKD-EPI 2021)', value: `${patient.labs.egfr} mL/min`, ref: '≥ 60 mL/min', organ: 'Renal Glomerular', status: patient.labs.egfr < 45 ? 'critical' : patient.labs.egfr < 60 ? 'warning' : 'normal', note: 'Stage 3a functional nephron loss' },
    { key: 'creatinine', name: 'Serum Creatinine', value: `${patient.labs.creatinine} mg/dL`, ref: '0.60 - 1.10 mg/dL', organ: 'Renal Glomerular', status: patient.labs.creatinine > 1.2 ? 'warning' : 'normal', note: 'Impaired clearance index' },
    { key: 'uacr', name: 'Urine Albumin/Creatinine (UACR)', value: `${patient.labs.uacr} mg/g`, ref: '< 30 mg/g', organ: 'Renal Glomerular', status: patient.labs.uacr >= 300 ? 'critical' : patient.labs.uacr >= 30 ? 'warning' : 'normal', note: 'Glomerular podocyte barrier breach' },
    { key: 'potassium', name: 'Serum Potassium (K+)', value: `${patient.labs.potassium} mEq/L`, ref: '3.5 - 5.0 mEq/L', organ: 'Renal / Electrolytes', status: patient.labs.potassium > 5.0 || patient.labs.potassium < 3.5 ? 'warning' : 'normal', note: 'Electrophysiological safety for RAASi' },
    { key: 'sodium', name: 'Serum Sodium (Na+)', value: `${patient.labs.sodium} mEq/L`, ref: '135 - 145 mEq/L', organ: 'Renal / Fluid Balance', status: 'normal', note: 'Osmolar extracellular balance' },
    { key: 'bicarbonate', name: 'Serum Bicarbonate (HCO3-)', value: `${patient.labs.bicarbonate} mEq/L`, ref: '22 - 29 mEq/L', organ: 'Renal / Acid-Base', status: patient.labs.bicarbonate < 22 ? 'warning' : 'normal', note: 'Metabolic acid retention in CKD' },

    // Cardiac Strain & Inflammation
    { key: 'bnp', name: 'B-Type Natriuretic Peptide (BNP)', value: `${patient.labs.bnp} pg/mL`, ref: '< 100 pg/mL', organ: 'Cardiovascular Network', status: patient.labs.bnp >= 100 ? 'warning' : 'normal', note: 'Ventricular wall diastolic stretch' },
    { key: 'hsCrp', name: 'High-Sensitivity CRP (hs-CRP)', value: `${patient.labs.hsCrp} mg/L`, ref: '< 1.0 mg/L', organ: 'Vascular / Inflammatory', status: patient.labs.hsCrp >= 3.0 ? 'critical' : patient.labs.hsCrp >= 1.0 ? 'warning' : 'normal', note: 'Residual cardiovascular athero-inflammation' },

    // Lipid Atherogenicity
    { key: 'ldl', name: 'LDL Cholesterol', value: `${patient.labs.ldl} mg/dL`, ref: '< 70 mg/dL (High Risk)', organ: 'Vascular Endothelium', status: patient.labs.ldl > 100 ? 'critical' : patient.labs.ldl > 70 ? 'warning' : 'normal', note: 'Apolipoprotein B plaque deposition' },
    { key: 'hdl', name: 'HDL Cholesterol', value: `${patient.labs.hdl} mg/dL`, ref: '> 40 mg/dL', organ: 'Lipid Transport', status: patient.labs.hdl < 40 ? 'warning' : 'normal', note: 'Reverse cholesterol transport efficiency' },
    { key: 'triglycerides', name: 'Triglycerides', value: `${patient.labs.triglycerides} mg/dL`, ref: '< 150 mg/dL', organ: 'Metabolic / Adipose', status: patient.labs.triglycerides >= 200 ? 'warning' : 'normal', note: 'Remnant lipoprotein particle excess' },
    { key: 'totalCholesterol', name: 'Total Cholesterol', value: `${patient.labs.totalCholesterol} mg/dL`, ref: '< 200 mg/dL', organ: 'Metabolic System', status: patient.labs.totalCholesterol > 200 ? 'warning' : 'normal', note: 'Total serum sterol concentration' },

    // Hepatic & Hematology
    { key: 'alt', name: 'Alanine Aminotransferase (ALT)', value: `${patient.labs.alt} U/L`, ref: '7 - 35 U/L', organ: 'Hepatic / Liver', status: patient.labs.alt > 35 ? 'warning' : 'normal', note: 'Hepatocyte integrity / steatosis' },
    { key: 'ast', name: 'Aspartate Aminotransferase (AST)', value: `${patient.labs.ast} U/L`, ref: '8 - 33 U/L', organ: 'Hepatic / Muscle', status: patient.labs.ast > 33 ? 'warning' : 'normal', note: 'Non-specific transaminase index' },
    { key: 'hemoglobin', name: 'Hemoglobin (Hgb)', value: `${patient.labs.hemoglobin} g/dL`, ref: '12.0 - 16.0 g/dL', organ: 'Hematology / Oxygenation', status: patient.labs.hemoglobin < 12.0 ? 'warning' : 'normal', note: 'Renal erythropoietin-dependent oxygen transport' },
  ];

  const filteredBiomarkers = allBiomarkers.filter((bm) => {
    if (biomarkerFilter === 'flagged') return bm.status !== 'normal';
    if (biomarkerFilter === 'cardiorenal') return ['Cardiovascular Network', 'Renal Glomerular', 'Vascular Endothelium', 'Renal / Electrolytes'].includes(bm.organ);
    return true;
  });

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'nominal':
        return {
          label: 'Normal Function',
          textClass: 'text-emerald-400',
          bgClass: 'bg-emerald-950/60 border-emerald-800',
          dot: 'bg-emerald-500',
        };
      case 'compensated':
        return {
          label: 'Compensated Function',
          textClass: 'text-teal-300',
          bgClass: 'bg-teal-950/60 border-teal-800',
          dot: 'bg-teal-400',
        };
      case 'compromised':
        return {
          label: 'Moderate Dysfunction',
          textClass: 'text-amber-400',
          bgClass: 'bg-amber-950/60 border-amber-800',
          dot: 'bg-amber-400',
        };
      case 'critical':
        return {
          label: 'Significant Strain',
          textClass: 'text-rose-400',
          bgClass: 'bg-rose-950/60 border-rose-800',
          dot: 'bg-rose-500',
        };
      default:
        return {
          label: 'Unassigned',
          textClass: 'text-slate-400',
          bgClass: 'bg-slate-800 border-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  // Find medications relevant to selected organ system
  const getRelevantMeds = (systemKey: string) => {
    if (systemKey === 'cardiovascular') {
      return patient.medications.filter((m) =>
        ['Beta-1 Selective Blocker', 'Calcium Channel Blocker', 'ACE Inhibitor', 'Antiplatelet', 'P2Y12 Inhibitor'].includes(m.category)
      );
    }
    if (systemKey === 'renal') {
      return patient.medications.filter((m) =>
        ['ACE Inhibitor', 'SGLT2 Inhibitor', 'Non-steroidal MRA'].includes(m.category) || m.name.toLowerCase().includes('lisinopril')
      );
    }
    if (systemKey === 'metabolic') {
      return patient.medications.filter((m) =>
        ['Biguanide', 'HMG-CoA Reductase Inhibitor', 'GLP-1 RA', 'SGLT2 Inhibitor'].includes(m.category)
      );
    }
    return [];
  };

  const relevantMeds = getRelevantMeds(selectedSystem.systemKey);

  return (
    <div className="space-y-4">
      {/* Perspective Switcher Ribbon */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-mono uppercase text-slate-300 font-bold">
            PHYSIOLOGICAL MODEL PERSPECTIVES:
          </span>
        </div>

        {/* 3 Prominent Perspective Buttons with Clear Descriptions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode('pathophysiology')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              viewMode === 'pathophysiology'
                ? 'bg-teal-950 border-teal-500 text-teal-200 shadow-md ring-1 ring-teal-500'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
            <span>Pathophysiology & Organs</span>
          </button>

          <button
            onClick={() => setViewMode('hemodynamics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              viewMode === 'hemodynamics'
                ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-md ring-1 ring-rose-500'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-rose-400" />
            <span>Hemodynamics & Pressures</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-900/60 text-rose-300">
              SVR {patient.vitals.systemicVascularResistance}
            </span>
          </button>

          <button
            onClick={() => setViewMode('biomarkers')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              viewMode === 'biomarkers'
                ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <TestTube2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Biomarkers & Metabolic Matrix</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-900/60 text-amber-300">
              {allBiomarkers.filter(b => b.status !== 'normal').length} Flagged
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Visual Anatomy Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          {/* Header depending on active view */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                {viewMode === 'pathophysiology' && <Stethoscope className="w-3.5 h-3.5 text-teal-400" />}
                {viewMode === 'hemodynamics' && <Gauge className="w-3.5 h-3.5 text-rose-400" />}
                {viewMode === 'biomarkers' && <TestTube2 className="w-3.5 h-3.5 text-amber-400" />}
                <span className="font-bold">
                  {viewMode === 'pathophysiology' && 'ORGAN PATHOLOGY & BIOMECHANICAL STRESS'}
                  {viewMode === 'hemodynamics' && 'HEMODYNAMIC PERFUSION & PRESSURE GRADIENTS'}
                  {viewMode === 'biomarkers' && 'BIOCHEMICAL & METABOLIC BIOMARKER ANATOMY'}
                </span>
              </div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {viewMode === 'pathophysiology' && `Inter-Organ System Health for ${patient.fullName}`}
                {viewMode === 'hemodynamics' && `Vascular Resistance (SVR ${patient.vitals.systemicVascularResistance} dyn·s/cm⁵) & Outflow`}
                {viewMode === 'biomarkers' && `Anatomically Mapped End-Organ Biomarkers`}
              </div>
            </div>

            {/* Quick Mode Status Badge */}
            <div className="text-right">
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded border uppercase font-medium ${
                  viewMode === 'hemodynamics'
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : viewMode === 'biomarkers'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-teal-950 text-teal-300 border-teal-800'
                }`}
              >
                {viewMode.toUpperCase()} VIEW ACTIVE
              </span>
            </div>
          </div>

          {/* Canvas Container */}
          <div className="relative min-h-[460px] my-3 flex items-center justify-center bg-slate-950/70 rounded-xl border border-slate-800/80 p-4 overflow-hidden">
            {/* Background Medical Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:28px_28px] opacity-25 rounded-xl pointer-events-none" />

            {/* Central SVG Body Schematic */}
            <div className="relative w-full max-w-[430px] h-[440px] flex items-center justify-center">
              <svg
                className="w-full h-full text-slate-700"
                viewBox="0 0 320 480"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Body Contour */}
                <path
                  d="M160 25 C175 25, 185 38, 185 58 C185 78, 176 90, 188 100 C210 108, 235 125, 240 150 C246 175, 240 245, 235 275 C230 305, 226 345, 222 455 C218 468, 204 468, 198 455 C188 405, 180 325, 170 275 C165 255, 155 255, 150 275 C140 325, 132 405, 122 455 C116 468, 102 468, 98 455 C94 345, 90 305, 85 275 C80 245, 74 175, 80 150 C85 125, 110 108, 132 100 C144 90, 135 78, 135 58 C135 38, 145 25, 160 25 Z"
                  stroke="#334155"
                  strokeWidth="1.5"
                  fill="#0b1120"
                  fillOpacity="0.8"
                />

                {/* Central Autonomic Spine / Vagus */}
                <line
                  x1="160"
                  y1="55"
                  x2="160"
                  y2="280"
                  stroke={viewMode === 'hemodynamics' ? '#f43f5e' : '#475569'}
                  strokeWidth={viewMode === 'hemodynamics' ? '2' : '1.5'}
                  strokeDasharray="3 3"
                />

                {/* Arterial Tree: Aorta & Common Iliac */}
                <path
                  d="M160 145 Q160 175 152 205 Q145 235 160 265 Q170 305 180 380"
                  stroke="#dc2626"
                  strokeWidth={viewMode === 'hemodynamics' ? '3.5' : '2.5'}
                  fill="none"
                  opacity={viewMode === 'hemodynamics' ? 1 : 0.6}
                />
                <path
                  d="M160 265 Q150 305 140 380"
                  stroke="#dc2626"
                  strokeWidth={viewMode === 'hemodynamics' ? '3.5' : '2.5'}
                  fill="none"
                  opacity={viewMode === 'hemodynamics' ? 1 : 0.6}
                />

                {/* Pulmonary Artery branches */}
                <path
                  d="M155 160 Q130 150 115 155 M165 160 Q190 150 205 155"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  fill="none"
                  opacity={viewMode === 'hemodynamics' ? 0.9 : 0.6}
                />

                {/* Bilateral Renal Arteries */}
                <path
                  d="M152 225 L125 230 M155 228 L195 232"
                  stroke="#dc2626"
                  strokeWidth={viewMode === 'hemodynamics' ? '3' : '2'}
                />

                {/* Carotid Arteries */}
                <path
                  d="M155 125 L155 75 M165 125 L165 75"
                  stroke="#dc2626"
                  strokeWidth={viewMode === 'hemodynamics' ? '2.5' : '1.5'}
                  opacity={viewMode === 'hemodynamics' ? 1 : 0.5}
                />

                {/* Heart Glyph */}
                <path
                  d="M155 140 C155 130 142 125 135 135 C125 145 125 160 145 175 L155 185 L165 175 C185 160 185 145 175 135 C168 125 155 130 155 140 Z"
                  fill={viewMode === 'hemodynamics' ? '#dc2626' : '#b91c1c'}
                  fillOpacity={viewMode === 'hemodynamics' ? 0.6 : 0.4}
                  stroke="#ef4444"
                  strokeWidth="1.8"
                />

                {/* Kidneys outline */}
                <ellipse cx="120" cy="232" rx="10" ry="15" fill="#4338ca" fillOpacity="0.35" stroke="#6366f1" strokeWidth="1.5" />
                <ellipse cx="200" cy="234" rx="10" ry="15" fill="#4338ca" fillOpacity="0.35" stroke="#6366f1" strokeWidth="1.5" />

                {/* Animated Pulsing Hemodynamic Flow Rings (Only in Hemodynamics Mode) */}
                {viewMode === 'hemodynamics' && liveStreaming && (
                  <>
                    <circle cx="155" cy="160" r="16" stroke="#f43f5e" strokeWidth="1.5" fill="none" opacity="0.8">
                      <animate attributeName="r" values="12;24;12" dur="1.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="120" cy="232" r="12" stroke="#6366f1" strokeWidth="1.5" fill="none" opacity="0.7">
                      <animate attributeName="r" values="8;18;8" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="200" cy="234" r="12" stroke="#6366f1" strokeWidth="1.5" fill="none" opacity="0.7">
                      <animate attributeName="r" values="8;18;8" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}
              </svg>

              {/* ==================================================== */}
              {/* MODE 1: PATHOPHYSIOLOGY OVERLAY NODES */}
              {/* ==================================================== */}
              {viewMode === 'pathophysiology' && (
                <>
                  {/* Neuro-Autonomic */}
                  <button
                    onClick={() => setSelectedSystemKey('neurological')}
                    className={`absolute top-[6%] left-[50%] -translate-x-1/2 px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedSystemKey === 'neurological'
                        ? 'bg-slate-800 border-teal-500 shadow-md ring-1 ring-teal-500'
                        : 'bg-slate-900/95 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-400" />
                      <span className="text-xs font-semibold text-white">Autonomic Axis</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      HRV SDNN: {patient.autonomic.hrvSdnn} ms
                    </div>
                  </button>

                  {/* Pulmonary */}
                  <button
                    onClick={() => setSelectedSystemKey('pulmonary')}
                    className={`absolute top-[20%] left-[4%] px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedSystemKey === 'pulmonary'
                        ? 'bg-slate-800 border-teal-500 shadow-md ring-1 ring-teal-500'
                        : 'bg-slate-900/95 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span className="text-xs font-semibold text-white">Pulmonary Circuit</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      SpO2 {patient.vitals.spo2}% · RR {patient.vitals.respiratoryRate}/min
                    </div>
                  </button>

                  {/* Cardiovascular */}
                  <button
                    onClick={() => setSelectedSystemKey('cardiovascular')}
                    className={`absolute top-[28%] right-[4%] px-3 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedSystemKey === 'cardiovascular'
                        ? 'bg-slate-800 border-rose-500 shadow-md ring-1 ring-rose-500'
                        : 'bg-slate-900/95 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full bg-rose-500 ${liveStreaming ? 'animate-pulse' : ''}`} />
                      <span className="text-xs font-bold text-white">Cardiovascular</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-200 mt-0.5">
                      BP {patient.vitals.systolicBp}/{patient.vitals.diastolicBp} · LVEF {patient.vitals.ejectionFraction}%
                    </div>
                  </button>

                  {/* Metabolic / Hepatic */}
                  <button
                    onClick={() => setSelectedSystemKey('metabolic')}
                    className={`absolute top-[44%] right-[6%] px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedSystemKey === 'metabolic'
                        ? 'bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500'
                        : 'bg-slate-900/95 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-xs font-semibold text-white">Metabolic / Hepatic</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      HbA1c: {patient.labs.hba1c}% · LDL: {patient.labs.ldl}
                    </div>
                  </button>

                  {/* Renal */}
                  <button
                    onClick={() => setSelectedSystemKey('renal')}
                    className={`absolute top-[52%] left-[4%] px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedSystemKey === 'renal'
                        ? 'bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                        : 'bg-slate-900/95 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="text-xs font-semibold text-white">Renal Glomerular</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      eGFR: {patient.labs.egfr} · UACR: {patient.labs.uacr}
                    </div>
                  </button>
                </>
              )}

              {/* ==================================================== */}
              {/* MODE 2: HEMODYNAMICS OVERLAY NODES (ACTIVE PRESSURE & FLOW) */}
              {/* ==================================================== */}
              {viewMode === 'hemodynamics' && (
                <>
                  {/* Cerebral & Carotid Perfusion */}
                  <div className="absolute top-[5%] left-[50%] -translate-x-1/2 p-2 rounded-lg bg-slate-900/95 border border-rose-500/80 shadow-lg text-left min-w-[210px]">
                    <div className="flex items-center justify-between text-[11px] font-mono text-rose-300 font-bold">
                      <span>CEREBRAL PERFUSION</span>
                      <span>PULSE: {pulsePressure} mmHg</span>
                    </div>
                    <div className="text-[10px] text-slate-300 mt-0.5">
                      Carotid flow velocity: Normal · Vagal tone: {patient.autonomic.hrvSdnn} ms
                    </div>
                  </div>

                  {/* Central Cardiac Pump Outflow */}
                  <div className="absolute top-[24%] right-[2%] p-2.5 rounded-lg bg-slate-900/95 border border-rose-500 shadow-xl text-left min-w-[220px]">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        <span>CARDIAC PUMP & FLOW</span>
                      </span>
                      <span className="text-[10px] font-mono text-rose-400">
                        EF {patient.vitals.ejectionFraction}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mt-1.5 text-[10px] font-mono">
                      <div className="bg-slate-950 p-1 rounded">
                        <span className="text-slate-400">CO: </span>
                        <strong className="text-white">{patient.vitals.cardiacOutput} L/min</strong>
                      </div>
                      <div className="bg-slate-950 p-1 rounded">
                        <span className="text-slate-400">SV: </span>
                        <strong className="text-white">{patient.vitals.strokeVolume} mL</strong>
                      </div>
                      <div className="bg-slate-950 p-1 rounded">
                        <span className="text-slate-400">CI: </span>
                        <strong className="text-white">{cardiacIndex} L/min/m²</strong>
                      </div>
                      <div className="bg-slate-950 p-1 rounded">
                        <span className="text-slate-400">HR: </span>
                        <strong className="text-white">{patient.vitals.heartRate} bpm</strong>
                      </div>
                    </div>
                  </div>

                  {/* Systemic Vascular Resistance (SVR) & Aorta Afterload */}
                  <div className="absolute top-[44%] left-[2%] p-2.5 rounded-lg bg-slate-900/95 border border-amber-500 shadow-xl text-left min-w-[220px]">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-amber-400" />
                        <span>AFTERLOAD & RESISTANCE</span>
                      </span>
                      <span className="text-[10px] font-mono px-1 bg-amber-950 border border-amber-800 rounded">
                        ELEVATED
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] font-mono text-white">
                      SVR: <strong className="text-amber-400">{patient.vitals.systemicVascularResistance}</strong> dyn·s/cm⁵
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      MAP: <strong>{patient.vitals.meanArterialPressure} mmHg</strong> (Ref: 70-100)
                    </div>
                    <div className="text-[9px] text-amber-300/80 mt-1">
                      Excessive left ventricular wall stress & impedance
                    </div>
                  </div>

                  {/* Renal Glomerular Capillary Pressure */}
                  <div className="absolute top-[68%] right-[2%] p-2.5 rounded-lg bg-slate-900/95 border border-indigo-500 shadow-xl text-left min-w-[220px]">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                      <span>RENAL MICROPERFUSION</span>
                      <span className="text-[10px] font-mono text-indigo-400">
                        eGFR {patient.labs.egfr}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-slate-300">
                      Intraglomerular capillary pressure: <strong>Elevated</strong>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      UACR: <strong className="text-white">{patient.labs.uacr} mg/g</strong>
                    </div>
                  </div>
                </>
              )}

              {/* ==================================================== */}
              {/* MODE 3: BIOMARKERS OVERLAY NODES (BIOCHEMICAL MAPPING) */}
              {/* ==================================================== */}
              {viewMode === 'biomarkers' && (
                <>
                  {/* Cardiac Strain & Inflammation Markers */}
                  <div className="absolute top-[16%] right-[2%] p-2 rounded-lg bg-slate-900/95 border border-rose-500 shadow-xl text-left min-w-[210px]">
                    <div className="text-[10px] font-mono uppercase text-rose-300 font-bold mb-1 flex items-center justify-between">
                      <span>CARDIAC STRAIN & INFLAM</span>
                      <span className="text-[9px] bg-rose-950 px-1 rounded">ELEVATED</span>
                    </div>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex justify-between bg-slate-950 p-1 rounded">
                        <span className="text-slate-400">hs-CRP:</span>
                        <strong className="text-rose-400">{patient.labs.hsCrp} mg/L</strong>
                      </div>
                      <div className="flex justify-between bg-slate-950 p-1 rounded">
                        <span className="text-slate-400">BNP:</span>
                        <strong className="text-white">{patient.labs.bnp} pg/mL</strong>
                      </div>
                    </div>
                  </div>

                  {/* Metabolic & Glycemic Biomarkers */}
                  <div className="absolute top-[34%] left-[2%] p-2 rounded-lg bg-slate-900/95 border border-amber-500 shadow-xl text-left min-w-[210px]">
                    <div className="text-[10px] font-mono uppercase text-amber-300 font-bold mb-1 flex items-center justify-between">
                      <span>GLYCEMIC & METABOLIC</span>
                      <span className="text-[9px] bg-amber-950 px-1 rounded">HIGH</span>
                    </div>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex justify-between bg-slate-950 p-1 rounded">
                        <span className="text-slate-400">HbA1c:</span>
                        <strong className="text-rose-400">{patient.labs.hba1c}%</strong>
                      </div>
                      <div className="flex justify-between bg-slate-950 p-1 rounded">
                        <span className="text-slate-400">Fasting Gluc:</span>
                        <strong className="text-white">{patient.labs.fastingGlucose} mg/dL</strong>
                      </div>
                    </div>
                  </div>

                  {/* Renal Filtration Panel */}
                  <div className="absolute top-[55%] right-[2%] p-2 rounded-lg bg-slate-900/95 border border-indigo-500 shadow-xl text-left min-w-[210px]">
                    <div className="text-[10px] font-mono uppercase text-indigo-300 font-bold mb-1 flex items-center justify-between">
                      <span>RENAL FUNCTION PANEL</span>
                      <span className="text-[9px] bg-indigo-950 px-1 rounded">STAGE 3a</span>
                    </div>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex justify-between bg-slate-950 p-1 rounded">
                        <span className="text-slate-400">eGFR:</span>
                        <strong className="text-amber-400">{patient.labs.egfr} mL/min</strong>
                      </div>
                      <div className="flex justify-between bg-slate-950 p-1 rounded">
                        <span className="text-slate-400">UACR:</span>
                        <strong className="text-rose-400">{patient.labs.uacr} mg/g</strong>
                      </div>
                      <div className="flex justify-between bg-slate-950 p-1 rounded">
                        <span className="text-slate-400">Potassium (K+):</span>
                        <strong className="text-white">{patient.labs.potassium} mEq/L</strong>
                      </div>
                    </div>
                  </div>

                  {/* Lipid Atherogenic Panel */}
                  <div className="absolute top-[75%] left-[2%] p-2 rounded-lg bg-slate-900/95 border border-sky-500 shadow-xl text-left min-w-[210px]">
                    <div className="text-[10px] font-mono uppercase text-sky-300 font-bold mb-1 flex items-center justify-between">
                      <span>LIPID PANEL</span>
                      <span className="text-[9px] bg-sky-950 px-1 rounded">EVALUATED</span>
                    </div>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex justify-between bg-slate-950 p-1 rounded">
                        <span className="text-slate-400">LDL-C:</span>
                        <strong className="text-rose-400">{patient.labs.ldl} mg/dL</strong>
                      </div>
                      <div className="flex justify-between bg-slate-950 p-1 rounded">
                        <span className="text-slate-400">Triglycerides:</span>
                        <strong className="text-white">{patient.labs.triglycerides} mg/dL</strong>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>
                {viewMode === 'pathophysiology' && 'Interactive organ nodes active. Click an organ to inspect.'}
                {viewMode === 'hemodynamics' && 'Hemodynamic vectors derived from stroke volume, MAP, and calibrated SVR.'}
                {viewMode === 'biomarkers' && '15 comprehensive clinical laboratory markers mapped to organ sources.'}
              </span>
            </div>

            <button
              onClick={onOpenPredictiveCare}
              className="flex items-center gap-1 text-teal-400 hover:text-teal-300 font-semibold transition-colors cursor-pointer"
            >
              <span>Simulate Interventions in Care Simulator →</span>
            </button>
          </div>
        </div>

        {/* Right Column: Contextual Inspection Drawer (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          {/* ==================================================== */}
          {/* DRAWER CONTENT 1: PATHOPHYSIOLOGY VIEW */}
          {/* ==================================================== */}
          {viewMode === 'pathophysiology' && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">ORGAN SYSTEM SPECIFICATION</div>
                  <h3 className="text-base font-bold text-white mt-0.5">{selectedSystem.name}</h3>
                </div>

                {(() => {
                  const badge = getStatusDisplay(selectedSystem.status);
                  return (
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium ${badge.bgClass} ${badge.textClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Biomechanical Stress Score */}
              <div className="mt-4 p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Pathological Stress Score:</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {selectedSystem.stressScore} / 100
                  </span>
                </div>
                <div className="mt-2 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      selectedSystem.stressScore > 75
                        ? 'bg-rose-500'
                        : selectedSystem.stressScore > 50
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedSystem.stressScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                  <span>0 (Nominal Homeostasis)</span>
                  <span>50 (Compensated)</span>
                  <span>100 (Critical Strain)</span>
                </div>
              </div>

              {/* Clinical Physiological Summary */}
              <div className="mt-4">
                <div className="text-xs font-semibold text-slate-300 mb-1">
                  Pathophysiological Mechanism & Cascade
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {selectedSystem.summary}
                </p>
              </div>

              {/* Key Biomarkers for Selected System */}
              <div className="mt-4">
                <div className="text-xs font-semibold text-slate-300 mb-2">
                  Primary System Biomarkers
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedSystem.keyMetrics.map((km) => (
                    <div key={km.label} className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                      <div className="text-[10px] font-mono text-slate-400">{km.label}</div>
                      <div className="text-sm font-bold font-mono text-white mt-0.5">{km.value}</div>
                      <div className="text-[10px] font-mono flex items-center gap-1 mt-0.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            km.status === 'critical'
                              ? 'bg-rose-400'
                              : km.status === 'warning'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <span
                          className={
                            km.status === 'critical'
                              ? 'text-rose-400'
                              : km.status === 'warning'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }
                        >
                          {km.status === 'critical' ? 'Alert High' : km.status === 'warning' ? 'Outside Range' : 'Normal'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Targeted Pharmacotherapy */}
              <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-[11px] font-semibold text-slate-300 uppercase mb-1.5">
                  Active Targeted Regimen
                </div>
                {relevantMeds.length > 0 ? (
                  <div className="space-y-1.5">
                    {relevantMeds.map((m) => (
                      <div key={m.id} className="text-xs flex items-center justify-between text-slate-200">
                        <div>
                          <strong>{m.name}</strong> {m.dosage} ({m.frequency})
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          Adh: {m.adherenceRate}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">
                    No targeted pharmacological agent currently assigned for this subsystem.
                  </div>
                )}
              </div>

              {/* Organ Switcher */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="text-[10px] font-mono uppercase text-slate-400 mb-2">
                  SWITCH ORGAN SYSTEM
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.organSystems.map((sys) => (
                    <button
                      key={sys.systemKey}
                      onClick={() => setSelectedSystemKey(sys.systemKey)}
                      className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer border ${
                        selectedSystemKey === sys.systemKey
                          ? 'bg-slate-800 text-teal-300 border-teal-500 font-semibold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {sys.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* DRAWER CONTENT 2: HEMODYNAMICS VIEW */}
          {/* ==================================================== */}
          {viewMode === 'hemodynamics' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="text-[10px] font-mono uppercase text-rose-400 font-semibold">
                  HEMODYNAMIC & VASCULAR RESISTANCE PROFILE
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Cardiovascular Afterload & Pressure Flow
                </h3>
              </div>

              {/* Hemodynamic Pressure Panel */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-400">NIBP (Systolic/Diastolic)</div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {patient.vitals.systolicBp} / {patient.vitals.diastolicBp} <span className="text-xs text-slate-400">mmHg</span>
                  </div>
                  <div className="text-[10px] text-amber-400 mt-1 font-mono">Stage 2 Hypertension</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-400">Mean Arterial Pressure (MAP)</div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {patient.vitals.meanArterialPressure} <span className="text-xs text-slate-400">mmHg</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">Target: 70 - 100 mmHg</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-400">Systemic Vascular Res. (SVR)</div>
                  <div className="text-base font-bold font-mono text-rose-400 mt-0.5">
                    {patient.vitals.systemicVascularResistance} <span className="text-xs text-slate-400">dyn·s/cm⁵</span>
                  </div>
                  <div className="text-[10px] text-rose-300 mt-1 font-mono">Marked Afterload Strain</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-400">Pulse Pressure</div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {pulsePressure} <span className="text-xs text-slate-400">mmHg</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">Large Artery Stiffness</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-400">Cardiac Output / Index</div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {patient.vitals.cardiacOutput} <span className="text-xs text-slate-400">L/min</span>
                  </div>
                  <div className="text-[10px] text-teal-300 mt-1 font-mono">CI: {cardiacIndex} L/min/m²</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-400">Stroke Volume (SV)</div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {patient.vitals.strokeVolume} <span className="text-xs text-slate-400">mL</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">LVEF: {patient.vitals.ejectionFraction}%</div>
                </div>
              </div>

              {/* Hemodynamic Clinical Interpretation */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-xs font-semibold text-rose-300 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Clinical Hemodynamic Synthesis</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Elevated Systemic Vascular Resistance ({patient.vitals.systemicVascularResistance} dyn·s/cm⁵) imposes continuous afterload on the left ventricle, causing microvascular capillary shear stress in renal afferent arterioles and worsening intraglomerular hypertension.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-teal-300">
                  <strong>GDMT Directives: </strong> SGLT2 inhibition + RAAS blockade to reduce intraglomerular capillary hypertension and afterload impedance.
                </div>
              </div>

              <button
                onClick={onOpenPredictiveCare}
                className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Simulate Hemodynamic Drug Titration →</span>
              </button>
            </div>
          )}

          {/* ==================================================== */}
          {/* DRAWER CONTENT 3: BIOMARKERS VIEW */}
          {/* ==================================================== */}
          {viewMode === 'biomarkers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase text-amber-400 font-semibold">
                    COMPREHENSIVE BIOCHEMICAL BIOMARKER MATRIX
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Laboratory Telemetry & Reference Ranges
                  </h3>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-[10px] font-mono">
                  <button
                    onClick={() => setBiomarkerFilter('all')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      biomarkerFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    ALL ({allBiomarkers.length})
                  </button>
                  <button
                    onClick={() => setBiomarkerFilter('flagged')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      biomarkerFilter === 'flagged' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800' : 'text-slate-400'
                    }`}
                  >
                    FLAGGED ({allBiomarkers.filter(b => b.status !== 'normal').length})
                  </button>
                </div>
              </div>

              {/* Scrollable Biomarkers Table */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredBiomarkers.map((bm) => (
                  <div
                    key={bm.key}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <span>{bm.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Source: {bm.organ} · Ref: {bm.ref}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-white tabular-nums">
                          {bm.value}
                        </div>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
                            bm.status === 'critical'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : bm.status === 'warning'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {bm.status === 'critical' ? 'High Risk' : bm.status === 'warning' ? 'Outside Ref' : 'Normal'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-300 flex items-center gap-1">
                      <Info className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{bm.note}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Evaluated against ADA & KDIGO laboratory thresholds</span>
                <button
                  onClick={onOpenPredictiveCare}
                  className="text-teal-400 hover:text-teal-300 font-semibold transition-colors cursor-pointer"
                >
                  Test Response in Simulator →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
