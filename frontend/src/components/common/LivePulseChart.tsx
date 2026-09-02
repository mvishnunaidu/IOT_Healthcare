import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { HealthReading } from '../../types';

interface LivePulseChartProps {
  readings: HealthReading[];
  height?: number;
}

export const LivePulseChart: React.FC<LivePulseChartProps> = ({ readings, height = 300 }) => {
  const [selectedMetric, setSelectedMetric] = useState<'heart_rate' | 'spo2' | 'temperature'>('heart_rate');

  const metricConfigs = {
    heart_rate: {
      name: 'Heart Rate',
      unit: 'BPM',
      color: '#ef4444',
      gradientId: 'hrGradient',
      normalMin: 60,
      normalMax: 100,
      domain: [40, 160],
    },
    spo2: {
      name: 'SpO2 Oxygen',
      unit: '%',
      color: '#06b6d4',
      gradientId: 'spo2Gradient',
      normalMin: 95,
      normalMax: 100,
      domain: [80, 100],
    },
    temperature: {
      name: 'Temperature',
      unit: '°C',
      color: '#f59e0b',
      gradientId: 'tempGradient',
      normalMin: 36.5,
      normalMax: 37.5,
      domain: [34.5, 41.0],
    },
  };

  const activeConf = metricConfigs[selectedMetric];

  // Format data for Recharts
  const chartData = readings.map((r, idx) => {
    const timeStr = r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `#${idx + 1}`;
    return {
      time: timeStr,
      heart_rate: r.heart_rate,
      spo2: r.spo2,
      temperature: r.temperature,
      status: r.status,
    };
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 glass-panel">
      {/* Chart Header & Metric Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Continuous Physiological Waveform</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </h3>
          <p className="text-xs text-slate-400">Live telemetry time-series streamed from edge gateway</p>
        </div>

        {/* Tab Controls */}
        <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
          {(['heart_rate', 'spo2', 'temperature'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMetric(m)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                selectedMetric === m
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {metricConfigs[m].name}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ width: '100%', height }}>
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Awaiting incoming telemetry packets...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={activeConf.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeConf.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={activeConf.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
              />
              <YAxis
                domain={activeConf.domain}
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                unit={` ${activeConf.unit}`}
              />

              {/* Threshold indicator lines */}
              <ReferenceLine y={activeConf.normalMin} stroke="#10b981" strokeDasharray="3 3" opacity={0.4} />
              <ReferenceLine y={activeConf.normalMax} stroke="#10b981" strokeDasharray="3 3" opacity={0.4} />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md">
                        <p className="text-xs text-slate-400 mb-1">{label}</p>
                        <p className="text-sm font-bold text-white">
                          {activeConf.name}:{' '}
                          <span style={{ color: activeConf.color }}>
                            {data[selectedMetric]} {activeConf.unit}
                          </span>
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs">
                          <span className="text-slate-400">Status:</span>
                          <span className={data.status === 'CRITICAL' ? 'text-rose-400 font-bold' : data.status === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'}>
                            {data.status}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={activeConf.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${activeConf.gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
