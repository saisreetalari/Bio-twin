# Virtual Patient Model & In-Silico Predictive Care Twin

A high-fidelity clinical digital twin platform and patient health portal designed to bridge complex physiological simulation with everyday health literacy. The platform combines multi-organ computational models, live hemodynamics, in-silico pharmacodynamic simulations, and plain-English patient education.

---

## 📋 Table of Contents
- [What is a Virtual Patient Model?](#what-is-a-virtual-patient-model)
- [Dual-Portal Architecture](#dual-portal-architecture)
  - [1. Patient Health Portal (Plain English)](#1-patient-health-portal-plain-english)
  - [2. Doctor & Clinical Portal (Physiological Engine)](#2-doctor--clinical-portal-physiological-engine)
- [Key Features](#key-features)
  - [Multi-Organ Digital Twin Simulation](#multi-organ-digital-twin-simulation)
  - [In-Silico Pharmacodynamic Simulator](#in-silico-predictive-care-simulator)
  - [Laboratory Report Interpreter](#laboratory-report-interpreter)
  - [Longitudinal Progress & Telemetry](#longitudinal-progress--telemetry)
  - [Printable Doctor Visit Sheet](#printable-doctor-visit-sheet)
- [Clinical Guidelines & Reference Standards](#clinical-guidelines--reference-standards)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Data Privacy & Safety Boundaries](#data-privacy--safety-boundaries)

---

## 🧬 What is a Virtual Patient Model?

A **Virtual Patient Model** (or **Clinical Digital Twin**) is an in-silico computational representation of an individual's personal biology calibrated using real-world laboratory markers (HbA1c, eGFR, creatinine, lipid panels), hemodynamic telemetry (blood pressure, pulse wave, cardiac output), and medical history.

### Who is it Useful For?
- **For Clinicians & Cardiometabolic Specialists**: Provides a risk-free digital sandbox to test drug interventions (such as adding SGLT2 inhibitors, adjusting GLP-1 RAs, or titrating ACEi/ARBs) before writing prescriptions, predicting multi-year disease trajectory and major adverse cardiovascular events (MACE).
- **For Patients & Caregivers**: Translates convoluted diagnostic reports and numeric lab values into plain everyday language, actionable daily habits, and clear appointment questions.
- **For Researchers & Educators**: Demonstrates inter-organ crosstalk—such as the cardiorenal-metabolic axis—showing how glycemic control directly influences renal microvasculature and systemic vascular resistance (SVR).

---

## 🏛️ Dual-Portal Architecture

The application enforces a strict separation of concerns between patient-facing health literacy and clinician-grade physiological tools:

### 1. Patient Health Portal (Plain English)
- **Strict Data Isolation**: Confined exclusively to the logged-in patient's confidential health record. Profile switchers, search bars, and other patients' records are inaccessible.
- **Everyday Language**: Eliminates intimidating medical jargon. Instead of *"inhibiting renin-angiotensin vasoconstriction"*, it explains that medication *"relaxes tight blood vessels to ease strain on your heart and shield your kidney filters."*
- **Personal Home Vitals Logger**: Allows patients to log daily morning blood pressure, fasting glucose, resting heart rate, and weight directly to their record.
- **Progress Across Checkups**: Simple tabular encounter history showing how HbA1c, blood pressure, and kidney eGFR have evolved over past visits.
- **Appointment Preparation**: Generates personalized discussion points based on current lab tests and includes a one-click **Print / Save Doctor Visit Sheet** formatted for clinical consultations.

### 2. Doctor & Clinical Portal (Physiological Engine)
- **Multi-Patient Clinical Roster**: Clinicians can switch between diverse clinical profiles across the risk spectrum (e.g., Eleanor Vance with early cardiorenal syndrome, Marcus Brody with uncontrolled hypertension, Clara Jenkins with advanced CKD Stage 4, David Chen with acute heart failure).
- **Continuous Bedside Telemetry**: Real-time simulated arterial pressure waveforms, heart rate, pulse oximetry (SpO2), cardiac output, systemic vascular resistance (SVR), and cardiac index (CI).
- **ICD-10 Diagnostic Staging**: Formal clinical problem list, staging criteria, and risk scores (KDIGO heatmaps, Framingham 10-year CVD risk, KDQOL indices).
- **New Case Intake**: Comprehensive patient registration modal supporting custom baseline labs, hemodynamics, and pharmacotherapy rosters.

---

## 🚀 Key Features

### Multi-Organ Digital Twin Simulation
Simulates continuous physiology across five interconnected systems:
1. **Cardiovascular**: Ventricular ejection fraction, mean arterial pressure (MAP), stroke volume, and systemic vascular resistance.
2. **Renal & Glomerular**: eGFR (CKD-EPI 2021 formula), serum creatinine, urine albumin-to-creatinine ratio (UACR), and tubular hyperfiltration states.
3. **Metabolic & Endocrine**: 3-month glycated hemoglobin (HbA1c), fasting plasma glucose, insulin resistance indices, and hepatic gluconeogenesis.
4. **Vascular & Lipids**: Atherosclerotic plaque burden, LDL cholesterol, non-HDL fractions, and pulse pressure.
5. **Pulmonary**: Oxygen saturation (SpO2), respiratory rate, and pulmonary capillary wedge pressure estimates.

### In-Silico Predictive Care Simulator
Allows clinicians to configure pharmacological regimens and lifestyle adherence:
- **Medication Titration**: Test combinations of SGLT2 inhibitors (Empagliflozin/Dapagliflozin), GLP-1 receptor agonists (Semaglutide), ACE inhibitors / ARBs, and statins.
- **Trajectory Forecasting**: Projects 1-year, 3-year, and 5-year trajectories for renal filtration preservation (eGFR decline rate in mL/min/year) and glycemic stabilization.
- **MACE Risk Reduction**: Computes projected percentage reduction in 5-year cardiovascular and renal endpoints based on clinical trial effect sizes (EMPA-REG, DAPA-CKD, FIDELIO-DKD).

### Laboratory Report Interpreter
- **Document & Image Analysis**: Patients or doctors can upload lab panels (photos, PDFs) or paste raw text.
- **Dual Translation**:
  - *Patient View*: Explains every flagged marker with calm, actionable guidance and reassurance.
  - *Clinical View*: Extracts precise numeric values and auto-calibrates the virtual patient's digital twin model.

### Longitudinal Progress & Telemetry
- Integrates continuous glucose monitoring (CGM) time-in-range metrics (70–180 mg/dL target), ambulatory blood pressure profiles, nocturnal dip status, and step count trends.

### Printable Doctor Visit Sheet
- Formatted via clean `@media print` CSS rules, allowing patients to produce a concise 1-page physical handout summarizing their vital trends, current medications, and prioritized questions for their care team.

---

## 📚 Clinical Guidelines & Reference Standards

The computational rules and clinical targets in this model align with major consensus guidelines:
- **ADA Standards of Care (2026)**: Glycemic management targets (HbA1c < 7.0% for most non-pregnant adults; personalized targets for older adults).
- **KDIGO Clinical Practice Guideline (2024)**: Evaluation and management of Chronic Kidney Disease, cardiorenal protection thresholds, and UACR stratification.
- **ACC/AHA/HFSA Guideline (2025)**: Guideline-Directed Medical Therapy (GDMT) for heart failure and stage-specific blood pressure targets (< 130/80 mmHg).
- **CKD-EPI Equation (2021)**: Race-free calculation of estimated glomerular filtration rate.

---

## 🛠️ Tech Stack

- **Framework**: React 19 (TypeScript)
- **Bundler & Tooling**: Vite, TypeScript 5.8
- **Styling**: Tailwind CSS, CSS print media modules
- **Icons**: Lucide React
- **Simulation**: Custom deterministic deterministic mathematical models calibrated to clinical trial response distributions.

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Clone or open the project directory
cd virtual-patient-twin

# Install dependencies
npm install

# Run the local development server
npm run dev
```

The application runs on `http://localhost:3000`.

### Building for Production
```bash
# Type check and build bundle
npm run build

# Preview production build
npm run preview
```

---

## 🔒 Data Privacy & Safety Boundaries

- **Single-Patient Scoping**: The Patient Portal does not cache or expose records from other individuals in the database.
- **Educational Notice**: Explicit disclaimers remind users that in-silico models are educational and clinical decision-support tools that do not replace direct medical advice from a licensed physician.
- **No Unsolicited AI Artifacts**: Clean, human-centered UI without floating chatbots or ungrounded generative content.
