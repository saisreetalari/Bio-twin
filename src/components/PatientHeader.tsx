import React from 'react';
import { VirtualPatient, getPatientInitials } from '../types/patient';
import {
  AlertOctagon,
  ShieldCheck,
  User,
  Calendar,
  Building2,
  Stethoscope,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Plus,
  Sparkles,
} from 'lucide-react';

interface PatientHeaderProps {
  patient: VirtualPatient;
  patients: VirtualPatient[];
  onSelectPatient: (patient: VirtualPatient) => void;
  onOpenNewPatientModal: () => void;
  liveStreaming: boolean;
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  patient,
  patients,
  onSelectPatient,
  onOpenNewPatientModal,
  liveStreaming,
}) => {
  // Approximate DOB from age if provided
  const simulatedDob = patient.age ? `04/18/${2026 - patient.age}` : 'Unspecified';

  // Calculate Body Surface Area if height and weight available
  const hasAnthropometrics = patient.heightCm > 0 && patient.weightKg > 0;
  const bsa = hasAnthropometrics
    ? Math.sqrt((patient.heightCm * patient.weightKg) / 3600).toFixed(2)
    : '--';

  // BMI classification
  const getBmiClass = (bmi: number) => {
    if (!bmi || bmi <= 0) return 'Uncalculated';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal Weight';
    if (bmi < 30) return 'Overweight';
    if (bmi < 35) return 'Class I Obesity';
    return 'Class II/III Obesity';
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Patient Core Demographics & Identifiers */}
          <div className="flex items-start gap-4">
            {/* Patient Monogram Initial Badge */}
            <div className="relative shrink-0">
              <div
                className="w-16 h-16 rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center shadow-md select-none group ring-1 ring-white/5"
                title={`${patient.fullName} · Monogram Initial Badge`}
              >
                <span className="font-mono font-bold text-xl tracking-wider text-teal-300 group-hover:text-teal-200 transition-colors">
                  {getPatientInitials(patient.fullName)}
                </span>
                <span className="text-[9px] font-mono uppercase text-slate-500 font-medium tracking-tight">
                  Twin ID
                </span>
              </div>
              {liveStreaming && (
                <span
                  title="Telemetry sensor link active"
                  className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
                </span>
              )}
            </div>

            {/* Demographics & Clinical Information */}
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {patient.fullName}
                </h1>
                <span className="text-xs font-mono text-teal-300">
                  MRN: {patient.mrn}
                </span>
                <span className="text-xs text-slate-600">·</span>
                <span className="text-xs font-mono text-slate-400">
                  {patient.twinId}
                </span>
                <span className="text-xs text-slate-600">·</span>
                <span className="text-xs text-emerald-400 font-medium">
                  Full Code
                </span>
              </div>

              {/* Patient Attributes Line */}
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-300">
                <span className="font-semibold text-white">
                  {patient.age ? `${patient.age} y.o.` : 'Age unrecorded'}
                </span>
                {patient.age > 0 && (
                  <>
                    <span className="text-slate-600">·</span>
                    <span>DOB: {simulatedDob}</span>
                  </>
                )}
                {patient.sex && (
                  <>
                    <span className="text-slate-600">·</span>
                    <span>{patient.sex}</span>
                  </>
                )}
                {hasAnthropometrics && (
                  <>
                    <span className="text-slate-600">·</span>
                    <span>
                      {patient.heightCm} cm · {patient.weightKg} kg
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-slate-300 tabular-nums">
                      BMI {patient.bmi} ({getBmiClass(patient.bmi)}) · BSA {bsa} m²
                    </span>
                  </>
                )}
              </div>

              {/* Care Team & Location */}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                  <span>Attending: <strong className="text-slate-200 font-medium">{patient.attendingPhysician}</strong></span>
                </div>
                <span className="text-slate-700">·</span>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patient.department}</span>
                </div>
                <span className="text-slate-700">·</span>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Last Encounter: {patient.lastEncounterDate}</span>
                </div>
              </div>

              {/* Clinical Safety & Allergies Alert */}
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-rose-300">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Allergies:</span>
                  <span className="text-slate-300">
                    {patient.allergies.join(', ')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="font-semibold text-slate-300">ICD-10:</span>
                  <span className="font-mono text-slate-300 text-[11px]">
                    {patient.icdCodes.join(' · ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Evidence-Based Clinical Risk Stratification */}
          <div className="grid grid-cols-3 gap-2.5 shrink-0 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            {/* 5-Year MACE / ASCVD Risk */}
            <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded min-w-[125px]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                5-YR MACE RISK
              </div>
              <div className="mt-1 flex items-baseline">
                <span
                  className={`text-2xl font-bold font-mono tabular-nums ${
                    patient.maceFiveYearRisk >= 20
                      ? 'text-rose-400'
                      : patient.maceFiveYearRisk >= 10
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {patient.maceFiveYearRisk.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-400 ml-1">%</span>
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">
                {patient.maceFiveYearRisk >= 20 ? 'High Risk Category' : 'Intermediate Risk'}
              </div>
            </div>

            {/* CKD Stage 4/5 Progression */}
            <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded min-w-[125px]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                CKD 5-YR DRIFT
              </div>
              <div className="mt-1 flex items-baseline">
                <span
                  className={`text-2xl font-bold font-mono tabular-nums ${
                    patient.ckdProgressionFiveYearRisk >= 30
                      ? 'text-amber-400'
                      : 'text-slate-200'
                  }`}
                >
                  {patient.ckdProgressionFiveYearRisk.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-400 ml-1">%</span>
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">
                KDIGO Heatmap G3/A2
              </div>
            </div>

            {/* 1-Yr Hospitalization / Decompensation */}
            <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded min-w-[125px]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                1-YR ADMISSION
              </div>
              <div className="mt-1 flex items-baseline">
                <span
                  className={`text-2xl font-bold font-mono tabular-nums ${
                    patient.hospitalizationOneYearRisk >= 20
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {patient.hospitalizationOneYearRisk.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-400 ml-1">%</span>
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">
                HF / Acute Care Readmit
              </div>
            </div>
          </div>
        </div>

        {/* Physician Active Patient Roster & Switcher */}
        {patients && patients.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium mr-1">
                <Users className="w-3.5 h-3.5 text-teal-400" />
                <span>Patient-Entered Records ({patients.length}):</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {patients.map((p) => {
                  const isCurrent = p.id === patient.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectPatient(p)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-teal-700 text-white shadow-xs font-semibold'
                          : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                      }`}
                      title={`Switch active patient to ${p.fullName} (${p.mrn})`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-white' : 'bg-slate-500'}`} />
                      <span>{p.fullName}</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">[{p.mrn}]</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
