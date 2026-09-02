import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLiveVitals } from '../../context/WebSocketContext';
import { useTheme } from '../../context/ThemeContext';
import { Activity, Wifi, WifiOff, Bell, Sun, Moon, LogOut, Search, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isConnected, latestAlert } = useLiveVitals();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 sm:px-6 backdrop-blur-md transition-colors">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-cyan-600 text-white shadow-md shadow-cyan-600/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">HealthGuard</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-mono">
                IoT
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block -mt-0.5">Clinical Telemetry System</span>
          </div>
        </Link>
      </div>

      {/* Center Search Input */}
      <div className="hidden md:flex items-center max-w-xs w-full relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search patients, rooms, vitals..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Stream Status Indicator */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
          isConnected
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
        }`}>
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ONLINE</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">OFFLINE</span>
            </>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Alerts Link */}
        <Link
          to="/alerts"
          className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Clinical Alerts"
        >
          <Bell className="w-4 h-4" />
          {latestAlert && !latestAlert.resolved && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
          )}
        </Link>

        {/* User Account / Staff Sign In */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-cyan-600/10 dark:bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-300 font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block leading-tight">{user.name}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{user.role}</span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Staff Login
          </Link>
        )}
      </div>
    </header>
  );
};
