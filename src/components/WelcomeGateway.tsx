import React, { useState } from 'react';
import { VirtualPatient } from '../types/patient';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  Activity,
  Heart,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Lock,
  HelpCircle,
  User,
  Sparkles,
} from 'lucide-react';

interface WelcomeGatewayProps {
  onPatientCreated: (patient: VirtualPatient) => void;
}

export const WelcomeGateway: React.FC<WelcomeGatewayProps> = ({
  onPatientCreated,
}) => {
  const { t } = useLanguage();
  // Setup form states - starts clean with NO default patient values
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [sbp, setSbp] = useState<string>('');
  const [dbp, setDbp] = useState<string>('');
  const [glucose, setGlucose] = useState<string>('');
  const [hba1c, setHba1c] = useState<string>('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const availableConditions = [
    'Hypertension / Elevated Blood Pressure',
    'Type 2 Diabetes / Pre-Diabetes',
    'Dyslipidemia (Cholesterol)',
    'Kidney Function Concerns (eGFR)',
    'General Preventive Wellness',
  ];

  const toggleCondition = (cond: string) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleQuickCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter your name or preferred identity for your health twin.');
      return;
    }

    if (!age || parseInt(age, 10) <= 0 || parseInt(age, 10) > 120) {
      setFormError('Please enter your actual age.');
      return;
    }

    if (!sex) {
      setFormError('Please select your biological sex.');
      return;
    }

    setIsSubmitting(true);

    const displayName = name.trim();
    const parsedAge = parseInt(age, 10);
    const mrnCode = `MRN-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const twinCode = `TWIN-${displayName.toUpperCase().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const primaryDiagnoses = selectedConditions.length > 0 
      ? selectedConditions 
      : ['Preventive Wellness & Cardiorenal Baseline'];

    const userSbp = sbp ? parseInt(sbp, 10) : 120;
    const userDbp = dbp ? parseInt(dbp, 10) : 80;
    const userHba1c = hba1c ? parseFloat(hba1c) : 5.4;
    const userGlucose = glucose ? parseInt(glucose, 10) : 95;

    const newPatient: VirtualPatient = {
      id: `VP-${Date.now().toString().slice(-4)}`,
      twinId: twinCode,
      mrn: mrnCode,
      fullName: displayName,
      age: parsedAge,
      sex: sex as any,
      heightCm: 170,
      weightKg: 70,
      bmi: 24.2,
      ethnicity: 'Patient Specified',
      attendingPhysician: 'Patient Self-Registered',
      department: 'Comprehensive Preventive & Cardiorenal Medicine',
      lastEncounterDate: new Date().toISOString().split('T')[0] + ' · Initial Virtual Twin Calibration',
      allergies: ['No Known Drug Allergies (NKDA)'],
      icdCodes: selectedConditions.map((_, i) => `Z00.0${i + 1} (Baseline)`),
      primaryDiagnoses: primaryDiagnoses,
      comorbidities: [],
      phenotypeClassification: selectedConditions.some(c => c.includes('Diabetes') || c.includes('Hypertension'))
        ? 'Cardiometabolic Risk Transition Stage'
        : 'Primary Cardiorenal Homeostatic Baseline',
      vitals: {
        heartRate: 72,
        systolicBp: userSbp,
        diastolicBp: userDbp,
        meanArterialPressure: Number(((userSbp + 2 * userDbp) / 3).toFixed(1)),
        respiratoryRate: 16,
        spo2: 98,
        bodyTemp: 36.8,
        cardiacOutput: 5.0,
        ejectionFraction: 58,
        strokeVolume: 69.4,
        systemicVascularResistance: 1350,
      },
      labs: {
        hba1c: userHba1c,
        fastingGlucose: userGlucose,
        egfr: selectedConditions.some(c => c.includes('Kidney')) ? 68 : 90,
        creatinine: selectedConditions.some(c => c.includes('Kidney')) ? 1.2 : 0.95,
        uacr: selectedConditions.some(c => c.includes('Kidney')) ? 65 : 18,
        potassium: 4.4,
        sodium: 140,
        bicarbonate: 24,
        ldl: 105,
        hdl: 50,
        triglycerides: 135,
        totalCholesterol: 182,
        hsCrp: 1.8,
        bnp: 60,
        hemoglobin: 14.0,
        alt: 25,
        ast: 22,
      },
      autonomic: {
        hrvSdnn: 36,
        sleepQualityScore: 74,
        cortisolBaseline: 14.0,
        ambulatoryPulsePressure: userSbp - userDbp,
      },
      medications: [],
      genomics: [],
      organSystems: [
        {
          name: 'Cardiovascular Network',
          systemKey: 'cardiovascular',
          status: (Number(sbp) > 135 || Number(dbp) > 85) ? 'compensated' : 'nominal',
          stressScore: (Number(sbp) > 135 || Number(dbp) > 85) ? 48 : 22,
          summary: 'Cardiovascular parameters initialized based on self-reported blood pressure vitals.',
          keyMetrics: [
            { label: 'Blood Pressure', value: `${sbp}/${dbp} mmHg`, status: (Number(sbp) > 135 ? 'warning' : 'normal') },
            { label: 'Ejection Fraction', value: '58%', status: 'normal' },
            { label: 'Pulse Pressure', value: `${(Number(sbp) || 120) - (Number(dbp) || 80)} mmHg`, status: 'normal' },
          ],
          primaryPathology: 'Homeostatic baseline calibrated to user intake',
        },
        {
          name: 'Renal Glomerular Apparatus',
          systemKey: 'renal',
          status: 'nominal',
          stressScore: 25,
          summary: 'Kidney filtration and glomerular clearance baseline established.',
          keyMetrics: [
            { label: 'eGFR', value: '88 mL/min/1.73m²', status: 'normal' },
            { label: 'Creatinine', value: '0.95 mg/dL', status: 'normal' },
            { label: 'UACR', value: '18 mg/g', status: 'normal' },
          ],
          primaryPathology: 'No microvascular kidney stress indicated',
        },
        {
          name: 'Endocrine & Metabolic Homeostasis',
          systemKey: 'metabolic',
          status: Number(hba1c) >= 6.5 ? 'compromised' : (Number(hba1c) >= 5.7 ? 'compensated' : 'nominal'),
          stressScore: Number(hba1c) >= 6.5 ? 65 : (Number(hba1c) >= 5.7 ? 40 : 18),
          summary: 'Metabolic balance calibrated to intake glucose and HbA1c values.',
          keyMetrics: [
            { label: 'HbA1c', value: `${hba1c}%`, status: Number(hba1c) >= 6.5 ? 'critical' : (Number(hba1c) >= 5.7 ? 'warning' : 'normal') },
            { label: 'Fasting Glucose', value: `${glucose} mg/dL`, status: Number(glucose) > 125 ? 'warning' : 'normal' },
          ],
          primaryPathology: 'Calibrated to patient intake parameters',
        },
      ],
      longitudinalHistory: [
        {
          period: 'Baseline',
          date: new Date().toISOString().split('T')[0],
          hba1c: Number(hba1c) || 5.7,
          egfr: 88,
          systolicBp: Number(sbp) || 120,
          ldl: 110,
          hsCrp: 2.1,
          weightKg: 75,
        },
      ],
      lifestyle: {
        dietarySodiumMg: 2800,
        mediterraneanDietScore: 6.0,
        weeklyCardioMinutes: 90,
        smokingStatus: 'Never',
        alcoholUnitsPerWeek: 1,
      },
      maceFiveYearRisk: Number(sbp) > 140 ? 12.5 : 6.2,
      ckdProgressionFiveYearRisk: 4.1,
      hospitalizationOneYearRisk: 3.5,
    };

    setTimeout(() => {
      onPatientCreated(newPatient);
      setIsSubmitting(false);
    }, 350);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Editorial Hero Header */}
      <div className="border-b border-slate-800 pb-8 pt-2">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-teal-400">
              Personal Health Portal · BioTwin
            </p>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-balance">
              {t('welcome_title')}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed text-balance">
              {t('welcome_subtitle')}
            </p>

            {/* Zero-Pill Unboxed Metadata */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                100% Private to Your Browser
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">ADA 2026 & KDIGO 2024 Clinical Guidelines</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">Personal Organ Trajectory Simulation</span>
            </div>
          </div>

          <div className="shrink-0 pt-1">
            <LanguageSwitcher variant="full" />
          </div>
        </div>
      </div>

      {/* Main Grid: Patient Setup Form (Left) & Lab Scanner / Patient Guidance (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Patient Intake Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-baseline justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-teal-400" />
                  <span>Set Up My Health Profile</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter your baseline numbers to calibrate your personalized model. Takes 1 minute.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                1-MIN SETUP
              </span>
            </div>

            {formError && (
              <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-lg text-xs text-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleQuickCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Name or Preferred Identity <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name (e.g. Alex Johnson)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Age (Years) <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    placeholder="e.g. 48"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono tabular-nums transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Biological Sex <span className="text-teal-400">*</span>
                  </label>
                  <select
                    value={sex}
                    required
                    onChange={(e) => setSex(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Select Sex...</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Typical Blood Pressure (mmHg)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="120"
                      value={sbp}
                      onChange={(e) => setSbp(e.target.value)}
                      className="w-1/2 bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-center font-mono tabular-nums"
                      title="Systolic BP"
                    />
                    <span className="text-slate-500 font-mono">/</span>
                    <input
                      type="number"
                      placeholder="80"
                      value={dbp}
                      onChange={(e) => setDbp(e.target.value)}
                      className="w-1/2 bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-center font-mono tabular-nums"
                      title="Diastolic BP"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Blood Sugar / HbA1c (%)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 5.6"
                      value={hba1c}
                      onChange={(e) => setHba1c(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono tabular-nums text-center"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Any specific health areas you want to track?
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableConditions.map((cond) => {
                    const selected = selectedConditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => toggleCondition(cond)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          selected
                            ? 'bg-teal-950/70 border-teal-600 text-teal-200 font-medium'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '}
                        {cond}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>{isSubmitting ? 'Calibrating Health Twin...' : 'Create My Personal Health Twin'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Patient Guidance & Value Props (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Fast Setup Guide */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-950 border border-teal-700/80 flex items-center justify-center text-teal-300 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">How Setup Works</h3>
                <p className="text-xs text-slate-400">Direct, private, and instant</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your standard vitals (blood pressure and blood sugar) using the form on the left. BioTwin calculates your organ safety indexes and metabolic trends in real time without needing complex file uploads.
            </p>

            <div className="pt-1 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>You can adjust or update your numbers at any time from your dashboard.</span>
            </div>
          </div>

          {/* Card 2: How Your Virtual Health Model Helps You */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-teal-400" />
              <span>How Your Health Twin Helps You</span>
            </h3>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span className="text-teal-400 font-mono text-[11px]">01.</span>
                  <span>Plain-English Lab Explanations</span>
                </div>
                <p className="text-slate-400 pl-5">
                  Translates confusing medical acronyms (eGFR, HbA1c, UACR, LDL) into clear explanations of what is healthy and what needs attention.
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span className="text-teal-400 font-mono text-[11px]">02.</span>
                  <span>Organ Protection Insights</span>
                </div>
                <p className="text-slate-400 pl-5">
                  Shows how keeping your blood pressure and blood sugar steady shields your heart and delicate kidney filters from long-term strain.
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span className="text-teal-400 font-mono text-[11px]">03.</span>
                  <span>Printable Doctor Visit Sheet</span>
                </div>
                <p className="text-slate-400 pl-5">
                  Generate a simple 1-page summary of your current numbers and tailored discussion questions to take to your next doctor checkup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
