import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { CheckCircle, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const configs = {
          success: { icon: CheckCircle, border: 'border-emerald-500/40', bg: 'bg-emerald-950/90', text: 'text-emerald-300' },
          warning: { icon: AlertTriangle, border: 'border-amber-500/40', bg: 'bg-amber-950/90', text: 'text-amber-300' },
          error: { icon: AlertOctagon, border: 'border-rose-500/50', bg: 'bg-rose-950/90', text: 'text-rose-300' },
          info: { icon: Info, border: 'border-sky-500/40', bg: 'bg-sky-950/90', text: 'text-sky-300' },
        }[t.type];

        const Icon = configs.icon;

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all animate-slide-in ${configs.bg} ${configs.border}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${configs.text}`} />
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">{t.title}</h5>
              <p className="text-xs text-slate-300 mt-0.5 break-words">{t.message}</p>
              <span className="text-[10px] text-slate-500 mt-1 block">{t.timestamp}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
