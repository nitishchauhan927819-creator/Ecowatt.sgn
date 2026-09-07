import React from 'react';
import { X, Sliders, Sun, DollarSign, Leaf, Battery, Save, RotateCcw } from 'lucide-react';
import { MicrogridConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: MicrogridConfig;
  onUpdateConfig: (newConfig: MicrogridConfig) => void;
  solarScale: number;
  onSolarScaleChange: (val: number) => void;
  priceScale: number;
  onPriceScaleChange: (val: number) => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  solarScale,
  onSolarScaleChange,
  priceScale,
  onPriceScaleChange,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Microgrid & Simulation Controls</h2>
              <p className="text-[11px] text-slate-400">Tune campus parameters, utility tariffs & solar scale</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Solar Multiplier Slider */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Solar Generation Scale
              </span>
              <span className="text-amber-400 font-bold">{Math.round(solarScale * 100)}% ({ (12.4 * solarScale).toFixed(1) } kW peak)</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={solarScale}
              onChange={(e) => onSolarScaleChange(parseFloat(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Cloudy / Winter (50%)</span>
              <span>Nominal (100%)</span>
              <span>High Irradiance (200%)</span>
            </div>
          </div>

          {/* Electricity Price Multiplier Slider */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                Electricity Tariff Multiplier
              </span>
              <span className="text-cyan-400 font-bold">{Math.round(priceScale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={priceScale}
              onChange={(e) => onPriceScaleChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Low Tariff (50%)</span>
              <span>Standard (100%)</span>
              <span>Peak Crisis (250%)</span>
            </div>
          </div>

          {/* Carbon Factor Slider */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                Grid Carbon Emission Factor
              </span>
              <span className="text-emerald-400 font-bold">{config.carbonEmissionFactorKgPerKwh} kg CO₂ / kWh</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1.2"
              step="0.02"
              value={config.carbonEmissionFactorKgPerKwh}
              onChange={(e) =>
                onUpdateConfig({
                  ...config,
                  carbonEmissionFactorKgPerKwh: parseFloat(e.target.value),
                })
              }
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Clean Grid (0.3)</span>
              <span>Average Grid (0.82)</span>
              <span>Coal Heavy (1.20)</span>
            </div>
          </div>

          {/* Battery & Solar Capacity Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <label className="text-slate-400 block mb-1 text-[11px]">Battery Capacity (kWh)</label>
              <input
                type="number"
                min="5"
                max="100"
                value={config.batteryCapacityKwh}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    batteryCapacityKwh: parseFloat(e.target.value) || 15,
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <label className="text-slate-400 block mb-1 text-[11px]">Emergency Reserve Buffer (%)</label>
              <input
                type="number"
                min="10"
                max="50"
                value={config.reserveSocPct}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    reserveSocPct: parseInt(e.target.value) || 20,
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>
          </div>

          {/* Feed-in Tariff Credit */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <label className="text-slate-400 block mb-1 text-[11px]">
              Solar Export Feed-in Tariff ({config.currencySymbol}/kWh)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.5"
              max="20"
              value={config.feedInCreditRatePerKwh}
              onChange={(e) =>
                onUpdateConfig({
                  ...config,
                  feedInCreditRatePerKwh: parseFloat(e.target.value) || 3.5,
                })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-between bg-slate-900/90">
          <button
            onClick={onResetDefaults}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Apply & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
