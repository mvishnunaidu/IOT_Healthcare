import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Cpu,
  ShieldAlert,
  ArrowRight,
  Heart,
  Radio,
  Layers,
  Sparkles,
  Database,
  LayoutDashboard,
  Bell,
  CheckCircle2,
  TrendingUp,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const pipelineSteps = [
    { step: 1, title: 'Patient', desc: 'Clinical subject & vitals profile', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/40' },
    { step: 2, title: 'Sensors', desc: 'PPG, Temp & SpO2 generators', icon: Radio, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/40' },
    { step: 3, title: 'IoT Device', desc: 'ESP32 standardized frame builder', icon: Cpu, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { step: 4, title: 'Edge Layer', desc: 'Boundary checks & noise cleaning', icon: Layers, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { step: 5, title: 'Detection', desc: 'Multi-tier rule & ML anomaly check', icon: ShieldAlert, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40' },
    { step: 6, title: 'Cloud DB', desc: 'Relational persistence & indexing', icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { step: 7, title: 'Dashboard', desc: 'WebSocket live telemetry stream', icon: LayoutDashboard, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/40' },
    { step: 8, title: 'Alerts', desc: 'Clinical alarm triage & dispatch', icon: Bell, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/40' },
  ];

  return (
    <div className="space-y-16 pb-16 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="pt-8 pb-10 text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Final-Year Computer Science Project</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-3xl mx-auto">
          IoT-Enabled Healthcare Monitoring
        </h1>

        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Real-time patient monitoring, abnormality detection, and intelligent healthcare alerts through a software-based IoT simulation.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all"
          >
            <span>Explore Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/architecture"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 transition-all shadow-sm"
          >
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>View System Architecture</span>
          </Link>
        </div>
      </section>

      {/* How It Works Pipeline Diagram */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">How It Works</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            End-to-end telemetry flow from simulated biological waveforms to reactive clinical triage.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {pipelineSteps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="saas-card p-4 flex flex-col items-center text-center group hover:border-cyan-400 transition-all"
              >
                <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} mb-2.5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 mb-0.5">0{item.step}</span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{item.title}</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5 Core Feature Highlights */}
      <section className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Core System Capabilities</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="saas-card p-5 space-y-2.5">
            <div className="p-2.5 w-fit rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Real-Time Monitoring</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Bi-directional WebSocket streaming feeds live waveforms and vital stats directly into reactive dashboard charts without page refreshes.
            </p>
          </div>

          <div className="saas-card p-5 space-y-2.5">
            <div className="p-2.5 w-fit rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Virtual IoT Simulation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Synthesizes realistic biometric waveforms with natural stochastic micro-variations, supporting Normal, Warning, Critical, and Custom modes.
            </p>
          </div>

          <div className="saas-card p-5 space-y-2.5">
            <div className="p-2.5 w-fit rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Abnormality Detection</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Configurable multi-tier clinical threshold matrix evaluates vitals into Normal, Warning, and Critical states with actionable recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Software-Only Prototype Explanation Section */}
      <section className="saas-card p-6 sm:p-8 bg-slate-900 text-white space-y-3 dark:bg-slate-900 border-slate-800">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>Software-Only Simulation Prototype</span>
        </div>
        <h3 className="text-lg font-bold text-white">Future Hardware Compatibility</h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          This system uses standardized HTTP JSON payload contracts and WebSockets. A physical microcontroller (such as an ESP32 or Raspberry Pi) with hardware sensors (e.g. MAX30102 Pulse Oximeter, DS18B20 Temp) can transmit data directly to the `/api/readings` endpoint without modifying any backend or dashboard code.
        </p>
      </section>
    </div>
  );
};
