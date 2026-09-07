import React, { useState } from 'react';
import { OptimizationMetrics, MicrogridConfig, DeferrableLoad } from '../types';
import { 
  TrendingDown, 
  Leaf, 
  Sun, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  Trees, 
  Zap, 
  Sparkles,
  BarChart3,
  Scale,
  Download,
  Printer,
  Copy,
  Check
} from 'lucide-react';

interface Props {
  metrics: OptimizationMetrics;
  config: MicrogridConfig;
  loads: DeferrableLoad[];
}

export const SavingsAndImpactSection: React.FC<Props> = ({ metrics, config, loads }) => {
  const [copied, setCopied] = useState(false);

  // Generate and download CSV
  const handleExportCSV = () => {
    const headers = ['Load ID', 'Appliance Name', 'Power (kW)', 'Duration (Hours)', 'Earliest Start', 'Latest Finish', 'Original Start', 'Optimized Start', 'Status'];
    const rows = loads.map(l => [
      l.id,
      `"${l.name}"`,
      l.powerKw,
      l.durationHours,
      `${l.earliestStart}:00`,
      `${l.latestFinish}:00`,
      `${l.originalStart}:00`,
      `${l.optimizedStart}:00`,
      l.enabled ? 'Automated' : 'Bypassed'
    ]);

    const summaryRows = [
      [],
      ['Metric', 'Before Optimization', 'After Optimization', 'Savings / Delta'],
      ['Daily Cost', `${config.currencySymbol}${metrics.originalCost.toFixed(2)}`, `${config.currencySymbol}${metrics.optimizedCost.toFixed(2)}`, `-${metrics.costSavingsPct}% (${config.currencySymbol}${metrics.moneySaved.toFixed(2)})`],
      ['Daily CO2 Emissions', `${metrics.originalEmissionsKg.toFixed(1)} kg`, `${metrics.optimizedEmissionsKg.toFixed(1)} kg`, `-${metrics.emissionsReductionPct}% (${metrics.co2SavedKg.toFixed(1)} kg)`],
      ['Solar Utilization', `${metrics.originalSolarUtilPct}%`, `${metrics.optimizedSolarUtilPct}%`, `+${metrics.solarWastedSavedKwh.toFixed(1)} kWh`],
      ['Export Revenue', '$0.00', `${config.currencySymbol}${metrics.gridExportRevenue.toFixed(2)}`, `${config.currencySymbol}${metrics.gridExportRevenue.toFixed(2)}`],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(r => r.join(',')), ...summaryRows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecowatt_optimization_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Executive Summary to clipboard
  const handleCopySummary = async () => {
    const summaryText = `🌿 EcoWatt Optimization Report - ${config.campusName}
Date: ${new Date().toLocaleDateString()}
Daily Cost: ${config.currencySymbol}${metrics.optimizedCost.toFixed(2)} (Saved ${metrics.costSavingsPct}%, ${config.currencySymbol}${metrics.moneySaved.toFixed(2)}/day)
CO2 Emissions: ${metrics.optimizedEmissionsKg.toFixed(1)} kg CO2 (Reduced ${metrics.emissionsReductionPct}%, ${metrics.co2SavedKg.toFixed(1)} kg saved)
Solar Utilization: ${metrics.optimizedSolarUtilPct}% (+${metrics.solarWastedSavedKwh.toFixed(1)} kWh captured)
Equivalent Trees Planted: ${Math.round(metrics.treesEquivalent)} trees/yr`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Clipboard copy failed', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="impact-section" className="bg-[#111827]/90 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Before vs After Optimization Scorecard
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Direct mathematical proof: Moving deferrable loads under the solar curve
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 transition-colors"
            title="Copy high-level audit summary to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-mono text-emerald-300 transition-colors font-semibold shadow-sm"
            title="Export CSV dispatch log for spreadsheet auditing"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 transition-colors"
            title="Print or save as PDF certificate"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Audit</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Column 1: Before Optimization (Original Schedule) */}
        <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30">
              Before Optimization (Unshifted)
            </span>
            <span className="text-xs text-rose-300/80 font-mono">High Grid Import</span>
          </div>

          <div className="space-y-4 font-mono">
            {/* Electricity Cost */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Daily Electricity Cost</div>
              <div className="text-2xl font-bold text-rose-400 mt-0.5">
                {config.currencySymbol}{metrics.originalCost.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Loads hit peak tariff ($0.34/₹14.5)</div>
            </div>

            {/* Carbon Emissions */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Carbon Emissions (Daily)</div>
              <div className="text-2xl font-bold text-rose-400 mt-0.5">
                {metrics.originalEmissionsKg.toFixed(1)} <span className="text-sm font-normal">kg CO₂</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Coal-fired grid power consumed</div>
            </div>

            {/* Solar Utilized */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Solar Energy Utilized</div>
              <div className="text-2xl font-bold text-amber-400 mt-0.5">
                {metrics.originalSolarUtilPct}%
              </div>
              <div className="text-[11px] text-rose-400/80 mt-1">
                Excess solar curtailed / low feed-in return
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: After Optimization (EcoWatt Schedule) */}
        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 relative shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
              After Optimization (EcoWatt Solved)
            </span>
            <span className="text-xs text-emerald-300 font-mono">100% Solar Synchronized</span>
          </div>

          <div className="space-y-4 font-mono">
            {/* Electricity Cost */}
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-500/30 relative">
              <div className="text-xs text-slate-400">Optimized Daily Cost</div>
              <div className="text-2xl font-bold text-emerald-400 mt-0.5 flex items-baseline justify-between">
                <span>{config.currencySymbol}{metrics.optimizedCost.toFixed(2)}</span>
                <span className="text-sm font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                  -{metrics.costSavingsPct}% Saved
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                Money Saved: {config.currencySymbol}{metrics.moneySaved.toFixed(2)} / day
              </div>
            </div>

            {/* Carbon Emissions */}
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-500/30">
              <div className="text-xs text-slate-400">Optimized Carbon Footprint</div>
              <div className="text-2xl font-bold text-emerald-400 mt-0.5 flex items-baseline justify-between">
                <span>{metrics.optimizedEmissionsKg.toFixed(1)} <span className="text-sm font-normal">kg CO₂</span></span>
                <span className="text-sm font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                  -{metrics.emissionsReductionPct}% Clean
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                CO₂ Saved: {metrics.co2SavedKg.toFixed(1)} kg / day
              </div>
            </div>

            {/* Solar Utilized */}
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-500/30">
              <div className="text-xs text-slate-400">Solar Energy Utilized</div>
              <div className="text-2xl font-bold text-emerald-400 mt-0.5 flex items-baseline justify-between">
                <span>{metrics.optimizedSolarUtilPct}%</span>
                <span className="text-sm font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                  +{metrics.solarWastedSavedKwh.toFixed(1)} kWh Captured
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                Solar curtailment eliminated
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appliance-by-Appliance Shifting Matrix */}
      <div className="pt-2">
        <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          Campus Load Dispatch Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="pb-2.5 font-semibold">Appliance / Load</th>
                <th className="pb-2.5 font-semibold">Power</th>
                <th className="pb-2.5 font-semibold">Duration</th>
                <th className="pb-2.5 font-semibold">Original Time</th>
                <th className="pb-2.5 font-semibold">Optimized Slot</th>
                <th className="pb-2.5 font-semibold">Solar Match</th>
                <th className="pb-2.5 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loads.map((load) => {
                const shift = load.optimizedStart - load.originalStart;
                const shiftLabel = shift === 0 ? 'Optimal' : shift > 0 ? `+${shift} hrs` : `${shift} hrs`;
                return (
                  <tr key={load.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 font-medium text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      {load.name}
                    </td>
                    <td className="py-2.5 text-slate-300">{load.powerKw} kW</td>
                    <td className="py-2.5 text-slate-400">{load.durationHours} hrs</td>
                    <td className="py-2.5 text-rose-400/90 line-through">
                      {load.originalStart.toString().padStart(2, '0')}:00
                    </td>
                    <td className="py-2.5 text-emerald-400 font-bold">
                      {load.optimizedStart.toString().padStart(2, '0')}:00
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px]">
                        Peak Solar Window
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold">
                        {load.enabled ? 'Automated' : 'Bypassed'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
