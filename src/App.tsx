import React, { useState, useEffect } from 'react';
import { VirtualPatient } from './types/patient';
import { useLanguage } from './context/LanguageContext';
import { TopNav, ActiveTab } from './components/TopNav';
import { PatientHeader } from './components/PatientHeader';
import { TelemetryVitalsStrip } from './components/TelemetryVitalsStrip';
import { TwinAnatomyStage } from './components/TwinAnatomyStage';
import { AIInsightsView } from './components/AIInsightsView';
import { PredictiveCareSimulator } from './components/PredictiveCareSimulator';
import { LongitudinalWearablesView } from './components/LongitudinalWearablesView';
import { NewPatientModal } from './components/NewPatientModal';
import { ExportModal } from './components/ExportModal';
import { SimplePatientView } from './components/SimplePatientView';
import { LogPatientVitalsModal } from './components/LogPatientVitalsModal';
import { WelcomeGateway } from './components/WelcomeGateway';
import { StaffAuthModal } from './components/StaffAuthModal';
import { WearableSyncModal } from './components/WearableSyncModal';
import {
  Activity,
  ShieldCheck,
  Heart,
  Sliders,
  Dna,
  ArrowRight,
  FileText,
  AlertTriangle,
  Stethoscope,
  Pill,
  Clock,
  ClipboardList,
  Gauge,
  TestTube2,
  UserPlus,
  User,
  Users,
  CheckCircle2,
  Lock,
  KeyRound,
  Sparkles,
  X,
} from 'lucide-react';

const MOCK_PATIENT_IDS = ['VP-8921', 'VP-4392', 'VP-7104'];

const isLegacyDummy = (p: VirtualPatient) => {
  if (!p || !p.id) return true;
  if (MOCK_PATIENT_IDS.includes(p.id)) return true;
  if (p.fullName === 'Eleanor Vance' || p.fullName === 'Arthur Pendelton' || p.fullName === 'Mateo Rodriguez') return true;
  if (p.fullName === 'Jane Henderson' && p.age === 64) return true;
  if (p.fullName === 'Robert Jenkins' && p.age === 59) return true;
  if (p.fullName === 'David Zhang' && p.age === 52) return true;
  if (p.fullName === 'Custom Virtual Subject' || (p.fullName === 'Jane Doe' && p.age === 62)) return true;
  return false;
};

export default function App() {
  const { dir, t } = useLanguage();
  // Only keep patient-entered records; do not load default mock patients
  const [patients, setPatients] = useState<VirtualPatient[]>(() => {
    try {
      const saved = localStorage.getItem('biotwin_patient_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((p) => !isLegacyDummy(p));
        }
      }
    } catch (e) {
      console.warn('Failed to load saved patients from localStorage:', e);
    }
    return [];
  });
  // Opening page defaults to clean Welcome Gateway without pre-loaded patient details
  const [activePatient, setActivePatient] = useState<VirtualPatient | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('console');
  const [viewMode, setViewMode] = useState<'patient' | 'clinical'>('patient'); // Default to clear, understandable patient view
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('biotwin_staff_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isStaffAuthModalOpen, setIsStaffAuthModalOpen] = useState<boolean>(false);
  const [liveStreaming, setLiveStreaming] = useState<boolean>(true);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isLogVitalsModalOpen, setIsLogVitalsModalOpen] = useState<boolean>(false);
  const [isWearableSyncModalOpen, setIsWearableSyncModalOpen] = useState<boolean>(false);
  const [recentReportNotice, setRecentReportNotice] = useState<string | null>(null);

  const handleToggleViewMode = (mode: 'patient' | 'clinical') => {
    if (mode === 'clinical') {
      if (isStaffAuthenticated) {
        setViewMode('clinical');
      } else {
        setIsStaffAuthModalOpen(true);
      }
    } else {
      setViewMode('patient');
    }
  };

  const handleStaffAuthSuccess = () => {
    setIsStaffAuthenticated(true);
    try {
      sessionStorage.setItem('biotwin_staff_auth', 'true');
    } catch {
      // ignore
    }
    setIsStaffAuthModalOpen(false);
    setViewMode('clinical');
  };

  const handleLockStaffSession = () => {
    setIsStaffAuthenticated(false);
    try {
      sessionStorage.removeItem('biotwin_staff_auth');
    } catch {
      // ignore
    }
    setViewMode('patient');
  };

  // Fetch patient models from server (only patient-entered ones)
  useEffect(() => {
    fetch('/api/patients')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch patient models');
        return res.json();
      })
      .then((data: VirtualPatient[]) => {
        if (Array.isArray(data)) {
          const userEntered = data.filter((p) => !isLegacyDummy(p));
          if (userEntered.length > 0) {
            setPatients(userEntered);
            try {
              localStorage.setItem('biotwin_patient_records', JSON.stringify(userEntered));
            } catch (e) {}
          } else {
            // Check if client has local patient-entered data to sync to server
            try {
              const saved = localStorage.getItem('biotwin_patient_records');
              if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  const cleaned = parsed.filter((p) => !isLegacyDummy(p));
                  if (cleaned.length > 0) {
                    setPatients(cleaned);
                    fetch('/api/patients/sync', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ patients: cleaned }),
                    }).catch(() => {});
                  }
                }
              }
            } catch (e) {}
          }
        }
      })
      .catch((err) => {
        console.warn('Network fetch error, using local patient records:', err);
      });
  }, []);

  const handleClearAllPatients = async () => {
    setPatients([]);
    setActivePatient(null);
    try {
      localStorage.removeItem('biotwin_patient_records');
    } catch (e) {}
    try {
      await fetch('/api/patients', { method: 'DELETE' });
    } catch (e) {}
  };

  const handlePatientCreated = (newPatient: VirtualPatient) => {
    setPatients((prev) => {
      const updated = [newPatient, ...prev.filter((p) => p.id !== newPatient.id)];
      try {
        localStorage.setItem('biotwin_patient_records', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    fetch('/api/patients/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patients: [newPatient] }),
    }).catch(() => {});

    setActivePatient(newPatient);
    setActiveTab('console');
  };

  const handlePatientReportUpdated = (updated: VirtualPatient) => {
    setPatients((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      const list = exists ? prev.map((p) => (p.id === updated.id ? updated : p)) : [updated, ...prev];
      try {
        localStorage.setItem('biotwin_patient_records', JSON.stringify(list));
      } catch (e) {}
      return list;
    });

    fetch('/api/patients/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patients: [updated] }),
    }).catch(() => {});

    setActivePatient(updated);
    setRecentReportNotice(`Health numbers successfully updated for ${updated.fullName}!`);
    setTimeout(() => setRecentReportNotice(null), 6000);
  };

  const handlePatientWearableSynced = (updated: VirtualPatient) => {
    setPatients((prev) => {
      const list = prev.map((p) => (p.id === updated.id ? updated : p));
      if (!list.some((p) => p.id === updated.id)) list.push(updated);
      try {
        localStorage.setItem('biotwin_patient_records', JSON.stringify(list));
      } catch (e) {}
      return list;
    });

    setActivePatient(updated);
    const providerTitle = updated.lastWearableSync?.providerName || 'Wearable Sensor';
    setRecentReportNotice(`✓ Synced 288 telemetry epochs from ${providerTitle}. Digital twin calibrated!`);
    setTimeout(() => setRecentReportNotice(null), 6000);
  };

  return (
    <div dir={dir} className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Clinical Top Navigation Bar */}
      <TopNav
        patients={patients}
        activePatient={activePatient}
        onSelectPatient={setActivePatient}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        liveStreaming={liveStreaming}
        onToggleLiveStream={() => setLiveStreaming(!liveStreaming)}
        onGoHome={() => setActivePatient(null)}
        isStaffAuthenticated={isStaffAuthenticated}
        onOpenStaffAuth={() => setIsStaffAuthModalOpen(true)}
        onLockStaffSession={handleLockStaffSession}
      />

      {/* If Doctor View is active and a patient is selected, render clinical EHR patient header & bedside telemetry strip */}
      {viewMode === 'clinical' && isStaffAuthenticated && activePatient && (
        <>
          <PatientHeader
            patient={activePatient}
            patients={patients}
            onSelectPatient={setActivePatient}
            onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
            liveStreaming={liveStreaming}
          />
          <TelemetryVitalsStrip patient={activePatient} liveStreaming={liveStreaming} />
        </>
      )}

      {/* Main Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        {/* Recent Health Data Update Notification */}
        {recentReportNotice && (
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-600 rounded-xl flex items-center justify-between text-xs text-emerald-200 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{recentReportNotice}</span>
            </div>
            <button
              onClick={() => setRecentReportNotice(null)}
              className="text-emerald-400 hover:text-white text-xs font-mono cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* VIEW MODE 1: PATIENT-FRIENDLY VIEW (Clear, simple, understandable for everyday people) */}
        {viewMode === 'patient' ? (
          !activePatient ? (
            <WelcomeGateway
              onPatientCreated={handlePatientCreated}
            />
          ) : (
            <SimplePatientView
              patient={activePatient}
              onOpenLogVitals={() => setIsLogVitalsModalOpen(true)}
              onSwitchToDoctorView={() => handleToggleViewMode('clinical')}
              onGoHome={() => setActivePatient(null)}
              onOpenWearableSync={() => setIsWearableSyncModalOpen(true)}
            />
          )
        ) : (
          /* VIEW MODE 2: DOCTOR / CLINICAL SPECIALIST DASHBOARD */
          !isStaffAuthenticated ? (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl max-w-xl mx-auto space-y-5 text-center shadow-xl my-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white">Clinical Staff Authorization Required</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  The Physician Workspace contains confidential patient charts, ICD-10 diagnostic staging, and multi-patient histories protected under HIPAA privacy standards.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsStaffAuthModalOpen(true)}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Enter Clinician PIN</span>
                </button>
                <button
                  onClick={() => setViewMode('patient')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  <span>Return to Patient View</span>
                </button>
              </div>
            </div>
          ) : !activePatient ? (
            <div className="space-y-6">
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl mx-auto space-y-6 text-center shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-teal-950 border border-teal-700 flex items-center justify-center text-teal-300 mx-auto shadow-lg">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white">Physician Clinical Workspace</h2>
                  <p className="text-xs text-slate-400 max-w-lg mx-auto">
                    {patients.length > 0
                      ? 'Select a patient-entered record below to inspect real-time cardiorenal hemodynamics, organ system stress matrices, and in-silico GDMT simulations.'
                      : 'This workspace displays only patient-entered records. No default mock patient data is retained.'}
                  </p>
                </div>

                {patients.length === 0 ? (
                  <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4 my-2 text-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-slate-200">No Patient Records Entered Yet</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                        Default patient details have been removed. Waiting for the patient to set up their health twin, or you can admit a patient record directly below.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <button
                        onClick={() => setIsNewPatientModalOpen(true)}
                        className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Admit / Add Patient Record</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                      <span className="font-semibold text-slate-300">
                        Patient-Entered Records ({patients.length})
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-teal-400">
                          Verified Clinical Twins
                        </span>
                        <button
                          type="button"
                          onClick={handleClearAllPatients}
                          className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                          title="Wipe stored records to start completely fresh"
                        >
                          Clear All Stored Records
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                      {patients.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setActivePatient(p)}
                          className="p-4 bg-slate-950 border border-slate-800 hover:border-teal-500 rounded-xl transition-all cursor-pointer group space-y-2 text-left hover:bg-slate-900/60 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white group-hover:text-teal-300 text-xs">
                              {p.fullName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              {p.mrn}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {p.age ? `${p.age}y` : 'Age N/A'} {p.sex ? `· ${p.sex}` : ''} {p.primaryDiagnoses && p.primaryDiagnoses[0] ? `· ${p.primaryDiagnoses[0]}` : ''}
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                            <span>BP {p.vitals.systolicBp}/{p.vitals.diastolicBp} · eGFR {p.labs.egfr}</span>
                            <span className="text-teal-400 group-hover:underline font-sans text-xs">Open Chart →</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsNewPatientModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Admit New Clinical Patient</span>
                  </button>
                  <button
                    onClick={() => setViewMode('patient')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Go to Patient Portal</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Banner for Physician Mode */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                  <span>
                    <strong className="text-white">Physician & Specialist Portal:</strong> Cardiorenal telemetry, ICD-10 diagnostic staging, hemodynamics (SVR, MAP, EF), GDMT protocols, and in-silico pharmacodynamic forecasting.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActivePatient(null)}
                    className="text-slate-300 hover:text-white font-medium cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 transition-colors"
                  >
                    <span>Change Patient</span>
                  </button>
                  <button
                    onClick={() => setViewMode('patient')}
                    className="text-teal-300 hover:text-white font-medium cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 transition-colors"
                    title="View simplified twin to share and explain to the patient"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Explain to Patient</span>
                  </button>
                  <button
                    onClick={handleLockStaffSession}
                    className="text-rose-300 hover:text-rose-200 font-semibold cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800/80 hover:bg-rose-900/60 transition-colors"
                    title="Lock clinical session to protect patient privacy"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Lock Session</span>
                  </button>
                </div>
              </div>

            {/* Navigation Tabs Bar for easy view switching */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('console')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'console'
                  ? 'bg-slate-800 text-teal-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Clinical Overview
            </button>
            <button
              onClick={() => setActiveTab('organs')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'organs'
                  ? 'bg-slate-800 text-teal-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Organ Systems Matrix
            </button>
            <button
              onClick={() => setActiveTab('hemodynamics')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'hemodynamics'
                  ? 'bg-rose-950 text-rose-200 border border-rose-800 font-bold shadow-sm'
                  : 'text-rose-400/90 hover:text-rose-200'
              }`}
            >
              <Gauge className="w-3.5 h-3.5 text-rose-400" />
              <span>Hemodynamics</span>
            </button>
            <button
              onClick={() => setActiveTab('biomarkers')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'biomarkers'
                  ? 'bg-amber-950 text-amber-200 border border-amber-800 font-bold shadow-sm'
                  : 'text-amber-400/90 hover:text-amber-200'
              }`}
            >
              <TestTube2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Biomarkers</span>
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'insights'
                  ? 'bg-slate-800 text-teal-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Clinical Intelligence (AI)
            </button>
            <button
              onClick={() => setActiveTab('predictive')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'predictive'
                  ? 'bg-slate-800 text-teal-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Predictive Care & GDMT
            </button>
            <button
              onClick={() => setActiveTab('longitudinal')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'longitudinal'
                  ? 'bg-slate-800 text-teal-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MAR, Genomics & Labs
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>CHART STATUS: REVIEWED</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">ATTENDING: {activePatient.attendingPhysician.split(',')[0]}</span>
          </div>
        </div>

        {/* Tab 1: Clinical Overview (Human Doctor / Care Team Dashboard) */}
        {activeTab === 'console' && (
          <div className="space-y-6">
            {/* Patient Registration Banner */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-950 border border-teal-700/80 flex items-center justify-center text-teal-300 shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    Clinical Patient Modeling & Baseline Calibration
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Currently inspecting <strong className="text-slate-200">{activePatient.fullName}</strong> ({activePatient.mrn} · {activePatient.age}y {activePatient.sex}). Enter custom parameters to calibrate another case.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActivePatient(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-lg text-xs transition-colors cursor-pointer border border-slate-700 flex items-center gap-1.5"
                  title="Return to patient roster"
                >
                  <Users className="w-3.5 h-3.5 text-teal-400" />
                  <span>Patient Roster</span>
                </button>
              </div>
            </div>

            {/* Clinical Notice */}
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 font-semibold">Clinical Decision Support Notice: </strong>
                Computational physiological simulations are designed for clinical decision-support and educational exploration. Diagnostic determinations and drug titration must be confirmed by licensed healthcare practitioners.
              </div>
            </div>

            {/* Top Row: Clinical Problem List & Active Regimen */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Active Clinical Problem List (7 cols) */}
              <div className="lg:col-span-7 p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-teal-400" />
                      <span className="text-xs font-semibold text-white">
                        Active Clinical Diagnoses & Syndromes
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {activePatient.primaryDiagnoses.length} Documented Diagnoses
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activePatient.primaryDiagnoses.map((diag, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                            <span>{diag}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Classification: {activePatient.phenotypeClassification}
                          </div>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                          Active · GDMT Indication
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Comorbidities */}
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <div className="text-[11px] font-mono text-slate-400 uppercase mb-1.5 font-semibold">
                      DOCUMENTED COMORBIDITIES
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activePatient.comorbidities.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
                  <span className="text-slate-400">
                    Dietary Sodium: {activePatient.lifestyle.dietarySodiumMg} mg/d · Exercise: {activePatient.lifestyle.weeklyCardioMinutes} min/wk
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('hemodynamics')}
                      className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Gauge className="w-3 h-3" />
                      <span>Inspect Hemodynamics</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('biomarkers')}
                      className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <TestTube2 className="w-3 h-3" />
                      <span>Inspect Biomarkers</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Prescriptions & Compliance (5 cols) */}
              <div className="lg:col-span-5 p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4 text-teal-400" />
                      <span className="text-xs font-mono uppercase text-slate-300 font-bold">
                        ACTIVE PHARMACOTHERAPY & REFILL COMPLIANCE
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {activePatient.medications.length} Prescriptions
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activePatient.medications.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">
                            {m.name} <span className="text-teal-300 font-mono font-normal">({m.dosage})</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {m.frequency} · {m.indication}
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs font-mono font-bold ${
                              m.adherenceRate >= 80 ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {m.adherenceRate}%
                          </span>
                          <div className="text-[9px] font-mono text-slate-500 uppercase">Adherence</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('longitudinal');
                      setTimeout(() => {
                        document.getElementById('section-cpic')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="Inspect CPIC Dosing Guidelines"
                  >
                    <Dna className="w-3.5 h-3.5" />
                    <span>{activePatient.genomics.length} CPIC Genomic Rules</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('longitudinal');
                      setTimeout(() => {
                        document.getElementById('section-mar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                    className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Open Full Medication Administration Record (MAR)"
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>Inspect Full MAR & CPIC Guides</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Access Modules: Clinical Intelligence & Predictive Care */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Clinical Intelligence Teaser */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5 font-semibold">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                      <span>CLINICAL DECISION SUPPORT & PATHOPHYSIOLOGY</span>
                    </span>
                    <span className="text-[11px] font-mono text-teal-400">Class 1A GDMT</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    Pathophysiological Inter-Organ Cross-Talk Synthesis
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                    Automated evaluation of intraglomerular hypertension, microalbuminuria (UACR{' '}
                    {activePatient.labs.uacr} mg/g), and systemic vascular resistance ({activePatient.vitals.systemicVascularResistance} dyn·s/cm5).
                    Detects early subclinical organ damage and contraindication flags.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Includes physician Q&A inquiry console
                  </span>
                  <button
                    onClick={() => setActiveTab('insights')}
                    className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Open Clinical Intelligence</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* In-Silico Care Plan Teaser */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5 font-semibold">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      <span>PREDICTIVE CARE & GDMT ESCALATION SIMULATOR</span>
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">Trial Validated</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    Multi-Modal Therapeutic Outcome Projections
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                    Model adding SGLT2 inhibitors (Empagliflozin), GLP-1 receptor agonists (Semaglutide), or non-steroidal MRAs (Finerenone)
                    to project 5-year MACE risk reductions and eGFR preservation curves against natural history drift.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Baseline 5-Year MACE: <strong>{activePatient.maceFiveYearRisk}%</strong>
                  </span>
                  <button
                    onClick={() => setActiveTab('predictive')}
                    className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Launch Care Simulator</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Embedded Organ Stage Preview */}
            <TwinAnatomyStage
              key={`${activePatient.id}-console`}
              patient={activePatient}
              liveStreaming={liveStreaming}
              onOpenPredictiveCare={() => setActiveTab('predictive')}
              initialViewMode="pathophysiology"
            />
          </div>
        )}

        {/* Tab 2: Organ Systems Matrix */}
        {activeTab === 'organs' && (
          <TwinAnatomyStage
            key={`${activePatient.id}-organs`}
            patient={activePatient}
            liveStreaming={liveStreaming}
            onOpenPredictiveCare={() => setActiveTab('predictive')}
            initialViewMode="pathophysiology"
          />
        )}

        {/* Tab 3: Dedicated Hemodynamics View */}
        {activeTab === 'hemodynamics' && (
          <TwinAnatomyStage
            key={`${activePatient.id}-hemodynamics`}
            patient={activePatient}
            liveStreaming={liveStreaming}
            onOpenPredictiveCare={() => setActiveTab('predictive')}
            initialViewMode="hemodynamics"
          />
        )}

        {/* Tab 4: Dedicated Biomarkers View */}
        {activeTab === 'biomarkers' && (
          <TwinAnatomyStage
            key={`${activePatient.id}-biomarkers`}
            patient={activePatient}
            liveStreaming={liveStreaming}
            onOpenPredictiveCare={() => setActiveTab('predictive')}
            initialViewMode="biomarkers"
          />
        )}

        {/* Tab 5: Clinical Intelligence (AI) */}
        {activeTab === 'insights' && (
          <AIInsightsView
            patient={activePatient}
            onOpenSimulator={() => setActiveTab('predictive')}
          />
        )}

        {/* Tab 6: Predictive Care & GDMT Simulator */}
        {activeTab === 'predictive' && (
          <PredictiveCareSimulator patient={activePatient} />
        )}

        {/* Tab 7: Labs & Ambulatory CGM */}
        {activeTab === 'longitudinal' && (
          <LongitudinalWearablesView
            patient={activePatient}
            onOpenWearableSync={() => setIsWearableSyncModalOpen(true)}
          />
        )}
            </>
          )
        )}
      </main>

      {/* Modals */}
      {activePatient && (
        <WearableSyncModal
          isOpen={isWearableSyncModalOpen}
          onClose={() => setIsWearableSyncModalOpen(false)}
          patient={activePatient}
          onPatientSynced={handlePatientWearableSynced}
        />
      )}

      {activePatient && (
        <LogPatientVitalsModal
          isOpen={isLogVitalsModalOpen}
          onClose={() => setIsLogVitalsModalOpen(false)}
          patient={activePatient}
          onPatientUpdated={handlePatientReportUpdated}
        />
      )}

      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onPatientCreated={handlePatientCreated}
      />

      {activePatient && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          patient={activePatient}
        />
      )}

      {/* Clinical Staff Authentication Modal */}
      <StaffAuthModal
        isOpen={isStaffAuthModalOpen}
        onClose={() => setIsStaffAuthModalOpen(false)}
        onSuccess={handleStaffAuthSuccess}
      />

      {/* Quiet Clinical Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded bg-teal-500" />
              <span className="font-semibold text-slate-300">BioTwin Clinical Studio</span>
              <span className="text-slate-600">|</span>
              <span>Virtual Patient Computational Physiology & In-Silico Predictive Care</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
              <span>ADA Standards 2026</span>
              <span className="text-slate-600">|</span>
              <span>ACC/AHA 2025 Multi-Society</span>
              <span className="text-slate-600">|</span>
              <span>KDIGO 2024</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center sm:text-left border-t border-slate-800/60 pt-2">
            ⚠️ <strong>Medical AI Disclaimer:</strong> AI models and simulations are not 100% correct and may make mistakes. Virtual patient modeling is intended as a clinical decision-support and educational tool, and does not replace the professional diagnosis, evaluation, or prescription of a licensed medical practitioner.
          </div>
        </div>
      </footer>
    </div>
  );
}
