import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLiveVitals } from '../context/WebSocketContext';
import { useNotification } from '../context/NotificationContext';
import { Patient, SimulatorStatus, DetectionResult } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Cpu,
  Play,
  Square,
  Pause,
  Sparkles,
  Zap,
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Radio,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Terminal,
} from 'lucide-react';

interface EventLogItem {
  time: string;
  type: 'TX' | 'ANOMALY' | 'CHECK' | 'INFO';
  message: string;
}

export const SimulatorPage: React.FC = () => {
  const { latestReading } = useLiveVitals();
  const { addToast } = useNotification();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(1);
  const [simMode, setSimMode] = useState<string>('NORMAL');
  const [intervalSec, setIntervalSec] = useState<number>(3.0);
  const [simStatus, setSimStatus] = useState<SimulatorStatus>({
    is_running: false,
    active_patient_id: null,
    active_patient_name: null,
    mode: 'NORMAL',
    interval_seconds: 3.0,
    packets_transmitted: 0,
    last_transmission: null,
    latest_reading: null,
    device_id: 'VIRTUAL_NODE_01',
  });

  // Event Log
  const [eventLogs, setEventLogs] = useState<EventLogItem[]>([
    { time: new Date().toLocaleTimeString(), type: 'INFO', message: 'Virtual IoT Gateway initialized' },
    { time: new Date().toLocaleTimeString(), type: 'CHECK', message: 'Edge Processing & Abnormality Engine online' },
  ]);

  // Custom Form
  const [customHR, setCustomHR] = useState<number>(135);
  const [customSpO2, setCustomSpO2] = useState<number>(86);
  const [customTemp, setCustomTemp] = useState<number>(39.1);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [customAnalysis, setCustomAnalysis] = useState<DetectionResult | null>(null);

  const fetchStatusAndPatients = async () => {
    try {
      const [pData, sData] = await Promise.all([
        api.getPatients(),
        api.getSimulationStatus(),
      ]);
      setPatients(pData);
      setSimStatus(sData);
      if (sData.active_patient_id) setSelectedPatientId(sData.active_patient_id);
      if (sData.mode) setSimMode(sData.mode);
      if (sData.interval_seconds) setIntervalSec(sData.interval_seconds);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatusAndPatients();
  }, []);

  // When live reading arrives, log event
  useEffect(() => {
    if (latestReading) {
      const logItem: EventLogItem = {
        time: new Date().toLocaleTimeString(),
        type: latestReading.status === 'CRITICAL' ? 'ANOMALY' : 'TX',
        message: `Reading [HR: ${latestReading.heart_rate}, SpO2: ${latestReading.spo2}%, Temp: ${latestReading.temperature}°C] -> Status ${latestReading.status}`,
      };
      setEventLogs((prev) => [logItem, ...prev.slice(0, 19)]);
    }
  }, [latestReading]);

  const handleStart = async () => {
    try {
      const status = await api.startSimulation(selectedPatientId, simMode, intervalSec);
      setSimStatus(status);
      addToast('success', 'Simulation Started', `Transmitting ${simMode} vitals every ${intervalSec}s`);
      setEventLogs((prev) => [
        { time: new Date().toLocaleTimeString(), type: 'INFO', message: `Simulator started for Patient ID ${selectedPatientId} in ${simMode} mode` },
        ...prev,
      ]);
    } catch (err: any) {
      addToast('error', 'Start Failed', err.message);
    }
  };

  const handleStop = async () => {
    try {
      const status = await api.stopSimulation();
      setSimStatus(status);
      addToast('info', 'Simulation Stopped', 'Virtual sensor transmission paused.');
      setEventLogs((prev) => [
        { time: new Date().toLocaleTimeString(), type: 'INFO', message: 'Simulator transmission stopped by operator' },
        ...prev,
      ]);
    } catch (err: any) {
      addToast('error', 'Stop Failed', err.message);
    }
  };

  const handleModeChange = async (mode: string) => {
    setSimMode(mode);
    if (simStatus.is_running) {
      try {
        await api.setSimulationScenario(mode);
        addToast('info', 'Scenario Switched', `Active physiological mode changed to ${mode}`);
        fetchStatusAndPatients();
      } catch (err: any) {
        addToast('error', 'Change Failed', err.message);
      }
    }
  };

  const handleCustomAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeCustomVitals({
        patient_id: Number(selectedPatientId),
        heart_rate: Number(customHR),
        spo2: Number(customSpO2),
        temperature: Number(customTemp),
      });
      setCustomAnalysis(res.detection);
      addToast(
        res.detection.overall_status === 'CRITICAL' ? 'error' : res.detection.overall_status === 'WARNING' ? 'warning' : 'success',
        `Analysis: ${res.detection.overall_status}`,
        res.detection.recommendation
      );
    } catch (err: any) {
      addToast('error', 'Analysis Error', err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentReading = latestReading || simStatus.latest_reading;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          <span>Virtual IoT Sensor Simulator</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Simulate real-time patient sensor data for system testing without physical hardware.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulator Controls (7 cols) */}
        <div className="lg:col-span-7 saas-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Transmitter Controls</span>
            </h3>
            <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              simStatus.is_running
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}>
              {simStatus.is_running ? '● RUNNING' : '○ STANDBY'}
            </span>
          </div>

          {/* Patient Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Patient
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(Number(e.target.value))}
              disabled={simStatus.is_running}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:outline-none disabled:opacity-60"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.patient_code}) - {p.room_number || 'Ward'} [{p.device_id}]
                </option>
              ))}
            </select>
          </div>

          {/* Simulation Mode Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Simulation Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'NORMAL', label: 'Normal', desc: 'HR 72, SpO2 98%', color: 'emerald' },
                { id: 'WARNING', label: 'Warning', desc: 'HR 108, SpO2 93%', color: 'amber' },
                { id: 'CRITICAL', label: 'Critical', desc: 'HR 135, SpO2 86%', color: 'rose' },
                { id: 'WAVE', label: 'Waveform', desc: 'Continuous sine wave', color: 'indigo' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModeChange(m.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    simMode === m.id
                      ? 'bg-cyan-50 border-cyan-500 text-cyan-900 dark:bg-cyan-950/60 dark:border-cyan-400 dark:text-cyan-200 shadow-sm ring-1 ring-cyan-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold block">{m.label}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interval */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Simulation Interval</span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{intervalSec.toFixed(1)} seconds</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.5"
              value={intervalSec}
              onChange={(e) => setIntervalSec(parseFloat(e.target.value))}
              disabled={simStatus.is_running}
              className="w-full accent-cyan-600 cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Start / Pause / Stop Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!simStatus.is_running ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Simulation</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Simulation</span>
              </button>
            )}

            <button
              onClick={() => {
                setCustomHR(138);
                setCustomSpO2(85.5);
                setCustomTemp(39.3);
                api.triggerAbnormalEvent(selectedPatientId).then(() => {
                  addToast('error', 'Abnormal Event Injected', 'Triggered acute tachycardia desaturation event.');
                });
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Generate Abnormal Event</span>
            </button>
          </div>
        </div>

        {/* Right Column: IoT Device Telemetry & Live Values (5 cols) */}
        <div className="lg:col-span-5 saas-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>IoT Device Status</span>
              </h3>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </div>

            {/* Packets & Last Sync */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 block">Data Packets</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">{simStatus.packets_transmitted}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 block">Last Transmission</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-1 block">
                  {simStatus.last_transmission || '18:42:31'}
                </span>
              </div>
            </div>

            {/* Current Values Box */}
            <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Current Values
              </span>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block">❤️ Heart Rate</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {currentReading?.heart_rate ?? 78} BPM
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold block">🫁 SpO₂</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {currentReading?.spo2 ? `${currentReading.spo2}%` : '98%'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">🌡 Temp</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {currentReading?.temperature ?? 36.7}°C
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Event Log Window */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <span className="flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" /> Live IoT Transmission Log
              </span>
              <span className="text-[10px] font-mono">Auto-scrolling</span>
            </div>
            <div className="h-28 overflow-y-auto rounded-xl bg-slate-950 p-2.5 font-mono text-[10px] space-y-1 text-slate-300 border border-slate-800">
              {eventLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-slate-500">{log.time}</span>
                  <span className={log.type === 'ANOMALY' ? 'text-rose-400 font-bold' : log.type === 'TX' ? 'text-cyan-300' : 'text-slate-400'}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Sensor Input Form Section */}
      <div className="saas-card p-6 space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Custom Simulated Sensor Input</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manually enter simulated sensor parameters to test edge validation and the abnormality detection engine.
          </p>
        </div>

        <form onSubmit={handleCustomAnalyze} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Heart Rate (BPM)
            </label>
            <input
              type="number"
              step="0.1"
              value={customHR}
              onChange={(e) => setCustomHR(parseFloat(e.target.value))}
              placeholder="e.g. 135"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              SpO₂ (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="40"
              max="100"
              value={customSpO2}
              onChange={(e) => setCustomSpO2(parseFloat(e.target.value))}
              placeholder="e.g. 86"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Temperature (°C)
            </label>
            <input
              type="number"
              step="0.1"
              value={customTemp}
              onChange={(e) => setCustomTemp(parseFloat(e.target.value))}
              placeholder="e.g. 39.1"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2.5 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Reading'}
            </button>
          </div>
        </form>

        {/* Abnormality Analysis Result Card */}
        {customAnalysis && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                Abnormality Analysis Result
              </span>
              <StatusBadge status={customAnalysis.overall_status} size="md" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Detected Conditions:</span>
              {customAnalysis.issues_detected.length === 0 ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All parameters are within normal baseline thresholds.
                </p>
              ) : (
                <ul className="space-y-1">
                  {customAnalysis.issues_detected.map((iss, idx) => (
                    <li key={idx} className="text-xs text-rose-700 dark:text-rose-300 flex items-start gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                      <span>{iss}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white block mb-0.5">Recommendation:</strong>
              {customAnalysis.recommendation}
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Remember: This is a prototype simulation and not a medical diagnosis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
