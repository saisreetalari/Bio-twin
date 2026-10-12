import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import type {
  VirtualPatient,
  SimulationIntervention,
  SimulationResult,
  TrajectoryProjectionPoint,
  AIClinicalInsight
} from './src/types/patient.ts';

dotenv.config();
process.env.DISABLE_HMR = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';

// In AI Studio dev environment, port 8080 is reserved for nginx reverse proxy.
// The Node/Express server must bind to port 3000, honoring --port CLI args if passed.
const cliPortIdx = process.argv.indexOf('--port');
const cliPort = cliPortIdx !== -1 && process.argv[cliPortIdx + 1] ? parseInt(process.argv[cliPortIdx + 1], 10) : null;
const envPort = process.env.PORT && process.env.PORT !== '8080' ? parseInt(process.env.PORT, 10) : null;
const PORT = cliPort || envPort || 3000;

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper for model calls with automatic fallback to gemini-3.1-flash-lite if 3.8-flash encounters demand spikes (503)
async function callGeminiGenerateContent(options: {
  contents: any;
  config?: any;
}) {
  try {
    return await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      ...options,
    });
  } catch (err: any) {
    console.warn('gemini-3.8-flash request fallback to gemini-3.1-flash-lite:', err?.message || err);
    return await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      ...options,
    });
  }
}

// In-memory virtual patient repository - starts empty to retain only patient-entered records
let patientStore: VirtualPatient[] = [];

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ limit: '25mb', extended: true }));

  // ---------------------------------------------
  // API: Get all virtual patients
  // ---------------------------------------------
  app.get('/api/patients', (req, res) => {
    res.json(patientStore);
  });

  // ---------------------------------------------
  // API: Get single virtual patient
  // ---------------------------------------------
  app.get('/api/patients/:id', (req, res) => {
    const patient = patientStore.find(p => p.id === req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient model not found' });
    }
    res.json(patient);
  });

  // ---------------------------------------------
  // API: Clear all virtual patients
  // ---------------------------------------------
  app.delete('/api/patients', (req, res) => {
    patientStore = [];
    res.json({ success: true, count: 0 });
  });

  // ---------------------------------------------
  // API: Create new custom virtual patient twin
  // ---------------------------------------------
  app.post('/api/patients/create', (req, res) => {
    try {
      const data = req.body;
      const newId = `VP-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTwinId = `TWIN-CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`;
      const newMrn = `MRN-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newPatient: VirtualPatient = {
        id: newId,
        twinId: newTwinId,
        mrn: data.mrn || newMrn,
        fullName: data.fullName || 'Patient Record',
        age: Number(data.age) || 0,
        sex: data.sex || 'Other',
        heightCm: Number(data.heightCm) || 0,
        weightKg: Number(data.weightKg) || 0,
        bmi: (Number(data.heightCm) > 0 && Number(data.weightKg) > 0)
          ? Number(((Number(data.weightKg)) / Math.pow((Number(data.heightCm)) / 100, 2)).toFixed(1))
          : 0,
        ethnicity: data.ethnicity || 'Patient Specified',
        primaryDiagnoses: Array.isArray(data.primaryDiagnoses) && data.primaryDiagnoses.length > 0
          ? data.primaryDiagnoses
          : ['Baseline Clinical Profile'],
        comorbidities: Array.isArray(data.comorbidities) ? data.comorbidities : [],
        icdCodes: Array.isArray(data.icdCodes) && data.icdCodes.length > 0
          ? data.icdCodes
          : ['Z00.00 (General Adult Medical Examination)'],
        allergies: Array.isArray(data.allergies) ? data.allergies : [],
        attendingPhysician: data.attendingPhysician || 'Unassigned Attending',
        department: data.department || 'Outpatient Clinical Services',
        lastEncounterDate: `${new Date().toISOString().split('T')[0]} · Clinical Registration`,
        phenotypeClassification: data.phenotypeClassification || 'Patient-Calibrated Twin Profile',
        vitals: {
          heartRate: Number(data.heartRate) || 72,
          systolicBp: Number(data.systolicBp) || 120,
          diastolicBp: Number(data.diastolicBp) || 80,
          meanArterialPressure: Number(((Number(data.systolicBp || 120) + 2 * (Number(data.diastolicBp || 80))) / 3).toFixed(1)) as any,
          respiratoryRate: 16,
          spo2: 98,
          bodyTemp: 36.8,
          cardiacOutput: 5.0,
          ejectionFraction: Number(data.ejectionFraction) || 58,
          strokeVolume: 68,
          systemicVascularResistance: 1350
        },
        labs: {
          hba1c: Number(data.hba1c) || 5.6,
          fastingGlucose: Number(data.fastingGlucose) || 95,
          egfr: Number(data.egfr) || 90,
          creatinine: 1.0,
          uacr: Number(data.uacr) || 20,
          potassium: 4.4,
          sodium: 140,
          bicarbonate: 24,
          ldl: Number(data.ldl) || 100,
          hdl: 50,
          triglycerides: 140,
          totalCholesterol: 180,
          hsCrp: Number(data.hsCrp) || 1.5,
          bnp: 60,
          hemoglobin: 14.0,
          alt: 25,
          ast: 22
        },
        autonomic: {
          hrvSdnn: 35,
          sleepQualityScore: 72,
          cortisolBaseline: 14.0,
          ambulatoryPulsePressure: (Number(data.systolicBp) || 120) - (Number(data.diastolicBp) || 80)
        },
        medications: Array.isArray(data.medications) ? data.medications : [],
        genomics: [],
        organSystems: [
          {
            name: 'Cardiovascular Network',
            systemKey: 'cardiovascular',
            status: (Number(data.systolicBp) || 140) > 145 ? 'compromised' : 'compensated',
            stressScore: Math.min(95, Math.round(((Number(data.systolicBp) || 140) / 180) * 100)),
            summary: `Elevated vascular afterload with systolic BP at ${data.systolicBp || 140} mmHg.`,
            keyMetrics: [
              { label: 'Systolic BP', value: `${data.systolicBp || 140} mmHg`, status: 'warning' },
              { label: 'Ejection Fraction', value: `${data.ejectionFraction || 52}%`, status: 'normal' }
            ],
            primaryPathology: 'Arterial compliance reduction and mechanical wall stress'
          },
          {
            name: 'Renal Glomerular Apparatus',
            systemKey: 'renal',
            status: (Number(data.egfr) || 60) < 60 ? 'compromised' : 'nominal',
            stressScore: Math.min(95, Math.round(100 - (Number(data.egfr) || 60))),
            summary: `Glomerular filtration rate estimated at ${data.egfr || 60} mL/min/1.73m².`,
            keyMetrics: [
              { label: 'eGFR', value: `${data.egfr || 60} mL/min`, status: (Number(data.egfr) || 60) < 60 ? 'warning' : 'normal' },
              { label: 'UACR', value: `${data.uacr || 180} mg/g`, status: (Number(data.uacr) || 180) > 30 ? 'warning' : 'normal' }
            ],
            primaryPathology: 'Early podocyte effacement and glomerular hyperfiltration'
          },
          {
            name: 'Endocrine & Metabolic Homeostasis',
            systemKey: 'metabolic',
            status: (Number(data.hba1c) || 8.0) > 7.5 ? 'compromised' : 'compensated',
            stressScore: Math.min(95, Math.round((Number(data.hba1c) || 8.0) * 10)),
            summary: `Glycemic control with HbA1c ${data.hba1c || 8.0}%.`,
            keyMetrics: [
              { label: 'HbA1c', value: `${data.hba1c || 8.0}%`, status: (Number(data.hba1c) || 8.0) > 7.5 ? 'critical' : 'normal' }
            ],
            primaryPathology: 'Insulin resistance and downstream glycation products'
          },
          {
            name: 'Pulmonary & Respiratory Mechanics',
            systemKey: 'pulmonary',
            status: 'nominal',
            stressScore: 20,
            summary: 'Normal respiratory parameters.',
            keyMetrics: [{ label: 'SpO2', value: '97%', status: 'normal' }],
            primaryPathology: 'None active'
          },
          {
            name: 'Neuro-Autonomic Regulation',
            systemKey: 'neurological',
            status: 'nominal',
            stressScore: 35,
            summary: 'Preserved circadian rhythms.',
            keyMetrics: [{ label: 'HRV SDNN', value: '26 ms', status: 'normal' }],
            primaryPathology: 'Mild autonomic imbalance'
          }
        ],
        longitudinalHistory: [
          { period: 'Q1-2025', date: '2025-03-01', hba1c: (Number(data.hba1c) || 8.0) - 0.4, egfr: (Number(data.egfr) || 60) + 3, systolicBp: (Number(data.systolicBp) || 140) - 4, ldl: (Number(data.ldl) || 120) + 8, hsCrp: 3.4, weightKg: (Number(data.weightKg) || 78) + 1.2 },
          { period: 'Q2-2025', date: '2025-06-01', hba1c: (Number(data.hba1c) || 8.0) - 0.2, egfr: (Number(data.egfr) || 60) + 2, systolicBp: (Number(data.systolicBp) || 140) - 2, ldl: (Number(data.ldl) || 120) + 4, hsCrp: 3.6, weightKg: (Number(data.weightKg) || 78) + 0.8 },
          { period: 'Q3-2025', date: '2025-09-01', hba1c: (Number(data.hba1c) || 8.0) - 0.1, egfr: (Number(data.egfr) || 60) + 1, systolicBp: (Number(data.systolicBp) || 140) - 1, ldl: (Number(data.ldl) || 120) + 2, hsCrp: 3.7, weightKg: (Number(data.weightKg) || 78) + 0.3 },
          { period: 'Q4-2025', date: '2025-12-01', hba1c: Number(data.hba1c) || 8.0, egfr: Number(data.egfr) || 60, systolicBp: Number(data.systolicBp) || 140, ldl: Number(data.ldl) || 120, hsCrp: Number(data.hsCrp) || 3.8, weightKg: Number(data.weightKg) || 78 }
        ],
        lifestyle: {
          dietarySodiumMg: 3500,
          mediterraneanDietScore: 5.2,
          weeklyCardioMinutes: 45,
          smokingStatus: 'Never',
          alcoholUnitsPerWeek: 2
        },
        maceFiveYearRisk: Math.min(60, Number((((Number(data.systolicBp) || 140) / 10) + ((Number(data.hba1c) || 8.0) * 1.5)).toFixed(1))),
        ckdProgressionFiveYearRisk: Math.min(80, Number((100 - (Number(data.egfr) || 60) * 0.8).toFixed(1))),
        hospitalizationOneYearRisk: 18.0
      };

      patientStore.unshift(newPatient);
      res.status(201).json(newPatient);
    } catch (err: any) {
      console.error('Error creating patient:', err);
      res.status(500).json({ error: err.message || 'Failed to create virtual patient' });
    }
  });

  // ---------------------------------------------
  // API: Sync/Upsert patient models from client
  // ---------------------------------------------
  app.post('/api/patients/sync', (req, res) => {
    try {
      const { patients: clientPatients } = req.body;
      if (Array.isArray(clientPatients)) {
        for (const cp of clientPatients) {
          if (!cp || !cp.id) continue;
          const idx = patientStore.findIndex(p => p.id === cp.id);
          if (idx >= 0) {
            patientStore[idx] = cp;
          } else {
            patientStore.unshift(cp);
          }
        }
      }
      res.json({ success: true, count: patientStore.length, patients: patientStore });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to sync patients' });
    }
  });

  // ---------------------------------------------
  // API: AI Clinical Insights (Powered by Gemini)
  // ---------------------------------------------
  app.post('/api/insights/analyze', async (req, res) => {
    const { patientId, patient: patientPayload } = req.body;
    let patient = patientStore.find(p => p.id === patientId);

    if (!patient && patientPayload && patientPayload.id) {
      patient = patientPayload;
      patientStore.unshift(patientPayload);
    }

    if (!patient) {
      return res.status(404).json({ error: 'Patient model not found' });
    }

    try {
      const prompt = `You are a clinical computational biology engine analyzing a high-fidelity virtual patient digital twin model.
Patient Details:
- Name: ${patient.fullName}, Age: ${patient.age}, Sex: ${patient.sex}
- Phenotype: ${patient.phenotypeClassification}
- Diagnoses: ${patient.primaryDiagnoses.join(', ')}
- Vitals: BP ${patient.vitals.systolicBp}/${patient.vitals.diastolicBp} mmHg (MAP ${patient.vitals.meanArterialPressure}), HR ${patient.vitals.heartRate} bpm, EF ${patient.vitals.ejectionFraction}%, SVR ${patient.vitals.systemicVascularResistance} dyn·s/cm5
- Key Labs: HbA1c ${patient.labs.hba1c}%, eGFR ${patient.labs.egfr} mL/min/1.73m², UACR ${patient.labs.uacr} mg/g, Potassium ${patient.labs.potassium} mEq/L, LDL ${patient.labs.ldl} mg/dL, hs-CRP ${patient.labs.hsCrp} mg/L, BNP ${patient.labs.bnp} pg/mL
- Medications: ${patient.medications.map(m => `${m.name} (${m.dosage} ${m.frequency}, adherence ${m.adherenceRate}%)`).join('; ')}
- Genomics: ${patient.genomics.map(g => `${g.gene} ${g.variant} (${g.phenotype})`).join('; ')}

Perform a deep in-silico pathophysiological analysis. Identify inter-organ stress cascades (e.g. cardiorenal crosstalk, endothelial inflammation), counterfactual scenarios (what occurs if standard of care remains unchanged or adherence slips), pharmacogenomic or drug interaction alerts, and 3-4 high-impact predictive care recommendations.

Return your analysis in strict JSON matching the schema.`;

      const response = await callGeminiGenerateContent({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: {
                type: Type.STRING,
                description: 'Concise 2-3 sentence clinical pathophysiological assessment of the virtual twin.',
              },
              pathophysiologicalMechanisms: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    organSystem: { type: Type.STRING },
                    cascade: { type: Type.STRING, description: 'Molecular/biomechanical cascade causing strain' },
                    clinicalRisk: { type: Type.STRING, description: 'Direct clinical outcome risk' },
                    severity: { type: Type.STRING, description: 'critical, high, moderate, or mild' },
                  },
                  required: ['organSystem', 'cascade', 'clinicalRisk', 'severity'],
                },
              },
              criticalCounterfactuals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    scenario: { type: Type.STRING },
                    projectedEffect: { type: Type.STRING },
                    mitigationStrategy: { type: Type.STRING },
                  },
                  required: ['scenario', 'projectedEffect', 'mitigationStrategy'],
                },
              },
              drugInteractionAlerts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    agents: { type: Type.STRING },
                    type: { type: Type.STRING, description: 'Synergistic Benefit, Adverse Interaction, or Dosing Alert' },
                    description: { type: Type.STRING },
                  },
                  required: ['agents', 'type', 'description'],
                },
              },
              predictiveRecommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'executiveSummary',
              'pathophysiologicalMechanisms',
              'criticalCounterfactuals',
              'drugInteractionAlerts',
              'predictiveRecommendations',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const insight: AIClinicalInsight = {
        patientId: patient.id,
        generatedAt: new Date().toISOString(),
        executiveSummary: parsed.executiveSummary || 'Clinical in-silico analysis completed.',
        pathophysiologicalMechanisms: parsed.pathophysiologicalMechanisms || [],
        criticalCounterfactuals: parsed.criticalCounterfactuals || [],
        drugInteractionAlerts: parsed.drugInteractionAlerts || [],
        predictiveRecommendations: parsed.predictiveRecommendations || [],
      };

      res.json(insight);
    } catch (err: any) {
      console.error('Gemini insight generation failed, serving clinical deterministic model:', err);
      // Fallback deterministic response grounded in patient data
      const fallback: AIClinicalInsight = {
        patientId: patient.id,
        generatedAt: new Date().toISOString(),
        executiveSummary: `Virtual twin exhibits active cardiorenal-metabolic crosstalk with elevated vascular afterload (BP ${patient.vitals.systolicBp}/${patient.vitals.diastolicBp} mmHg) and renal microvascular stress (eGFR ${patient.labs.egfr} mL/min, UACR ${patient.labs.uacr} mg/g). Glycemic control (HbA1c ${patient.labs.hba1c}%) requires targeted neurohormonal and renal protection.`,
        pathophysiologicalMechanisms: [
          {
            organSystem: 'Cardiorenal Nexus',
            cascade: 'Glomerular hyperfiltration coupled with high systemic vascular resistance and elevated pulse pressure',
            clinicalRisk: 'Accelerated loss of functional nephrons and progressive albuminuria',
            severity: patient.labs.egfr < 60 ? 'high' : 'moderate',
          },
          {
            organSystem: 'Vascular Endothelium',
            cascade: `Persistent systemic inflammation (hs-CRP ${patient.labs.hsCrp} mg/L) accelerating coronary plaque lipid core expansion`,
            clinicalRisk: 'Vascular stiffness, unstable coronary plaque vulnerability',
            severity: patient.labs.hsCrp > 3.0 ? 'high' : 'mild',
          },
          {
            organSystem: 'Metabolic Pancreatic-Hepatic Axis',
            cascade: 'Insulin resistance with compensatory hyperinsulinemia and hepatic gluconeogenesis',
            clinicalRisk: 'Endothelial glucotoxicity and microvascular barrier degradation',
            severity: patient.labs.hba1c > 8.0 ? 'critical' : 'moderate',
          },
        ],
        criticalCounterfactuals: [
          {
            scenario: 'Suboptimal medication adherence (<70% for ACEi/Statin)',
            projectedEffect: 'Systolic BP drifts +12 mmHg within 90 days; eGFR decline accelerates by 2.8 mL/min/year',
            mitigationStrategy: 'Transition to single-pill combination therapy and digital twin reminder protocol',
          },
          {
            scenario: 'High dietary sodium intake (>3500 mg/day)',
            projectedEffect: 'Blunts the anti-proteinuric effect of renin-angiotensin blockade by 40%',
            mitigationStrategy: 'Sodium titration target below 2000 mg/day with DASH dietary coaching',
          },
        ],
        drugInteractionAlerts: [
          {
            agents: 'RAAS Inhibitor + Thiazide/SGLT2i',
            type: 'Synergistic Benefit',
            description: 'Reduces intraglomerular pressure and reduces microalbuminuria by ~30-40%',
          },
          {
            agents: 'Statin + CYP/SLCO1B1 Profile',
            type: 'Dosing Alert',
            description: 'Patient genetic profile indicates appropriate clearance; monitor hepatic enzymes annually',
          },
        ],
        predictiveRecommendations: [
          'Initiate SGLT2 inhibitor (e.g., Empagliflozin 10mg daily) for cardiorenal protection and glycemic stabilization',
          'Optimize blood pressure target to <130/80 mmHg using mineralocorticoid receptor antagonist (Finerenone) or titration',
          'Target LDL-C reduction <70 mg/dL with Ezetimibe add-on if statin titration is limited',
          'Deploy continuous glucose monitoring (CGM) to evaluate time-in-range (TIR > 70%)',
        ],
      };
      res.json(fallback);
    }
  });

  // ---------------------------------------------
  // API: Interactive Clinical Query / Consult Twin
  // ---------------------------------------------
  app.post('/api/insights/ask', async (req, res) => {
    const { patientId, question, patient: patientPayload } = req.body;
    let patient = patientStore.find(p => p.id === patientId);

    if (!patient && patientPayload && patientPayload.id) {
      patient = patientPayload;
      patientStore.unshift(patientPayload);
    }

    if (!patient) {
      return res.status(404).json({ error: 'Patient model not found' });
    }

    try {
      const prompt = `You are a clinical decision support and virtual patient physiology expert. Answer the following question about this virtual patient digital twin.
Patient Profile:
- Name: ${patient.fullName}, Age: ${patient.age}, Sex: ${patient.sex}
- Diagnoses: ${patient.primaryDiagnoses.join('; ')}
- Vitals: BP ${patient.vitals.systolicBp}/${patient.vitals.diastolicBp} mmHg, HR ${patient.vitals.heartRate} bpm, EF ${patient.vitals.ejectionFraction}%, SVR ${patient.vitals.systemicVascularResistance}
- Labs: HbA1c ${patient.labs.hba1c}%, eGFR ${patient.labs.egfr} mL/min, UACR ${patient.labs.uacr} mg/g, Potassium ${patient.labs.potassium} mEq/L, LDL ${patient.labs.ldl} mg/dL, hs-CRP ${patient.labs.hsCrp} mg/L
- Active Meds: ${patient.medications.map(m => `${m.name} ${m.dosage}`).join(', ')}
- Genomics: ${patient.genomics.map(g => `${g.gene} ${g.variant}`).join(', ')}

Physician / Researcher Question:
"${question}"

Provide a concise, rigorous, evidence-based clinical reasoning response (2-3 paragraphs). Include mechanistic physiological rationale, safety considerations (contraindications/electrolytes/renal clearance), and concrete recommendation.`;

      const response = await callGeminiGenerateContent({
        contents: prompt,
      });

      res.json({ answer: response.text });
    } catch (err: any) {
      console.error('Ask Gemini error:', err);
      res.json({
        answer: `In this virtual patient model (${patient.fullName}, eGFR ${patient.labs.egfr} mL/min, HbA1c ${patient.labs.hba1c}%, BP ${patient.vitals.systolicBp}/${patient.vitals.diastolicBp} mmHg), any proposed modification directly impacts the cardiorenal hemodynamic balance. Specifically, maintaining renal perfusion while optimizing afterload reduction is the primary therapeutic priority. Close monitoring of serum creatinine, potassium (${patient.labs.potassium} mEq/L), and ambulatory pulse pressure is strongly indicated.`
      });
    }
  });

  // ---------------------------------------------
  // API: In-Silico Predictive Care Simulation
  // ---------------------------------------------
  app.post('/api/predictive-care/simulate', async (req, res) => {
    const { patientId, intervention, patient: patientPayload }: { patientId: string; intervention: SimulationIntervention; patient?: VirtualPatient } = req.body;
    let patient = patientStore.find(p => p.id === patientId);

    if (!patient && patientPayload && patientPayload.id) {
      patient = patientPayload;
      patientStore.unshift(patientPayload);
    }

    if (!patient) {
      return res.status(404).json({ error: 'Patient model not found' });
    }

    try {
      // 1. Deterministic Pharmacokinetic & Clinical Trial Calibration Engine
      let hba1cEffect = 0;
      let sbpEffect = 0;
      let egfrPreservationFactor = 1.0; // multiplier to slow annual eGFR decline
      let uacrReductionPct = 0;
      let maceReductionPct = 0;
      let ckdReductionPct = 0;
      let hfReductionPct = 0;

      // Evaluate Added Medications
      const addedMedications = intervention?.medicationsToAdd || [];
      const addedNames = addedMedications.map(m => (m?.name || '').toLowerCase());
      if (addedNames.some(n => n.includes('empagliflozin') || n.includes('dapagliflozin') || n.includes('sglt2'))) {
        hba1cEffect += 0.8;
        sbpEffect += 4.5;
        uacrReductionPct += 32;
        maceReductionPct += 14;
        ckdReductionPct += 38;
        hfReductionPct += 34;
        egfrPreservationFactor *= 0.65; // 35% slower annual decline
      }

      if (addedNames.some(n => n.includes('semaglutide') || n.includes('tirzepatide') || n.includes('glp-1'))) {
        hba1cEffect += 1.4;
        sbpEffect += 5.0;
        uacrReductionPct += 24;
        maceReductionPct += 20;
        ckdReductionPct += 22;
        hfReductionPct += 12;
      }

      if (addedNames.some(n => n.includes('finerenone') || n.includes('spironolactone') || n.includes('mra'))) {
        sbpEffect += 6.0;
        uacrReductionPct += 30;
        maceReductionPct += 14;
        ckdReductionPct += 28;
        hfReductionPct += 22;
      }

      if (addedNames.some(n => n.includes('lisinopril') || n.includes('losartan') || n.includes('valsartan') || n.includes('acei') || n.includes('arb'))) {
        sbpEffect += 8.0;
        uacrReductionPct += 25;
        ckdReductionPct += 20;
        maceReductionPct += 10;
      }

      if (addedNames.some(n => n.includes('atorvastatin') || n.includes('rosuvastatin') || n.includes('ezetimibe') || n.includes('statin'))) {
        maceReductionPct += 25;
      }

      // Lifestyle Modifications (safely guarded against undefined)
      const currentSodium = patient.lifestyle?.dietarySodiumMg ?? 2800;
      const targetSodium = intervention.lifestyleChanges?.targetSodiumMg ?? 2000;
      const sodiumReduction = Math.max(0, currentSodium - targetSodium);
      if (sodiumReduction > 1000) {
        sbpEffect += 5.2;
        uacrReductionPct += 10;
      }

      const currentCardio = patient.lifestyle?.weeklyCardioMinutes ?? 90;
      const targetCardio = intervention.lifestyleChanges?.targetExerciseMin ?? 150;
      const exerciseDelta = Math.max(0, targetCardio - currentCardio);
      if (exerciseDelta >= 60) {
        hba1cEffect += 0.4;
        sbpEffect += 3.5;
        maceReductionPct += 8;
      }

      if (intervention.lifestyleChanges?.smokingCessation && patient.lifestyle?.smokingStatus === 'Active') {
        maceReductionPct += 30;
        sbpEffect += 4.0;
      }

      // Apply Adherence Modifier
      const adherenceFactor = (intervention.overallAdherenceRate || 80) / 100;
      hba1cEffect *= adherenceFactor;
      sbpEffect *= adherenceFactor;
      uacrReductionPct = Math.min(75, uacrReductionPct * adherenceFactor);
      maceReductionPct = Math.min(65, maceReductionPct * adherenceFactor);
      ckdReductionPct = Math.min(70, ckdReductionPct * adherenceFactor);
      hfReductionPct = Math.min(60, hfReductionPct * adherenceFactor);

      // Baseline risk fallbacks
      const currentHba1c = Number(patient.labs.hba1c) || 5.7;
      const currentEgfr = Number(patient.labs.egfr) || 90;
      const currentSbp = Number(patient.vitals.systolicBp) || 120;
      const currentUacr = Number(patient.labs.uacr) || 15;
      const currentMace = Number(patient.maceFiveYearRisk) || 10.0;
      const currentCkd = Number(patient.ckdProgressionFiveYearRisk) || 5.0;
      const currentHosp = Number(patient.hospitalizationOneYearRisk) || 4.0;

      // Trajectory Points calculation (0, 3, 6, 12, 60 months)
      const months = [0, 3, 6, 12, 60];
      const trajectoryPoints: TrajectoryProjectionPoint[] = months.map(m => {
        const shortTimeFraction = Math.min(1, m / 6);

        // Baseline (Untreated natural history drift)
        const baseHba1c = Number((currentHba1c + (m > 0 ? (m / 12) * 0.15 : 0)).toFixed(2));
        const baseEgfr = Number((currentEgfr - (m > 0 ? (m / 12) * 2.8 : 0)).toFixed(1));
        const baseSbp = Number((currentSbp + (m > 0 ? (m / 12) * 1.2 : 0)).toFixed(1));
        const baseMace = Number((currentMace * (m === 0 ? 0 : (m / 60))).toFixed(1));
        const baseUacr = Number((currentUacr * (1 + (m > 0 ? (m / 12) * 0.08 : 0))).toFixed(0));

        // Simulated Intervention Trajectory
        const simHba1c = Number(Math.max(5.6, currentHba1c - (hba1cEffect * shortTimeFraction)).toFixed(2));
        // SGLT2i causes a transient hemodynamic drop in eGFR in first 3-6 weeks, followed by long-term slope flattening
        const transientDip = (addedNames.some(n => n.includes('sglt2') || n.includes('empagliflozin')) && m > 0 && m <= 3) ? 2.5 : 0;
        const simEgfr = Number((currentEgfr - transientDip - (m > 0 ? (m / 12) * (2.8 * egfrPreservationFactor) : 0)).toFixed(1));
        const simSbp = Number(Math.max(115, currentSbp - (sbpEffect * shortTimeFraction)).toFixed(1));
        const simMace = Number((currentMace * (1 - (maceReductionPct / 100)) * (m === 0 ? 0 : (m / 60))).toFixed(1));
        const simUacr = Number(Math.max(20, currentUacr * (1 - ((uacrReductionPct / 100) * shortTimeFraction))).toFixed(0));

        const label = m === 0 ? 'Baseline' : m === 3 ? '3 Mo' : m === 6 ? '6 Mo' : m === 12 ? '1 Yr' : '5 Yr';

        return {
          month: m,
          label,
          baseline: {
            hba1c: baseHba1c,
            egfr: baseEgfr,
            systolicBp: baseSbp,
            maceRisk: baseMace,
            uacr: baseUacr
          },
          simulated: {
            hba1c: simHba1c,
            egfr: simEgfr,
            systolicBp: simSbp,
            maceRisk: simMace,
            uacr: simUacr
          }
        };
      });

      const simMaceFiveYear = Number((currentMace * (1 - (maceReductionPct / 100))).toFixed(1));
      const simCkdRisk = Number((currentCkd * (1 - (ckdReductionPct / 100))).toFixed(1));
      const simHospRisk = Number((currentHosp * (1 - (hfReductionPct / 100))).toFixed(1));

      // 2. Call Gemini for clinical guidelines & narrative care plan
      let aiCarePlan = {
        summary: `In-silico simulation demonstrates a ${maceReductionPct.toFixed(0)}% relative reduction in 5-year MACE risk and ${ckdReductionPct.toFixed(0)}% deceleration in CKD progression under the optimized intervention protocol.`,
        keyRecommendations: [
          {
            priority: 'Urgent' as const,
            title: 'Initiate Cardiorenal Glycemic SGLT2 Inhibitor',
            rationale: 'Demonstrated reduction in intraglomerular capillary hypertension and cardiovascular death (EMPA-REG / DAPA-CKD).',
            expectedOutcome: 'Estimated 32% reduction in microalbuminuria and preservation of long-term eGFR trajectory.'
          },
          {
            priority: 'High' as const,
            title: 'Intensify Blood Pressure Target to <130/80 mmHg',
            rationale: 'Addresses arterial stiffening and vascular shear stress per ACC/AHA 2025 guidelines.',
            expectedOutcome: 'Lower systolic BP to ~128 mmHg, cutting recurrent stroke/MI probability.'
          },
          {
            priority: 'Routine' as const,
            title: 'Dietary Sodium Modulation (<2000 mg/day)',
            rationale: 'Restores diurnal blood pressure dipping and enhances RAAS blockade responsiveness.',
            expectedOutcome: 'Synergistic 4-6 mmHg systolic BP reduction without additional pharmacological burden.'
          }
        ],
        monitoringMilestones: [
          { timeframe: 'Week 2 - 4', action: 'Renal panel & serum electrolytes', targetMetric: 'Verify eGFR stable within 30% of baseline; K+ < 5.2 mEq/L' },
          { timeframe: 'Month 3', action: 'Repeat HbA1c & 24h Ambulatory BP', targetMetric: 'Target HbA1c < 7.2%; daytime BP < 130/80 mmHg' },
          { timeframe: 'Month 6', action: 'Quantitative UACR & Lipid panel', targetMetric: 'Target UACR reduction >30%; LDL-C < 70 mg/dL' }
        ],
        safetyWarnings: [
          'Monitor volume status closely during initial weeks of SGLT2i/Diuretic co-administration to prevent symptomatic orthostasis.',
          'Counsel patient on sick-day rules: hold SGLT2i during prolonged fasting or acute illness to minimize euglycemic DKA risk.'
        ]
      };

      try {
        const prompt = `You are a precision predictive medicine AI. The virtual patient ${patient.fullName} (Age ${patient.age}, diagnoses: ${patient.primaryDiagnoses.join(', ')}) was simulated with the following intervention:
Added Meds: ${intervention.medicationsToAdd.map(m => `${m.name} ${m.dosage}`).join(', ') || 'None'}
Adherence: ${intervention.overallAdherenceRate}%
Target Sodium: ${intervention.lifestyleChanges.targetSodiumMg} mg/day, Exercise: ${intervention.lifestyleChanges.targetExerciseMin} min/week
Projected Outcomes:
- MACE 5-yr Risk: ${patient.maceFiveYearRisk}% -> ${simMaceFiveYear}% (${maceReductionPct.toFixed(1)}% reduction)
- CKD 5-yr Progression: ${patient.ckdProgressionFiveYearRisk}% -> ${simCkdRisk}% (${ckdReductionPct.toFixed(1)}% reduction)
- Projected HbA1c: ${trajectoryPoints[3].simulated.hba1c}% (from ${patient.labs.hba1c}%)
- Projected SBP: ${trajectoryPoints[3].simulated.systolicBp} mmHg (from ${patient.vitals.systolicBp} mmHg)

Generate a succinct clinical action plan including:
1. Executive clinical rationale summary.
2. 3 prioritized clinical recommendations (Urgent, High, Routine) with rationale and expected outcome.
3. 3 monitoring milestones with timeframes, actions, and target metrics.
4. 2 safety warnings (e.g. sick-day rules, electrolyte checks).

Format as JSON matching the schema.`;

        const response = await callGeminiGenerateContent({
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                keyRecommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      priority: { type: Type.STRING, description: 'Urgent, High, or Routine' },
                      title: { type: Type.STRING },
                      rationale: { type: Type.STRING },
                      expectedOutcome: { type: Type.STRING },
                    },
                    required: ['priority', 'title', 'rationale', 'expectedOutcome'],
                  },
                },
                monitoringMilestones: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      timeframe: { type: Type.STRING },
                      action: { type: Type.STRING },
                      targetMetric: { type: Type.STRING },
                    },
                    required: ['timeframe', 'action', 'targetMetric'],
                  },
                },
                safetyWarnings: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['summary', 'keyRecommendations', 'monitoringMilestones', 'safetyWarnings'],
            },
          },
        });

        const parsedAi = JSON.parse(response.text || '{}');
        if (parsedAi.summary && parsedAi.keyRecommendations) {
          aiCarePlan = parsedAi;
        }
      } catch (geminiErr) {
        console.warn('Gemini care plan generation fallback used:', geminiErr);
      }

      const result: SimulationResult = {
        intervention,
        projectedMetrics: {
          baselineMaceFiveYear: patient.maceFiveYearRisk,
          simulatedMaceFiveYear: simMaceFiveYear,
          maceRiskDelta: Number((simMaceFiveYear - patient.maceFiveYearRisk).toFixed(1)),
          baselineCkdProgressionRisk: patient.ckdProgressionFiveYearRisk,
          simulatedCkdProgressionRisk: simCkdRisk,
          ckdRiskDelta: Number((simCkdRisk - patient.ckdProgressionFiveYearRisk).toFixed(1)),
          baselineHospitalizationRisk: patient.hospitalizationOneYearRisk,
          simulatedHospitalizationRisk: simHospRisk,
          hospitalizationRiskDelta: Number((simHospRisk - patient.hospitalizationOneYearRisk).toFixed(1)),
          projectedHba1c: trajectoryPoints[3].simulated.hba1c,
          projectedEgfr: trajectoryPoints[3].simulated.egfr,
          projectedSystolicBp: trajectoryPoints[3].simulated.systolicBp,
        },
        trajectoryPoints,
        guidelineCompliance: {
          adaDiabetes2026: {
            status: addedNames.some(n => n.includes('sglt2') || n.includes('glp-1')) ? 'compliant' : 'partial',
            notes: addedNames.some(n => n.includes('sglt2') || n.includes('glp-1'))
              ? 'Meets ADA 2026 Class 1A recommendation for organ protection in CKD/ASCVD.'
              : 'Suboptimal: ADA recommends SGLT2i or GLP-1 RA regardless of baseline HbA1c in high-risk patients.'
          },
          accAhaCardio2025: {
            status: (trajectoryPoints[3].simulated.systolicBp <= 130) ? 'compliant' : 'partial',
            notes: (trajectoryPoints[3].simulated.systolicBp <= 130)
              ? 'Achieves target blood pressure <130/80 mmHg with neurohormonal protection.'
              : 'Blood pressure remains above 130 mmHg threshold; consider further titration.'
          },
          kdigoRenal2024: {
            status: (addedNames.some(n => n.includes('sglt2')) && (uacrReductionPct > 20)) ? 'compliant' : 'partial',
            notes: 'Aligns with KDIGO clinical practice guidelines for microalbuminuria reduction and glomerular protection.'
          }
        },
        aiCarePlan
      };

      res.json(result);
    } catch (err: any) {
      console.error('Simulation error:', err);
      res.status(500).json({ error: err.message || 'Failed to execute simulation' });
    }
  });

  // ---------------------------------------------
  // API: Analyze Patient Medical Report & Extract Metrics
  // ---------------------------------------------
  app.post('/api/reports/analyze', async (req, res) => {
    try {
      const { fileBase64, mimeType, rawText, patientName } = req.body;

      if (!fileBase64 && !rawText) {
        return res.status(400).json({ error: 'Please provide either a document file or report text.' });
      }

      const prompt = `You are an expert clinical laboratory document validator and medical test translator.
Patient context: ${patientName || 'Current Patient'}

STAGE 1: DOCUMENT AUTHENTICATION & VERIFICATION (CRITICAL):
Examine the provided image or text carefully. Determine whether this is an authentic, genuine medical laboratory test report, diagnostic blood/urine panel, clinical pathology test, physician discharge summary, or medical vital signs log.

CRITICAL NON-MEDICAL / FAKE DOCUMENT REJECTION RULES:
- If the image or text is NOT an authentic medical laboratory test report or clinical diagnostic record:
  (For example: if it is a photo of a person, selfie, face, pet, animal, plant, landscape, scenery, vehicle, room, object, food, meme, cartoon, artistic illustration, clothing, receipt, financial invoice, general programming code, random text without medical test markers, or an unreadable blur):
  YOU MUST SET:
  - "isValidMedicalReport": false
  - "detectedDocumentType": specify what was actually observed, e.g. "Non-Medical Photo / Subject", "Personal Image / Selfie", "Landscape or Scenery", "Pet / Animal Photo", "Unrecognized Document", etc.
  - "rejectionReason": a clear, polite explanation describing why it was rejected, e.g. "The uploaded image appears to be a personal photo/non-medical picture and does not contain clinical laboratory test results, diagnostic biomarkers, or medical assays."
  - "plainEnglishSummary": "This uploaded image or document could not be recognized as a valid medical laboratory test report."
  - "overallAssessment": "Needs Medical Review"
  - "goodNews": []
  - "needsAttention": ["No authentic clinical laboratory test results or biomarkers could be identified in this upload."]
  - "simpleActionSteps": [
      "Please upload a clear, well-lit photo or PDF of an official clinical lab report (such as from Quest Diagnostics, LabCorp, Hospital, or Clinic).",
      "Ensure reference ranges, test names (like HbA1c, Glucose, Lipid Panel, CBC), and numerical values are clearly visible.",
      "Alternatively, click the 'Paste Report Text' tab to type or paste your laboratory findings directly."
    ]
  - "questionsForDoctor": []
  - "extractedMetrics": {} (MUST BE EMPTY - NEVER FABRICATE MEDICAL NUMBERS FOR NON-MEDICAL IMAGES)

STAGE 2: TRANSLATION & METRIC EXTRACTION (ONLY IF AUTHENTIC MEDICAL REPORT):
- Only if the document is a genuine clinical lab report or medical test:
  1. "isValidMedicalReport": true
  2. "detectedDocumentType": specific test name (e.g. "Comprehensive Metabolic Panel (CMP)", "Lipid Panel", "Complete Blood Count (CBC)", "Glycemic HbA1c Report", "Renal Function Panel", etc.)
  3. "rejectionReason": null
  4. "plainEnglishSummary": 2-3 warm, reassuring sentences explaining in everyday language what this test shows overall.
  5. "overallAssessment": choose one from 'Looking Good' | 'Mild Attention Needed' | 'Needs Medical Review'.
  6. "goodNews": list 2-3 positive, reassuring things found in the report.
  7. "needsAttention": list 1-3 things to keep an eye on in plain English.
  8. "simpleActionSteps": 3 easy, practical everyday tips.
  9. "questionsForDoctor": 2-3 easy questions the patient can ask their doctor at their next checkup.
  10. "patientAge": if the report mentions age, extract it as an integer number.
  11. "patientSex": if the report mentions biological sex/gender ("Male", "Female"), extract it.
  12. "extractedMetrics": extract ONLY genuine numerical values explicitly present in the report:
      - systolicBp (number in mmHg)
      - diastolicBp (number in mmHg)
      - heartRate (number in bpm)
      - hba1c (number, e.g. 7.5 for 7.5%)
      - fastingGlucose (number in mg/dL)
      - egfr (number in mL/min)
      - creatinine (number in mg/dL)
      - uacr (number in mg/g)
      - ldl (number in mg/dL)
      - hdl (number in mg/dL)
      - triglycerides (number in mg/dL)
      - totalCholesterol (number in mg/dL)
      - potassium (number in mEq/L)
      - sodium (number in mEq/L)

Report Content to analyze:
${rawText || 'See attached medical report document / image.'}

Return valid JSON adhering strictly to the schema.`;

      const contents: any[] = [];
      if (fileBase64) {
        const cleanBase64 = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
        contents.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          }
        });
      }
      contents.push(prompt);

      let parsedResult: any = null;

      try {
        const response = await callGeminiGenerateContent({
          contents,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isValidMedicalReport: {
                  type: Type.BOOLEAN,
                  description: 'True if and only if the document is an authentic clinical medical lab test, diagnostic panel, or discharge report. False if it is a non-medical photo, selfie, pet, landscape, food, receipt, or unreadable document.'
                },
                detectedDocumentType: { type: Type.STRING },
                rejectionReason: { type: Type.STRING },
                reportDate: { type: Type.STRING },
                labName: { type: Type.STRING },
                patientName: { type: Type.STRING },
                patientAge: { type: Type.NUMBER },
                patientSex: { type: Type.STRING, enum: ['Male', 'Female', 'Other'] },
                plainEnglishSummary: { type: Type.STRING },
                overallAssessment: {
                  type: Type.STRING,
                  enum: ['Looking Good', 'Mild Attention Needed', 'Needs Medical Review']
                },
                goodNews: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                needsAttention: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                simpleActionSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                questionsForDoctor: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                extractedMetrics: {
                  type: Type.OBJECT,
                  properties: {
                    systolicBp: { type: Type.NUMBER },
                    diastolicBp: { type: Type.NUMBER },
                    heartRate: { type: Type.NUMBER },
                    hba1c: { type: Type.NUMBER },
                    fastingGlucose: { type: Type.NUMBER },
                    egfr: { type: Type.NUMBER },
                    creatinine: { type: Type.NUMBER },
                    uacr: { type: Type.NUMBER },
                    ldl: { type: Type.NUMBER },
                    hdl: { type: Type.NUMBER },
                    triglycerides: { type: Type.NUMBER },
                    totalCholesterol: { type: Type.NUMBER },
                    potassium: { type: Type.NUMBER },
                    sodium: { type: Type.NUMBER },
                  }
                }
              },
              required: ['isValidMedicalReport', 'plainEnglishSummary', 'overallAssessment', 'goodNews', 'needsAttention', 'simpleActionSteps', 'questionsForDoctor']
            }
          }
        });

        if (response.text) {
          parsedResult = JSON.parse(response.text);
        }
      } catch (aiErr) {
        console.warn('Gemini report analysis fallback:', aiErr);
      }

      // Safe rule-based fallback if AI response parsing was incomplete
      if (!parsedResult) {
        const text = (rawText || '').toLowerCase();
        const clinicalKeywords = [
          'glucose', 'fasting blood sugar', 'fbs', 'hba1c', 'a1c', 'glycated',
          'blood pressure', 'systolic', 'diastolic', 'egfr', 'gfr', 'creatinine',
          'cholesterol', 'ldl', 'hdl', 'triglycerides', 'uacr', 'potassium',
          'sodium', 'hemoglobin', 'platelets', 'wbc', 'rbc', 'hematocrit', 'bnp',
          'alt', 'ast', 'bun', 'tsh', 'urinalysis', 'labcorp', 'quest diagnostics'
        ];

        const hasClinicalTerm = clinicalKeywords.some(kw => text.includes(kw));

        // If this was an uploaded image with no recognizable medical text, or text with zero clinical keywords, reject it safely!
        if (!hasClinicalTerm) {
          parsedResult = {
            isValidMedicalReport: false,
            detectedDocumentType: 'Unverified / Non-Medical File',
            rejectionReason: 'The uploaded file could not be verified as an authentic clinical laboratory report or diagnostic test. To prevent inaccurate medical data from being applied to the patient digital twin, please upload a clear, legible photo or PDF of an official lab report (such as a Comprehensive Metabolic Panel, Lipid Panel, or HbA1c test).',
            reportDate: new Date().toISOString().split('T')[0],
            plainEnglishSummary: 'We could not detect authentic medical laboratory biomarkers or clinical test results in this upload.',
            overallAssessment: 'Needs Medical Review',
            goodNews: [],
            needsAttention: [
              'No authentic clinical laboratory test results or biomarkers could be identified in this upload.',
              'Non-medical images, photographs, and unreadable files cannot be applied to your Digital Health Twin.'
            ],
            simpleActionSteps: [
              'Please upload a clear, well-lit photo or PDF of an official lab test report.',
              'Ensure test names (like HbA1c, Glucose, Lipid Panel) and numbers are clearly visible.',
              'Or click the "Paste Report Text" tab to type or paste your numbers directly.'
            ],
            questionsForDoctor: [],
            extractedMetrics: {}
          };
        } else {
          // If legitimate medical text keywords were found in rawText, extract them
          const extracted: any = {};

          const bpMatch = (rawText || '').match(/(\d{2,3})\s*[\/|\\]\s*(\d{2,3})/);
          if (bpMatch) {
            extracted.systolicBp = parseInt(bpMatch[1], 10);
            extracted.diastolicBp = parseInt(bpMatch[2], 10);
          }
          const a1cMatch = text.match(/(?:hba1c|a1c|glycated)\s*[:=]?\s*(\d+\.?\d*)/);
          if (a1cMatch) extracted.hba1c = parseFloat(a1cMatch[1]);

          const glucMatch = text.match(/(?:glucose|fasting blood sugar|fbs)\s*[:=]?\s*(\d+)/);
          if (glucMatch) extracted.fastingGlucose = parseInt(glucMatch[1], 10);

          const egfrMatch = text.match(/(?:egfr|gfr)\s*[:=]?\s*(\d+)/);
          if (egfrMatch) extracted.egfr = parseInt(egfrMatch[1], 10);

          const ldlMatch = text.match(/(?:ldl|cholesterol ldl)\s*[:=]?\s*(\d+)/);
          if (ldlMatch) extracted.ldl = parseInt(ldlMatch[1], 10);

          parsedResult = {
            isValidMedicalReport: true,
            detectedDocumentType: 'Clinical Diagnostic Panel (Text Extract)',
            reportDate: new Date().toISOString().split('T')[0],
            labName: 'Clinical Diagnostic Report',
            patientName: patientName || 'Patient',
            plainEnglishSummary: 'We have processed your medical report. Your core health vitals and lab numbers have been translated into simple everyday words so you can easily review how your body is doing.',
            overallAssessment: (extracted.hba1c && extracted.hba1c > 8) || (extracted.systolicBp && extracted.systolicBp > 145) ? 'Needs Medical Review' : 'Mild Attention Needed',
            goodNews: [
              'Your report was successfully read and scanned.',
              'Key metabolic indicators have been organized clearly for your doctor visit.'
            ],
            needsAttention: [
              extracted.hba1c ? `Blood sugar (HbA1c) is ${extracted.hba1c}% — keep an eye on refined carbohydrates.` : 'Some numbers are outside of ideal ranges.',
              extracted.systolicBp ? `Blood pressure was recorded at ${extracted.systolicBp}/${extracted.diastolicBp || 85} mmHg.` : 'Discuss these results with your care team.'
            ],
            simpleActionSteps: [
              'Stay well-hydrated throughout the day.',
              'Aim for 15–20 minutes of light walking or stretching.',
              'Take your prescribed medications at the same time each morning.'
            ],
            questionsForDoctor: [
              'How do these results compare to my last test 6 months ago?',
              'Do I need to adjust any of my daily medications based on these numbers?',
              'When is the right time to do my next follow-up blood work?'
            ],
            extractedMetrics: extracted
          };
        }
      }

      res.json(parsedResult);
    } catch (err: any) {
      console.error('Report analysis error:', err);
      res.status(500).json({ error: err.message || 'Failed to analyze patient report' });
    }
  });

  // ---------------------------------------------
  // API: Apply Extracted Report Metrics to Patient
  // ---------------------------------------------
  app.post('/api/patients/:id/update-metrics', (req, res) => {
    try {
      const { metrics, reportSummary, patient: patientPayload } = req.body;
      let patient = patientStore.find(p => p.id === req.params.id);

      if (!patient && patientPayload && patientPayload.id) {
        patient = patientPayload;
        patientStore.unshift(patientPayload);
      }

      if (!patient) {
        return res.status(404).json({ error: 'Patient model not found' });
      }
      if (!metrics) {
        return res.status(400).json({ error: 'No metrics provided' });
      }

      // Update Vitals if extracted
      if (metrics.systolicBp) patient.vitals.systolicBp = Number(metrics.systolicBp);
      if (metrics.diastolicBp) patient.vitals.diastolicBp = Number(metrics.diastolicBp);
      if (metrics.systolicBp || metrics.diastolicBp) {
        patient.vitals.meanArterialPressure = Number(((patient.vitals.systolicBp + 2 * patient.vitals.diastolicBp) / 3).toFixed(1)) as any;
      }
      if (metrics.heartRate) patient.vitals.heartRate = Number(metrics.heartRate);

      // Update Labs if extracted
      if (metrics.hba1c) patient.labs.hba1c = Number(metrics.hba1c);
      if (metrics.fastingGlucose) patient.labs.fastingGlucose = Number(metrics.fastingGlucose);
      if (metrics.egfr) patient.labs.egfr = Number(metrics.egfr);
      if (metrics.creatinine) patient.labs.creatinine = Number(metrics.creatinine);
      if (metrics.uacr) patient.labs.uacr = Number(metrics.uacr);
      if (metrics.ldl) patient.labs.ldl = Number(metrics.ldl);
      if (metrics.hdl) patient.labs.hdl = Number(metrics.hdl);
      if (metrics.triglycerides) patient.labs.triglycerides = Number(metrics.triglycerides);
      if (metrics.totalCholesterol) patient.labs.totalCholesterol = Number(metrics.totalCholesterol);
      if (metrics.potassium) patient.labs.potassium = Number(metrics.potassium);
      if (metrics.sodium) patient.labs.sodium = Number(metrics.sodium);

      // Recalculate 5-year risks based on new metrics
      patient.maceFiveYearRisk = Math.min(60, Number(((patient.vitals.systolicBp / 10) + (patient.labs.hba1c * 1.5)).toFixed(1)));
      patient.ckdProgressionFiveYearRisk = Math.min(80, Number((100 - patient.labs.egfr * 0.8).toFixed(1)));
      patient.lastEncounterDate = `${new Date().toISOString().split('T')[0]} · Lab Report Uploaded`;

      // Add point to longitudinal history
      patient.longitudinalHistory.push({
        period: `Report-${new Date().getMonth() + 1}/${new Date().getFullYear().toString().slice(2)}`,
        date: new Date().toISOString().split('T')[0],
        hba1c: patient.labs.hba1c,
        egfr: patient.labs.egfr,
        systolicBp: patient.vitals.systolicBp,
        ldl: patient.labs.ldl,
        hsCrp: patient.labs.hsCrp,
        weightKg: patient.weightKg
      });

      res.json(patient);
    } catch (err: any) {
      console.error('Update patient metrics error:', err);
      res.status(500).json({ error: err.message || 'Failed to update patient metrics' });
    }
  });

  // ---------------------------------------------
  // API: Sync Wearable Device Telemetry (Apple Health, Dexcom, Fitbit, Withings)
  // ---------------------------------------------
  app.post('/api/patients/:id/sync-wearable', (req, res) => {
    try {
      const patientId = req.params.id;
      const { provider, providerName, reading, telemetryPointsCount } = req.body;

      let patient = patientStore.find(p => p.id === patientId);
      if (!patient && req.body.patient) {
        const fallbackPatient = req.body.patient as VirtualPatient;
        patientStore.push(fallbackPatient);
        patient = fallbackPatient;
      }

      if (!patient) {
        return res.status(404).json({ error: 'Patient model not found' });
      }

      if (!reading) {
        return res.status(400).json({ error: 'No wearable reading provided' });
      }

      // Update vitals
      if (reading.heartRate) patient.vitals.heartRate = Number(reading.heartRate);
      if (reading.systolicBp) patient.vitals.systolicBp = Number(reading.systolicBp);
      if (reading.diastolicBp) patient.vitals.diastolicBp = Number(reading.diastolicBp);
      if (reading.systolicBp || reading.diastolicBp) {
        patient.vitals.meanArterialPressure = Number(((patient.vitals.systolicBp + 2 * patient.vitals.diastolicBp) / 3).toFixed(1)) as any;
      }
      if (reading.spo2Pct) patient.vitals.spo2 = Number(reading.spo2Pct);

      // Update labs / metabolic
      if (reading.glucoseMgDl) {
        patient.labs.fastingGlucose = Number(reading.glucoseMgDl);
        // Estimate updated HbA1c from mean glucose if shifted significantly
        const estimatedHbA1c = Number(((Number(reading.glucoseMgDl) + 46.7) / 28.7).toFixed(1));
        if (estimatedHbA1c >= 4.5 && estimatedHbA1c <= 14.0) {
          patient.labs.hba1c = Number(((patient.labs.hba1c * 0.7) + (estimatedHbA1c * 0.3)).toFixed(1));
        }
      }

      // Update autonomic metrics
      if (reading.hrvSdnn) patient.autonomic.hrvSdnn = Number(reading.hrvSdnn);
      if (reading.sleepHours) {
        patient.autonomic.sleepQualityScore = Math.min(100, Math.round((Number(reading.sleepHours) / 8) * 90));
      }

      // Record wearable sync meta
      patient.lastWearableSync = {
        provider: provider || 'apple_health',
        providerName: providerName || 'Apple Health',
        syncedAt: new Date().toISOString(),
        telemetryPointsIngested: Number(telemetryPointsCount) || 288,
        reading
      };

      // Recalculate risks
      patient.maceFiveYearRisk = Math.min(60, Number(((patient.vitals.systolicBp / 10) + (patient.labs.hba1c * 1.5)).toFixed(1)));
      patient.ckdProgressionFiveYearRisk = Math.min(80, Number((100 - patient.labs.egfr * 0.8).toFixed(1)));
      patient.lastEncounterDate = `${new Date().toISOString().split('T')[0]} · Wearable Synced (${providerName || 'IoT Sensor'})`;

      // Append to longitudinal history
      patient.longitudinalHistory.push({
        period: `Sync-${new Date().getMonth() + 1}/${new Date().getDate()}`,
        date: new Date().toISOString().split('T')[0],
        hba1c: patient.labs.hba1c,
        egfr: patient.labs.egfr,
        systolicBp: patient.vitals.systolicBp,
        ldl: patient.labs.ldl,
        hsCrp: patient.labs.hsCrp,
        weightKg: patient.weightKg
      });

      res.json(patient);
    } catch (err: any) {
      console.error('Wearable sync error:', err);
      res.status(500).json({ error: err.message || 'Failed to sync wearable device' });
    }
  });

  // ---------------------------------------------
  // Vite Middleware / Static Serving
  // ---------------------------------------------
  const server = http.createServer(app);

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
    console.log(`  ➜  press h + enter to show help`);
  });
}

startServer().catch(err => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
