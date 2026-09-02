import React from 'react';
import { VitalStatus } from '../../types';
import { CheckCircle2, AlertTriangle, AlertOctagon, Activity } from 'lucide-react';

interface StatusBadgeProps {
  status?: VitalStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = 'NORMAL',
  size = 'md',
  showIcon = true,
}) => {
  const normStatus = (status || 'NORMAL').toUpperCase();

  const configs: Record<string, { bg: string; text: string; border: string; dot: string; icon: any; label: string }> = {
    NORMAL: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300 font-semibold',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      label: 'NORMAL',
    },
    WARNING: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300 font-semibold',
      border: 'border-amber-200 dark:border-amber-800/60',
      dot: 'bg-amber-500 animate-pulse',
      icon: AlertTriangle,
      label: 'WARNING',
    },
    CRITICAL: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300 font-bold',
      border: 'border-rose-300 dark:border-rose-800/80 shadow-sm shadow-rose-500/10',
      dot: 'bg-rose-600 animate-ping',
      icon: AlertOctagon,
      label: 'CRITICAL',
    },
  };

  const current = configs[normStatus] || {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300 font-medium',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
    icon: Activity,
    label: normStatus,
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  }[size];

  const IconComponent = current.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {showIcon && <IconComponent className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span className="tracking-wide uppercase">{current.label}</span>
    </span>
  );
};
