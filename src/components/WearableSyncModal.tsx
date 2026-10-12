import React, { useState } from 'react';
import { VirtualPatient, WearableReading, WearableSyncRecord } from '../types/patient';
import {
  Watch,
  Activity,
  Heart,
  Droplets,
  Moon,
  Footprints,
  Flame,
  CheckCircle2,
  X,
  RefreshCw,
  Sliders,
  Sparkles,
  Smartphone,
  Wifi,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface WearableSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: VirtualPatient;
  onPatientSynced: (updatedPatient: VirtualPatient) => void;
}

type DeviceType = 'apple_health' | 'dexcom_g7' | 'fitbit' | 'withings';

interface DeviceOption {
  id: DeviceType;
  name: string;
  manufacturer: string;
  typeLabel: string;
  badge: string;
  iconBg: string;
  accentColor: string;
  description: string;
}

const DEVICES: DeviceOption[] = [
  {
    id: 'apple_health',
    name: 'Apple Health',
    manufacturer: 'Apple Watch Series 10 / Ultra',
    typeLabel: 'Cardio-Autonomic Ecosystem',
    badge: 'HealthKit V18',
    iconBg: 'bg-rose-950/60 border-rose-800 text-rose-400',
    accentColor: '#f43f5e',
    description: 'Resting pulse, heart rate variability (HRV SDNN), SpO2 saturation, sleep architecture, and active energy expenditure.',
  },
  {
    id: 'dexcom_g7',
    name: 'Dexcom G7 CGM',
    manufacturer: 'Dexcom Inc. / Interstitial Sensor',
    typeLabel: 'Continuous Glucose Monitoring',
    badge: 'BLE Sensor Stream',
    iconBg: 'bg-emerald-950/60 border-emerald-800 text-emerald-400',
    accentColor: '#10b981',
    description: '5-minute interstitial glucose stream, real-time glycemic velocity trend arrows, Time-in-Range (TIR), and GMI estimation.',
  },
  {
    id: 'fitbit',
    name: 'Fitbit Sense 2 / Pixel Watch',
    manufacturer: 'Google Fitbit Ecosystem',
    typeLabel: 'Biometric & Stress Tracker',
    badge: 'Fitbit Web API',
    iconBg: 'bg-teal-950/60 border-teal-800 text-teal-400',
    accentColor: '#14b8a6',
    description: 'Continuous electrodermal activity (cEDA stress), nightly skin temperature variance, step cadence, and resting heart rate.',
  },
  {
    id: 'withings',
    name: 'Withings BPM Core',
    manufacturer: 'Withings Health Solutions',
    typeLabel: 'Smart Oscillometric BP & ECG',
    badge: 'Cellular / WiFi Sync',
    iconBg: 'bg-sky-950/60 border-sky-800 text-sky-400',
    accentColor: '#0ea5e9',
    description: 'Clinical-grade morning and evening blood pressure monitoring, pulse wave velocity (PWV arterial stiffness), and valvular sound analysis.',
  },
];

interface ScenarioPreset {
  id: string;
  title: string;
  subtitle: string;
  device: DeviceType;
  reading: WearableReading;
}

const SCENARIOS: ScenarioPreset[] = [
  {
    id: 'dexcom_steady',
    title: 'Optimal Glycemic Baseline',
    subtitle: 'Fasting stability with high Time-In-Range (>92%)',
    device: 'dexcom_g7',
    reading: {
      glucoseMgDl: 96,
      glucoseTrend: 'steady',
      heartRate: 68,
      restingHeartRate: 62,
      spo2Pct: 99,
      hrvSdnn: 54,
      stepsToday: 5400,
      activeCalories: 280,
      sleepHours: 7.6,
      systolicBp: 120,
      diastolicBp: 78,
    },
  },
  {
    id: 'dexcom_spike',
    title: 'Post-Meal Glycemic Elevation',
    subtitle: 'Prandial carbohydrate absorption surge (Trend ⇈)',
    device: 'dexcom_g7',
    reading: {
      glucoseMgDl: 178,
      glucoseTrend: 'rapidly_rising',
      heartRate: 84,
      restingHeartRate: 72,
      spo2Pct: 98,
      hrvSdnn: 36,
      stepsToday: 3200,
      activeCalories: 190,
      sleepHours: 6.8,
      systolicBp: 134,
      diastolicBp: 86,
    },
  },
  {
    id: 'apple_walk',
    title: 'Aerobic Walk & Cardio Recovery',
    subtitle: 'Sustained cadence with elevated HRV response',
    device: 'apple_health',
    reading: {
      heartRate: 72,
      restingHeartRate: 59,
      systolicBp: 118,
      diastolicBp: 76,
      glucoseMgDl: 104,
      glucoseTrend: 'steady',
      spo2Pct: 99,
      hrvSdnn: 64,
      stepsToday: 9850,
      activeCalories: 510,
      sleepHours: 8.1,
    },
  },
  {
    id: 'withings_hypertensive',
    title: 'Morning Arterial Pressure Surge',
    subtitle: 'Elevated morning home BP check',
    device: 'withings',
    reading: {
      systolicBp: 146,
      diastolicBp: 92,
      heartRate: 76,
      restingHeartRate: 71,
      glucoseMgDl: 112,
      glucoseTrend: 'steady',
      spo2Pct: 97,
      hrvSdnn: 32,
      stepsToday: 2100,
      activeCalories: 140,
      sleepHours: 5.6,
    },
  },
  {
    id: 'fitbit_stress',
    title: 'Sympathetic Stress & Short Sleep',
    subtitle: 'Depressed autonomic HRV with low sleep recovery',
    device: 'fitbit',
    reading: {
      heartRate: 86,
      restingHeartRate: 78,
      systolicBp: 138,
      diastolicBp: 88,
      glucoseMgDl: 128,
      glucoseTrend: 'rising',
      spo2Pct: 97,
      hrvSdnn: 24,
      stepsToday: 4100,
      activeCalories: 260,
      sleepHours: 4.9,
      skinTempDeviation: 0.4,
    },
  },
];

export const WearableSyncModal: React.FC<WearableSyncModalProps> = ({
  isOpen,
  onClose,
  patient,
  onPatientSynced,
}) => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('dexcom_g7');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('dexcom_steady');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStep, setSyncStep] = useState<number>(0);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Editable reading state
  const [reading, setReading] = useState<WearableReading>({
    glucoseMgDl: patient.labs.fastingGlucose || 98,
    glucoseTrend: 'steady',
    heartRate: patient.vitals.heartRate || 72,
    restingHeartRate: 64,
    systolicBp: patient.vitals.systolicBp || 122,
    diastolicBp: patient.vitals.diastolicBp || 80,
    spo2Pct: patient.vitals.spo2 || 98,
    hrvSdnn: patient.autonomic?.hrvSdnn || 48,
    stepsToday: 6200,
    activeCalories: 340,
    sleepHours: 7.4,
  });

  if (!isOpen) return null;

  const currentDevice = DEVICES.find((d) => d.id === selectedDevice) || DEVICES[0];

  const handleSelectScenario = (scenario: ScenarioPreset) => {
    setSelectedScenarioId(scenario.id);
    setSelectedDevice(scenario.device);
    setReading({ ...scenario.reading });
  };

  const handleDeviceChange = (devId: DeviceType) => {
    setSelectedDevice(devId);
    // Select matching scenario if available
    const match = SCENARIOS.find((s) => s.device === devId);
    if (match) {
      setSelectedScenarioId(match.id);
      setReading({ ...match.reading });
    }
  };

  const handleExecuteSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncStep(1);

    try {
      // Realistic multi-stage synchronization pipeline
      await new Promise((r) => setTimeout(r, 650));
      setSyncStep(2);
      await new Promise((r) => setTimeout(r, 750));
      setSyncStep(3);
      await new Promise((r) => setTimeout(r, 600));

      const response = await fetch(`/api/patients/${patient.id}/sync-wearable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedDevice,
          providerName: currentDevice.name,
          reading,
          telemetryPointsCount: 288,
          patient,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync request failed with status ${response.status}`);
      }

      const updatedPatient: VirtualPatient = await response.json();
      onPatientSynced(updatedPatient);
      setSyncStep(4);
      await new Promise((r) => setTimeout(r, 500));
      setIsSyncing(false);
      onClose();
    } catch (err: any) {
      console.warn('API sync endpoint fallback to local digital twin update:', err);
      // Client-side fallback if server is unreachable
      const updated: VirtualPatient = {
        ...patient,
        vitals: {
          ...patient.vitals,
          heartRate: reading.heartRate || patient.vitals.heartRate,
          systolicBp: reading.systolicBp || patient.vitals.systolicBp,
          diastolicBp: reading.diastolicBp || patient.vitals.diastolicBp,
          spo2: reading.spo2Pct || patient.vitals.spo2,
          meanArterialPressure: Number((((reading.systolicBp || 120) + 2 * (reading.diastolicBp || 80)) / 3).toFixed(1)) as any,
        },
        labs: {
          ...patient.labs,
          fastingGlucose: reading.glucoseMgDl || patient.labs.fastingGlucose,
        },
        autonomic: {
          ...patient.autonomic,
          hrvSdnn: reading.hrvSdnn || patient.autonomic.hrvSdnn,
          sleepQualityScore: reading.sleepHours ? Math.min(100, Math.round((reading.sleepHours / 8) * 90)) : patient.autonomic.sleepQualityScore,
        },
        lastEncounterDate: `${new Date().toISOString().split('T')[0]} · Wearable Synced (${currentDevice.name})`,
        lastWearableSync: {
          provider: selectedDevice,
          providerName: currentDevice.name,
          syncedAt: new Date().toISOString(),
          telemetryPointsIngested: 288,
          reading,
        },
        longitudinalHistory: [
          ...patient.longitudinalHistory,
          {
            period: `Sync-${new Date().getMonth() + 1}/${new Date().getDate()}`,
            date: new Date().toISOString().split('T')[0],
            hba1c: patient.labs.hba1c,
            egfr: patient.labs.egfr,
            systolicBp: reading.systolicBp || patient.vitals.systolicBp,
            ldl: patient.labs.ldl,
            hsCrp: patient.labs.hsCrp,
            weightKg: patient.weightKg,
          },
        ],
      };

      onPatientSynced(updated);
      setSyncStep(4);
      await new Promise((r) => setTimeout(r, 400));
      setIsSyncing(false);
      onClose();
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'rapidly_rising':
        return <span className="text-rose-400 font-bold text-base">⇈ Rapidly Rising</span>;
      case 'rising':
        return <span className="text-amber-400 font-bold text-base">↗ Rising</span>;
      case 'falling':
        return <span className="text-blue-400 font-bold text-base">↘ Falling</span>;
      case 'rapidly_falling':
        return <span className="text-indigo-400 font-bold text-base">⇊ Rapidly Falling</span>;
      default:
        return <span className="text-emerald-400 font-bold text-base">→ Steady</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Ambulatory Wearable & CGM Sync Engine</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-950 border border-teal-800 text-teal-300">
                  Continuous Telemetry Stream
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate continuous biometric telemetry ingestion for <strong className="text-slate-200">{patient.fullName}</strong> ({patient.mrn})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSyncing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Device Selection Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-teal-400" />
                <span>1. Select Wearable Sensor / Device Ecosystem</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                Active Protocol: Bluetooth Low Energy & Cloud OAuth
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {DEVICES.map((dev) => {
                const isSelected = selectedDevice === dev.id;
                return (
                  <button
                    key={dev.id}
                    type="button"
                    onClick={() => handleDeviceChange(dev.id)}
                    disabled={isSyncing}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800/90 border-teal-500 ring-1 ring-teal-500/40 shadow-lg'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${dev.iconBg}`}>
                          {dev.badge}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                        )}
                      </div>
                      <div className="font-bold text-sm text-white">{dev.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{dev.manufacturer}</div>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {dev.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Realistic Clinical Telemetry Presets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                <span>2. Choose Telemetry Profile Scenario</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Click a scenario to load sensor data automatically
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {SCENARIOS.map((sc) => {
                const isSelected = selectedScenarioId === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => handleSelectScenario(sc)}
                    disabled={isSyncing}
                    className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-850 border-blue-500 text-white shadow-xs'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{sc.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {DEVICES.find((d) => d.id === sc.device)?.name.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{sc.subtitle}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Telemetry Stream Parameters (Interactive Inputs) */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>3. Live Stream Ingestion Values (288 Epoch Points)</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Adjust sliders to simulate custom values
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Interstitial Glucose */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Droplets className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CGM Glucose</span>
                  </span>
                  <span className="font-mono text-white font-bold">{reading.glucoseMgDl} mg/dL</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="260"
                  step="1"
                  value={reading.glucoseMgDl || 100}
                  onChange={(e) => setReading({ ...reading, glucoseMgDl: Number(e.target.value) })}
                  disabled={isSyncing}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="mt-2 flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                  <span className="text-slate-500">Trend:</span>
                  <select
                    value={reading.glucoseTrend || 'steady'}
                    onChange={(e) => setReading({ ...reading, glucoseTrend: e.target.value as any })}
                    disabled={isSyncing}
                    className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-slate-200"
                  >
                    <option value="rapidly_rising">⇈ Rapidly Rising</option>
                    <option value="rising">↗ Rising</option>
                    <option value="steady">→ Steady</option>
                    <option value="falling">↘ Falling</option>
                    <option value="rapidly_falling">⇊ Rapidly Falling</option>
                  </select>
                </div>
              </div>

              {/* Heart Rate & Resting HR */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>Heart Rate</span>
                  </span>
                  <span className="font-mono text-white font-bold">{reading.heartRate} bpm</span>
                </div>
                <input
                  type="range"
                  min="48"
                  max="135"
                  step="1"
                  value={reading.heartRate || 72}
                  onChange={(e) => setReading({ ...reading, heartRate: Number(e.target.value) })}
                  disabled={isSyncing}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="mt-2 flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60 text-slate-400">
                  <span>Resting HR:</span>
                  <span className="font-mono text-slate-200">{reading.restingHeartRate || 64} bpm</span>
                </div>
              </div>

              {/* Blood Pressure (Systolic / Diastolic) */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    <span>Blood Pressure</span>
                  </span>
                  <span className="font-mono text-white font-bold">
                    {reading.systolicBp}/{reading.diastolicBp}
                  </span>
                </div>
                <input
                  type="range"
                  min="95"
                  max="175"
                  step="1"
                  value={reading.systolicBp || 120}
                  onChange={(e) =>
                    setReading({
                      ...reading,
                      systolicBp: Number(e.target.value),
                      diastolicBp: Math.round(Number(e.target.value) * 0.65),
                    })
                  }
                  disabled={isSyncing}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="mt-2 flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60 text-slate-400">
                  <span>Mean Arterial:</span>
                  <span className="font-mono text-slate-200">
                    {(((reading.systolicBp || 120) + 2 * (reading.diastolicBp || 80)) / 3).toFixed(0)} mmHg
                  </span>
                </div>
              </div>

              {/* Autonomic HRV & Steps */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Footprints className="w-3.5 h-3.5 text-amber-400" />
                    <span>Daily Steps & HRV</span>
                  </span>
                  <span className="font-mono text-white font-bold">{reading.stepsToday?.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="16000"
                  step="250"
                  value={reading.stepsToday || 5000}
                  onChange={(e) => setReading({ ...reading, stepsToday: Number(e.target.value) })}
                  disabled={isSyncing}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="mt-2 flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60 text-slate-400">
                  <span>HRV SDNN:</span>
                  <span className="font-mono text-slate-200">{reading.hrvSdnn || 45} ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Progress Bar (when actively syncing) */}
          {isSyncing && (
            <div className="p-4 bg-teal-950/40 border border-teal-800/80 rounded-xl space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-teal-300 font-semibold">
                  <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                  <span>
                    {syncStep === 1 && `Establishing encrypted TLS link to ${currentDevice.name}...`}
                    {syncStep === 2 && 'Ingesting 288 ambulatory biometric epochs (5-min telemetry)...'}
                    {syncStep === 3 && 'Calibrating multi-organ physiological twin baseline...'}
                    {syncStep === 4 && '✓ Synchronized! Updating longitudinal trajectory...'}
                  </span>
                </div>
                <span className="font-mono text-teal-400 font-bold">{syncStep * 25}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${syncStep * 25}%` }}
                />
              </div>
            </div>
          )}

          {syncError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg">
              {syncError}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>FHIR Observation resource compatible · HIPAA simulated enclave</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer w-full sm:w-auto text-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteSync}
              disabled={isSyncing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing Stream...' : `Sync ${currentDevice.name} Stream`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
