import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Activity,
  Cpu,
  Bell,
  History,
  GitFork,
  Settings,
  Home,
  ShieldCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/live', label: 'Live Telemetry', icon: Activity },
    { to: '/simulator', label: 'IoT Simulator', icon: Cpu, badge: 'Live' },
    { to: '/alerts', label: 'Clinical Alerts', icon: Bell },
    { to: '/history', label: 'Health History', icon: History },
    { to: '/architecture', label: 'Architecture', icon: GitFork },
    { to: '/settings', label: 'Thresholds', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="space-y-6">
        {/* Navigation Group */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Clinical Telemetry
            </p>
            {onClose && (
              <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800/80 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-105 text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Public Overview Link */}
        <div className="space-y-1 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Overview
          </p>
          <NavLink
            to="/"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`
            }
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Landing Page</span>
          </NavLink>
        </div>
      </div>

      {/* Educational Prototype Disclaimer Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-bold mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Final-Year CS Project</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Software-simulated IoT healthcare prototype. Not certified for clinical diagnosis.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hidden md:block min-h-[calc(100vh-4rem)] transition-colors">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <div className="relative w-64 bg-white dark:bg-slate-900 h-full shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
