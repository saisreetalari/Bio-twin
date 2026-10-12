import { VirtualPatient } from '../types/patient';

export const INITIAL_PATIENTS: VirtualPatient[] = [
  {
    id: 'VP-8921',
    twinId: 'TWIN-CARDIORENAL-8921',
    mrn: 'MRN-842-1904',
    fullName: 'Eleanor Vance',
    age: 64,
    sex: 'Female',
    heightCm: 165,
    weightKg: 82.5,
    bmi: 30.3,
    ethnicity: 'Mixed / Caucasian',
    attendingPhysician: 'Dr. Sarah Chen, MD, FACC (Cardionephrology)',
    department: 'Metabolic Cardiology & Renal Medicine Clinic',
    lastEncounterDate: '2026-02-14 · Routine Comprehensive Follow-up',
    allergies: ['Penicillin (Maculopapular Rash)', 'Codeine (Nausea)'],
    icdCodes: ['E11.22 (T2DM with Diabetic Nephropathy)', 'I10 (Essential Hypertension)', 'N18.31 (CKD Stage 3a)'],
    primaryDiagnoses: [
      'Type 2 Diabetes Mellitus with Microalbuminuria',
      'Hypertensive Nephrosclerosis (CKD Stage 3a)',
      'Atherosclerotic Cardiovascular Disease (ASCVD)'
    ],
    comorbidities: ['Mixed Dyslipidemia', 'Mild Obstructive Sleep Apnea'],
    phenotypeClassification: 'Cardiorenal-Metabolic Syndrome Stage III',
    vitals: {
      heartRate: 78,
      systolicBp: 148,
      diastolicBp: 92,
      meanArterialPressure: 110.7,
      respiratoryRate: 16,
      spo2: 96,
      bodyTemp: 36.8,
      cardiacOutput: 4.8,
      ejectionFraction: 54,
      strokeVolume: 61.5,
      systemicVascularResistance: 1580
    },
    labs: {
      hba1c: 8.4,
      fastingGlucose: 168,
      egfr: 52, // mL/min/1.73m²
      creatinine: 1.34,
      uacr: 248, // mg/g (microalbuminuria)
      potassium: 4.8,
      sodium: 139,
      bicarbonate: 22,
      ldl: 124,
      hdl: 42,
      triglycerides: 215,
      totalCholesterol: 209,
      hsCrp: 4.2, // systemic vascular inflammation
      bnp: 145,
      hemoglobin: 12.1,
      alt: 32,
      ast: 28
    },
    autonomic: {
      hrvSdnn: 24, // attenuated vagal tone
      sleepQualityScore: 58,
      cortisolBaseline: 17.2,
      ambulatoryPulsePressure: 56
    },
    medications: [
      {
        id: 'med-1',
        name: 'Metformin HCl',
        category: 'Biguanide',
        dosage: '1000 mg',
        frequency: 'BID (twice daily)',
        adherenceRate: 88,
        indication: 'Glycemic control / insulin sensitivity'
      },
      {
        id: 'med-2',
        name: 'Lisinopril',
        category: 'ACE Inhibitor',
        dosage: '20 mg',
        frequency: 'Daily',
        adherenceRate: 75,
        indication: 'Renoprotection & afterload reduction'
      },
      {
        id: 'med-3',
        name: 'Atorvastatin',
        category: 'HMG-CoA Reductase Inhibitor',
        dosage: '20 mg',
        frequency: 'QHS (bedtime)',
        adherenceRate: 70,
        indication: 'Secondary ASCVD prevention'
      },
      {
        id: 'med-4',
        name: 'Hydrochlorothiazide',
        category: 'Thiazide Diuretic',
        dosage: '12.5 mg',
        frequency: 'Morning',
        adherenceRate: 82,
        indication: 'Synergistic BP reduction'
      }
    ],
    genomics: [
      {
        gene: 'TCF7L2',
        variant: 'rs7903146 (T/T)',
        phenotype: 'High risk beta-cell exhaustion',
        clinicalSignificance: 'Reduced incretin response, benefits from GLP-1/SGLT2'
      },
      {
        gene: 'SLCO1B1',
        variant: '*5 / 521T>C',
        phenotype: 'Intermediate hepatic statin uptake',
        clinicalSignificance: 'Monitor for high-dose statin myopathy'
      },
      {
        gene: 'CYP2C9',
        variant: '*1/*1 (Normal)',
        phenotype: 'Normal metabolizer',
        clinicalSignificance: 'Standard clearance for ARBs/Sulfonylureas'
      }
    ],
    organSystems: [
      {
        name: 'Cardiovascular Network',
        systemKey: 'cardiovascular',
        status: 'compensated',
        stressScore: 68,
        summary: 'Subclinical left ventricular remodeling, elevated pulse pressure, mild arterial stiffening.',
        keyMetrics: [
          { label: 'Blood Pressure', value: '148/92 mmHg', status: 'warning' },
          { label: 'Ejection Fraction', value: '54%', status: 'normal' },
          { label: 'Pulse Pressure', value: '56 mmHg', status: 'warning' }
        ],
        primaryPathology: 'Endothelial shear stress and persistent nocturnal hypertension'
      },
      {
        name: 'Renal Glomerular Apparatus',
        systemKey: 'renal',
        status: 'compromised',
        stressScore: 74,
        summary: 'Stage 3a CKD with moderately elevated microalbuminuria (UACR 248 mg/g). Glomerular hyperfiltration progressing to sclerosis.',
        keyMetrics: [
          { label: 'eGFR', value: '52 mL/min/1.73m²', status: 'warning' },
          { label: 'Serum Creatinine', value: '1.34 mg/dL', status: 'warning' },
          { label: 'UACR', value: '248 mg/g', status: 'critical' }
        ],
        primaryPathology: 'Intraglomerular hypertension driven by RAAS activation and diabetic hyperfiltration'
      },
      {
        name: 'Endocrine & Metabolic Homeostasis',
        systemKey: 'metabolic',
        status: 'compromised',
        stressScore: 79,
        summary: 'Poor glycemic equilibrium (HbA1c 8.4%) with peripheral insulin resistance and atherogenic dyslipidemia.',
        keyMetrics: [
          { label: 'HbA1c', value: '8.4%', status: 'critical' },
          { label: 'Fasting Glucose', value: '168 mg/dL', status: 'warning' },
          { label: 'Triglycerides', value: '215 mg/dL', status: 'warning' }
        ],
        primaryPathology: 'Hepatic gluconeogenesis unsuppressed, glucotoxicity driving vascular injury'
      },
      {
        name: 'Pulmonary & Respiratory Mechanics',
        systemKey: 'pulmonary',
        status: 'nominal',
        stressScore: 28,
        summary: 'Intact alveolar gas exchange; minimal nocturnal oxygen desaturations associated with mild sleep apnea.',
        keyMetrics: [
          { label: 'SpO2 Room Air', value: '96%', status: 'normal' },
          { label: 'Respiratory Rate', value: '16 br/min', status: 'normal' }
        ],
        primaryPathology: 'No active parenchymal pulmonary pathology'
      },
      {
        name: 'Neuro-Autonomic Regulation',
        systemKey: 'neurological',
        status: 'compensated',
        stressScore: 52,
        summary: 'Blunted parasympathetic vagal tone (HRV SDNN 24 ms), blunted circadian BP dipping.',
        keyMetrics: [
          { label: 'HRV SDNN', value: '24 ms', status: 'warning' },
          { label: 'Cortisol Baseline', value: '17.2 mcg/dL', status: 'normal' }
        ],
        primaryPathology: 'Autonomic neuropathy secondary to chronicity of hyperglycemia'
      }
    ],
    longitudinalHistory: [
      { period: 'Q1-2025', date: '2025-03-15', hba1c: 7.9, egfr: 58, systolicBp: 142, ldl: 132, hsCrp: 3.8, weightKg: 84.0 },
      { period: 'Q2-2025', date: '2025-06-20', hba1c: 8.1, egfr: 56, systolicBp: 144, ldl: 128, hsCrp: 4.0, weightKg: 83.2 },
      { period: 'Q3-2025', date: '2025-09-18', hba1c: 8.3, egfr: 54, systolicBp: 146, ldl: 126, hsCrp: 4.1, weightKg: 82.8 },
      { period: 'Q4-2025', date: '2025-12-14', hba1c: 8.4, egfr: 52, systolicBp: 148, ldl: 124, hsCrp: 4.2, weightKg: 82.5 }
    ],
    lifestyle: {
      dietarySodiumMg: 3800,
      mediterraneanDietScore: 4.2,
      weeklyCardioMinutes: 45,
      smokingStatus: 'Never',
      alcoholUnitsPerWeek: 2
    },
    maceFiveYearRisk: 26.4,
    ckdProgressionFiveYearRisk: 38.2,
    hospitalizationOneYearRisk: 19.5
  },
  {
    id: 'VP-4105',
    twinId: 'TWIN-CARDIOVASC-4105',
    mrn: 'MRN-519-7720',
    fullName: 'Marcus Chen',
    age: 52,
    sex: 'Male',
    heightCm: 178,
    weightKg: 91.0,
    bmi: 28.7,
    ethnicity: 'East Asian',
    attendingPhysician: 'Dr. Arthur Sterling, MD, FSCAI (Interventional Cardiology)',
    department: 'Post-Acute Coronary Intervention Clinic',
    lastEncounterDate: '2026-01-28 · Post-PCI 9-Month Angiographic Review',
    allergies: ['No Known Drug Allergies (NKDA)'],
    icdCodes: ['I21.09 (STEMI/NSTEMI LAD)', 'E78.1 (Pure Hypertriglyceridemia)', 'K76.0 (Hepatic Steatosis)'],
    primaryDiagnoses: [
      'Post-NSTEMI (PCI to LAD with DES 9 months ago)',
      'Severe Hypertriglyceridemic Dyslipidemia',
      'Metabolic Syndrome with Non-Alcoholic Fatty Liver'
    ],
    comorbidities: ['Essential Hypertension', 'Statin-Induced Myalgia (mild)'],
    phenotypeClassification: 'High-Risk Post-ACS Coronary Atherothrombosis',
    vitals: {
      heartRate: 72,
      systolicBp: 136,
      diastolicBp: 86,
      meanArterialPressure: 102.7,
      respiratoryRate: 15,
      spo2: 98,
      bodyTemp: 36.6,
      cardiacOutput: 5.2,
      ejectionFraction: 48, // mildly reduced
      strokeVolume: 72,
      systemicVascularResistance: 1380
    },
    labs: {
      hba1c: 6.2,
      fastingGlucose: 114,
      egfr: 84,
      creatinine: 1.02,
      uacr: 38,
      potassium: 4.4,
      sodium: 141,
      bicarbonate: 25,
      ldl: 142, // insufficiently suppressed for post-ACS
      hdl: 36,
      triglycerides: 340,
      totalCholesterol: 246,
      hsCrp: 5.8, // severe residual inflammatory risk
      bnp: 110,
      hemoglobin: 14.8,
      alt: 54, // hepatic steatosis
      ast: 42
    },
    autonomic: {
      hrvSdnn: 31,
      sleepQualityScore: 64,
      cortisolBaseline: 19.5,
      ambulatoryPulsePressure: 50
    },
    medications: [
      {
        id: 'med-m1',
        name: 'Aspirin',
        category: 'Antiplatelet',
        dosage: '81 mg',
        frequency: 'Daily',
        adherenceRate: 95,
        indication: 'Secondary stent thrombosis prevention'
      },
      {
        id: 'med-m2',
        name: 'Clopidogrel',
        category: 'P2Y12 Inhibitor',
        dosage: '75 mg',
        frequency: 'Daily',
        adherenceRate: 90,
        indication: 'Dual antiplatelet therapy (DAPT)'
      },
      {
        id: 'med-m3',
        name: 'Rosuvastatin',
        category: 'HMG-CoA Reductase Inhibitor',
        dosage: '10 mg',
        frequency: 'QHS',
        adherenceRate: 65, // low adherence due to muscle soreness
        indication: 'Plaque stabilization'
      },
      {
        id: 'med-m4',
        name: 'Metoprolol Succinate',
        category: 'Beta-1 Selective Blocker',
        dosage: '50 mg',
        frequency: 'Daily',
        adherenceRate: 88,
        indication: 'Post-MI myocardial oxygen economy'
      }
    ],
    genomics: [
      {
        gene: 'CYP2C19',
        variant: '*2/*1 (Loss of function allele)',
        phenotype: 'Intermediate Metabolizer',
        clinicalSignificance: 'Reduced active metabolite of clopidogrel; higher risk of recurrent ischemia'
      },
      {
        gene: 'APOE',
        variant: 'ε3/ε4',
        phenotype: 'Atherogenic lipoprotein profile',
        clinicalSignificance: 'Accelerated coronary plaque progression'
      }
    ],
    organSystems: [
      {
        name: 'Cardiovascular Network',
        systemKey: 'cardiovascular',
        status: 'compromised',
        stressScore: 78,
        summary: 'Mild systolic impairment (LVEF 48%), DES in LAD, high residual atherogenic & inflammatory stress.',
        keyMetrics: [
          { label: 'Ejection Fraction', value: '48%', status: 'warning' },
          { label: 'LDL-C', value: '142 mg/dL', status: 'critical' },
          { label: 'hs-CRP', value: '5.8 mg/L', status: 'critical' }
        ],
        primaryPathology: 'Persistent vascular inflammation, residual coronary plaque vulnerability'
      },
      {
        name: 'Renal Glomerular Apparatus',
        systemKey: 'renal',
        status: 'nominal',
        stressScore: 22,
        summary: 'Preserved glomerular filtration rate (eGFR 84 mL/min) with baseline microalbuminuria within limits.',
        keyMetrics: [
          { label: 'eGFR', value: '84 mL/min/1.73m²', status: 'normal' },
          { label: 'UACR', value: '38 mg/g', status: 'normal' }
        ],
        primaryPathology: 'No nephropathic impairment at present'
      },
      {
        name: 'Endocrine & Metabolic Homeostasis',
        systemKey: 'metabolic',
        status: 'compensated',
        stressScore: 62,
        summary: 'Severe hypertriglyceridemia and insulin resistance with elevated transaminases indicative of NAFLD.',
        keyMetrics: [
          { label: 'Triglycerides', value: '340 mg/dL', status: 'critical' },
          { label: 'ALT', value: '54 U/L', status: 'warning' },
          { label: 'Fasting Glucose', value: '114 mg/dL', status: 'warning' }
        ],
        primaryPathology: 'Hepatic lipid accumulation driving atherogenic particle secretion'
      },
      {
        name: 'Pulmonary & Respiratory Mechanics',
        systemKey: 'pulmonary',
        status: 'nominal',
        stressScore: 18,
        summary: 'Normal spirometric and oxygen saturation profile.',
        keyMetrics: [
          { label: 'SpO2 Room Air', value: '98%', status: 'normal' }
        ],
        primaryPathology: 'No impairment detected'
      },
      {
        name: 'Neuro-Autonomic Regulation',
        systemKey: 'neurological',
        status: 'compensated',
        stressScore: 48,
        summary: 'Sympathetic hyperactivity related to post-acute coronary anxiety and occupational stress.',
        keyMetrics: [
          { label: 'HRV SDNN', value: '31 ms', status: 'normal' }
        ],
        primaryPathology: 'Mild chronic stress response with adrenergic tone'
      }
    ],
    longitudinalHistory: [
      { period: 'Q1-2025', date: '2025-03-25', hba1c: 6.0, egfr: 88, systolicBp: 142, ldl: 158, hsCrp: 7.2, weightKg: 93.0 },
      { period: 'Q2-2025', date: '2025-06-28', hba1c: 6.1, egfr: 86, systolicBp: 138, ldl: 150, hsCrp: 6.4, weightKg: 92.4 },
      { period: 'Q3-2025', date: '2025-09-30', hba1c: 6.1, egfr: 85, systolicBp: 136, ldl: 145, hsCrp: 6.0, weightKg: 91.5 },
      { period: 'Q4-2025', date: '2025-12-18', hba1c: 6.2, egfr: 84, systolicBp: 136, ldl: 142, hsCrp: 5.8, weightKg: 91.0 }
    ],
    lifestyle: {
      dietarySodiumMg: 3400,
      mediterraneanDietScore: 5.0,
      weeklyCardioMinutes: 60,
      smokingStatus: 'Former',
      alcoholUnitsPerWeek: 6
    },
    maceFiveYearRisk: 31.8,
    ckdProgressionFiveYearRisk: 8.5,
    hospitalizationOneYearRisk: 22.0
  },
  {
    id: 'VP-7730',
    twinId: 'TWIN-CARDIOMYO-7730',
    mrn: 'MRN-338-9041',
    fullName: 'Amina Morales',
    age: 29,
    sex: 'Female',
    heightCm: 168,
    weightKg: 68.0,
    bmi: 24.1,
    ethnicity: 'Hispanic / Latino',
    attendingPhysician: 'Dr. Rebecca Lowenstein, MD, FACOG, FACC (Cardio-Obstetrics)',
    department: 'Maternal Heart Disease Program',
    lastEncounterDate: '2026-02-02 · Postpartum 6-Month Echocardiogram',
    allergies: ['Sulfa Antibiotics (Severe Urticaria)'],
    icdCodes: ['O90.3 (Peripartum Cardiomyopathy)', 'R00.0 (Sinus Tachycardia)', 'R73.01 (Impaired Fasting Glucose)'],
    primaryDiagnoses: [
      'Peripartum Cardiomyopathy (Recovering, LVEF 42%)',
      'Post-Gestational Impaired Fasting Glucose',
      'Sinus Tachycardia with Inappropriate Autonomic Response'
    ],
    comorbidities: ['Iron Deficiency Anemia (resolved)'],
    phenotypeClassification: 'Postpartum Myocardial Recovery & Cardiometabolic Transition',
    vitals: {
      heartRate: 94,
      systolicBp: 118,
      diastolicBp: 76,
      meanArterialPressure: 90.0,
      respiratoryRate: 18,
      spo2: 99,
      bodyTemp: 37.0,
      cardiacOutput: 4.4,
      ejectionFraction: 42,
      strokeVolume: 47,
      systemicVascularResistance: 1420
    },
    labs: {
      hba1c: 5.8,
      fastingGlucose: 108,
      egfr: 104,
      creatinine: 0.72,
      uacr: 18,
      potassium: 4.2,
      sodium: 140,
      bicarbonate: 24,
      ldl: 96,
      hdl: 52,
      triglycerides: 135,
      totalCholesterol: 175,
      hsCrp: 2.1,
      bnp: 220, // cardiac strain marker
      hemoglobin: 12.8,
      alt: 22,
      ast: 20
    },
    autonomic: {
      hrvSdnn: 38,
      sleepQualityScore: 50, // postpartum sleep disruption
      cortisolBaseline: 18.0,
      ambulatoryPulsePressure: 42
    },
    medications: [
      {
        id: 'med-a1',
        name: 'Carvedilol',
        category: 'Non-selective Beta Blocker with Alpha-1 Block',
        dosage: '6.25 mg',
        frequency: 'BID',
        adherenceRate: 92,
        indication: 'Ventricular reverse remodeling'
      },
      {
        id: 'med-a2',
        name: 'Enalapril',
        category: 'ACE Inhibitor',
        dosage: '5 mg',
        frequency: 'BID',
        adherenceRate: 88,
        indication: 'Neurohormonal blockade for cardiomyopathy'
      }
    ],
    genomics: [
      {
        gene: 'TTN (Titin)',
        variant: 'Truncating Variant p.Trp13840*',
        phenotype: 'Genetic predisposition to dilated/peripartum cardiomyopathy',
        clinicalSignificance: 'Requires prolonged GDMT even after EF recovery'
      }
    ],
    organSystems: [
      {
        name: 'Cardiovascular Network',
        systemKey: 'cardiovascular',
        status: 'compromised',
        stressScore: 71,
        summary: 'Recovering peripartum dilated cardiomyopathy (LVEF 42%, elevated BNP 220 pg/mL), persistent sinus tachycardia.',
        keyMetrics: [
          { label: 'Ejection Fraction', value: '42%', status: 'warning' },
          { label: 'BNP', value: '220 pg/mL', status: 'warning' },
          { label: 'Resting Heart Rate', value: '94 bpm', status: 'warning' }
        ],
        primaryPathology: 'Left ventricular systolic dysfunction with ongoing reverse remodeling'
      },
      {
        name: 'Renal Glomerular Apparatus',
        systemKey: 'renal',
        status: 'nominal',
        stressScore: 12,
        summary: 'Excellent filtration rate and electrolyte balance.',
        keyMetrics: [
          { label: 'eGFR', value: '104 mL/min/1.73m²', status: 'normal' }
        ],
        primaryPathology: 'Normal kidney function'
      },
      {
        name: 'Endocrine & Metabolic Homeostasis',
        systemKey: 'metabolic',
        status: 'nominal',
        stressScore: 32,
        summary: 'Mild residual post-gestational glycemic dysregulation.',
        keyMetrics: [
          { label: 'HbA1c', value: '5.8%', status: 'normal' },
          { label: 'Fasting Glucose', value: '108 mg/dL', status: 'normal' }
        ],
        primaryPathology: 'Transient gestational insulin resistance returning to baseline'
      },
      {
        name: 'Pulmonary & Respiratory Mechanics',
        systemKey: 'pulmonary',
        status: 'nominal',
        stressScore: 15,
        summary: 'No pulmonary congestion or interstitial edema present.',
        keyMetrics: [
          { label: 'SpO2 Room Air', value: '99%', status: 'normal' }
        ],
        primaryPathology: 'Normal pulmonary mechanics'
      },
      {
        name: 'Neuro-Autonomic Regulation',
        systemKey: 'neurological',
        status: 'compensated',
        stressScore: 56,
        summary: 'Elevated sympathetic tone due to sleep fragmentation and caring for newborn.',
        keyMetrics: [
          { label: 'Resting Pulse', value: '94 bpm', status: 'warning' }
        ],
        primaryPathology: 'Postpartum sleep deficit with adrenergic compensation'
      }
    ],
    longitudinalHistory: [
      { period: 'Q1-2025', date: '2025-02-10', hba1c: 6.4, egfr: 110, systolicBp: 110, ldl: 104, hsCrp: 4.8, weightKg: 74.0 },
      { period: 'Q2-2025', date: '2025-05-15', hba1c: 6.1, egfr: 108, systolicBp: 114, ldl: 100, hsCrp: 3.2, weightKg: 71.5 },
      { period: 'Q3-2025', date: '2025-08-20', hba1c: 5.9, egfr: 105, systolicBp: 116, ldl: 98, hsCrp: 2.5, weightKg: 69.2 },
      { period: 'Q4-2025', date: '2025-11-28', hba1c: 5.8, egfr: 104, systolicBp: 118, ldl: 96, hsCrp: 2.1, weightKg: 68.0 }
    ],
    lifestyle: {
      dietarySodiumMg: 2200,
      mediterraneanDietScore: 7.2,
      weeklyCardioMinutes: 90,
      smokingStatus: 'Never',
      alcoholUnitsPerWeek: 0
    },
    maceFiveYearRisk: 11.2,
    ckdProgressionFiveYearRisk: 2.1,
    hospitalizationOneYearRisk: 14.2
  },
  {
    id: 'VP-1984',
    twinId: 'TWIN-MULTIMORBID-1984',
    mrn: 'MRN-729-4410',
    fullName: 'David Miller',
    age: 71,
    sex: 'Male',
    heightCm: 172,
    weightKg: 87.0,
    bmi: 29.4,
    ethnicity: 'Caucasian',
    attendingPhysician: 'Dr. Gregory Vance, MD, FACP (Geriatric Cardionephrology)',
    department: 'Complex Multimorbidity & Heart Failure Center',
    lastEncounterDate: '2026-02-18 · Multidisciplinary Frailty & Medication Review',
    allergies: ['NSAIDs / Indomethacin (Severe AKI)', 'Aspirin (Bronchospasm)'],
    icdCodes: ['I50.32 (Chronic Diastolic HF)', 'N18.32 (CKD Stage 3b)', 'J44.9 (COPD)', 'I48.0 (Paroxysmal AFib)'],
    primaryDiagnoses: [
      'Heart Failure with Preserved Ejection Fraction (HFpEF, NYHA Class II)',
      'Chronic Kidney Disease Stage 3b (eGFR 38 mL/min)',
      'Moderate Chronic Obstructive Pulmonary Disease (COPD, GOLD 2)',
      'Recurrent Gout & Chronic Polypharmacy'
    ],
    comorbidities: ['Atrial Fibrillation (Paroxysmal, CHA2DS2-VASc 4)', 'Osteoarthritis'],
    phenotypeClassification: 'Elderly Multimorbid Cardiopulmonary-Renal Complex',
    vitals: {
      heartRate: 82,
      systolicBp: 154,
      diastolicBp: 84,
      meanArterialPressure: 107.3,
      respiratoryRate: 20,
      spo2: 93,
      bodyTemp: 36.7,
      cardiacOutput: 4.1,
      ejectionFraction: 56, // preserved EF but high filling pressures
      strokeVolume: 50,
      systemicVascularResistance: 1720
    },
    labs: {
      hba1c: 6.9,
      fastingGlucose: 132,
      egfr: 38,
      creatinine: 1.82,
      uacr: 380, // overt proteinuria
      potassium: 5.1, // borderline hyperkalemia
      sodium: 137,
      bicarbonate: 21,
      ldl: 112,
      hdl: 39,
      triglycerides: 195,
      totalCholesterol: 190,
      hsCrp: 6.4,
      bnp: 480, // elevated cardiac filling pressure
      hemoglobin: 11.2, // anemia of chronic disease
      alt: 26,
      ast: 30
    },
    autonomic: {
      hrvSdnn: 18,
      sleepQualityScore: 46,
      cortisolBaseline: 21.0,
      ambulatoryPulsePressure: 70 // severe arterial stiffness
    },
    medications: [
      {
        id: 'med-d1',
        name: 'Furosemide',
        category: 'Loop Diuretic',
        dosage: '40 mg',
        frequency: 'Daily morning',
        adherenceRate: 85,
        indication: 'Volume overload & peripheral edema'
      },
      {
        id: 'med-d2',
        name: 'Apixaban',
        category: 'DOAC Anticoagulant',
        dosage: '2.5 mg',
        frequency: 'BID (dose adjusted for renal/age)',
        adherenceRate: 94,
        indication: 'Stroke prevention in Atrial Fibrillation'
      },
      {
        id: 'med-d3',
        name: 'Amlodipine',
        category: 'Dihydropyridine Calcium Channel Blocker',
        dosage: '5 mg',
        frequency: 'Daily',
        adherenceRate: 80,
        indication: 'Systolic hypertension'
      },
      {
        id: 'med-d4',
        name: 'Tiotropium Bromide',
        category: 'LAMA Bronchodilator',
        dosage: '18 mcg',
        frequency: 'Inhalation Daily',
        adherenceRate: 82,
        indication: 'COPD symptom maintenance'
      }
    ],
    genomics: [
      {
        gene: 'VKORC1',
        variant: '1639G>A',
        phenotype: 'Warfarin sensitive (on DOAC)',
        clinicalSignificance: 'DOAC preferred given variable VKORC1'
      }
    ],
    organSystems: [
      {
        name: 'Cardiovascular Network',
        systemKey: 'cardiovascular',
        status: 'critical',
        stressScore: 84,
        summary: 'HFpEF with high LV filling pressure (BNP 480 pg/mL), paroxysmal AF, and severe pulse pressure (70 mmHg).',
        keyMetrics: [
          { label: 'BNP', value: '480 pg/mL', status: 'critical' },
          { label: 'Systolic BP', value: '154 mmHg', status: 'critical' },
          { label: 'Pulse Pressure', value: '70 mmHg', status: 'critical' }
        ],
        primaryPathology: 'Diastolic stiffness, elevated wedge pressure, left atrial strain'
      },
      {
        name: 'Renal Glomerular Apparatus',
        systemKey: 'renal',
        status: 'critical',
        stressScore: 88,
        summary: 'Stage 3b CKD (eGFR 38 mL/min) with severe proteinuria and borderline hyperkalemia (K+ 5.1 mEq/L).',
        keyMetrics: [
          { label: 'eGFR', value: '38 mL/min/1.73m²', status: 'critical' },
          { label: 'Potassium', value: '5.1 mEq/L', status: 'warning' },
          { label: 'UACR', value: '380 mg/g', status: 'critical' }
        ],
        primaryPathology: 'Chronic tubulointerstitial fibrosis & cardiorenal venous congestion'
      },
      {
        name: 'Endocrine & Metabolic Homeostasis',
        systemKey: 'metabolic',
        status: 'compensated',
        stressScore: 54,
        summary: 'Moderate dysglycemia, metabolic acidosis component (bicarb 21 mEq/L).',
        keyMetrics: [
          { label: 'HbA1c', value: '6.9%', status: 'warning' },
          { label: 'Bicarbonate', value: '21 mEq/L', status: 'warning' }
        ],
        primaryPathology: 'Impaired metabolic clearance and secondary hyperuricemia'
      },
      {
        name: 'Pulmonary & Respiratory Mechanics',
        systemKey: 'pulmonary',
        status: 'compromised',
        stressScore: 76,
        summary: 'COPD GOLD 2 with resting SpO2 93%, mild exertional dyspnea, reactive airway limitation.',
        keyMetrics: [
          { label: 'SpO2 Room Air', value: '93%', status: 'warning' },
          { label: 'Respiration Rate', value: '20 br/min', status: 'warning' }
        ],
        primaryPathology: 'Airflow obstruction compounded by subclinical pulmonary venous congestion'
      },
      {
        name: 'Neuro-Autonomic Regulation',
        systemKey: 'neurological',
        status: 'compromised',
        stressScore: 68,
        summary: 'Severe autonomic dampening (HRV SDNN 18 ms) and fragmented sleep related to nocturnal orthopnea.',
        keyMetrics: [
          { label: 'HRV SDNN', value: '18 ms', status: 'critical' }
        ],
        primaryPathology: 'Chronic baroreflex attenuation and sympathetically mediated vasoconstriction'
      }
    ],
    longitudinalHistory: [
      { period: 'Q1-2025', date: '2025-01-20', hba1c: 6.7, egfr: 44, systolicBp: 148, ldl: 118, hsCrp: 5.5, weightKg: 89.2 },
      { period: 'Q2-2025', date: '2025-04-22', hba1c: 6.8, egfr: 42, systolicBp: 150, ldl: 115, hsCrp: 5.9, weightKg: 88.5 },
      { period: 'Q3-2025', date: '2025-07-25', hba1c: 6.8, egfr: 40, systolicBp: 152, ldl: 114, hsCrp: 6.2, weightKg: 87.8 },
      { period: 'Q4-2025', date: '2025-10-30', hba1c: 6.9, egfr: 38, systolicBp: 154, ldl: 112, hsCrp: 6.4, weightKg: 87.0 }
    ],
    lifestyle: {
      dietarySodiumMg: 3100,
      mediterraneanDietScore: 4.8,
      weeklyCardioMinutes: 30,
      smokingStatus: 'Former',
      alcoholUnitsPerWeek: 1
    },
    maceFiveYearRisk: 42.5,
    ckdProgressionFiveYearRisk: 61.0,
    hospitalizationOneYearRisk: 48.0
  }
];
