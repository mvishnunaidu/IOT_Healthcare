import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useLiveVitals } from '../context/WebSocketContext';
import { Patient, HealthReading, Alert } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { VitalCard } from '../components/common/VitalCard';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  Droplets,
  Thermometer,
  Activity,
  AlertTriangle,
  FileText,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  const { latestReading } = useLiveVitals();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeRange, setTimeRange] = useState<'1h' | 'today' | '7d' | '30d'>('today');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      Promise.all([
        api.getPatient(patientId),
        api.getPatientReadings(patientId, 50),
        api.getAlerts({ patient_id: patientId }),
      ])
        .then(([pData, rData, aData]) => {
          setPatient(pData);
          setReadings(rData);
          setAlerts(aData);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [patientId]);

  // Handle live WebSocket update for this patient
  useEffect(() => {
    if (latestReading && latestReading.patient_id === patientId) {
      setReadings((prev) => [...prev.slice(-49), latestReading]);
    }
  }, [latestReading, patientId]);

  if (isLoading || !patient) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Loading patient clinical record...
      </div>
    );
  }

  const latest = (latestReading && latestReading.patient_id === patientId)
    ? latestReading
    : readings[readings.length - 1];

  const chartData = readings.map((r, i) => ({
    time: r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `#${i}`,
    heart_rate: r.heart_rate,
    spo2: r.spo2,
    temperature: r.temperature,
    status: r.status,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <Link
          to="/patients"
          className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-white">{patient.name}</h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400">
              {patient.patient_code}
            </span>
            <StatusBadge status={latest?.status || patient.current_status} size="sm" />
          </div>
          <p className="text-xs text-slate-400">
            Admitted: {new Date(patient.created_at).toLocaleDateString()} | Room: {patient.room_number || 'General Ward'} | Device: {patient.device_id}
          </p>
        </div>
      </div>

      {/* Patient Profile Demographics Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/70 glass-panel text-xs">
        <div>
          <span className="text-slate-500 block mb-1">Age & Gender</span>
          <span className="text-sm font-semibold text-white">{patient.age} yrs / {patient.gender}</span>
        </div>
        <div>
          <span className="text-slate-500 block mb-1">Emergency Contact</span>
          <span className="text-sm font-semibold text-white">{patient.emergency_contact || 'None specified'}</span>
        </div>
        <div>
          <span className="text-slate-500 block mb-1">Clinical Diagnosis</span>
          <span className="text-sm font-semibold text-cyan-300">{patient.medical_conditions || 'Routine Observation'}</span>
        </div>
        <div>
          <span className="text-slate-500 block mb-1">Primary Phone</span>
          <span className="text-sm font-semibold text-white">{patient.phone || 'N/A'}</span>
        </div>
      </div>

      {/* Current Vitals Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <VitalCard
          type="heart_rate"
          title="Heart Rate"
          value={latest?.heart_rate}
          unit="BPM"
          status={latest?.status}
          normalRange="60 – 100 BPM"
        />
        <VitalCard
          type="spo2"
          title="SpO2 Saturation"
          value={latest?.spo2}
          unit="%"
          status={latest?.status}
          normalRange="95 – 100 %"
        />
        <VitalCard
          type="temperature"
          title="Temperature"
          value={latest?.temperature}
          unit="°C"
          status={latest?.status}
          normalRange="36.5 – 37.5 °C"
        />
        <VitalCard
          type="systolic_bp"
          title="Blood Pressure"
          value={latest?.systolic_bp ? `${latest.systolic_bp}/${latest.diastolic_bp || 80}` : '--'}
          unit="mmHg"
          status={latest?.status}
          normalRange="90/60 – 120/80"
        />
      </div>

      {/* Multi-Parameter Historical Waveforms */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 glass-panel space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">Historical Telemetry Waveforms</h3>
            <p className="text-xs text-slate-400">Continuous biometric trends across monitoring periods</p>
          </div>

          {/* Time Filter Buttons */}
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            {(['1h', 'today', '7d', '30d'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  timeRange === t ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === '1h' ? 'Last Hour' : t === 'today' ? 'Today' : t === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Line Chart */}
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                name="Heart Rate (BPM)"
                type="monotone"
                dataKey="heart_rate"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
              <Line
                name="SpO2 (%)"
                type="monotone"
                dataKey="spo2"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
              />
              <Line
                name="Temperature (°C)"
                type="monotone"
                dataKey="temperature"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alert History & Telemetry Logs Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Alerts History */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 glass-panel space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Alert History for {patient.name}</span>
          </h3>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No alerts triggered for this patient.</p>
            ) : (
              alerts.map((a) => (
                <div
                  key={a.id}
                  className={`p-3 rounded-xl border text-xs ${
                    a.severity === 'CRITICAL' ? 'border-rose-500/30 bg-rose-950/20' : 'border-amber-500/30 bg-amber-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{a.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(a.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1">{a.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Reading Log Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 glass-panel space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Recent Sensor Reading Audit</span>
          </h3>

          <div className="max-h-64 overflow-y-auto pr-1">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-[10px] uppercase text-slate-400 font-semibold">
                <tr>
                  <th className="py-2">Time</th>
                  <th className="py-2">HR</th>
                  <th className="py-2">SpO2</th>
                  <th className="py-2">Temp</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono text-[11px]">
                {readings.slice(-8).reverse().map((r, i) => (
                  <tr key={i}>
                    <td className="py-2 text-slate-400">
                      {new Date(r.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 text-rose-400 font-bold">{r.heart_rate}</td>
                    <td className="py-2 text-cyan-400 font-bold">{r.spo2}%</td>
                    <td className="py-2 text-amber-400 font-bold">{r.temperature}°C</td>
                    <td className="py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        r.status === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : r.status === 'WARNING' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
