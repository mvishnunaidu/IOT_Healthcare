import React, { useState } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Patient, DetectionResult } from '../../types';
import { Play, Sparkles, X, AlertOctagon, CheckCircle, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface CustomAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onAnalysisComplete?: () => void;
}

export const CustomAnalyzerModal: React.FC<CustomAnalyzerModalProps> = ({
  isOpen,
  onClose,
  patients,
  onAnalysisComplete,
}) => {
  const { addToast } = useNotification();
  const [patientId, setPatientId] = useState<number>(patients[0]?.id || 1);
  const [heartRate, setHeartRate] = useState<number>(135);
  const [spo2, setSpo2] = useState<number>(86);
  const [temperature, setTemperature] = useState<number>(39.1);
  const [systolicBp, setSystolicBp] = useState<number>(145);
  const [diastolicBp, setDiastolicBp] = useState<number>(92);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(26);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<DetectionResult | null>(null);

  if (!isOpen) return null;

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeCustomVitals({
        patient_id: Number(patientId),
        heart_rate: Number(heartRate),
        spo2: Number(spo2),
        temperature: Number(temperature),
        systolic_bp: Number(systolicBp),
        diastolic_bp: Number(diastolicBp),
        respiratory_rate: Number(respiratoryRate),
      });

      setAnalysisResult(res.detection);
      addToast(
        res.detection.overall_status === 'CRITICAL'
          ? 'error'
          : res.detection.overall_status === 'WARNING'
          ? 'warning'
          : 'success',
        `Analysis Complete: ${res.detection.overall_status}`,
        res.detection.recommendation
      );

      if (onAnalysisComplete) onAnalysisComplete();
    } catch (err: any) {
      addToast('error', 'Analysis Failed', err.response?.data?.detail || err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadPreset = (hr: number, o2: number, t: number, s: number, d: number, r: number) => {
    setHeartRate(hr);
    setSpo2(o2);
    setTemperature(t);
    setSystolicBp(s);
    setDiastolicBp(d);
    setRespiratoryRate(r);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl glass-panel animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Manual Parameter Testing Sandbox</h3>
              <p className="text-xs text-slate-400">Inject customized vital values through the full IoT & Abnormality Detection pipeline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Scenario Fill Buttons */}
        <div className="my-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1">Quick Presets:</span>
          <button
            type="button"
            onClick={() => loadPreset(72, 98, 36.7, 120, 80, 16)}
            className="px-2.5 py-1 text-xs rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/80 transition-colors"
          >
            Baseline Normal (72 BPM, 98% SpO2)
          </button>
          <button
            type="button"
            onClick={() => loadPreset(108, 93, 37.9, 134, 88, 22)}
            className="px-2.5 py-1 text-xs rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-300 hover:bg-amber-900/80 transition-colors"
          >
            Warning Tachycardia (108 BPM, 93% SpO2)
          </button>
          <button
            type="button"
            onClick={() => loadPreset(135, 86, 39.1, 150, 95, 28)}
            className="px-2.5 py-1 text-xs rounded-lg bg-rose-950/60 border border-rose-800/50 text-rose-300 hover:bg-rose-900/80 transition-colors font-semibold"
          >
            Critical Hypoxia (135 BPM, 86% SpO2, 39.1°C)
          </button>
        </div>

        {/* Inputs Form */}
        <form onSubmit={handleRunAnalysis} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient Selector */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Patient</label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.patient_code}) - {p.room_number || 'General Ward'}
                  </option>
                ))}
              </select>
            </div>

            {/* Heart Rate */}
            <div>
              <label className="block text-xs font-medium text-rose-400 mb-1">Heart Rate (BPM)</label>
              <input
                type="number"
                step="0.1"
                value={heartRate}
                onChange={(e) => setHeartRate(parseFloat(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-sm text-white focus:border-rose-500 focus:outline-none"
                required
              />
            </div>

            {/* SpO2 */}
            <div>
              <label className="block text-xs font-medium text-cyan-400 mb-1">SpO2 Oxygen Saturation (%)</label>
              <input
                type="number"
                step="0.1"
                min="40"
                max="100"
                value={spo2}
                onChange={(e) => setSpo2(parseFloat(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-sm text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-xs font-medium text-amber-400 mb-1">Body Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-sm text-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            {/* Blood Pressure */}
            <div>
              <label className="block text-xs font-medium text-purple-400 mb-1">Blood Pressure (Sys / Dia mmHg)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(parseFloat(e.target.value))}
                  placeholder="Sys"
                  className="w-1/2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white focus:border-purple-500 focus:outline-none"
                />
                <input
                  type="number"
                  value={diastolicBp}
                  onChange={(e) => setDiastolicBp(parseFloat(e.target.value))}
                  placeholder="Dia"
                  className="w-1/2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              {isAnalyzing ? 'Ingesting & Detecting...' : 'Analyze & Inject Reading'}
            </button>
          </div>
        </form>

        {/* Live Analysis Engine Feedback Breakdown */}
        {analysisResult && (
          <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Detection Engine Output</span>
              <StatusBadge status={analysisResult.overall_status} size="md" />
            </div>

            {/* Reasons / Issues */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-300">Detected Issues & Violations:</p>
              {analysisResult.issues_detected.length === 0 ? (
                <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> All parameters are within normal baseline thresholds.
                </p>
              ) : (
                <ul className="space-y-1">
                  {analysisResult.issues_detected.map((issue, i) => (
                    <li key={i} className="text-xs text-rose-300 flex items-start gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Clinical Recommendation */}
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-white block mb-0.5">Clinical Protocol Recommendation:</span>
              {analysisResult.recommendation}
            </div>

            {/* ML Insight */}
            {analysisResult.ml_insights && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
                <span>ML Statistical Anomaly Score: <strong className="text-cyan-400">{(analysisResult.ml_insights.anomaly_risk_score * 100).toFixed(0)}%</strong></span>
                <span>Risk Level: <strong className="text-white">{analysisResult.ml_insights.predicted_risk_level}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
