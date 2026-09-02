import React from 'react';
import { VitalStatus } from '../../types';
import { Heart, Droplets, Thermometer, Activity, Wind, LucideIcon } from 'lucide-react';

interface VitalCardProps {
  type: 'heart_rate' | 'spo2' | 'temperature' | 'systolic_bp' | 'diastolic_bp' | 'respiratory_rate';
  title: string;
  value: number | string | null | undefined;
  unit: string;
  status?: VitalStatus;
  normalRange?: string;
  subtitle?: string;
  isLiveUpdating?: boolean;
}

export const VitalCard: React.FC<VitalCardProps> = ({
  type,
  title,
  value,
  unit,
  status = 'NORMAL',
  normalRange,
  subtitle,
  isLiveUpdating = false,
}) => {
  const configs: Record<string, { icon: LucideIcon; iconBg: string; iconColor: string; borderColor: string }> = {
    heart_rate: {
      icon: Heart,
      iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
      iconColor: 'text-rose-500',
      borderColor: 'hover:border-rose-300 dark:hover:border-rose-700',
    },
    spo2: {
      icon: Droplets,
      iconBg: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400',
      iconColor: 'text-cyan-500',
      borderColor: 'hover:border-cyan-300 dark:hover:border-cyan-700',
    },
    temperature: {
      icon: Thermometer,
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
      iconColor: 'text-amber-500',
      borderColor: 'hover:border-amber-300 dark:hover:border-amber-700',
    },
    systolic_bp: {
      icon: Activity,
      iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400',
      iconColor: 'text-indigo-500',
      borderColor: 'hover:border-indigo-300 dark:hover:border-indigo-700',
    },
    respiratory_rate: {
      icon: Wind,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
      iconColor: 'text-emerald-500',
      borderColor: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    },
  };

  const currentConfig = configs[type] || configs.heart_rate;
  const Icon = currentConfig.icon;

  const statusBadge = {
    NORMAL: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    WARNING: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 font-semibold',
    CRITICAL: 'text-rose-700 bg-rose-50 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 font-bold animate-pulse',
  }[status] || 'text-slate-600 bg-slate-100 border-slate-200';

  return (
    <div className={`saas-card p-5 ${currentConfig.borderColor} relative overflow-hidden group`}>
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 ${currentConfig.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h4>
            {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
          </div>
        </div>

        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono tracking-wide ${statusBadge}`}>
          {status}
        </span>
      </div>

      {/* Main Metric Value */}
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
          {value !== undefined && value !== null ? value : '--'}
        </span>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{unit}</span>

        {isLiveUpdating && (
          <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-cyan-600 dark:text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
            Live Stream
          </span>
        )}
      </div>

      {/* Normal Baseline Reference Footer */}
      {normalRange && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Target baseline:</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{normalRange}</span>
        </div>
      )}
    </div>
  );
};
