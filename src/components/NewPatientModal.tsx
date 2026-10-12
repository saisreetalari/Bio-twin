import React, { useState } from 'react';
import { VirtualPatient } from '../types/patient';
import {
  X,
  UserPlus,
  Stethoscope,
  AlertTriangle,
  Check,
  Sparkles,
  Heart,
  Activity,
  FileSpreadsheet,
  AlertOctagon,
} from 'lucide-react';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (patient: VirtualPatient) => void;
  isFirstVisit?: boolean;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onPatientCreated,
  isFirstVisit = false,
}) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<string>('');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [mrn, setMrn] = useState('');
  const [attending, setAttending] = useState('');
  const [department, setDepartment] = useState('');
  const [allergies, setAllergies] = useState('');
  const [primaryDiagnoses, setPrimaryDiagnoses] = useState('');
  const [sbp, setSbp] = useState<string>('');
  const [dbp, setDbp] = useState<string>('');
  const [hr, setHr] = useState<string>('');
  const [hba1c, setHba1c] = useState<string>('');
  const [glucose, setGlucose] = useState<string>('');
  const [egfr, setEgfr] = useState<string>('');
  const [uacr, setUacr] = useState<string>('');
  const [ldl, setLdl] = useState<string>('');
  const [medications, setMedications] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-calculated BMI if height and weight are provided
  const hasBmi = Number(heightCm) > 0 && Number(weightKg) > 0;
  const bmi = hasBmi
    ? (Number(weightKg) / ((Number(heightCm) / 100) * (Number(heightCm) / 100))).toFixed(1)
    : '--';

  const handleClearForm = () => {
    setFullName('');
    setAge('');
    setSex('');
    setHeightCm('');
    setWeightKg('');
    setMrn('');
    setAttending('');
    setDepartment('');
    setAllergies('');
    setPrimaryDiagnoses('');
    setSbp('');
    setDbp('');
    setHr('');
    setHba1c('');
    setGlucose('');
    setEgfr('');
    setUacr('');
    setLdl('');
    setMedications('');
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Please enter the patient legal full name.');
      return;
    }

    if (!age || parseInt(age, 10) <= 0 || parseInt(age, 10) > 120) {
      setFormError('Please enter a valid age between 1 and 120.');
      return;
    }

    if (!sex) {
      setFormError('Please select the biological sex.');
      return;
    }

    setLoading(true);

    const generatedMrn = mrn.trim() || `MRN-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const parsedAge = parseInt(age, 10);
    const parsedHeight = heightCm ? Number(heightCm) : 170;
    const parsedWeight = weightKg ? Number(weightKg) : 70;
    const parsedSbp = sbp ? Number(sbp) : 120;
    const parsedDbp = dbp ? Number(dbp) : 80;
    const parsedHr = hr ? Number(hr) : 72;
    const parsedHba1c = hba1c ? Number(hba1c) : 5.6;
    const parsedGlucose = glucose ? Number(glucose) : 95;
    const parsedEgfr = egfr ? Number(egfr) : 90;
    const parsedUacr = uacr ? Number(uacr) : 20;
    const parsedLdl = ldl ? Number(ldl) : 100;

    const newPatientData = {
      fullName: fullName.trim(),
      mrn: generatedMrn,
      age: parsedAge,
      sex: sex as any,
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      bmi: hasBmi ? Number(bmi) : 24.2,
      attendingPhysician: attending.trim() || 'Attending Physician',
      department: department.trim() || 'Clinical Medicine',
      allergies: allergies ? allergies.split(',').map((s) => s.trim()).filter(Boolean) : ['No Known Drug Allergies (NKDA)'],
      primaryDiagnoses: primaryDiagnoses ? primaryDiagnoses.split(',').map((s) => s.trim()).filter(Boolean) : ['Clinical Baseline Profile'],
      systolicBp: parsedSbp,
      diastolicBp: parsedDbp,
      heartRate: parsedHr,
      hba1c: parsedHba1c,
      fastingGlucose: parsedGlucose,
      egfr: parsedEgfr,
      uacr: parsedUacr,
      ldl: parsedLdl,
      medications: medications
        ? medications
            .split(',')
            .map((m, idx) => ({
              id: `med-custom-${idx}`,
              name: m.trim(),
              category: 'Prescription Regimen',
              dosage: 'As Directed',
              frequency: 'Daily',
              adherenceRate: 90,
              indication: 'Targeted Condition',
            }))
            .filter((m) => m.name.length > 0)
        : [],
    };

    try {
      const res = await fetch('/api/patients/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatientData),
      });
      if (!res.ok) throw new Error('Failed to create patient on server');
      const created = await res.json();
      onPatientCreated(created);
      onClose();
    } catch (err) {
      console.warn('Server create failed, generating local patient model:', err);
      const fallbackPatient: VirtualPatient = {
        id: `VP-${Date.now().toString().slice(-4)}`,
        twinId: `TWIN-ADMIT-${Math.floor(1000 + Math.random() * 9000)}`,
        mrn: newPatientData.mrn,
        fullName: newPatientData.fullName,
        age: newPatientData.age,
        sex: newPatientData.sex as any,
        heightCm: newPatientData.heightCm,
        weightKg: newPatientData.weightKg,
        bmi: newPatientData.bmi,
        ethnicity: 'Patient Specified',
        attendingPhysician: newPatientData.attendingPhysician,
        department: newPatientData.department,
        lastEncounterDate: `${new Date().toISOString().split('T')[0]} · Clinical Registration`,
        allergies: newPatientData.allergies,
        icdCodes: ['Z00.00 (General Adult Examination)'],
        primaryDiagnoses: newPatientData.primaryDiagnoses,
        comorbidities: [],
        phenotypeClassification: 'Patient-Entered Clinical Profile',
        vitals: {
          heartRate: newPatientData.heartRate,
          systolicBp: newPatientData.systolicBp,
          diastolicBp: newPatientData.diastolicBp,
          meanArterialPressure: Number(((newPatientData.systolicBp + 2 * newPatientData.diastolicBp) / 3).toFixed(1)),
          respiratoryRate: 16,
          spo2: 98,
          bodyTemp: 36.8,
          cardiacOutput: 5.0,
          ejectionFraction: 58,
          strokeVolume: 68,
          systemicVascularResistance: 1350,
        },
        labs: {
          hba1c: newPatientData.hba1c,
          fastingGlucose: newPatientData.fastingGlucose,
          egfr: newPatientData.egfr,
          creatinine: 1.0,
          uacr: newPatientData.uacr,
          potassium: 4.4,
          sodium: 140,
          bicarbonate: 24,
          ldl: newPatientData.ldl,
          hdl: 48,
          triglycerides: 140,
          totalCholesterol: 185,
          hsCrp: 1.8,
          bnp: 65,
          hemoglobin: 14.0,
          alt: 26,
          ast: 24,
        },
        autonomic: {
          hrvSdnn: 35,
          sleepQualityScore: 72,
          cortisolBaseline: 14.0,
          ambulatoryPulsePressure: newPatientData.systolicBp - newPatientData.diastolicBp,
        },
        medications: newPatientData.medications,
        genomics: [],
        organSystems: [
          {
            name: 'Cardiovascular Network',
            systemKey: 'cardiovascular',
            status: newPatientData.systolicBp > 140 ? 'compensated' : 'nominal',
            stressScore: newPatientData.systolicBp > 140 ? 50 : 25,
            summary: `Calibrated with systolic BP ${newPatientData.systolicBp} mmHg.`,
            keyMetrics: [
              { label: 'Blood Pressure', value: `${newPatientData.systolicBp}/${newPatientData.diastolicBp} mmHg`, status: newPatientData.systolicBp > 140 ? 'warning' : 'normal' },
              { label: 'Heart Rate', value: `${newPatientData.heartRate} bpm`, status: 'normal' },
            ],
            primaryPathology: 'Regulated homeostatic function',
          },
          {
            name: 'Renal Glomerular Apparatus',
            systemKey: 'renal',
            status: newPatientData.egfr < 60 ? 'compromised' : 'nominal',
            stressScore: newPatientData.egfr < 60 ? 60 : 20,
            summary: `Glomerular filtration rate at ${newPatientData.egfr} mL/min/1.73m².`,
            keyMetrics: [
              { label: 'eGFR', value: `${newPatientData.egfr} mL/min`, status: newPatientData.egfr < 60 ? 'warning' : 'normal' },
              { label: 'UACR', value: `${newPatientData.uacr} mg/g`, status: newPatientData.uacr > 30 ? 'warning' : 'normal' },
            ],
            primaryPathology: 'Calibrated to entered kidney metrics',
          },
          {
            name: 'Endocrine & Metabolic Homeostasis',
            systemKey: 'metabolic',
            status: newPatientData.hba1c >= 6.5 ? 'compromised' : 'nominal',
            stressScore: newPatientData.hba1c >= 6.5 ? 65 : 20,
            summary: `Glycemic control indexed at HbA1c ${newPatientData.hba1c}%.`,
            keyMetrics: [
              { label: 'HbA1c', value: `${newPatientData.hba1c}%`, status: newPatientData.hba1c >= 6.5 ? 'critical' : 'normal' },
              { label: 'Glucose', value: `${newPatientData.fastingGlucose} mg/dL`, status: newPatientData.fastingGlucose > 125 ? 'warning' : 'normal' },
            ],
            primaryPathology: 'Metabolic baseline from user intake',
          },
        ],
        longitudinalHistory: [
          {
            period: 'Intake Baseline',
            date: new Date().toISOString().split('T')[0],
            hba1c: newPatientData.hba1c,
            egfr: newPatientData.egfr,
            systolicBp: newPatientData.systolicBp,
            ldl: newPatientData.ldl,
            hsCrp: 1.8,
            weightKg: newPatientData.weightKg,
          },
        ],
        lifestyle: {
          dietarySodiumMg: 2300,
          mediterraneanDietScore: 6.5,
          weeklyCardioMinutes: 90,
          smokingStatus: 'Never',
          alcoholUnitsPerWeek: 1,
        },
        maceFiveYearRisk: Math.min(50, Number(((newPatientData.systolicBp / 14) + (newPatientData.hba1c * 1.2)).toFixed(1))),
        ckdProgressionFiveYearRisk: Math.min(60, Number(Math.max(5, 100 - newPatientData.egfr).toFixed(1))),
        hospitalizationOneYearRisk: 4.5,
      };
      onPatientCreated(fallbackPatient);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-950 border border-teal-700 flex items-center justify-center text-teal-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isFirstVisit ? 'Step 1: Patient Clinical Intake & Details Entry' : 'New Patient Intake & Model Registration'}
              </h3>
              <div className="text-xs text-slate-400">
                Enter clinical metrics to initialize computational in-silico twin & predictive care trajectories
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Safety Notice Banner (Mandatory Medical Disclaimer) */}
        <div className="px-6 py-3 bg-amber-950/40 border-b border-amber-900/60 flex items-start gap-3 text-xs text-amber-200">
          <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 font-semibold">Important Clinical AI Notice: </strong>
            AI models and in-silico simulations are <strong>not 100% correct and may make mistakes</strong>.
            All AI insights, risk scores, and treatment predictions are decision-support aids for simulation and research. They do not replace certified medical diagnosis or clinical judgment.
          </div>
        </div>

        {/* Clinical Clean State Bar */}
        <div className="px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-medium">
            Clinical Intake Roster: All fields are blank by default. Enter only patient-verified details.
          </span>
          <button
            type="button"
            onClick={handleClearForm}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer text-[11px]"
          >
            Clear All Inputs
          </button>
        </div>

        {formError && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/80 border border-rose-800 rounded-lg text-xs text-rose-200">
            {formError}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Section 1: Demographics */}
          <div>
            <div className="text-xs font-mono uppercase text-slate-400 font-bold mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>1. PATIENT DEMOGRAPHICS & ANTHROPOMETRICS</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Full Legal Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter patient full name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Medical Record Number (MRN)</label>
                <input
                  type="text"
                  value={mrn}
                  onChange={(e) => setMrn(e.target.value)}
                  placeholder="Auto-generated if blank"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Biological Sex <span className="text-rose-400">*</span>
                </label>
                <select
                  value={sex}
                  required
                  onChange={(e) => setSex(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500 cursor-pointer text-xs"
                >
                  <option value="">Select Sex...</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Age (Years) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 52"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="e.g. 170"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 72"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Calculated BMI</label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-teal-400 font-mono font-bold text-xs flex items-center justify-between">
                  <span>{bmi} {hasBmi ? 'kg/m²' : ''}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {hasBmi ? (Number(bmi) >= 30 ? 'Obese' : Number(bmi) >= 25 ? 'Overweight' : 'Normal') : 'Enter Ht & Wt'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Diagnoses & Allergies */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>2. PRIMARY CLINICAL DIAGNOSES & ALLERGIES</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Active Clinical Diagnoses / Health Issues
                </label>
                <input
                  type="text"
                  value={primaryDiagnoses}
                  onChange={(e) => setPrimaryDiagnoses(e.target.value)}
                  placeholder="e.g., Type 2 Diabetes, Essential Hypertension, CKD"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Documented Drug Allergies & Adverse Reactions
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g., Penicillin (Rash), Sulfa (or None)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Current Medications & Dosages
                </label>
                <input
                  type="text"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="e.g., Metformin 1000mg BID, Lisinopril 20mg QD (or leave blank if none)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Vitals & Hemodynamics */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>3. PHYSIOLOGICAL VITALS & HEMODYNAMICS</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">Normal ranges indicated</span>
            </div>
            <div className="grid grid-cols-3 gap-3 font-mono">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Systolic BP (&lt;120 mmHg)</label>
                <input
                  type="number"
                  value={sbp}
                  onChange={(e) => setSbp(e.target.value)}
                  placeholder="e.g. 120"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Diastolic BP (&lt;80 mmHg)</label>
                <input
                  type="number"
                  value={dbp}
                  onChange={(e) => setDbp(e.target.value)}
                  placeholder="e.g. 80"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Resting Heart Rate (60-100)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  placeholder="e.g. 72"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Laboratory Biomarkers */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>4. LABORATORY BIOMARKERS & METABOLIC PANEL</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">Reference bounds shown</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">HbA1c (&lt;5.7%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={hba1c}
                  onChange={(e) => setHba1c(e.target.value)}
                  placeholder="e.g. 5.6"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Fasting Gluc (70-99)</label>
                <input
                  type="number"
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value)}
                  placeholder="e.g. 95"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">eGFR (≥60 mL/min)</label>
                <input
                  type="number"
                  value={egfr}
                  onChange={(e) => setEgfr(e.target.value)}
                  placeholder="e.g. 90"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">UACR (&lt;30 mg/g)</label>
                <input
                  type="number"
                  value={uacr}
                  onChange={(e) => setUacr(e.target.value)}
                  placeholder="e.g. 18"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">LDL-C (&lt;100 mg/dL)</label>
                <input
                  type="number"
                  value={ldl}
                  onChange={(e) => setLdl(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors cursor-pointer text-xs"
            >
              {isFirstVisit ? 'Explore Sample Patient Case Instead' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-md flex items-center gap-2 text-xs"
            >
              {loading ? (
                <span>Calibrating Physiological Model...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Initialize Virtual Patient Model & Simulate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
