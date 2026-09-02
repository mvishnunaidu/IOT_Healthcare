import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useNotification();

  const [email, setEmail] = useState('doctor@hospital.org');
  const [password, setPassword] = useState('doctor123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      addToast('success', 'Authentication Successful', 'Logged in as healthcare practitioner');
      navigate('/dashboard');
    } catch (err: any) {
      addToast('error', 'Authentication Failed', err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (role: 'doctor' | 'nurse') => {
    if (role === 'doctor') {
      setEmail('doctor@hospital.org');
      setPassword('doctor123');
    } else {
      setEmail('nurse@hospital.org');
      setPassword('nurse123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl glass-panel space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-950/50">
            <Activity className="w-7 h-7 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Clinical Staff Sign In</h2>
          <p className="text-xs text-slate-400">Access real-time patient telemetry and abnormality alert feeds</p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 block">Quick Demo Login:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('doctor')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-medium hover:bg-cyan-900/60 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Dr. Sameer Verma</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('nurse')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/60 border border-sky-800/40 text-sky-300 text-xs font-medium hover:bg-sky-900/60 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Nurse Ananya</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Healthcare Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.org"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-slate-400 hover:text-cyan-400 transition-colors">
            ← Return to Overview Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
};
