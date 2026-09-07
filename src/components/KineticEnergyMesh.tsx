import React, { useState } from 'react';
import { Sun, Zap, Home, Grid, BatteryCharging, ArrowUpRight, Activity } from 'lucide-react';
import { MicrogridConfig } from '../types';

interface Props {
  solarKw: number;
  homeLoadKw: number;
  batterySocPct: number;
  batteryPowerKw: number;
  gridExportKw: number;
  config: MicrogridConfig;
  onInspectNode?: (nodeId: 'pv' | 'hub' | 'loads' | 'grid') => void;
}

export const KineticEnergyMesh: React.FC<Props> = ({
  solarKw,
  homeLoadKw,
  batterySocPct,
  gridExportKw,
  config,
  onInspectNode,
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'Realtime' | '1H' | '24H' | '7D' | '30D'>('Realtime');
  const [activeNode, setActiveNode] = useState<string | null>(null);

  // Horizon multiplier for dynamic numbers
  const horizonMultiplier = 
    selectedHorizon === 'Realtime' ? 1 :
    selectedHorizon === '1H' ? 1 :
    selectedHorizon === '24H' ? 6.2 :
    selectedHorizon === '7D' ? 43.4 : 186.0;

  const unitLabel = selectedHorizon === 'Realtime' ? 'kW' : 'kWh';

  const dispSolar = (solarKw * horizonMultiplier).toFixed(1);
  const dispLoads = (homeLoadKw * horizonMultiplier).toFixed(1);
  const dispExportVal = gridExportKw * horizonMultiplier;
  const isExporting = dispExportVal >= 0;
  const netExportDisplay = isExporting ? `+${dispExportVal.toFixed(1)}` : `${dispExportVal.toFixed(1)}`;

  const handleNodeClick = (node: 'pv' | 'hub' | 'loads' | 'grid') => {
    setActiveNode(node);
    if (onInspectNode) {
      onInspectNode(node);
    }
  };

  return (
    <div className="bg-[#111827]/90 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-ping absolute top-0 left-0"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Kinetic Energy Mesh
              <span className="text-[10px] tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono">
                Active Matrix
              </span>
            </h2>
            <p className="text-xs text-slate-400">Bidirectional multi-node dispatch at 100ms telemetry cadence</p>
          </div>
        </div>

        {/* Time horizon pill toggles */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-xs self-start sm:self-auto font-mono">
          {(['Realtime', '1H', '24H', '7D', '30D'] as const).map((horizon) => (
            <button
              key={horizon}
              onClick={() => setSelectedHorizon(horizon)}
              className={`px-2.5 py-1 rounded-lg transition-all duration-200 ${
                selectedHorizon === horizon
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {horizon}
            </button>
          ))}
        </div>
      </div>

      {/* Mesh Canvas Container */}
      <div className="relative min-h-[300px] w-full flex items-center justify-center py-4 select-none">
        {/* Animated Connecting SVG Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 700 280" fill="none">
          <defs>
            <linearGradient id="pvToHub" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="hubToLoads" x1="0%" y1="50%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="hubToGrid" x1="0%" y1="50%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* PV to EcoHub Path */}
          <path
            d="M 180 140 C 260 140, 290 140, 350 140"
            stroke="url(#pvToHub)"
            strokeWidth="3.5"
            strokeDasharray="6,6"
            className="animate-dash-flow"
          />

          {/* EcoHub to Campus Loads Path */}
          <path
            d="M 370 120 C 420 80, 480 70, 540 70"
            stroke="url(#hubToLoads)"
            strokeWidth="3.5"
            strokeDasharray="6,6"
            className="animate-dash-flow"
          />

          {/* EcoHub to Regional Grid Path */}
          <path
            d="M 370 160 C 420 200, 480 210, 540 210"
            stroke="url(#hubToGrid)"
            strokeWidth="3.5"
            strokeDasharray="6,6"
            className="animate-dash-flow-fast"
          />
        </svg>

        {/* Nodes Grid */}
        <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10 px-2 sm:px-6">
          {/* Node 1: Rooftop PV Array (Left) */}
          <div
            onClick={() => handleNodeClick('pv')}
            className={`cursor-pointer transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border ${
              activeNode === 'pv' ? 'border-amber-400 ring-2 ring-amber-500/30' : 'border-amber-500/30 hover:border-amber-400/60'
            } text-center shadow-lg relative group`}
            title="Click to view detailed PV Array telemetry"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2 shadow-inner group-hover:bg-amber-500/20 transition-colors">
              <Sun className="w-7 h-7" />
            </div>
            <div className="font-mono text-2xl font-bold text-amber-400 tracking-tight">
              {dispSolar} <span className="text-xs font-normal text-amber-300/80">{unitLabel}</span>
            </div>
            <h3 className="text-xs font-semibold text-slate-200 mt-0.5">Rooftop Solar Array</h3>
            <p className="text-[11px] text-amber-400/80 font-mono">32 Monocrystalline 400W</p>
            <span className="text-[9px] text-slate-500 group-hover:text-amber-300 mt-1 transition-colors">Click to inspect</span>
          </div>

          {/* Node 2: EcoHub Hybrid Inverter & PowerVault (Center) */}
          <div
            onClick={() => handleNodeClick('hub')}
            className={`cursor-pointer transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center p-5 rounded-3xl bg-slate-900/95 border ${
              activeNode === 'hub' ? 'border-emerald-400 ring-2 ring-emerald-500/40' : 'border-emerald-500/40 hover:border-emerald-400/70'
            } text-center shadow-2xl relative group`}
            title="Click to view EcoHub Inverter & Battery diagnostics"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/50 flex flex-col items-center justify-center text-emerald-400 mb-2.5 animate-pulse-glow">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              EcoHub Core
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">98.4% Eff</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">Hybrid Inverter • MPPT Active</p>

            {/* Battery Status Pill */}
            <div className="mt-3 w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2 flex items-center justify-between text-left">
              <div className="flex items-center space-x-2">
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 font-mono">{batterySocPct}%</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {(config.batteryCapacityKwh * (batterySocPct / 100)).toFixed(1)} / {config.batteryCapacityKwh} kWh
              </div>
            </div>
            <span className="text-[9px] text-slate-500 group-hover:text-emerald-300 mt-1 transition-colors">Click to inspect</span>
          </div>

          {/* Right Column: Campus Loads & Regional Grid */}
          <div className="flex flex-col space-y-4">
            {/* Node 3: Home / Campus Loads */}
            <div
              onClick={() => handleNodeClick('loads')}
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border ${
                activeNode === 'loads' ? 'border-emerald-400 ring-2 ring-emerald-500/30' : 'border-emerald-500/30 hover:border-emerald-400/60'
              } shadow-lg group`}
              title="Click to view Campus circuits & load shedding"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Home className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-200">Campus Loads</div>
                  <div className="text-[10px] text-emerald-400 font-mono">100% Green Powered</div>
                  <span className="text-[9px] text-slate-500 group-hover:text-emerald-300 transition-colors">Click to inspect</span>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-lg font-bold text-emerald-400">
                  {dispLoads} <span className="text-[10px] font-normal">{unitLabel}</span>
                </div>
                <div className="text-[10px] text-slate-400">Active Demand</div>
              </div>
            </div>

            {/* Node 4: Regional Grid */}
            <div
              onClick={() => handleNodeClick('grid')}
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border ${
                activeNode === 'grid' ? 'border-cyan-400 ring-2 ring-cyan-500/30' : 'border-cyan-500/30 hover:border-cyan-400/60'
              } shadow-lg group`}
              title="Click to view Regional Grid & Islanding telemetry"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Grid className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-200">Regional Grid</div>
                  <div className="text-[10px] text-cyan-400 font-mono">
                    {config.currencySymbol}{config.feedInCreditRatePerKwh.toFixed(2)}/kWh Feed-in
                  </div>
                  <span className="text-[9px] text-slate-500 group-hover:text-cyan-300 transition-colors">Click to inspect</span>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-lg font-bold text-cyan-400 flex items-center justify-end">
                  {netExportDisplay} <span className="text-[10px] font-normal ml-0.5">{unitLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 text-cyan-400" />
                </div>
                <div className="text-[10px] text-slate-400">Net Export Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry strip at bottom */}
      <div className="mt-2 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Synchronized Telemetry: Phase A/B/C In-Phase (60.02 Hz)</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-slate-300">Net Power Factor: <strong className="text-emerald-400">0.99</strong></span>
          <span className="text-slate-300">Inverter Temp: <strong className="text-slate-200">38.4°C</strong></span>
        </div>
      </div>
    </div>
  );
};
