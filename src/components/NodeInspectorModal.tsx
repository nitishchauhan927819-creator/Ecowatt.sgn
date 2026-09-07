import React, { useState } from 'react';
import { 
  X, 
  Sun, 
  Zap, 
  Home, 
  Grid, 
  BatteryCharging, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Sliders, 
  Power,
  Flame,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { MicrogridConfig } from '../types';

interface Props {
  nodeId: 'pv' | 'hub' | 'loads' | 'grid' | null;
  onClose: () => void;
  solarKw: number;
  homeLoadKw: number;
  batterySocPct: number;
  gridExportKw: number;
  config: MicrogridConfig;
  onSimulateOutage?: () => void;
  onIsolateLoads?: () => void;
}

export const NodeInspectorModal: React.FC<Props> = ({
  nodeId,
  onClose,
  solarKw,
  homeLoadKw,
  batterySocPct,
  gridExportKw,
  config,
  onSimulateOutage,
  onIsolateLoads,
}) => {
  const [panelWiped, setPanelWiped] = useState(false);
  const [mpptTracing, setMpptTracing] = useState(false);
  const [inverterTesting, setInverterTesting] = useState(false);
  const [isIslanded, setIsIslanded] = useState(false);
  const [loadShedActive, setLoadShedActive] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!nodeId) return null;

  const triggerAction = (msg: string, actionFn?: () => void) => {
    if (actionFn) actionFn();
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            {nodeId === 'pv' && (
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Sun className="w-5 h-5" />
              </div>
            )}
            {nodeId === 'hub' && (
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
            )}
            {nodeId === 'loads' && (
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Home className="w-5 h-5" />
              </div>
            )}
            {nodeId === 'grid' && (
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Grid className="w-5 h-5" />
              </div>
            )}

            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                {nodeId === 'pv' && 'Rooftop PV Array Telemetry'}
                {nodeId === 'hub' && 'EcoHub Hybrid Inverter & Storage'}
                {nodeId === 'loads' && 'Campus Load Distribution Center'}
                {nodeId === 'grid' && 'Regional Grid Interconnection (PCC)'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Online
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Sub-millisecond node state & real-time actuator control
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action feedback toast */}
        {actionSuccessMsg && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-4 py-2 text-emerald-300 flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Content depending on node */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 1. PV ARRAY NODE */}
          {nodeId === 'pv' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Solar Output</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">{solarKw.toFixed(1)} kW</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">DC Bus Voltage</div>
                  <div className="text-lg font-bold text-slate-100 mt-0.5">384.2 V</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Solar Irradiance</div>
                  <div className="text-lg font-bold text-slate-100 mt-0.5">862 W/m²</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Array Temp</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">41.8°C</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-semibold text-slate-200">String Inverter MPPT Trackers:</div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>String 1 (East Wing • 16x 400W):</span>
                  <span className="text-emerald-400 font-bold">192.1 V @ 18.2 A (3.5 kW)</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>String 2 (West Wing • 16x 400W):</span>
                  <span className="text-emerald-400 font-bold">192.1 V @ 17.8 A (3.4 kW)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Interactive Node Commands
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMpptTracing(true);
                      setTimeout(() => {
                        setMpptTracing(false);
                        triggerAction('MPPT Fast Sweep Completed: Peak power operating point locked.');
                      }, 800);
                    }}
                    disabled={mpptTracing}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${mpptTracing ? 'animate-spin text-amber-400' : ''}`} />
                    <span>{mpptTracing ? 'Sweeping...' : 'Run MPPT Sweep'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setPanelWiped(true);
                      triggerAction('Automated sprinkler dust sweep executed! +4.2% irradiance gain.');
                    }}
                    className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{panelWiped ? 'Panels Washed' : 'Dust Wash Sprinklers'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. ECOHUB INVERTER & BATTERY NODE */}
          {nodeId === 'hub' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Battery SOC</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">{batterySocPct}%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Inverter Eff.</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">98.4%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">AC Frequency</div>
                  <div className="text-lg font-bold text-slate-100 mt-0.5">60.02 Hz</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Core Temp</div>
                  <div className="text-lg font-bold text-slate-100 mt-0.5">38.4°C</div>
                </div>
              </div>

              {/* Battery cell status */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200">15 kWh LFP PowerVault:</span>
                  <span className="text-emerald-400 font-bold">16S Cell Balancer OK</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Cell Max Delta:</span>
                  <span className="text-slate-200 font-mono">6 mV (Nominal &lt; 25mV)</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Cycle Count:</span>
                  <span className="text-slate-200 font-mono">248 cycles (99.4% SOH)</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Minimum Reserve Buffer:</span>
                  <span className="text-emerald-400 font-mono">{config.reserveSocPct}% (Emergency Hold)</span>
                </div>
              </div>

              {/* Interactive Inverter Controls */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Actuator & Inverter Commands
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setInverterTesting(true);
                      setTimeout(() => {
                        setInverterTesting(false);
                        triggerAction('Hybrid Inverter Self-Diagnostic Passed: 0 faults, relay OK.');
                      }, 800);
                    }}
                    disabled={inverterTesting}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1.5"
                  >
                    <Activity className={`w-3.5 h-3.5 ${inverterTesting ? 'animate-spin text-emerald-400' : ''}`} />
                    <span>{inverterTesting ? 'Diagnosing...' : 'Inverter Self-Test'}</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerAction('Battery Equalization Scheduled for 02:00 AM off-peak.');
                    }}
                    className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 flex items-center justify-center gap-1.5"
                  >
                    <BatteryCharging className="w-3.5 h-3.5" />
                    <span>Run Cell Balance</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. CAMPUS LOADS NODE */}
          {nodeId === 'loads' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Total Active Draw</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">{homeLoadKw.toFixed(1)} kW</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Power Factor</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">0.99</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Clean Power Ratio</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">100%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Phase Unbalance</div>
                  <div className="text-lg font-bold text-slate-100 mt-0.5">0.8%</div>
                </div>
              </div>

              {/* Sub-circuits breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-semibold text-slate-200">Main Campus Sub-Circuits:</div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>EV Fleet Charger Relay (3.6 kW):</span>
                  <span className="text-emerald-400 font-mono">Running (Solar Synced)</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>HVAC Thermal Storage (2.8 kW):</span>
                  <span className="text-emerald-400 font-mono">Pre-Cooling Active</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Water Pump Sub-circuit (4.0 kW):</span>
                  <span className="text-cyan-400 font-mono">Scheduled @ 13:00</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Baseline Critical Lighting & Servers:</span>
                  <span className="text-slate-200 font-mono">2.1 kW Constant</span>
                </div>
              </div>

              {/* Load commands */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Campus Circuit Controls
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const nextState = !loadShedActive;
                      setLoadShedActive(nextState);
                      triggerAction(
                        nextState
                          ? 'Priority Load Shedding Active: Non-essential dorm laundry paused.'
                          : 'Load Shedding Deactivated: Normal automated dispatch restored.'
                      );
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                      loadShedActive
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{loadShedActive ? 'Cancel Load Shed' : 'Shed Non-Critical Loads'}</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerAction('All 5 smart relays pinged: Response latency 12ms, 0 packet loss.');
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ping Smart Relays</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. REGIONAL GRID NODE */}
          {nodeId === 'grid' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Net Export Power</div>
                  <div className="text-lg font-bold text-cyan-400 mt-0.5">
                    {gridExportKw >= 0 ? `+${gridExportKw.toFixed(1)}` : `${gridExportKw.toFixed(1)}`} kW
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Feed-In Tariff</div>
                  <div className="text-lg font-bold text-slate-100 mt-0.5">
                    {config.currencySymbol}{config.feedInCreditRatePerKwh.toFixed(2)}/kWh
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Grid Interconnect</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    {isIslanded ? 'ISLANDED' : 'SYNCHRONIZED'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Grid Carbon Int.</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">
                    {config.carbonEmissionFactorKgPerKwh} kg/kWh
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200">Point of Common Coupling (PCC):</span>
                  <span className="text-cyan-400 font-mono">IEEE 1547-2018 Compliant</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Reverse Power Relay (32):</span>
                  <span className="text-emerald-400 font-mono">Permitted (Export Mode)</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Anti-Islanding Protection:</span>
                  <span className="text-emerald-400 font-mono">Active (Frequency Shift)</span>
                </div>
              </div>

              {/* Grid commands */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Grid Interconnect Controls
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const next = !isIslanded;
                      setIsIslanded(next);
                      triggerAction(
                        next
                          ? 'Microgrid Islanded! Isolated from regional grid. PowerVault forming 60Hz reference.'
                          : 'Microgrid Reconnected to Regional Grid! Smooth phase lock established.'
                      );
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                      isIslanded
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{isIslanded ? 'Re-Sync With Grid' : 'Test Microgrid Islanding'}</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerAction('Utility Smart Meter Pinged: Export verified with regional utility.');
                    }}
                    className="p-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 flex items-center justify-center gap-1.5"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Sync Smart Meter</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 flex justify-end bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
