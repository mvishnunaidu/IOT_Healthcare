import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Patient } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { AddPatientModal } from '../components/patients/AddPatientModal';
import { useNotification } from '../context/NotificationContext';
import {
  Users,
  UserPlus,
  Search,
  ArrowUpRight,
  Trash2,
  Activity,
  Heart,
  Droplets,
  Thermometer,
} from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const { addToast } = useNotification();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const data = await api.getPatients();
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to discharge/remove patient ${name}?`)) return;
    try {
      await api.deletePatient(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
      addToast('info', 'Patient Removed', `Discharged ${name} from active monitoring`);
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patient_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.room_number && p.room_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || p.current_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Patient Directory</h1>
          <p className="text-xs text-slate-400">Manage patient demographics, room assignments, and assigned virtual IoT devices</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/60 glass-panel">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patient name, code, or room..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="NORMAL">Normal</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="p-4">Patient Code</th>
                <th className="p-4">Patient Name</th>
                <th className="p-4">Age / Gender</th>
                <th className="p-4">Room / Bed</th>
                <th className="p-4">Heart Rate</th>
                <th className="p-4">SpO2</th>
                <th className="p-4">Temperature</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No patients match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const r = p.latest_reading;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-cyan-400">{p.patient_code}</td>
                      <td className="p-4 font-semibold text-white">
                        <Link to={`/patients/${p.id}`} className="hover:text-cyan-400 transition-colors">
                          {p.name}
                        </Link>
                        {p.medical_conditions && (
                          <span className="block text-[11px] text-slate-400 font-normal truncate max-w-xs">
                            {p.medical_conditions}
                          </span>
                        )}
                      </td>
                      <td className="p-4">{p.age} yrs / {p.gender}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-300">
                          {p.room_number || 'General'}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-rose-400 font-bold">
                        {r ? `${r.heart_rate} BPM` : '--'}
                      </td>
                      <td className="p-4 font-mono text-cyan-400 font-bold">
                        {r ? `${r.spo2}%` : '--'}
                      </td>
                      <td className="p-4 font-mono text-amber-400 font-bold">
                        {r ? `${r.temperature}°C` : '--'}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={p.current_status} size="sm" />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/patients/${p.id}`}
                            className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 hover:bg-cyan-900/60 transition-colors"
                            title="View Patient Details & Charts"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Remove Patient"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newP) => setPatients((prev) => [newP, ...prev])}
      />
    </div>
  );
};
