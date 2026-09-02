import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Patient, HealthReading } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  History,
  Download,
  Filter,
  Calendar,
  Heart,
  Droplets,
  Thermometer,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';

export const HealthHistoryPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(1);
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [limit, setLimit] = useState<number>(50);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getPatients().then((pList) => {
      setPatients(pList);
      if (pList.length > 0) {
        setSelectedPatientId(pList[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      setIsLoading(true);
      api.getPatientReadings(selectedPatientId, limit)
        .then((data) => setReadings(data))
        .finally(() => setIsLoading(false));
    }
  }, [selectedPatientId, limit]);

  const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const filteredReadings = readings.filter((r) => {
    return statusFilter === 'ALL' || r.status === statusFilter;
  });

  const exportCSV = () => {
    if (filteredReadings.length === 0) return;
    const headers = ['Timestamp', 'Patient ID', 'Heart Rate (BPM)', 'SpO2 (%)', 'Temperature (°C)', 'Systolic BP', 'Diastolic BP', 'Status', 'Analysis Reason'];
    const rows = filteredReadings.map((r) => [
      r.timestamp,
      r.patient_id,
      r.heart_rate,
      r.spo2,
      r.temperature,
      r.systolic_bp || '',
      r.diastolic_bp || '',
      r.status,
      `"${(r.analysis_reason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `telemetry_history_patient_${selectedPatientId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Health History & Telemetry Logs</span>
          </h1>
          <p className="text-xs text-slate-400">
            Audit historical vital signs logs, filter by clinical condition, and export time-series telemetry datasets
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-bold shadow-md transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Dataset</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/60 glass-panel">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Target Patient</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.patient_code}) - {p.room_number || 'Ward'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Classification Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Readings</option>
            <option value="NORMAL">Normal Only</option>
            <option value="WARNING">Warning Only</option>
            <option value="CRITICAL">Critical Only</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Log Count Limit</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value={25}>25 Readings</option>
            <option value={50}>50 Readings</option>
            <option value={100}>100 Readings</option>
            <option value={200}>200 Readings</option>
          </select>
        </div>
      </div>

      {/* Readings Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="p-4">Timestamp (UTC)</th>
                <th className="p-4">Heart Rate</th>
                <th className="p-4">SpO2</th>
                <th className="p-4">Temperature</th>
                <th className="p-4">Blood Pressure</th>
                <th className="p-4">Respiratory</th>
                <th className="p-4">Status</th>
                <th className="p-4">Clinical Diagnostic Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredReadings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                    No historical readings recorded for the chosen filters.
                  </td>
                </tr>
              ) : (
                filteredReadings.slice().reverse().map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-slate-400">
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-rose-400">{r.heart_rate} BPM</td>
                    <td className="p-4 font-bold text-cyan-400">{r.spo2}%</td>
                    <td className="p-4 font-bold text-amber-400">{r.temperature}°C</td>
                    <td className="p-4 text-purple-300">
                      {r.systolic_bp ? `${r.systolic_bp}/${r.diastolic_bp || 80}` : '--'}
                    </td>
                    <td className="p-4 text-emerald-300">
                      {r.respiratory_rate ? `${r.respiratory_rate} rpm` : '--'}
                    </td>
                    <td className="p-4 font-sans">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="p-4 font-sans text-xs text-slate-300 truncate max-w-xs">
                      {r.analysis_reason || 'Nominal vital baseline'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
