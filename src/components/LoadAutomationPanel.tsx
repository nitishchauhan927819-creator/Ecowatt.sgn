import React, { useState } from 'react';
import { DeferrableLoad, GridPreset, MicrogridConfig } from '../types';
import { 
  Car, 
  Wind, 
  Droplets, 
  FlaskConical, 
  Sparkles, 
  Plus, 
  Check, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Scale, 
  Sliders, 
  Trash2,
  CalendarCheck
} from 'lucide-react';

interface Props {
  loads: DeferrableLoad[];
  config: MicrogridConfig;
  onUpdateLoad: (updatedLoad: DeferrableLoad) => void;
  onAddLoad: (newLoad: DeferrableLoad) => void;
  onDeleteLoad: (loadId: string) => void;
  onPresetChange: (preset: GridPreset) => void;
}

export const LoadAutomationPanel: React.FC<Props> = ({
  loads,
  config,
  onUpdateLoad,
  onAddLoad,
  onDeleteLoad,
  onPresetChange,
}) => {
  const [editingLoadId, setEditingLoadId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New load form state
  const [newName, setNewName] = useState('');
  const [newPower, setNewPower] = useState(2.5);
  const [newDuration, setNewDuration] = useState(2);
  const [newEarliest, setNewEarliest] = useState(8);
  const [newLatest, setNewLatest] = useState(18);

  const getLoadIcon = (category: DeferrableLoad['category']) => {
    switch (category) {
      case 'ev':
        return <Car className="w-5 h-5 text-emerald-400" />;
      case 'hvac':
        return <Wind className="w-5 h-5 text-cyan-400" />;
      case 'pump':
        return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'lab':
        return <FlaskConical className="w-5 h-5 text-purple-400" />;
      case 'laundry':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      default:
        return <Zap className="w-5 h-5 text-emerald-400" />;
    }
  };

  const activeRelaysCount = loads.filter((l) => l.enabled).length;

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newLoad: DeferrableLoad = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      category: 'custom',
      powerKw: newPower,
      durationHours: newDuration,
      earliestStart: newEarliest,
      latestFinish: newLatest,
      enabled: true,
      originalStart: newEarliest,
      optimizedStart: newEarliest,
      badgeLabel: 'Campus Custom Load',
      badgeDetail: 'Automated Relay',
    };
    onAddLoad(newLoad);
    setNewName('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-[#111827]/90 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Zap className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Load Automation</h2>
              <p className="text-xs text-slate-400">Deferrable appliance relays</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {activeRelaysCount} Smart Relays Active
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Add Deferrable Load"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Load items list */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {loads.map((load) => {
            const isEditing = editingLoadId === load.id;
            const shiftHours = load.optimizedStart - load.originalStart;
            return (
              <div
                key={load.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  load.enabled
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      {getLoadIcon(load.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">{load.name}</span>
                        {load.enabled && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span className="text-emerald-400 font-medium">{load.badgeLabel}</span>
                        <span>•</span>
                        <span>{load.badgeDetail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold font-mono text-slate-100">
                      {load.powerKw.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">kW</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{load.durationHours} hrs cycle</div>
                  </div>
                </div>

                {/* Scheduling Pill & Difference */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-rose-400/80 line-through">
                      Orig: {load.originalStart.toString().padStart(2, '0')}:00
                    </span>
                    <span className="text-slate-500">→</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <CalendarCheck className="w-3 h-3" />
                      Opt: {load.optimizedStart.toString().padStart(2, '0')}:00
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingLoadId(isEditing ? null : load.id)}
                      className="text-slate-400 hover:text-cyan-400 p-1 rounded transition-colors"
                      title="Adjust Load Parameters"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={load.enabled}
                        onChange={(e) => onUpdateLoad({ ...load, enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>

                {/* Inline Editing Controls */}
                {isEditing && (
                  <div className="mt-3 p-3 bg-slate-950/90 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400">Power: {load.powerKw} kW</label>
                        <input
                          type="range"
                          min="0.5"
                          max="10"
                          step="0.5"
                          value={load.powerKw}
                          onChange={(e) => onUpdateLoad({ ...load, powerKw: parseFloat(e.target.value) })}
                          className="w-full accent-emerald-400 h-1 bg-slate-800 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Duration: {load.durationHours} hrs</label>
                        <input
                          type="range"
                          min="1"
                          max="8"
                          step="1"
                          value={load.durationHours}
                          onChange={(e) => onUpdateLoad({ ...load, durationHours: parseInt(e.target.value) })}
                          className="w-full accent-emerald-400 h-1 bg-slate-800 rounded"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400">Earliest: {load.earliestStart}:00</label>
                        <input
                          type="range"
                          min="0"
                          max="22"
                          value={load.earliestStart}
                          onChange={(e) => onUpdateLoad({ ...load, earliestStart: parseInt(e.target.value) })}
                          className="w-full accent-cyan-400 h-1 bg-slate-800 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Latest: {load.latestFinish}:00</label>
                        <input
                          type="range"
                          min={load.earliestStart + load.durationHours}
                          max="24"
                          value={load.latestFinish}
                          onChange={(e) => onUpdateLoad({ ...load, latestFinish: parseInt(e.target.value) })}
                          className="w-full accent-cyan-400 h-1 bg-slate-800 rounded"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <button
                        onClick={() => onDeleteLoad(load.id)}
                        className="text-rose-400 hover:text-rose-300 text-[10px] flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove Load
                      </button>
                      <button
                        onClick={() => setEditingLoadId(null)}
                        className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AUTOMATED GRID PRESETS (Matching Screenshot) */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2.5">
          Automated Grid Presets
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* Preset 1: Max Solar */}
          <button
            onClick={() => onPresetChange('max_solar')}
            className={`p-2.5 rounded-xl border font-medium text-xs flex flex-col items-center justify-center gap-1 transition-all ${
              config.selectedPreset === 'max_solar'
                ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Max Solar</span>
          </button>

          {/* Preset 2: Storm Guard */}
          <button
            onClick={() => onPresetChange('storm_guard')}
            className={`p-2.5 rounded-xl border font-medium text-xs flex flex-col items-center justify-center gap-1 transition-all ${
              config.selectedPreset === 'storm_guard'
                ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Storm Guard</span>
          </button>

          {/* Preset 3: Arbitrage */}
          <button
            onClick={() => onPresetChange('arbitrage')}
            className={`p-2.5 rounded-xl border font-medium text-xs flex flex-col items-center justify-center gap-1 transition-all ${
              config.selectedPreset === 'arbitrage'
                ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Arbitrage</span>
          </button>
        </div>
      </div>

      {/* Add Load Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Add Deferrable Campus Load
            </h3>
            <form onSubmit={handleAddNew} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Load / Appliance Name</label>
                <input
                  type="text"
                  placeholder="e.g., Chemistry Hall Ventilation"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Power Consumption (kW)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="50"
                    value={newPower}
                    onChange={(e) => setNewPower(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Earliest Start Hour (0-23)</label>
                  <input
                    type="number"
                    min="0"
                    max="22"
                    value={newEarliest}
                    onChange={(e) => setNewEarliest(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Latest Finish Hour (1-24)</label>
                  <input
                    type="number"
                    min={newEarliest + newDuration}
                    max="24"
                    value={newLatest}
                    onChange={(e) => setNewLatest(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors"
                >
                  Save Appliance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
