import React, { useState } from 'react';
import { VirtualPatient, getPatientInitials } from '../types/patient';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  Activity,
  Plus,
  Download,
  Search,
  ChevronDown,
  User,
  UserPlus,
  Stethoscope,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export type ActiveTab = 'console' | 'organs' | 'hemodynamics' | 'biomarkers' | 'insights' | 'predictive' | 'longitudinal';

interface TopNavProps {
  patients: VirtualPatient[];
  activePatient: VirtualPatient | null;
  onSelectPatient: (patient: VirtualPatient) => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenNewPatientModal: () => void;
  onOpenExportModal: () => void;
  viewMode: 'patient' | 'clinical';
  onToggleViewMode: (mode: 'patient' | 'clinical') => void;
  liveStreaming: boolean;
  onToggleLiveStream: () => void;
  onGoHome?: () => void;
  isStaffAuthenticated?: boolean;
  onOpenStaffAuth?: () => void;
  onLockStaffSession?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  patients,
  activePatient,
  onSelectPatient,
  activeTab,
  onSelectTab,
  onOpenNewPatientModal,
  onOpenExportModal,
  viewMode,
  onToggleViewMode,
  liveStreaming,
  onToggleLiveStream,
  onGoHome,
  isStaffAuthenticated = false,
  onOpenStaffAuth,
  onLockStaffSession,
}) => {
  const { t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients.filter((p) =>
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.primaryDiagnoses.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand Element (Top Bar Contract) */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
          title={t('return_home')}
        >
          <div className="w-7 h-7 rounded bg-teal-600 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-xs">
            BT
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold tracking-tight text-white group-hover:text-teal-300 transition-colors">
              BioTwin
            </span>
            <span className="text-xs text-slate-400 font-normal hidden sm:inline">
              {viewMode === 'clinical' ? t('app_subtitle_clinical') : t('app_subtitle_patient')}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links & Clinical Tabs */}
        <div className="hidden lg:flex items-center gap-2">
          {viewMode === 'clinical' && activePatient && (
            <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
              <button
                onClick={() => onSelectTab('console')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'console'
                    ? 'bg-slate-800 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('tab_overview')}
              </button>
              <button
                onClick={() => onSelectTab('organs')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'organs'
                    ? 'bg-slate-800 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('tab_organs')}
              </button>
              <button
                onClick={() => onSelectTab('hemodynamics')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'hemodynamics'
                    ? 'bg-rose-950/80 text-rose-200 border border-rose-800 shadow-xs font-semibold'
                    : 'text-rose-400/80 hover:text-rose-200'
                }`}
              >
                {t('tab_hemodynamics')}
              </button>
              <button
                onClick={() => onSelectTab('biomarkers')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'biomarkers'
                    ? 'bg-amber-950/80 text-amber-200 border border-amber-800 shadow-xs font-semibold'
                    : 'text-amber-400/80 hover:text-amber-200'
                }`}
              >
                {t('tab_biomarkers')}
              </button>
              <button
                onClick={() => onSelectTab('predictive')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'predictive'
                    ? 'bg-slate-800 text-teal-300 shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('tab_predictive')}
              </button>
              <button
                onClick={() => onSelectTab('longitudinal')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'longitudinal'
                    ? 'bg-slate-800 text-teal-300 shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('tab_longitudinal')}
              </button>
            </nav>
          )}
        </div>

        {/* Zone 3: Primary Actions & Identity */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multi-Language Selector */}
          <LanguageSwitcher variant="compact" />

          {/* Segmented View Switcher (Patient vs. Physician) */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => onToggleViewMode('patient')}
              className={`px-2.5 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'patient'
                  ? 'bg-teal-700 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Patient Health Portal (Private & Confidential)"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('view_patient')}</span>
            </button>
            {isStaffAuthenticated ? (
              <button
                onClick={() => onToggleViewMode('clinical')}
                className={`px-2.5 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'clinical'
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Physician Clinical Dashboard"
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                <span>{t('physician_mode')}</span>
              </button>
            ) : (
              <button
                onClick={onOpenStaffAuth}
                className="px-2.5 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 text-slate-400 hover:text-amber-300 group"
                title="Clinical Staff Access (Locked - Staff PIN Required)"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>{t('physician_mode')}</span>
              </button>
            )}
          </div>

          {/* Privacy Badge in Patient Mode */}
          {viewMode === 'patient' && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-teal-950/40 border border-teal-800/40 rounded-lg text-[11px] text-teal-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>{t('confidential_twin')}</span>
            </div>
          )}

          {/* Clinical Workstation Lock Button (Active when Staff Authenticated) */}
          {isStaffAuthenticated && (
            <button
              onClick={onLockStaffSession}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/70 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              title="Lock clinical session and return to confidential patient view"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">{t('lock_session')}</span>
            </button>
          )}

          {/* Patient Switcher / Active Patient Identity */}
          {viewMode === 'clinical' ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-lg text-xs text-left cursor-pointer transition-colors"
                title="Switch clinical patient profile"
              >
                <div className={`w-2 h-2 rounded-full ${activePatient ? 'bg-emerald-500' : (patients.length > 0 ? 'bg-amber-400' : 'bg-slate-600')}`} />
                <div className="truncate max-w-[140px]">
                  <div className="font-semibold text-white leading-tight truncate">
                    {activePatient ? activePatient.fullName : (patients.length > 0 ? t('act_select_patient') : t('act_no_patients'))}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {activePatient ? activePatient.mrn : `${patients.length} Entered`}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 pb-2 border-b border-slate-800">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder={t('act_search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                    {filteredPatients.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 space-y-2">
                        <p>{t('act_no_patients')}</p>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenNewPatientModal();
                          }}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          {t('act_admit_details')}
                        </button>
                      </div>
                    ) : (
                      filteredPatients.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onSelectPatient(p);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer gap-2 ${
                            p.id === activePatient?.id ? 'bg-teal-950/40 text-teal-200' : 'text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 border border-teal-500/30 flex items-center justify-center font-mono font-bold text-[11px] text-teal-300 shrink-0 select-none">
                              {getPatientInitials(p.fullName)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-white flex items-center gap-1.5 truncate">
                                <span className="truncate">{p.fullName}</span>
                                <span className="text-[10px] font-mono text-slate-400 shrink-0">[{p.mrn}]</span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[170px]">
                                {p.age}y · {p.sex} · {p.primaryDiagnoses[0]}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 font-mono text-[10px] text-slate-400">
                            {p.maceFiveYearRisk}% MACE
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : activePatient ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-teal-950 to-slate-900 border border-teal-500/40 flex items-center justify-center font-mono font-bold text-[9px] text-teal-300 shrink-0 select-none">
                {getPatientInitials(activePatient.fullName)}
              </div>
              <div className="truncate max-w-[120px]">
                <div className="font-semibold text-white leading-tight truncate">
                  {activePatient.fullName}
                </div>
                <div className="text-[10px] text-slate-400">
                  {activePatient.mrn}
                </div>
              </div>
              {onGoHome && (
                <button
                  onClick={onGoHome}
                  className="ml-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 hover:text-white cursor-pointer border border-slate-700 transition-colors"
                  title="Switch profile"
                >
                  {t('act_change')}
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('act_setup_twin')}</span>
            </button>
          )}

          {/* Clinical Add Patient & FHIR Export (Physician Mode Only) */}
          {viewMode === 'clinical' && activePatient && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenNewPatientModal}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Admit New Clinical Patient"
              >
                <Plus className="w-4 h-4" />
              </button>
              {activePatient && (
                <button
                  onClick={onOpenExportModal}
                  className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Export FHIR Bundle"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
