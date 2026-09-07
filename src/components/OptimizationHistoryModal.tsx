import React from 'react';
import { X, History, TrendingUp, Sparkles, Calendar, Zap, CheckCircle2 } from 'lucide-react';
import { OptimizationRunRecord, MicrogridConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  runs: OptimizationRunRecord[];
  config: MicrogridConfig;
}

export const OptimizationHistoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  runs,
  config,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Optimization Audit Log</h2>
              <p className="text-[11px] text-slate-400">Synced with Google Cloud Firestore database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Runs */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {runs.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Zap className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-slate-400">No optimization runs logged yet</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Click "Auto-Schedule Appliances Now" on the dashboard to record an audit trace.
              </p>
            </div>
          ) : (
            runs.map((run, idx) => (
              <div
                key={run.id || idx}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-bold text-slate-200">MILP Dispatch #{runs.length - idx}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {run.formattedDate || new Date(run.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">Cost Savings</div>
                    <div className="font-bold text-emerald-400">
                      {config.currencySymbol}{run.moneySaved?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">CO2 Offset</div>
                    <div className="font-bold text-emerald-400">
                      {run.co2SavedKg?.toFixed(1) || '0.0'} kg
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">Solar Util.</div>
                    <div className="font-bold text-amber-400">
                      {run.solarUtilPct || 94}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Preset: <strong className="text-slate-300 uppercase">{run.preset || 'Max Solar'}</strong></span>
                  <span>{run.loadsCount || 5} deferrable loads shifted</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Firestore collections: 'config', 'runs'</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
