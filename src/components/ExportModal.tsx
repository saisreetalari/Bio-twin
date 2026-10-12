import React, { useState } from 'react';
import { VirtualPatient } from '../types/patient';
import { X, Download, Copy, Check, FileJson, FileText } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: VirtualPatient;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, patient }) => {
  const [format, setFormat] = useState<'fhir' | 'soap'>('fhir');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Realistic HL7 FHIR R4 Bundle Representation
  const fhirBundle = {
    resourceType: 'Bundle',
    type: 'collection',
    id: `bundle-${patient.id.toLowerCase()}`,
    timestamp: new Date().toISOString(),
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: patient.id,
          identifier: [
            { system: 'urn:oid:hospital-mrn', value: patient.mrn },
            { system: 'urn:oid:virtual-twin', value: patient.twinId },
          ],
          name: [{ text: patient.fullName || 'Patient' }],
          gender: (patient.sex || 'other').toLowerCase(),
          birthDate: `${2026 - (patient.age || 45)}-04-18`,
          generalPractitioner: [{ display: patient.attendingPhysician }],
          extension: [
            { url: 'http://hl7.org/fhir/StructureDefinition/patient-ethnicity', valueString: patient.ethnicity },
            { url: 'http://hl7.org/fhir/StructureDefinition/patient-phenotype', valueString: patient.phenotypeClassification },
          ],
        },
      },
      ...patient.primaryDiagnoses.map((diag, i) => ({
        resource: {
          resourceType: 'Condition',
          id: `cond-${i + 1}`,
          subject: { reference: `Patient/${patient.id}` },
          code: { text: diag },
          clinicalStatus: { coding: [{ code: 'active' }] },
        },
      })),
      {
        resource: {
          resourceType: 'Observation',
          id: 'obs-vitals-panel',
          status: 'final',
          code: { text: 'Vital Signs Comprehensive Panel' },
          subject: { reference: `Patient/${patient.id}` },
          component: [
            { code: { text: 'Systolic Blood Pressure' }, valueQuantity: { value: patient.vitals.systolicBp, unit: 'mmHg' } },
            { code: { text: 'Diastolic Blood Pressure' }, valueQuantity: { value: patient.vitals.diastolicBp, unit: 'mmHg' } },
            { code: { text: 'Heart Rate' }, valueQuantity: { value: patient.vitals.heartRate, unit: 'beats/minute' } },
            { code: { text: 'Ejection Fraction' }, valueQuantity: { value: patient.vitals.ejectionFraction, unit: '%' } },
          ],
        },
      },
      {
        resource: {
          resourceType: 'Observation',
          id: 'obs-labs-panel',
          status: 'final',
          code: { text: 'Cardiorenal & Metabolic Laboratory Panel' },
          subject: { reference: `Patient/${patient.id}` },
          component: [
            { code: { text: 'Hemoglobin A1c' }, valueQuantity: { value: patient.labs.hba1c, unit: '%' } },
            { code: { text: 'eGFR CKD-EPI' }, valueQuantity: { value: patient.labs.egfr, unit: 'mL/min/1.73m2' } },
            { code: { text: 'Urine Albumin/Creatinine Ratio' }, valueQuantity: { value: patient.labs.uacr, unit: 'mg/g' } },
            { code: { text: 'LDL Cholesterol' }, valueQuantity: { value: patient.labs.ldl, unit: 'mg/dL' } },
            { code: { text: 'High Sensitivity CRP' }, valueQuantity: { value: patient.labs.hsCrp, unit: 'mg/L' } },
          ],
        },
      },
      ...patient.medications.map((med) => ({
        resource: {
          resourceType: 'MedicationStatement',
          id: med.id,
          status: 'active',
          medicationCodeableConcept: { text: `${med.name} ${med.dosage}` },
          dosage: [{ text: `${med.dosage} ${med.frequency}` }],
          subject: { reference: `Patient/${patient.id}` },
        },
      })),
    ],
  };

  // Structured SOAP Clinical Note
  const soapNote = `HOSPITAL CLINICAL DOSSIER & IN-SILICO CARE SUMMARY
=====================================================
PATIENT: ${patient.fullName} | MRN: ${patient.mrn} | TWIN: ${patient.twinId}
DOB / AGE: 04/18/${2026 - patient.age} (${patient.age}y) | SEX: ${patient.sex}
ATTENDING: ${patient.attendingPhysician}
CLINIC: ${patient.department}
DATE OF ENCOUNTER: ${patient.lastEncounterDate}
ALLERGIES: ${patient.allergies.join(', ')}

1. SUBJECTIVE:
Patient reviewed for comprehensive cardiorenal and metabolic risk profiling.
Active diagnoses: ${patient.primaryDiagnoses.join('; ')}.
Comorbidities: ${patient.comorbidities.join('; ')}.
Reported lifestyle: Sodium intake ~${patient.lifestyle.dietarySodiumMg} mg/day, aerobic activity ${patient.lifestyle.weeklyCardioMinutes} min/wk, smoking status ${patient.lifestyle.smokingStatus}.

2. OBJECTIVE:
- Hemodynamics: BP ${patient.vitals.systolicBp}/${patient.vitals.diastolicBp} mmHg, HR ${patient.vitals.heartRate} bpm, MAP ${patient.vitals.meanArterialPressure} mmHg.
- Echocardiography: LVEF ${patient.vitals.ejectionFraction}%, Cardiac Output ${patient.vitals.cardiacOutput} L/min.
- Metabolic & Renal: HbA1c ${patient.labs.hba1c}%, Fasting Glucose ${patient.labs.fastingGlucose} mg/dL, eGFR ${patient.labs.egfr} mL/min/1.73m², Serum Creatinine ${patient.labs.creatinine} mg/dL, UACR ${patient.labs.uacr} mg/g.
- Lipid & Inflammatory: LDL ${patient.labs.ldl} mg/dL, HDL ${patient.labs.hdl} mg/dL, Triglycerides ${patient.labs.triglycerides} mg/dL, hs-CRP ${patient.labs.hsCrp} mg/L.
- Active Medications:
${patient.medications.map(m => `  • ${m.name} ${m.dosage} (${m.frequency}) - Indication: ${m.indication} [Adherence: ${m.adherenceRate}%]`).join('\n')}

3. ASSESSMENT & IN-SILICO RISK STRATIFICATION:
- Phenotype: ${patient.phenotypeClassification}
- 5-Year MACE / ASCVD Risk: ${patient.maceFiveYearRisk}%
- 5-Year CKD Progression (Stage 4/5): ${patient.ckdProgressionFiveYearRisk}%
- 1-Year Acute Decompensation / Hospitalization: ${patient.hospitalizationOneYearRisk}%
- Pharmacogenomics: ${patient.genomics.map(g => `${g.gene} (${g.variant}) -> ${g.clinicalSignificance}`).join('; ')}

4. PLAN:
- GDMT Optimization: Consider escalation with SGLT2 inhibitor (Empagliflozin 10mg) and/or GLP-1 RA for cardiorenal protection and glycemic control.
- Dietary counseling: Target sodium reduction to <2000 mg/day (DASH corridor).
- Surveillance: Repeat BMP, eGFR, and electrolytes in 3-4 weeks post-initiation.
`;

  const exportText = format === 'fhir' ? JSON.stringify(fhirBundle, null, 2) : soapNote;

  const handleCopy = () => {
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename =
      format === 'fhir'
        ? `FHIR_R4_Bundle_${patient.id}.json`
        : `Clinical_SOAP_Dossier_${patient.id}.txt`;
    const mimeType = format === 'fhir' ? 'application/json' : 'text/plain';
    const blob = new Blob([exportText], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Export Clinical Patient Model Dossier</h3>
              <div className="text-[11px] text-slate-400">
                {patient.fullName} ({patient.mrn}) · EMR Interoperability Export
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFormat('fhir')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors cursor-pointer font-medium ${
                format === 'fhir'
                  ? 'bg-teal-950 border border-teal-700 text-teal-200'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>HL7 FHIR R4 Bundle (JSON)</span>
            </button>

            <button
              onClick={() => setFormat('soap')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors cursor-pointer font-medium ${
                format === 'soap'
                  ? 'bg-teal-950 border border-teal-700 text-teal-200'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Attending Clinical SOAP Dossier</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-6 overflow-y-auto bg-slate-950 flex-1">
          <pre className="text-[11px] font-mono text-slate-300 whitespace-pre leading-relaxed overflow-x-auto select-all">
            {exportText}
          </pre>
        </div>
      </div>
    </div>
  );
};
