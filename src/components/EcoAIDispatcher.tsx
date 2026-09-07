import React, { useState } from 'react';
import { Sparkles, Sun, Zap, Battery, ArrowRight, CheckCircle2, RotateCw, AlertCircle } from 'lucide-react';
import { MicrogridConfig, OptimizationMetrics } from '../types';
import confetti from 'canvas-confetti';

interface Props {
  metrics: OptimizationMetrics;
  config: MicrogridConfig;
  optimalSolarWindow: {
    startHour: number;
    endHour: number;
    peakHour: number;
    peakSurplusKw: number;
  };
  onOptimizeClick: () => void;
  isOptimizing: boolean;
  lastOptimizedTime: string | null;
  onSimulateCloudStress?: () => void;
}

export const EcoAIDispatcher: React.FC<Props> = ({
  metrics,
  config,
  optimalSolarWindow,
  onOptimizeClick,
  isOptimizing,
  lastOptimizedTime,
  onSimulateCloudStress,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [stressActive, setStressActive] = useState(false);

  const handleRunOptimizer = () => {
    onOptimizeClick();
    // Trigger celebratory microgrid confetti
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#f59e0b', '#06b6d4', '#34d399'],
    });
  };

  const handleStressToggle = () => {
    setStressActive(!stressActive);
    if (onSimulateCloudStress) {
      onSimulateCloudStress();
    }
  };

  const startFormatted = `${optimalSolarWindow.startHour.toString().padStart(2, '0')}:00`;
  const endFormatted = `${optimalSolarWindow.endHour.toString().padStart(2, '0')}:00`;

  return (
    <div className="bg-[#111827]/90 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-sm flex flex-col justify-between relative overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-slate-100">EcoAI Dispatcher</h2>
          </div>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider font-semibold transition-colors"
            title="View MILP mathematical formulation"
          >
            {showExplanation ? 'Hide MILP Specs' : 'MILP Formulation'}
          </button>
        </div>

        {/* Expandable Mathematical formulation */}
        {showExplanation && (
          <div className="mb-4 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono space-y-2 text-slate-300">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> PuLP Mixed-Integer Linear Programming Formulation:
            </div>
            <p className="text-slate-400">
              <strong>Objective:</strong> Minimize Total Cost = Σ_t (Tariff_t × GridImport_t - FeedInRate × GridExport_t)
            </p>
            <p className="text-slate-400">
              <strong>Subject to:</strong>
              <br />• Deferrable load start: Earliest_i ≤ Start_i ≤ Latest_i - Duration_i
              <br />• Continuity: Load runs uninterrupted for Duration_i
              <br />• Microgrid Balance: Solar_t + BatteryDischarge_t + GridImport_t = Demand_t + BatteryCharge_t + GridExport_t
              <br />• Storage limits: ReserveBuffer ({config.reserveSocPct}%) ≤ SOC_t ≤ 100%
            </p>
          </div>
        )}

        {/* Optimal Solar Window Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-4 relative">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 shadow-inner">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                Optimal Solar Window
                <span className="text-[10px] text-amber-400 font-mono font-normal">
                  (+{optimalSolarWindow.peakSurplusKw.toFixed(1)} kW Surplus)
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Surplus peak forecast between{' '}
                <strong className="text-amber-400 font-semibold font-mono">
                  {startFormatted} – {endFormatted}
                </strong>
                . Schedule high-draw washing, pumping & EV cycles here to utilize 100% free green power.
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Solar Absorption Rate:</span>
            <strong className="text-emerald-400">{metrics.optimizedSolarUtilPct}%</strong>
          </div>
        </div>

        {/* Big Action Button (Matching Screenshot) */}
        <div className="space-y-2">
          <button
            onClick={handleRunOptimizer}
            disabled={isOptimizing}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
              isOptimizing
                ? 'bg-emerald-600/70 text-slate-950 cursor-wait'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-[0.99]'
            }`}
          >
            {isOptimizing ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Solving Mixed-Integer Linear Schedule...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Auto-Schedule Appliances Now</span>
              </>
            )}
          </button>

          {/* Stress test simulator button */}
          <button
            onClick={handleStressToggle}
            className={`w-full py-2 px-3 rounded-xl font-mono text-xs flex items-center justify-center gap-2 transition-colors border ${
              stressActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900/90 hover:bg-slate-850 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            title="Simulate sudden cloud cover drop to test dynamic load resilience"
          >
            <RotateCw className={`w-3.5 h-3.5 ${stressActive ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span>{stressActive ? 'Cloud Cover Stress Active (50% Solar)' : 'Simulate Cloud Cover Stress Test'}</span>
          </button>
        </div>

        {/* Battery Reserve Level Note */}
        <div className="mt-4 flex items-start space-x-2.5 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <Battery className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="text-slate-200 font-medium">Battery Reserve Level:</span> PowerVault scheduled to supply evening peak (18:00 – 21:00) while safeguarding {config.reserveSocPct}% minimum emergency buffer.
          </div>
        </div>
      </div>

      {/* Footer Model Telemetry */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Forecast Model v4.2.1</span>
        </div>
        <div>
          {lastOptimizedTime ? (
            <span className="text-slate-400">Run: {lastOptimizedTime}</span>
          ) : (
            <span className="text-slate-500">Telemetry Live</span>
          )}
        </div>
      </div>
    </div>
  );
};
