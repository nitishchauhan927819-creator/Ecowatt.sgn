import React, { useState } from 'react';
import { X, Building2, Sun, BatteryCharging, Check, Plus, ShieldCheck, MapPin } from 'lucide-react';
import { CAMPUS_PRESETS } from '../data/sampleData';
import { MicrogridConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: MicrogridConfig;
  onSelectCampus: (campus: typeof CAMPUS_PRESETS[0]) => void;
  onCustomCampusAdd?: (name: string, solar: number, battery: number) => void;
}

export const CampusSwitcherModal: React.FC<Props> = ({
  isOpen,
  onClose,
  config,
  onSelectCampus,
  onCustomCampusAdd,
}) => {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customSolar, setCustomSolar] = useState(25.0);
  const [customBattery, setCustomBattery] = useState(40.0);

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const customCampus = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      solarKw: customSolar,
      batteryKwh: customBattery,
      socPct: 85,
      description: 'Custom Campus Microgrid Facility',
      baselineMultiplier: customSolar / 12.4,
    };
    onSelectCampus(customCampus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Switch Campus Facility</h2>
              <p className="text-[11px] text-slate-400">Select microgrid site or provision new sub-cluster</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Campuses List */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {CAMPUS_PRESETS.map((campus) => {
            const isCurrent = config.campusName === campus.name;
            return (
              <div
                key={campus.id}
                onClick={() => {
                  onSelectCampus(campus);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  isCurrent
                    ? 'bg-slate-900 border-emerald-400 ring-1 ring-emerald-500/30 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-200 text-sm">{campus.name}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{campus.description}</p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center space-x-4 text-[11px]">
                  <div className="flex items-center space-x-1.5 text-amber-400">
                    <Sun className="w-3.5 h-3.5" />
                    <span>{campus.solarKw} kW Solar Array</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <BatteryCharging className="w-3.5 h-3.5" />
                    <span>{campus.batteryKwh} kWh PowerVault</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Custom Campus Form */}
          {showCustomForm ? (
            <form onSubmit={handleCustomSubmit} className="p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-3 mt-2">
              <div className="font-bold text-slate-200 flex items-center justify-between">
                <span>Configure Custom Microgrid Node</span>
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Campus / Building Name</label>
                <input
                  type="text"
                  placeholder="e.g., North Athletic Complex & Arena"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">Rooftop Solar (kW)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="500"
                    value={customSolar}
                    onChange={(e) => setCustomSolar(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">Battery Capacity (kWh)</label>
                  <input
                    type="number"
                    step="1"
                    min="2"
                    max="1000"
                    value={customBattery}
                    onChange={(e) => setCustomBattery(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                >
                  Switch to Custom Facility
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowCustomForm(true)}
              className="w-full p-3 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-slate-900/50 text-slate-400 hover:text-emerald-400 flex items-center justify-center gap-2 transition-all font-mono"
            >
              <Plus className="w-4 h-4" />
              <span>Define New Campus Microgrid Cluster</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
