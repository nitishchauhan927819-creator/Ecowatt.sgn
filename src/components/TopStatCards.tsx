import React from 'react';
import { Sun, Home, BatteryCharging, ArrowUpRight, Target, TrendingUp, Sparkles } from 'lucide-react';
import { MicrogridConfig, OptimizationMetrics } from '../types';

interface Props {
  currentSolarKw: number;
  currentDemandKw: number;
  batterySocPct: number;
  currentExportKw: number;
  metrics: OptimizationMetrics;
  config: MicrogridConfig;
}

export const TopStatCards: React.FC<Props> = ({
  currentSolarKw,
  currentDemandKw,
  batterySocPct,
  currentExportKw,
  metrics,
  config,
}) => {
  const isExporting = currentExportKw >= 0;
  const netExportDisplay = isExporting ? `+${currentExportKw.toFixed(1)}` : `${currentExportKw.toFixed(1)}`;
  const storedKwh = (config.batteryCapacityKwh * (batterySocPct / 100)).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-5">
      {/* Card 1: PV Array Solar */}
      <div className="bg-[#111827]/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              PV Array Solar
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {currentSolarKw.toFixed(1)} <span className="text-xs font-normal text-slate-400">kW</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            +18% vs prev
          </span>
        </div>

        {/* Sparkline & Detail */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div>
            Daily Peak <strong className="text-slate-200">9.8 kW</strong> @ 12:45 PM
          </div>
          {/* Decorative mini sparkline */}
          <svg className="w-12 h-5 text-amber-400" viewBox="0 0 50 20" fill="none">
            <path
              d="M 2 18 Q 15 17, 25 3 T 48 18"
              stroke="#fbbf24"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Card 2: Campus Active Draw */}
      <div className="bg-[#111827]/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              Campus Active Draw
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {currentDemandKw.toFixed(1)} <span className="text-xs font-normal text-slate-400">kW</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
            Optimized
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div>
            HVAC & Baseline • <span className="text-slate-300">1.2 kW HVAC</span>
          </div>
          <svg className="w-12 h-5 text-emerald-400" viewBox="0 0 50 20" fill="none">
            <path
              d="M 2 12 Q 12 15, 25 10 T 48 8"
              stroke="#34d399"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Card 3: PowerVault LFP Battery */}
      <div className="bg-[#111827]/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              PowerVault LFP
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 flex items-baseline gap-1.5">
              {batterySocPct}%
              <span className="text-xs font-normal text-slate-400">
                {storedKwh}/{config.batteryCapacityKwh} kWh
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Standby / Reserve
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>Discharging: <strong className="text-slate-300">0.0 kW</strong></span>
          <span>Reserve <strong className="text-emerald-400">{config.reserveSocPct}%</strong></span>
        </div>
      </div>

      {/* Card 4: Net Export */}
      <div className="bg-[#111827]/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
              Net Export
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              {netExportDisplay} <span className="text-xs font-normal text-slate-400">kW</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            Feed-in Active
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>Today Feed Credit</span>
          <span className="text-cyan-400 font-bold flex items-center">
            +{config.currencySymbol}{metrics.gridExportRevenue.toFixed(2)} Earned
          </span>
        </div>
      </div>

      {/* Card 5: Autonomous Zero-Net */}
      <div className="bg-[#111827]/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              Autonomous
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1 flex items-baseline gap-1">
              <span className="text-emerald-400">{metrics.optimizedSolarUtilPct}%</span>
              <span className="text-xs font-normal text-slate-400">Zero-Net</span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>CO₂ Offset Today</span>
          <strong className="text-emerald-400">{metrics.co2SavedKg.toFixed(1)} kg saved</strong>
        </div>
      </div>
    </div>
  );
};
