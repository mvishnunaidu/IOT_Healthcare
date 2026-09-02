import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArchitectureNode } from '../types';
import {
  GitFork,
  Heart,
  Radio,
  Cpu,
  Layers,
  ShieldAlert,
  Database,
  LayoutDashboard,
  Bell,
  Code2,
  CheckCircle2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const [nodes, setNodes] = useState<ArchitectureNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node_virtual_sensors');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getArchitectureNodes()
      .then((data) => {
        setNodes(data);
        if (data.length > 0) setSelectedNodeId(data[1].id);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const nodeIcons: Record<string, any> = {
    node_patient: Heart,
    node_virtual_sensors: Radio,
    node_virtual_iot_device: Cpu,
    node_edge_processing: Layers,
    node_abnormality_detection: ShieldAlert,
    node_database_cloud: Database,
    node_healthcare_dashboard: LayoutDashboard,
    node_alert_system: Bell,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <GitFork className="w-6 h-6 text-purple-400" />
          <span>Interactive System Architecture Explorer</span>
        </h1>
        <p className="text-xs text-slate-400">
          Click any architectural layer node below to inspect its data flow contracts, underlying technology, and viva presentation notes
        </p>
      </div>

      {/* Interactive Horizontal Flow Map */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 glass-panel space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">System Pipeline Navigation</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {nodes.map((node) => {
            const Icon = nodeIcons[node.id] || Cpu;
            const isSelected = node.id === selectedNodeId;
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-xl shadow-cyan-950/50 scale-105'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 block">0{node.step}</span>
                  <span className={`text-xs font-bold leading-tight block ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {node.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Node Deep Dive Inspector */}
      {selectedNode && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Node Specifications (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 glass-panel space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                  STEP 0{selectedNode.step}
                </span>
                <h2 className="text-xl font-extrabold text-white">{selectedNode.title}</h2>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                {selectedNode.category}
              </span>
            </div>

            {/* Purpose */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Architectural Purpose</h4>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                {selectedNode.purpose}
              </p>
            </div>

            {/* Input & Output Specifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Input Data Stream</h5>
                <p className="text-xs text-slate-300">{selectedNode.input}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Output Payload</h5>
                <p className="text-xs text-slate-300">{selectedNode.output}</p>
              </div>
            </div>

            {/* Technology Stack */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Implemented Technology</h4>
              <p className="text-xs font-mono text-cyan-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                {selectedNode.technology}
              </p>
            </div>

            {/* Viva / Project Defense Talking Points */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Viva & Project Presentation Talking Points</span>
              </h4>
              <ul className="space-y-1.5">
                {selectedNode.viva_talking_points.map((tp, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{tp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Example Data Payload Inspector (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 glass-panel flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <span>Payload Contract Schema</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">JSON</span>
              </div>

              {/* JSON Code Viewer */}
              <div className="mt-4 rounded-xl bg-slate-950 p-4 border border-slate-800/80 overflow-x-auto max-h-80">
                <pre className="text-xs font-mono text-cyan-300 leading-relaxed">
                  {JSON.stringify(selectedNode.example_data, null, 2)}
                </pre>
              </div>
            </div>

            {/* Hardware replacement roadmap banner */}
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-slate-300">
              <span className="font-semibold text-purple-300 block mb-1">Physical Hardware Compatibility:</span>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Because all communications use standard HTTP JSON schemas over REST/WebSockets, an ESP32 microcontroller with physical MAX30102 / LM35 sensors can directly POST to this endpoint without modifying any backend code.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
