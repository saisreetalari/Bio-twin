import React, { useState, useEffect } from 'react';
import { VirtualPatient, AIClinicalInsight } from '../types/patient';
import {
  Stethoscope,
  RefreshCw,
  Send,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Dna,
  FileText,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface AIInsightsViewProps {
  patient: VirtualPatient;
  onOpenSimulator: () => void;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({ patient, onOpenSimulator }) => {
  const [insight, setInsight] = useState<AIClinicalInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Physician Inquiry State
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [qnaHistory, setQnaHistory] = useState<{ q: string; a: string; time: string }[]>([]);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/insights/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient.id, patient }),
      });
      if (!res.ok) throw new Error('Failed to generate clinical decision support insights');
      const data = await res.json();
      setInsight(data);
    } catch (err: any) {
      setError(err.message || 'Error communicating with clinical decision support server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    setQnaHistory([]);
  }, [patient.id]);

  const handleAskQuestion = async (customQ?: string) => {
    const qToSend = customQ || question;
    if (!qToSend.trim()) return;

    setAsking(true);
    try {
      const res = await fetch('/api/insights/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient.id, question: qToSend, patient }),
      });
      const data = await res.json();
      setQnaHistory((prev) => [
        {
          q: qToSend,
          a: data.answer || 'No response generated.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
      if (!customQ) setQuestion('');
    } catch (err) {
      console.error(err);
    } finally {
      setAsking(false);
    }
  };

  const presetClinicalQueries = [
    `Evaluate SGLT2 inhibitor (Empagliflozin 10mg) initiation safety given eGFR ${patient.labs.egfr} mL/min and K+ ${patient.labs.potassium} mEq/L.`,
    `Assess pharmacogenomic interaction risks between current medications and candidate lipid-lowering therapies based on genetic variants.`,
    `What are the projected cardiorenal consequences if patient medication adherence slips below 65%?`,
    `Review ACC/AHA and KDIGO GDMT alignment for persistent microalbuminuria (UACR ${patient.labs.uacr} mg/g).`
  ];

  return (
    <div className="space-y-6">
      {/* Top Clinical Decision Support Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-300">Clinical Decision Support</span>
              <span className="text-slate-600">·</span>
              <span className="text-teal-400 font-medium">Class 1A Guidelines Consensus</span>
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              Diagnostic Synthesis for {patient.fullName} ({patient.mrn})
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-700 hover:border-slate-500 rounded-md text-xs text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
            <span>{loading ? 'Re-Evaluating...' : 'Refresh Clinical Synthesis'}</span>
          </button>

          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-md text-xs transition-colors cursor-pointer shadow-sm"
          >
            <span>Open Care Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Critical Clinical AI Safety Notice Banner */}
      <div className="p-3.5 bg-amber-950/40 border border-amber-800/80 rounded-xl flex items-start gap-3 text-xs text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-amber-300 font-bold">Clinical Safety Notice: </strong>
          AI insights and predictive summaries are generated via computational intelligence models and are <strong>not 100% correct; AI may make mistakes</strong>.
          This system is intended for in-silico simulation, clinical decision support research, and care planning analysis only. All outputs must be verified with certified physician judgment and official clinical laboratory testing prior to any medical decision or prescription.
        </div>
      </div>

      {loading && !insight && (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <RefreshCw className="w-7 h-7 text-teal-400 animate-spin mx-auto mb-3" />
          <div className="text-sm font-semibold text-white">Synthesizing Clinical Pathophysiology...</div>
          <div className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Cross-referencing cardiorenal hemodynamics, metabolic biomarkers, and guideline-directed indications.
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-200 text-xs">
          {error}
        </div>
      )}

      {insight && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Clinical Assessment & Pathophysiology (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Executive Clinical Assessment Note */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-mono uppercase text-slate-300 font-bold">
                    ATTENDING CLINICAL SYNTHESIS & IMPRESSION
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Timestamp: {new Date(insight.generatedAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
                {insight.executiveSummary}
              </p>
            </div>

            {/* Pathophysiological Inter-Organ Stress Cascades */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
                  INTER-ORGAN PATHOPHYSIOLOGICAL MECHANISMS & CASCADE
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {insight.pathophysiologicalMechanisms.length} Identified Active Cascades
                </span>
              </div>

              <div className="space-y-3">
                {insight.pathophysiologicalMechanisms.map((mech, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-400" />
                        <span>{mech.organSystem}</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-medium ${
                          mech.severity === 'critical'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : mech.severity === 'high'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-teal-950 text-teal-300 border-teal-800'
                        }`}
                      >
                        {mech.severity} severity
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-slate-400 font-normal">Molecular / Biomechanical Cascade: </strong>
                      {mech.cascade}
                    </div>

                    <div className="mt-2 text-xs text-slate-300 border-t border-slate-800/80 pt-2 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-amber-400 font-semibold">Clinical Outcome Risk: </strong>
                        {mech.clinicalRisk}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In-Silico Counterfactual Scenario Forecasts */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs font-mono uppercase text-slate-400 font-semibold mb-3">
                COUNTERFACTUAL CLINICAL TRAJECTORY SCENARIOS
              </div>
              <p className="text-xs text-slate-400 mb-4">
                In-silico projection of natural history drift under non-compliance or physiological disturbance:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {insight.criticalCounterfactuals.map((cf, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{cf.scenario}</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-300 leading-relaxed">
                        <strong className="text-slate-400 font-normal">Projected Drift: </strong>
                        {cf.projectedEffect}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-xs text-teal-300">
                      <strong className="text-slate-400 font-normal">Mitigation Directive: </strong>
                      {cf.mitigationStrategy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Physician Clinical Decision Support & Pharmacogenomics (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Physician Decision Support Inquiry Console */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                <span>CLINICAL DECISION SUPPORT INQUIRY</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Query the patient's cardiorenal model for evidence-based clinical reasoning:
              </p>

              <div className="space-y-2.5">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter clinical question regarding medication choice, dosing, or risk..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none font-sans"
                />

                <button
                  onClick={() => handleAskQuestion()}
                  disabled={asking || !question.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {asking ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating Clinical Evidence...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Clinical Inquiry</span>
                    </>
                  )}
                </button>
                <div className="text-[10px] text-slate-400 font-mono text-center mt-1.5">
                  AI may make mistakes. Always cross-reference with physician judgment.
                </div>
              </div>

              {/* Sample Physician Questions */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase mb-2 font-semibold">
                  PRESET CLINICAL CONSULTATIONS
                </div>
                <div className="space-y-1.5">
                  {presetClinicalQueries.map((pq, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskQuestion(pq)}
                      className="w-full text-left p-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors cursor-pointer truncate"
                      title={pq}
                    >
                      {pq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consult Responses History */}
              {qnaHistory.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-3 max-h-72 overflow-y-auto">
                  {qnaHistory.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                      <div className="font-semibold text-teal-300 mb-1">
                        Inquiry: {item.q}
                      </div>
                      <div className="text-slate-200 text-xs leading-relaxed whitespace-pre-line bg-slate-900 p-2.5 rounded border border-slate-800/80">
                        {item.a}
                      </div>
                      <div className="mt-1 text-[10px] font-mono text-slate-500 text-right">
                        {item.time}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pharmacogenomics & CPIC Guidelines */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs font-mono uppercase text-slate-400 font-semibold mb-3 flex items-center gap-2">
                <Dna className="w-3.5 h-3.5 text-teal-400" />
                <span>PHARMACOGENOMICS & CPIC LEVEL EVIDENCE</span>
              </div>

              <div className="space-y-2">
                {patient.genomics.map((g) => (
                  <div key={g.gene} className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span className="font-mono text-teal-300">{g.gene}</span>
                      <span className="text-[10px] font-mono text-slate-400">{g.variant}</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      <strong className="text-slate-400 font-normal">Phenotype: </strong>
                      {g.phenotype}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 border-t border-slate-800/60 pt-1">
                      <strong className="text-slate-300 font-normal">CPIC Recommendation: </strong>
                      {g.clinicalSignificance}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs font-mono uppercase text-slate-400 font-semibold mb-3">
                EVIDENCE-BASED CARE RECOMMENDATIONS
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {insight.predictiveRecommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded border border-slate-800/80">
                    <span className="text-teal-400 font-mono font-bold text-xs mt-0.5">
                      0{idx + 1}.
                    </span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
