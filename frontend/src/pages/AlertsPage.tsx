import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLiveVitals } from '../context/WebSocketContext';
import { useNotification } from '../context/NotificationContext';
import { Alert } from '../types';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  Clock,
  User,
  ShieldCheck,
  Filter,
  Check,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { latestAlert } = useLiveVitals();
  const { addToast } = useNotification();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ACTIVE');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAlerts = async () => {
    try {
      const data = await api.getAlerts({ limit: 100 });
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Prepend live alert from WebSocket
  useEffect(() => {
    if (latestAlert) {
      setAlerts((prev) => [latestAlert, ...prev.filter((a) => a.id !== latestAlert.id)]);
      addToast(
        latestAlert.severity === 'CRITICAL' ? 'error' : 'warning',
        `${latestAlert.severity} Alert: ${latestAlert.patient_name}`,
        latestAlert.message
      );
    }
  }, [latestAlert]);

  const handleAcknowledge = async (id: number) => {
    try {
      const updated = await api.updateAlert(id, { acknowledged: true, acknowledged_by: 'Dr. Pavan' });
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      addToast('success', 'Alert Acknowledged', 'Logged in clinical audit log');
    } catch (err: any) {
      addToast('error', 'Action Failed', err.message);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      const updated = await api.updateAlert(id, { resolved: true });
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      addToast('success', 'Alert Resolved', 'Case marked as clinically addressed');
    } catch (err: any) {
      addToast('error', 'Action Failed', err.message);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && !a.resolved) ||
      (statusFilter === 'RESOLVED' && a.resolved);
    return matchesSeverity && matchesStatus;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && !a.resolved).length;
  const warningCount = alerts.filter((a) => a.severity === 'WARNING' && !a.resolved).length;
  const resolvedCount = alerts.filter((a) => a.resolved).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-rose-400" />
            <span>Clinical Alert Triage Center</span>
          </h1>
          <p className="text-xs text-slate-400">
            Automated abnormality detection alarms, severity classification, and clinical response audit trail
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold">
            {criticalCount} Critical Active
          </span>
          <span className="px-3 py-1 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold">
            {warningCount} Warnings
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/60 glass-panel">
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
          {(['ACTIVE', 'RESOLVED', 'ALL'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === st ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ACTIVE' ? `Active (${criticalCount + warningCount})` : st === 'RESOLVED' ? `Resolved (${resolvedCount})` : 'All Alerts'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARNING">Warning Only</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed Grid */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center text-slate-500 text-xs glass-card">
            <CheckCircle className="w-8 h-8 text-emerald-400/50 mx-auto mb-2" />
            <span>No clinical alerts matching your active filter criteria.</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl border p-5 transition-all glass-panel flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.resolved
                  ? 'border-slate-800/80 bg-slate-900/40 opacity-70'
                  : alert.severity === 'CRITICAL'
                  ? 'border-rose-500/50 bg-rose-950/20 shadow-lg shadow-rose-950/30'
                  : 'border-amber-500/40 bg-amber-950/20'
              }`}
            >
              {/* Alert Content */}
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                  alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {alert.severity === 'CRITICAL' ? (
                    <AlertOctagon className="w-5 h-5 animate-pulse" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {alert.severity}
                    </span>
                    {alert.threshold_violated && (
                      <span className="text-[10px] text-slate-400 font-mono">[{alert.threshold_violated}]</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300">{alert.message}</p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
                    <span className="text-cyan-300 font-semibold">{alert.patient_name || 'Patient'} ({alert.patient_code})</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                    {alert.acknowledged_by && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400">Ack by {alert.acknowledged_by}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!alert.acknowledged && !alert.resolved && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}

                {!alert.resolved ? (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolve Alert</span>
                  </button>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Resolved
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
