import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useLiveVitals } from '../context/WebSocketContext';
import { useNotification } from '../context/NotificationContext';
import { Patient, HealthReading, Alert } from '../types';
import { VitalCard } from '../components/common/VitalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { LivePulseChart } from '../components/common/LivePulseChart';
import { CustomAnalyzerModal } from '../components/simulator/CustomAnalyzerModal';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Bell,
  Cpu,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { latestReading, latestAlert, isConnected } = useLiveVitals();
  const { addToast } = useNotification();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(1);
  const [patientReadings, setPatientReadings] = useState<HealthReading[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [isSandboxOpen, setIsSandboxOpen] = useState<boolean>(false);
  const [patientVitalsMap, setPatientVitalsMap] = useState<Record<number, HealthReading>>({});

  const fetchData = async () => {
    try {
      const [patientsData, alertsData, latestReadings] = await Promise.all([
        api.getPatients(),
        api.getAlerts({ limit: 8 }),
        api.getLatestReadings(),
      ]);
      setPatients(patientsData);
      setRecentAlerts(alertsData);

      const map: Record<number, HealthReading> = {};
      latestReadings.forEach((r) => {
        map[r.patient_id] = r;
      });
      setPatientVitalsMap(map);

      const targetId = selectedPatientId || (patientsData[0]?.id || 1);
      setSelectedPatientId(targetId);

      const readingsData = await api.getPatientReadings(targetId, 30);
      setPatientReadings(readingsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      api.getPatientReadings(selectedPatientId, 30)
        .then((data) => setPatientReadings(data))
        .catch(console.error);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    if (latestReading) {
      setPatientVitalsMap((prev) => ({
        ...prev,
        [latestReading.patient_id]: latestReading,
      }));
      if (latestReading.patient_id === selectedPatientId) {
        setPatientReadings((prev) => [...prev.slice(-29), latestReading]);
      }
    }
  }, [latestReading, selectedPatientId]);

  useEffect(() => {
    if (latestAlert) {
      setRecentAlerts((prev) => [latestAlert, ...prev.filter((a) => a.id !== latestAlert.id).slice(0, 7)]);
    }
  }, [latestAlert]);

  const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const activeVitals = (latestReading && latestReading.patient_id === selectedPatientId)
    ? latestReading
    : (patientVitalsMap[selectedPatientId] || patientReadings[patientReadings.length - 1]);

  // Calculations
  const normalCount = patients.filter((p) => (patientVitalsMap[p.id]?.status || p.current_status) === 'NORMAL').length;
  const warningCount = patients.filter((p) => (patientVitalsMap[p.id]?.status || p.current_status) === 'WARNING').length;
  const criticalCount = patients.filter((p) => (patientVitalsMap[p.id]?.status || p.current_status) === 'CRITICAL').length;
  const unresolvedAlerts = recentAlerts.filter((a) => !a.resolved);
  const criticalAlert = unresolvedAlerts.find((a) => a.severity === 'CRITICAL');

  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      const updated = await api.updateAlert(alertId, { acknowledged: true, acknowledged_by: 'Dr. Pavan' });
      setRecentAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
      addToast('success', 'Alert Acknowledged', 'Recorded in clinical triage log');
    } catch (e: any) {
      addToast('error', 'Action Failed', e.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Greeting Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Good evening, Doctor.
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Here's the latest overview of patient health monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSandboxOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Custom Analysis Form</span>
          </button>

          <Link
            to="/simulator"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Open IoT Simulator</span>
          </Link>
        </div>
      </div>

      {/* Prominent Critical Alert Section */}
      {criticalAlert && (
        <div className="p-4 sm:p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/30 flex-shrink-0 mt-0.5">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 font-mono">
                  CRITICAL ALERT
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {criticalAlert.patient_name || 'Rahul Kumar'}
                </span>
              </div>
              <p className="text-sm font-semibold text-rose-900 dark:text-rose-200 mt-0.5">
                {criticalAlert.message}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                <span>Value: <strong>{criticalAlert.value ?? '--'}</strong></span>
                <span>•</span>
                <span>Detected {new Date(criticalAlert.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => navigate(`/patients/${criticalAlert.patient_id}`)}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              View Patient
            </button>
            {!criticalAlert.acknowledged && (
              <button
                onClick={() => handleAcknowledgeAlert(criticalAlert.id)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
              >
                Acknowledge
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Patients */}
        <div className="saas-card p-4">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs font-medium mb-1">
            <span>Total Patients</span>
            <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{patients.length || 5}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+2 registered today</span>
          </div>
        </div>

        {/* Normal Status */}
        <div className="saas-card p-4 border-emerald-100 dark:border-emerald-950/60">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs font-medium mb-1">
            <span>Normal</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{normalCount}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
            {patients.length ? `${Math.round((normalCount / patients.length) * 100)}% of monitored patients` : 'Baseline'}
          </span>
        </div>

        {/* Warning Status */}
        <div className="saas-card p-4 border-amber-100 dark:border-amber-950/60">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs font-medium mb-1">
            <span>Warning</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">{warningCount}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
            Observation protocol
          </span>
        </div>

        {/* Critical Status */}
        <div className="saas-card p-4 border-rose-100 dark:border-rose-950/60">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs font-medium mb-1">
            <span>Critical</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">{criticalCount}</div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold block mt-1">
            Requires attention
          </span>
        </div>

        {/* Active Alerts */}
        <div className="saas-card p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs font-medium mb-1">
            <span>Active Alerts</span>
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{unresolvedAlerts.length}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
            Pending triage
          </span>
        </div>
      </div>

      {/* Active Patient Focused Monitor & Vital Cards */}
      <div className="saas-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {activePatient?.name.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{activePatient?.name}</h3>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {activePatient?.patient_code}
                </span>
                <StatusBadge status={activeVitals?.status || activePatient?.current_status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Age: {activePatient?.age} | Room: {activePatient?.room_number || 'General Ward'} | Device: {activePatient?.device_id}
              </p>
            </div>
          </div>

          {/* Patient Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Select Patient:</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(Number(e.target.value))}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.patient_code}) - {p.room_number || 'Ward'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vital Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <VitalCard
            type="heart_rate"
            title="Heart Rate"
            value={activeVitals?.heart_rate}
            unit="BPM"
            status={activeVitals?.status}
            normalRange="60 – 100 BPM"
            isLiveUpdating={isConnected}
          />
          <VitalCard
            type="spo2"
            title="Oxygen Saturation (SpO2)"
            value={activeVitals?.spo2}
            unit="%"
            status={activeVitals?.status}
            normalRange="95 – 100 %"
            isLiveUpdating={isConnected}
          />
          <VitalCard
            type="temperature"
            title="Body Temperature"
            value={activeVitals?.temperature}
            unit="°C"
            status={activeVitals?.status}
            normalRange="36.5 – 37.5 °C"
            isLiveUpdating={isConnected}
          />
          <VitalCard
            type="systolic_bp"
            title="Blood Pressure"
            value={activeVitals?.systolic_bp ? `${activeVitals.systolic_bp}/${activeVitals.diastolic_bp || 80}` : '--'}
            unit="mmHg"
            status={activeVitals?.status}
            normalRange="90/60 – 120/80"
            isLiveUpdating={isConnected}
          />
        </div>
      </div>

      {/* Live Patient Monitoring Cards Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Live Patient Monitoring</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Continuous telemetry overview for all monitored beds</p>
          </div>
          <Link to="/live" className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
            <span>View Full Grid</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.slice(0, 6).map((p) => {
            const v = patientVitalsMap[p.id];
            const pStatus = v?.status || p.current_status || 'NORMAL';

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`saas-card p-4 cursor-pointer transition-all ${
                  selectedPatientId === p.id ? 'ring-2 ring-cyan-500 shadow-md' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{p.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">{p.patient_code} • {p.room_number || 'Ward'}</span>
                    </div>
                  </div>
                  <StatusBadge status={pStatus} size="sm" />
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-rose-500 font-semibold block">HR</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{v?.heart_rate ?? '--'}</span>
                  </div>
                  <div className="border-x border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-cyan-500 font-semibold block">SpO2</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{v?.spo2 ? `${v.spo2}%` : '--'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-500 font-semibold block">Temp</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{v?.temperature ? `${v.temperature}°` : '--'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Updated recently
                  </span>
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">Inspect Details →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continuous Waveform Chart & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LivePulseChart readings={patientReadings} height={300} />
        </div>

        {/* Alerts Column */}
        <div className="saas-card p-5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-rose-500" />
                <span>Recent Clinical Alerts</span>
              </h3>
              <Link to="/alerts" className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {recentAlerts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No active clinical alerts.</p>
              ) : (
                recentAlerts.map((a) => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      a.severity === 'CRITICAL'
                        ? 'bg-rose-50/80 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900'
                        : 'bg-amber-50/80 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{a.title}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        a.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                      }`}>
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">{a.message}</p>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-500">
                      <span>{a.patient_name}</span>
                      {a.acknowledged ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Acknowledged</span>
                      ) : (
                        <button
                          onClick={() => handleAcknowledgeAlert(a.id)}
                          className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <CustomAnalyzerModal
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
        patients={patients}
        onAnalysisComplete={fetchData}
      />
    </div>
  );
};
