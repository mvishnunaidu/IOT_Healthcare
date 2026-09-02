import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Settings, Sliders, Save, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { addToast } = useNotification();
  const [thresholds, setThresholds] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    api.getThresholds()
      .then((data) => setThresholds(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (metric: string, field: string, val: number) => {
    setThresholds((prev) => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [field]: val,
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateThresholds(thresholds);
      addToast('success', 'Thresholds Updated', 'Abnormality detection rule matrix dynamically refreshed');
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const resetDefaults = () => {
    // Reload from server default
    api.getThresholds().then((data) => {
      setThresholds(data);
      addToast('info', 'Reset', 'Reloaded current stored thresholds');
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading threshold configuration...</div>;
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-cyan-400" />
            <span>Abnormality Detection Threshold Rules</span>
          </h1>
          <p className="text-xs text-slate-400">
            Configure multi-tier clinical alert boundaries for Heart Rate, SpO2, and Body Temperature
          </p>
        </div>

        <button
          type="button"
          onClick={resetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {Object.entries(thresholds).map(([metricKey, conf]) => (
          <div key={metricKey} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 glass-panel space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white capitalize">
                {conf.name || metricKey.replace('_', ' ')}
              </h3>
              <span className="font-mono text-xs text-cyan-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                Unit: {conf.unit}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Normal Baseline */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-bold text-emerald-400 block">Normal Target Baseline</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={conf.normal_min}
                    onChange={(e) => handleChange(metricKey, 'normal_min', parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="number"
                    step="0.1"
                    value={conf.normal_max}
                    onChange={(e) => handleChange(metricKey, 'normal_max', parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Warning Thresholds */}
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                <span className="text-xs font-bold text-amber-400 block">Warning Deviation Range</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={conf.warning_low}
                    onChange={(e) => handleChange(metricKey, 'warning_low', parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="number"
                    step="0.1"
                    value={conf.warning_high}
                    onChange={(e) => handleChange(metricKey, 'warning_high', parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Critical Alert Thresholds */}
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2">
                <span className="text-xs font-bold text-rose-400 block">Critical Emergency Cutoffs</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={conf.critical_low}
                    onChange={(e) => handleChange(metricKey, 'critical_low', parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="number"
                    step="0.1"
                    value={conf.critical_high}
                    onChange={(e) => handleChange(metricKey, 'critical_high', parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Configurations...' : 'Save Updated Threshold Rules'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
