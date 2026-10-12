import React, { useState } from 'react';
import { VirtualPatient, getPatientInitials } from '../types/patient';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  Heart,
  Activity,
  Droplets,
  Shield,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Pill,
  ChevronRight,
  Stethoscope,
  Wind,
  Check,
  Copy,
  Lock,
  HelpCircle,
  Printer,
  ChevronDown,
  ChevronUp,
  Dna,
  Sparkles,
  Volume2,
  VolumeX,
  Camera,
  Sun,
  Sunrise,
  Moon,
  Utensils,
  AlertOctagon,
  PhoneCall,
  Eye,
  Watch,
} from 'lucide-react';

interface SimplePatientViewProps {
  patient: VirtualPatient;
  onOpenLogVitals: () => void;
  onSwitchToDoctorView: () => void;
  onGoHome?: () => void;
  onOpenWearableSync?: () => void;
}

export const SimplePatientView: React.FC<SimplePatientViewProps> = ({
  patient,
  onOpenLogVitals,
  onSwitchToDoctorView,
  onGoHome,
  onOpenWearableSync,
}) => {
  const { t, currentLang } = useLanguage();
  const [selectedOrgan, setSelectedOrgan] = useState<string>('heart');
  const [copiedQuestion, setCopiedQuestion] = useState<number | null>(null);
  const [showTwinExplainer, setShowTwinExplainer] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isEasyVoiceMode, setIsEasyVoiceMode] = useState<boolean>(true);

  // Stop speaking when leaving or unmounting
  React.useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Create simple, warm spoken script tailored for low literacy / everyday patients
    const heartState =
      patient.vitals.systolicBp <= 130
        ? 'Your heart is strong and beating steady.'
        : 'Your blood pressure is slightly high today. Rest well and avoid salty food.';
    const sugarState =
      patient.labs.hba1c <= 7.0
        ? 'Your blood sugar is at a safe target.'
        : 'Your blood sugar is a little high. Please take your morning medicine with food, avoid sweet drinks and biscuits, and take a light walk.';
    const kidneyState =
      patient.labs.egfr >= 60
        ? 'Your kidney water filters are working well.'
        : 'Your kidney filters need plenty of water today. Drink six glasses of water and avoid non-prescribed pain pills.';

    const script = `Hello ${patient.fullName}. Here is your easy health update. ${heartState} ${sugarState} ${kidneyState} Today's medicine: Take your morning tablet after your meal. Eat green vegetables and lentils. Take your night tablet before sleep. If you ever feel chest tightness or hard breathing, please see a doctor immediately.`;

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.88;
    utterance.pitch = 1.0;

    const langMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
      hi: 'hi-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      fr: 'fr-FR',
      de: 'de-DE',
      zh: 'zh-CN',
      ar: 'ar-SA',
      ja: 'ja-JP',
    };
    if (currentLang && langMap[currentLang]) {
      utterance.lang = langMap[currentLang];
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Clinical translation of diagnoses into human-friendly explanations
  const translateDiagnosis = (diag: string) => {
    const lower = diag.toLowerCase();
    if (lower.includes('diabetes') || lower.includes('t2dm') || lower.includes('sugar')) {
      return {
        title: 'Blood Sugar Regulation (Type 2 Diabetes)',
        description:
          'Your cells require extra support absorbing glucose from meals. Consistent meal timing and prescribed therapy shield your vision, nerves, and heart.',
        dailyFocus: 'Monitor portion sizes, take daily tablet, and take a light walk after dinner.',
        statusCategory: patient.labs.hba1c <= 7.0 ? 'At Target' : 'Active Management',
        statusColor:
          patient.labs.hba1c <= 7.0
            ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60'
            : 'text-amber-400 bg-amber-950/40 border-amber-900/60',
      };
    }
    if (lower.includes('hypertens') || lower.includes('blood pressure')) {
      return {
        title: 'Blood Pressure Management',
        description:
          'Blood moves through your circulatory vessels with elevated force. Keeping arterial pressure controlled shields your heart muscle and delicate kidney filters.',
        dailyFocus: 'Take morning tablet consistently; aim for under 2,000 mg of sodium daily.',
        statusCategory: patient.vitals.systolicBp <= 130 ? 'Controlled' : 'Monitoring Needed',
        statusColor:
          patient.vitals.systolicBp <= 130
            ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60'
            : 'text-amber-400 bg-amber-950/40 border-amber-900/60',
      };
    }
    if (
      lower.includes('nephro') ||
      lower.includes('ckd') ||
      lower.includes('kidney') ||
      lower.includes('microalbumin')
    ) {
      return {
        title: 'Kidney Filter Preservation',
        description:
          'Your kidneys are filtering waste and fluid at a moderate pace. Staying properly hydrated and avoiding high-dose NSAID painkillers keeps filtration stable.',
        dailyFocus: 'Drink 6 to 8 glasses of plain water daily; avoid non-prescribed pain relievers.',
        statusCategory: patient.labs.egfr >= 60 ? 'Optimal' : 'Stage 3a Care Plan',
        statusColor:
          patient.labs.egfr >= 60
            ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60'
            : 'text-amber-400 bg-amber-950/40 border-amber-900/60',
      };
    }
    return {
      title: 'Arterial & Cholesterol Protection',
      description:
        'Circulating blood lipids (fats) are monitored to ensure vessel walls remain smooth, preventing hardening of the arteries.',
      dailyFocus: 'Take evening lipid-lowering tablet; favor olive oil, nuts, and high-fiber foods.',
      statusCategory: patient.labs.ldl <= 100 ? 'At Target' : 'Moderate Priority',
      statusColor:
        patient.labs.ldl <= 100
          ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60'
          : 'text-blue-400 bg-blue-950/40 border-blue-900/60',
    };
  };

  // Systems Guide (Clinical plain-English without emojis)
  const organDetails: Record<
    string,
    {
      title: string;
      icon: React.ReactNode;
      clinicalFunction: string;
      currentStatusText: string;
      statusBadge: string;
      statusBadgeColor: string;
      practicalGuidance: string;
    }
  > = {
    heart: {
      title: 'Heart & Circulatory System',
      icon: <Heart className="w-5 h-5 text-rose-400" />,
      clinicalFunction:
        'Acts as the muscular pump providing continuous oxygen and nutrients through arterial circulation to every organ.',
      currentStatusText: `Resting pulse is stable at ${patient.vitals.heartRate} bpm. Blood pressure is currently measured at ${patient.vitals.systolicBp}/${patient.vitals.diastolicBp} mmHg, reflecting mild vascular resistance.`,
      statusBadge: 'Under Routine Observation',
      statusBadgeColor: 'text-amber-300 bg-amber-950/50 border-amber-800',
      practicalGuidance:
        'Continue prescribed antihypertensive therapy each morning. 20 minutes of brisk daily walking keeps the heart muscle efficient and lowers resting vascular tension.',
    },
    kidneys: {
      title: 'Kidney Filtration & Fluid Balance',
      icon: <Droplets className="w-5 h-5 text-blue-400" />,
      clinicalFunction:
        'Microscopic filtration units (nephrons) continuously clear metabolic waste products and regulate blood volume and electrolyte balance.',
      currentStatusText: `Current glomerular filtration rate (eGFR) is ${patient.labs.egfr} mL/min with a creatinine level of ${patient.labs.creatinine} mg/dL. Modest microalbuminuria (UACR ${patient.labs.uacr} mg/g) is present.`,
      statusBadge: 'Active Preservation Protocol',
      statusBadgeColor: 'text-amber-300 bg-amber-950/50 border-amber-800',
      practicalGuidance:
        'Prioritize consistent daily water intake. Avoid over-the-counter NSAIDs (ibuprofen, naproxen) without consulting your physician, as they constrain renal blood flow.',
    },
    sugar: {
      title: 'Metabolic & Glycemic Balance',
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      clinicalFunction:
        'The pancreas and liver coordinate insulin release and glucose transport into tissues for sustained cellular energy.',
      currentStatusText: `3-month average blood glucose marker (HbA1c) is ${patient.labs.hba1c}%, with fasting morning glucose around ${patient.labs.fastingGlucose} mg/dL. Target for chronic management is below 7.0%.`,
      statusBadge: 'Treatment Optimization Area',
      statusBadgeColor: 'text-amber-300 bg-amber-950/50 border-amber-800',
      practicalGuidance:
        'Ensure daily metformin and metabolic medications are taken with food. A post-meal 10-to-15 minute walk significantly enhances peripheral muscle glucose absorption.',
    },
    vessels: {
      title: 'Vascular & Arterial Integrity',
      icon: <Shield className="w-5 h-5 text-teal-400" />,
      clinicalFunction:
        'The extensive network of elastic arteries and veins maintaining proper systemic perfusion to the brain, heart, and limbs.',
      currentStatusText: `Arterial pressure reading of ${patient.vitals.systolicBp}/${patient.vitals.diastolicBp} mmHg. LDL cholesterol is ${patient.labs.ldl} mg/dL, with total triglycerides at ${patient.labs.triglycerides} mg/dL.`,
      statusBadge: 'Vascular Shield Active',
      statusBadgeColor: 'text-blue-300 bg-blue-950/50 border-blue-800',
      practicalGuidance:
        'Keep dietary sodium under 2,000 mg daily by limiting processed deli meats and restaurant broths. Regular evening statin therapy preserves arterial wall elasticity.',
    },
    lungs: {
      title: 'Pulmonary & Respiratory System',
      icon: <Wind className="w-5 h-5 text-sky-400" />,
      clinicalFunction:
        'Exchanges carbon dioxide for fresh atmospheric oxygen and delivers oxygenated hemoglobin into circulation.',
      currentStatusText: `Peripheral pulse oximetry (SpO2) is solid at ${patient.vitals.spo2}% on ambient room air, with a resting respiratory rate of ${patient.vitals.respiratoryRate} breaths per minute.`,
      statusBadge: 'Within Normal Limits',
      statusBadgeColor: 'text-emerald-300 bg-emerald-950/50 border-emerald-800',
      practicalGuidance:
        'Oxygenation is optimal. Continue routine physical activities and maintain current vaccination schedules (annual influenza and pneumococcal as recommended).',
    },
  };

  // Structured appointment preparation questions
  const doctorQuestions = [
    {
      id: 1,
      topic: 'Blood Sugar & Medication',
      question: `My latest HbA1c is ${patient.labs.hba1c}%. What is our specific 6-month target, and do we need to adjust my medication or meal timing?`,
    },
    {
      id: 2,
      topic: 'Kidney Health & Protection',
      question: `My kidney filtration score is currently eGFR ${patient.labs.egfr}. Are there newer organ-protecting medications (such as SGLT2 inhibitors) appropriate for my profile?`,
    },
    {
      id: 3,
      topic: 'Blood Pressure at Home',
      question: `My clinic blood pressure was ${patient.vitals.systolicBp}/${patient.vitals.diastolicBp} mmHg. Should I track morning and evening readings at home for two weeks before our next visit?`,
    },
  ];

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestion(id);
    setTimeout(() => setCopiedQuestion(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Patient Profile Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 border border-teal-500/30 flex items-center justify-center font-mono font-bold text-teal-300 text-sm shadow-sm ring-1 ring-white/5 select-none"
            title={`${patient.fullName} · Monogram Initial Badge`}
          >
            {getPatientInitials(patient.fullName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">{patient.fullName}</h2>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-300">
                {patient.age} years old · {patient.sex}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Care Team: {patient.attendingPhysician} · {patient.lastEncounterDate.split('·')[0]}
            </div>
          </div>
        </div>

        {/* Private Patient Portal Badge, Language Switcher & Switch Button */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="subtle" />

          <div className="hidden sm:flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Lock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-medium">{t('confidential_twin')}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">100% Private</span>
            </div>
          </div>

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium cursor-pointer transition-colors"
              title="Return to Welcome Hub or switch health profile"
            >
              {t('act_switch_profile')}
            </button>
          )}
        </div>
      </div>

      {/* Accessible Spoken & Picture Mode Banner (Designed for low-literacy / uneducated patients) */}
      <div className="bg-gradient-to-r from-teal-950/80 via-slate-900 to-emerald-950/70 border border-teal-500/40 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <Eye className="w-3 h-3 text-emerald-400" />
                <span>Easy Visual & Spoken Mode</span>
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-300">No medical jargon · Tap to listen aloud</span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>How is Your Body Doing Today?</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Easy for everyone: Tap the button to listen in plain words, check simple color traffic lights (Green = Safe, Yellow = Watch out), see your daily pills by meal, or snap a photo of doctor papers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleToggleSpeak}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 active:scale-95'
              }`}
              title="Listen to your daily health summary spoken aloud in plain language"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Stop Speaking</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  <span>🔊 Listen Aloud (Read to Me)</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenLogVitals}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-600/40 text-xs font-semibold cursor-pointer shadow-sm hover:scale-105 transition-transform"
              title="Take a photo of your doctor paper slip or lab report"
            >
              <Camera className="w-4 h-4 text-teal-400" />
              <span>📷 Snap Doctor Slip / Paper</span>
            </button>

            {onOpenWearableSync && (
              <button
                onClick={onOpenWearableSync}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-600/40 text-xs font-semibold cursor-pointer shadow-sm hover:scale-105 transition-transform"
                title="Connect smartwatch or continuous glucose monitor"
              >
                <Watch className="w-4 h-4 text-emerald-400" />
                <span>⌚ Connect Smartwatch / Sensor</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Traffic-Light Health Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Heart */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl" role="img" aria-label="heart">❤️</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                patient.vitals.systolicBp <= 130
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {patient.vitals.systolicBp <= 130 ? '🟢 Doing Well' : '🟡 Take It Easy'}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white">Heart Pump</div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {patient.vitals.systolicBp <= 130 ? 'Steady beat, safe pressure.' : 'Slightly high pressure. Avoid salty foods.'}
              </p>
            </div>
          </div>

          {/* Sugar */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl" role="img" aria-label="blood drop">🩸</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                patient.labs.hba1c <= 7.0
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {patient.labs.hba1c <= 7.0 ? '🟢 Normal Sugar' : '🟡 Sugar is High'}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white">Blood Sugar</div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {patient.labs.hba1c <= 7.0 ? 'Good energy balance.' : 'Take morning pill after food. Walk 10 mins.'}
              </p>
            </div>
          </div>

          {/* Kidneys */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl" role="img" aria-label="water drop">💧</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                patient.labs.egfr >= 60
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {patient.labs.egfr >= 60 ? '🟢 Filters Clean' : '🟡 Drink Clean Water'}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white">Kidney Water Filters</div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Drink 6 glasses of water. Avoid unprescribed pain tablets.
              </p>
            </div>
          </div>

          {/* Breathing / Lungs */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl" role="img" aria-label="lungs">🫁</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                🟢 Breathing Good
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white">Oxygen & Lungs</div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Oxygen is {patient.vitals.spo2}%. Easy, healthy breathing.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Daily Routine: Pills & Meals */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
          <div className="text-xs font-bold text-teal-300 flex items-center gap-2">
            <span>📅 Your Daily Routine (What to Do Today)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Morning */}
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <Sunrise className="w-4 h-4" />
                <span>🌅 Morning (Breakfast)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                • 💊 Take morning diabetes tablet after breakfast.
              </p>
              <p className="text-[11px] text-slate-300">
                • 🥛 Drink 1 large glass of clean water.
              </p>
            </div>

            {/* Afternoon */}
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-yellow-400 font-semibold text-xs">
                <Sun className="w-4 h-4" />
                <span>☀️ Afternoon (Lunch)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                • 🥗 Eat fresh green vegetables, lentils (dal), less oil.
              </p>
              <p className="text-[11px] text-slate-300">
                • 🚫 Avoid salty pickles, papad, and fried snacks.
              </p>
            </div>

            {/* Night */}
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                <Moon className="w-4 h-4" />
                <span>🌙 Night (Dinner & Sleep)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                • 💊 Take blood pressure tablet before sleeping.
              </p>
              <p className="text-[11px] text-slate-300">
                • 🚶 Walk 10 to 15 minutes after dinner.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency SOS Banner */}
        <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-200">When to go to hospital right now:</span>
              <p className="text-[11px] text-rose-300/90 mt-0.5">
                Heavy chest squeezing pain · Cannot breathe properly · Sudden extreme dizziness or fainting.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 108 / 911 Emergency</span>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onOpenLogVitals}
          className="p-4 bg-slate-900 hover:bg-slate-850 border border-teal-800/80 hover:border-teal-600 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-950 border border-teal-700 flex items-center justify-center text-teal-300">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">{t('act_log_vitals')}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Record your home blood pressure, morning glucose, or weight
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
        </button>

        <button
          onClick={() => window.print()}
          className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group"
          title="Print or save as PDF for your next medical appointment"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Printer className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">{t('act_print_summary')}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Generate a 1-page visit sheet with your numbers and questions
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
        </button>
      </div>

      {/* Patient Health Information & Virtual Twin Explainer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => setShowTwinExplainer(!showTwinExplainer)}
          className="w-full px-4 py-3 bg-slate-900 hover:bg-slate-850/80 flex items-center justify-between text-left transition-colors cursor-pointer border-b border-slate-800/80"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-teal-400 shrink-0" />
            <div>
              <span className="text-white font-medium">What is my Virtual Health Model and who is it useful for?</span>
              <span className="text-slate-400 ml-2 text-[11px] hidden sm:inline">Learn how this computational model helps you and your doctor</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <span>{showTwinExplainer ? 'Hide explanation' : 'Show explanation'}</span>
            {showTwinExplainer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showTwinExplainer && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-slate-950/70">
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg space-y-1">
              <div className="text-[11px] font-semibold text-teal-300">1. What is a Virtual Health Model?</div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                It is a private computational model calibrated to your actual blood tests, blood pressure, and organ biomarkers. Rather than viewing scattered lab sheets, it continuously maps how your heart, kidneys, and metabolism interact together.
              </p>
            </div>

            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg space-y-1">
              <div className="text-[11px] font-semibold text-blue-300">2. For Whom is it Useful?</div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                <strong className="text-white">For You:</strong> It translates complex medical jargon into clear everyday habits (nutrition, hydration, medication timing).<br />
                <strong className="text-white">For Your Doctor:</strong> It helps physicians simulate medication adjustments in advance before prescribing them to protect your organs.
              </p>
            </div>

            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg space-y-1">
              <div className="text-[11px] font-semibold text-emerald-300">3. Privacy & Safety Guarantee</div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Your health model is strictly isolated to your individual medical record. Your information is never accessible to other patients and is used exclusively by you and your authorized clinical care team.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Key Lab Indicators (Clean Tabular Presentation) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Key Laboratory Indicators</h3>
            <p className="text-xs text-slate-400">
              Summary of your four most important baseline values
            </p>
          </div>
          <span className="text-xs text-slate-400">Last Panel: February 2026</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* HbA1c */}
          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">3-Month Blood Sugar</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                    patient.labs.hba1c <= 7.0
                      ? 'text-emerald-400 bg-emerald-950/50 border-emerald-900'
                      : 'text-amber-400 bg-amber-950/50 border-amber-900'
                  }`}
                >
                  {patient.labs.hba1c <= 7.0 ? 'At Target' : 'Above Target'}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-white">
                  {patient.labs.hba1c}%
                </span>
                <span className="text-xs text-slate-400 font-mono">HbA1c</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Target for diabetes management is typically under 7.0%. Reflects average circulating
                glucose over the past 90 days.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400">
              Target: &lt; 7.0% · Routine re-check in 90 days
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Blood Pressure</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                    patient.vitals.systolicBp <= 130
                      ? 'text-emerald-400 bg-emerald-950/50 border-emerald-900'
                      : 'text-amber-400 bg-amber-950/50 border-amber-900'
                  }`}
                >
                  {patient.vitals.systolicBp <= 130 ? 'Controlled' : 'Stage 1'}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-white">
                  {patient.vitals.systolicBp}/{patient.vitals.diastolicBp}
                </span>
                <span className="text-xs text-slate-400 font-mono">mmHg</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Measures pressure inside arterial walls. Target is below 130/80 mmHg to shield heart
                and kidneys from workload.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400">
              Target: &lt; 130/80 mmHg · Daily morning log
            </div>
          </div>

          {/* Kidney eGFR */}
          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Kidney Filtration</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                    patient.labs.egfr >= 60
                      ? 'text-emerald-400 bg-emerald-950/50 border-emerald-900'
                      : 'text-amber-400 bg-amber-950/50 border-amber-900'
                  }`}
                >
                  {patient.labs.egfr >= 60 ? 'Optimal' : 'Stage 3a (Mild)'}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-white">
                  {patient.labs.egfr}
                </span>
                <span className="text-xs text-slate-400 font-mono">eGFR</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Measures the blood-cleaning capability of kidneys. Values of 60 or greater indicate
                stable baseline filtering capacity.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400">
              Target: &gt; 60 mL/min · Hydration priority
            </div>
          </div>

          {/* LDL Cholesterol */}
          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">LDL Cholesterol</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                    patient.labs.ldl <= 100
                      ? 'text-emerald-400 bg-emerald-950/50 border-emerald-900'
                      : 'text-blue-400 bg-blue-950/50 border-blue-900'
                  }`}
                >
                  {patient.labs.ldl <= 100 ? 'In Target' : 'Moderate Priority'}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-white">
                  {patient.labs.ldl}
                </span>
                <span className="text-xs text-slate-400 font-mono">mg/dL</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Lipid marker carrying cholesterol through vessels. Keeping LDL controlled shields
                coronary arteries from plaque.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400">
              Target: &lt; 100 mg/dL (&lt; 70 high risk)
            </div>
          </div>
        </div>
      </div>

      {/* My Health Progress Across Recent Checkups */}
      {patient.longitudinalHistory && patient.longitudinalHistory.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">My Health Progress Across Recent Checkups</h3>
              <p className="text-xs text-slate-400">
                Track how your blood sugar, blood pressure, and kidney filtration evolve across visits
              </p>
            </div>
            <span className="text-xs text-slate-400">
              {patient.longitudinalHistory.length} Previous Lab Encounters Recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3">Checkup Date</th>
                  <th className="py-2.5 px-3">Blood Sugar (HbA1c)</th>
                  <th className="py-2.5 px-3">Blood Pressure</th>
                  <th className="py-2.5 px-3">Kidney Filter (eGFR)</th>
                  <th className="py-2.5 px-3">Weight</th>
                  <th className="py-2.5 px-3">Status Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {patient.longitudinalHistory.map((entry, idx) => {
                  const isLatest = idx === patient.longitudinalHistory.length - 1;
                  return (
                    <tr key={idx} className={`hover:bg-slate-800/40 ${isLatest ? 'bg-slate-950/60 font-medium' : ''}`}>
                      <td className="py-2.5 px-3 text-slate-300 font-mono">
                        {entry.date} <span className="text-slate-500 text-[11px]">({entry.period})</span>
                        {isLatest && <span className="ml-2 text-[10px] text-teal-400 font-semibold uppercase tracking-wider">Most Recent</span>}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={entry.hba1c > 7.0 ? 'text-amber-300' : 'text-emerald-400'}>
                          {entry.hba1c}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">
                        {entry.systolicBp} mmHg
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={entry.egfr < 60 ? 'text-amber-300' : 'text-emerald-400'}>
                          {entry.egfr} mL/min
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">
                        {entry.weightKg} kg
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {entry.hba1c > 8.0 ? 'Blood sugar elevated; discussion suggested' : 'Stable control maintained'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-start gap-2.5">
            <Activity className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-white">How your care team uses this history: </span>
              Your virtual patient model connects these historical laboratory points to simulate how your organs will respond over the coming months. If numbers creep upwards, your physician can adjust medications early to prevent strain on your heart and kidneys.
            </div>
          </div>
        </div>
      )}

      {/* Active Care Management Plan */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Active Care Management Plan</h3>
            <p className="text-xs text-slate-400">
              Translating clinical diagnoses into everyday practical focus
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {patient.primaryDiagnoses.length} Priority Areas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {patient.primaryDiagnoses.map((diag, idx) => {
            const item = translateDiagnosis(diag);
            return (
              <div
                key={idx}
                className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded border font-medium ${item.statusColor}`}
                    >
                      {item.statusCategory}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{item.description}</p>
                </div>
                <div className="pt-2.5 border-t border-slate-900 text-[11px] text-teal-300 flex items-start gap-1.5">
                  <span className="font-semibold text-slate-400 shrink-0">Daily habit:</span>
                  <span className="text-slate-200">{item.dailyFocus}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Organ System Clinical Education Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Organ Systems Health Guide</h3>
            <p className="text-xs text-slate-400">
              Detailed breakdown of organ status, physiology, and daily lifestyle recommendations
            </p>
          </div>
          <span className="text-xs text-slate-400">Select system to inspect</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {Object.keys(organDetails).map((key) => {
            const org = organDetails[key];
            const isSelected = selectedOrgan === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedOrgan(key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {org.icon}
                <span>{org.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Organ Detail View */}
        {selectedOrgan && organDetails[selectedOrgan] && (
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                  {organDetails[selectedOrgan].icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {organDetails[selectedOrgan].title}
                  </h4>
                  <p className="text-xs text-slate-400">Clinical function and daily self-care</p>
                </div>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded border self-start sm:self-auto font-medium ${organDetails[selectedOrgan].statusBadgeColor}`}
              >
                {organDetails[selectedOrgan].statusBadge}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
                <div className="text-slate-400 font-semibold text-[11px]">
                  1. Biological Function
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {organDetails[selectedOrgan].clinicalFunction}
                </p>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
                <div className="text-slate-400 font-semibold text-[11px]">
                  2. Current Patient Readings
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {organDetails[selectedOrgan].currentStatusText}
                </p>
              </div>

              <div className="p-3.5 bg-slate-900 border border-teal-900/40 rounded-lg space-y-1.5">
                <div className="text-teal-400 font-semibold text-[11px]">
                  3. Clinical Recommendations
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {organDetails[selectedOrgan].practicalGuidance}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prescription Schedule & Rationales */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Prescribed Medications</h3>
            <p className="text-xs text-slate-400">
              Clear schedule, timing, and clinical purpose for each daily prescription
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {patient.medications.length} Prescriptions on File
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {patient.medications.map((m) => {
            let whyHelp =
              'Protects your organs and maintains steady, healthy blood circulation.';
            const medName = m.name.toLowerCase();
            if (medName.includes('metformin')) {
              whyHelp =
                'Helps your cells absorb food sugar naturally so glucose doesn’t build up in your bloodstream, protecting your eyesight, nerves, and heart.';
            } else if (
              medName.includes('lisinopril') ||
              medName.includes('losartan') ||
              medName.includes('enalapril')
            ) {
              whyHelp =
                'Gently relaxes tight arterial blood vessels so blood flows with ease, easing workload on your heart and protecting your kidney filters.';
            } else if (
              medName.includes('atorvastatin') ||
              medName.includes('rosuvastatin') ||
              medName.includes('statin')
            ) {
              whyHelp =
                'Keeps arterial walls clean and smooth by lowering "bad" LDL cholesterol, reducing lifetime risk of heart attacks and strokes.';
            } else if (
              medName.includes('empagliflozin') ||
              medName.includes('dapagliflozin') ||
              medName.includes('jardiance') ||
              medName.includes('farxiga')
            ) {
              whyHelp =
                'Helps your kidneys gently flush excess sugar through urine and provides proven long-term protection for your heart and kidney longevity.';
            } else if (
              medName.includes('carvedilol') ||
              medName.includes('metoprolol') ||
              medName.includes('bisoprolol')
            ) {
              whyHelp =
                'Keeps your heart beating in a calm, steady rhythm so the heart muscle gets plenty of rest between beats.';
            }

            return (
              <div
                key={m.id}
                className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {m.name} <span className="font-mono text-teal-400 font-normal">({m.dosage})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Schedule: {m.frequency}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-emerald-900 bg-emerald-950/40 text-emerald-300 font-medium">
                      {m.adherenceRate}% taken
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-300 leading-relaxed">
                    <span className="text-teal-400 font-medium">Why this helps you: </span>
                    {whyHelp}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>For: {m.indication}</span>
                  <span className="text-emerald-400 font-medium">Active Prescription</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pharmacogenomics & CPIC Drug Compatibility (Patient-Friendly) */}
      {patient.genomics && patient.genomics.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400">
                <Dna className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Genetic Drug Compatibility & Safety (CPIC Guides)
                </h3>
                <p className="text-xs text-slate-400">
                  How your DNA influences how your body absorbs and processes medications
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded">
              {patient.genomics.length} Tested Genes on File
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {patient.genomics.map((g) => (
              <div
                key={g.gene}
                className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-teal-300 text-xs">
                      {g.gene} <span className="text-slate-400 font-normal font-sans">({g.variant})</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                      CPIC Guided
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1.5">
                    <strong className="text-white">Your Body's Response: </strong>
                    {g.phenotype}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    <strong className="text-teal-400">Prescription Guidance: </strong>
                    {g.clinicalSignificance}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>Standardized CPIC Protocol</span>
                  <button
                    onClick={onSwitchToDoctorView}
                    className="text-teal-400 hover:text-teal-300 underline cursor-pointer"
                  >
                    View in Clinical MAR &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consultation Preparation: Questions for Next Clinic Appointment */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Consultation Preparation: Questions for Your Next Visit
            </h3>
            <p className="text-xs text-slate-400">
              Personalized discussion points based on your latest laboratory markers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer no-print shadow-xs"
              title="Print or save as PDF for your next appointment"
            >
              <Printer className="w-3.5 h-3.5 text-teal-400" />
              <span>Print / Save Doctor Visit Sheet</span>
            </button>
            <span className="text-xs text-slate-400 hidden md:inline">Physician Visit Checklist</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {doctorQuestions.map((q) => {
            const isCopied = copiedQuestion === q.id;
            return (
              <div
                key={q.id}
                className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-teal-400 uppercase tracking-wide">
                    {q.topic}
                  </div>
                  <p className="text-slate-200 leading-relaxed">"{q.question}"</p>
                </div>
                <button
                  onClick={() => handleCopy(q.id, q.question)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-md transition-colors cursor-pointer flex items-center gap-1 shrink-0 text-xs"
                  title="Copy question to clipboard"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
