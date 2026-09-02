import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useLiveVitals } from '../context/WebSocketContext';
import { Patient, HealthReading } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Radio,
  ArrowUpRight,
  Wifi,
  Sparkles,
  Layers,
} from 'lucide-react';

export const LiveMonitoringPage: React.FC = () => {
  const { latestReading, isConnected } = useLiveVitals();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientVitalsMap, setPatientVitalsMap] = useState<Record<number, HealthReading>>({});

  useEffect(() => {
    api.getPatients().then(async (data) => {
      setPatients(data);
      const latestReadings = await api.getLatestReadings();
      const map: Record<number, HealthReading> = {};
      latestReadings.forEach((r) => {
        map[r.patient_id] = r;
      });
      setPatientVitalsMap(map);
    });
  }, []);

  // Update map on incoming WebSocket reading
  useEffect(() => {
    if (latestReading) {
      setPatientVitalsMap((prev) => ({
        ...prev,
        [latestReading.patient_id]: latestReading,
      }));
    }
  }, [latestReading]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Multi-Patient Telemetry Matrix</span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          </h1>
          <p className="text-xs text-slate-400">
            Real-time ward & ICU oversight grid. High-frequency WebSocket telemetry streaming from virtual sensor nodes.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <Wifi className="w-3.5 h-3.5 text-cyan-400" />
          <span>Stream Frequency: <strong>3.0s</strong></span>
        </div>
      </div>

      {/* Grid of Patient Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {patients.map((p) => {
          const vitals = patientVitalsMap[p.id];
          const isCurrentActiveSim = latestReading?.patient_id === p.id;

          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-5 transition-all duration-300 glass-card flex flex-col justify-between space-y-4 ${
                vitals?.status === 'CRITICAL'
                  ? 'border-rose-500/50 bg-rose-950/20 shadow-lg shadow-rose-950/30'
                  : vitals?.status === 'WARNING'
                  ? 'border-amber-500/40 bg-amber-950/20'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{p.name}</h3>
                    {isCurrentActiveSim && (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800/40">
                        <Radio className="w-2.5 h-2.5 animate-pulse" /> SIMULATING
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="font-mono text-cyan-300">{p.patient_code}</span>
                    <span>•</span>
                    <span>{p.room_number || 'General Ward'}</span>
                    <span>•</span>
                    <span>{p.age}y / {p.gender}</span>
                  </div>
                </div>

                <StatusBadge status={vitals?.status || p.current_status} size="sm" />
              </div>

              {/* Vitals Readings Grid */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                {/* Heart Rate */}
                <div className="text-center space-y-0.5">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-rose-400">
                    <Heart className="w-3 h-3" />
                    <span>HR</span>
                  </div>
                  <span className="text-lg font-extrabold text-white font-mono block">
                    {vitals?.heart_rate ?? '--'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">BPM</span>
                </div>

                {/* SpO2 */}
                <div className="text-center space-y-0.5 border-x border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-cyan-400">
                    <Droplets className="w-3 h-3" />
                    <span>SpO2</span>
                  </div>
                  <span className="text-lg font-extrabold text-white font-mono block">
                    {vitals?.spo2 ? `${vitals.spo2}%` : '--'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">%</span>
                </div>

                {/* Temperature */}
                <div className="text-center space-y-0.5">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400">
                    <Thermometer className="w-3 h-3" />
                    <span>Temp</span>
                  </div>
                  <span className="text-lg font-extrabold text-white font-mono block">
                    {vitals?.temperature ?? '--'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">°C</span>
                </div>
              </div>

              {/* Footer / Diagnostic Notes */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400 truncate max-w-[180px]">
                  {vitals?.analysis_reason || p.medical_conditions || 'Nominal vital signs'}
                </span>

                <Link
                  to={`/patients/${p.id}`}
                  className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
