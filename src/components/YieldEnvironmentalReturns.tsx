import React, { useState } from 'react';
import { MicrogridConfig, OptimizationMetrics } from '../types';
import { TrendingUp, DollarSign, Trees, ShieldCheck, CheckCircle, Award, Calendar } from 'lucide-react';

interface Props {
  metrics: OptimizationMetrics;
  config: MicrogridConfig;
}

export const YieldEnvironmentalReturns: React.FC<Props> = ({ metrics, config }) => {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const daysInPeriod = period === 'month' ? 30 : period === 'quarter' ? 90 : 365;
  const periodLabel = period === 'month' ? 'Estimated Month' : period === 'quarter' ? 'Estimated Quarter' : 'Annualized';

  const projectedSavings = metrics.moneySaved * daysInPeriod;
  const projectedFeedCredits = metrics.gridExportRevenue * daysInPeriod;
  const projectedCarbonTons = ((metrics.co2SavedKg * daysInPeriod) / 1000).toFixed(2);
  const treesCount = Math.round((metrics.treesEquivalent / 365) * daysInPeriod);

  return (
    <div className="bg-[#111827]/90 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-sm flex flex-col justify-between">
      <div>
        {/* Header with period toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Award className="w-4 h-4" />
            </span>
            <h2 className="text-base font-semibold text-slate-100">Yield & Environmental Returns</h2>
          </div>

          {/* Period Pills */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-mono self-start sm:self-auto">
            <button
              onClick={() => setPeriod('month')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                period === 'month' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              30-Day
            </button>
            <button
              onClick={() => setPeriod('quarter')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                period === 'quarter' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                period === 'year' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Annual ESG
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Card 1: Projected Savings */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-md">
            <div>
              <div className="text-[11px] font-mono text-slate-400 mb-1">{periodLabel} Savings</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {config.currencySymbol}{projectedSavings.toFixed(2)}
              </div>
            </div>
            <div className="mt-2 text-[11px] text-emerald-400/90 font-mono flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{metrics.costSavingsPct}% vs grid-only</span>
            </div>
          </div>

          {/* Card 2: Utility Feed Credits */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-md">
            <div>
              <div className="text-[11px] font-mono text-slate-400 mb-1">{periodLabel} Feed Credits</div>
              <div className="text-2xl font-bold font-mono text-cyan-400">
                {config.currencySymbol}{projectedFeedCredits.toFixed(2)}
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 font-mono">
              Auto-applied to campus bill
            </div>
          </div>

          {/* Card 3: Cumulative Carbon */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-md">
            <div>
              <div className="text-[11px] font-mono text-slate-400 mb-1">Cumulative Carbon Offset</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {projectedCarbonTons} <span className="text-xs font-normal text-slate-300">Tons</span>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-emerald-300 font-mono flex items-center gap-1">
              <Trees className="w-3.5 h-3.5" />
              <span>Equiv. to {treesCount} trees planted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Microgrid Resilience Banner */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-4">
        {/* Subtle decorative background glow */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
              Microgrid Resilience
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>100% Edge Autonomous</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Campus installation has operated independently for <strong className="text-slate-100 font-semibold">14 straight days</strong> without utility fallback or grid outage vulnerabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
