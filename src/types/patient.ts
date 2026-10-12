export type OrganStatus = 'nominal' | 'compensated' | 'compromised' | 'critical';

export interface Vitals {
  heartRate: number; // bpm
  systolicBp: number; // mmHg
  diastolicBp: number; // mmHg
  meanArterialPressure: number; // mmHg
  respiratoryRate: number; // br/min
  spo2: number; // %
  bodyTemp: number; // °C
  cardiacOutput: number; // L/min
  ejectionFraction: number; // %
  strokeVolume: number; // mL
  systemicVascularResistance: number; // dyn·s/cm5
}

export interface Labs {
  hba1c: number; // %
  fastingGlucose: number; // mg/dL
  egfr: number; // mL/min/1.73m²
  creatinine: number; // mg/dL
  uacr: number; // mg/g (urine albumin to creatinine)
  potassium: number; // mEq/L
  sodium: number; // mEq/L
  bicarbonate: number; // mEq/L
  ldl: number; // mg/dL
  hdl: number; // mg/dL
  triglycerides: number; // mg/dL
  totalCholesterol: number; // mg/dL
  hsCrp: number; // mg/L
  bnp: number; // pg/mL (brain natriuretic peptide)
  hemoglobin: number; // g/dL
  alt: number; // U/L
  ast: number; // U/L
}

export interface AutonomicMetrics {
  hrvSdnn: number; // ms
  sleepQualityScore: number; // /100
  cortisolBaseline: number; // mcg/dL
  ambulatoryPulsePressure: number; // mmHg
}

export interface Medication {
  id: string;
  name: string;
  category: string;
  dosage: string;
  frequency: string;
  adherenceRate: number; // %
  indication: string;
}

export interface GenomicVariant {
  gene: string;
  variant: string;
  phenotype: string;
  clinicalSignificance: string;
}

export interface OrganSystemModel {
  name: string;
  systemKey: 'cardiovascular' | 'renal' | 'metabolic' | 'pulmonary' | 'neurological';
  status: OrganStatus;
  stressScore: number; // 0 - 100
  summary: string;
  keyMetrics: { label: string; value: string; status: 'normal' | 'warning' | 'critical' }[];
  primaryPathology: string;
}

export interface LongitudinalPoint {
  period: string; // e.g., 'Q1-2025', 'Q2-2025'
  date: string;
  hba1c: number;
  egfr: number;
  systolicBp: number;
  ldl: number;
  hsCrp: number;
  weightKg: number;
}

export interface WearableReading {
  heartRate?: number;
  restingHeartRate?: number;
  systolicBp?: number;
  diastolicBp?: number;
  glucoseMgDl?: number;
  glucoseTrend?: 'rapidly_rising' | 'rising' | 'steady' | 'falling' | 'rapidly_falling';
  spo2Pct?: number;
  hrvSdnn?: number;
  stepsToday?: number;
  activeCalories?: number;
  sleepHours?: number;
  skinTempDeviation?: number;
}

export interface WearableSyncRecord {
  provider: 'apple_health' | 'dexcom_g7' | 'fitbit' | 'withings';
  providerName: string;
  syncedAt: string;
  telemetryPointsIngested: number;
  reading: WearableReading;
}

export interface VirtualPatient {
  id: string;
  twinId: string;
  mrn: string;
  fullName: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  avatarUrl?: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  ethnicity: string;
  primaryDiagnoses: string[];
  comorbidities: string[];
  icdCodes: string[];
  allergies: string[];
  attendingPhysician: string;
  department: string;
  lastEncounterDate: string;
  phenotypeClassification: string;
  vitals: Vitals;
  labs: Labs;
  autonomic: AutonomicMetrics;
  medications: Medication[];
  genomics: GenomicVariant[];
  organSystems: OrganSystemModel[];
  longitudinalHistory: LongitudinalPoint[];
  lifestyle: {
    dietarySodiumMg: number;
    mediterraneanDietScore: number; // /10
    weeklyCardioMinutes: number;
    smokingStatus: 'Never' | 'Former' | 'Active';
    alcoholUnitsPerWeek: number;
  };
  maceFiveYearRisk: number; // %
  ckdProgressionFiveYearRisk: number; // %
  hospitalizationOneYearRisk: number; // %
  lastWearableSync?: WearableSyncRecord;
}

export interface SimulationIntervention {
  medicationsToAdd: { name: string; dosage: string; frequency: string; category: string }[];
  medicationsToModify: { id: string; newDosage: string; newAdherence: number }[];
  medicationsToRemove: string[]; // ids
  lifestyleChanges: {
    targetSodiumMg: number;
    targetExerciseMin: number;
    dietaryAdherenceImprovement: number; // %
    smokingCessation: boolean;
  };
  overallAdherenceRate: number; // %
  projectionHorizonMonths: 3 | 6 | 12 | 60;
}

export interface TrajectoryProjectionPoint {
  month: number;
  label: string;
  baseline: {
    hba1c: number;
    egfr: number;
    systolicBp: number;
    maceRisk: number;
    uacr: number;
  };
  simulated: {
    hba1c: number;
    egfr: number;
    systolicBp: number;
    maceRisk: number;
    uacr: number;
  };
}

export interface SimulationResult {
  intervention: SimulationIntervention;
  projectedMetrics: {
    baselineMaceFiveYear: number;
    simulatedMaceFiveYear: number;
    maceRiskDelta: number; // negative is reduction
    baselineCkdProgressionRisk: number;
    simulatedCkdProgressionRisk: number;
    ckdRiskDelta: number;
    baselineHospitalizationRisk: number;
    simulatedHospitalizationRisk: number;
    hospitalizationRiskDelta: number;
    projectedHba1c: number;
    projectedEgfr: number;
    projectedSystolicBp: number;
  };
  trajectoryPoints: TrajectoryProjectionPoint[];
  guidelineCompliance: {
    adaDiabetes2026: { status: 'compliant' | 'partial' | 'non-compliant'; notes: string };
    accAhaCardio2025: { status: 'compliant' | 'partial' | 'non-compliant'; notes: string };
    kdigoRenal2024: { status: 'compliant' | 'partial' | 'non-compliant'; notes: string };
  };
  aiCarePlan: {
    summary: string;
    keyRecommendations: { priority: 'Urgent' | 'High' | 'Routine'; title: string; rationale: string; expectedOutcome: string }[];
    monitoringMilestones: { timeframe: string; action: string; targetMetric: string }[];
    safetyWarnings: string[];
  };
}

export interface AIClinicalInsight {
  patientId: string;
  generatedAt: string;
  executiveSummary: string;
  pathophysiologicalMechanisms: {
    organSystem: string;
    cascade: string;
    clinicalRisk: string;
    severity: 'critical' | 'high' | 'moderate' | 'mild';
  }[];
  criticalCounterfactuals: {
    scenario: string;
    projectedEffect: string;
    mitigationStrategy: string;
  }[];
  drugInteractionAlerts: {
    agents: string;
    type: 'Synergistic Benefit' | 'Adverse Interaction' | 'Dosing Alert';
    description: string;
  }[];
  predictiveRecommendations: string[];
}

export interface ReportAnalysisResult {
  isValidMedicalReport: boolean;
  detectedDocumentType?: string;
  rejectionReason?: string;
  reportDate?: string;
  labName?: string;
  patientName?: string;
  patientAge?: number;
  patientSex?: 'Male' | 'Female' | 'Other';
  plainEnglishSummary: string;
  overallAssessment: 'Looking Good' | 'Mild Attention Needed' | 'Needs Medical Review';
  goodNews: string[];
  needsAttention: string[];
  simpleActionSteps: string[];
  questionsForDoctor: string[];
  extractedMetrics: {
    systolicBp?: number;
    diastolicBp?: number;
    heartRate?: number;
    hba1c?: number;
    fastingGlucose?: number;
    egfr?: number;
    creatinine?: number;
    uacr?: number;
    ldl?: number;
    hdl?: number;
    triglycerides?: number;
    totalCholesterol?: number;
    potassium?: number;
    sodium?: number;
  };
}

export const getPatientInitials = (name?: string): string => {
  if (!name) return 'PT';
  const clean = name.trim().replace(/^(mr\.|mrs\.|ms\.|dr\.)\s+/i, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PT';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

