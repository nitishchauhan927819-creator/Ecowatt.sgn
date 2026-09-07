import React, { useState, useEffect, useRef } from 'react';
import { HourlyData, MicrogridConfig, TariffZoneInfo } from '../types';
import { TARIFF_ZONES } from '../data/sampleData';
import { Eye, Info, Layers, Zap, Clock, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  hourlyData: HourlyData[];
  config: MicrogridConfig;
  currentHoverHour?: number;
  onHoverHourChange?: (hour: number) => void;
}

export const ProductionTariffProfiler: React.FC<Props> = ({
  hourlyData,
  config,
  currentHoverHour = 13,
  onHoverHourChange,
}) => {
  const [viewMode, setViewMode] = useState<'optimized' | 'comparison' | 'original'>('optimized');
  const [activeHour, setActiveHour] = useState<number>(currentHoverHour);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeHourRef = useRef<number>(activeHour);
  activeHourRef.current = activeHour;

  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        const next = (activeHourRef.current + 1) % 24;
        setActiveHour(next);
        if (onHoverHourChange) {
          onHoverHourChange(next);
        }
      }, 700);
    } else if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, onHoverHourChange]);

  useEffect(() => {
    if (currentHoverHour !== undefined && currentHoverHour !== activeHourRef.current) {
      setActiveHour(currentHoverHour);
    }
  }, [currentHoverHour]);

  const maxVal = Math.max(
    ...hourlyData.map((d) => Math.max(d.solarKw, d.originalTotalKw, d.optimizedTotalKw, 10))
  );

  const handleHourSelect = (h: number) => {
    setActiveHour(h);
    if (onHoverHourChange) onHoverHourChange(h);
  };

  const handleStepBack = () => {
    const prev = activeHour === 0 ? 23 : activeHour - 1;
    handleHourSelect(prev);
  };

  const handleStepForward = () => {
    const next = (activeHour + 1) % 24;
    handleHourSelect(next);
  };

  const jumpToZone = (zone: typeof TARIFF_ZONES[0]) => {
    const targetHour = Math.floor((zone.startHour + zone.endHour) / 2);
    handleHourSelect(targetHour);
  };

  const selectedData = hourlyData[activeHour] || hourlyData[12];
  const surplus = selectedData.solarKw - (viewMode === 'original' ? selectedData.originalTotalKw : selectedData.optimizedTotalKw);

  // SVG dimensions for 24-hour chart
  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const getX = (hour: number) => paddingX + (hour / 23) * chartW;
  const getY = (val: number) => paddingY + chartH - (val / (maxVal * 1.15)) * chartH;

  // Path generators
  const generateSmoothAreaPath = (values: number[], baseZero: boolean = true) => {
    if (!values.length) return '';
    const points = values.map((v, i) => ({ x: getX(i), y: getY(v) }));
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    if (baseZero) {
      path += ` L ${points[points.length - 1].x} ${paddingY + chartH} L ${points[0].x} ${paddingY + chartH} Z`;
    }
    return path;
  };

  const generateSmoothLinePath = (values: number[]) => {
    if (!values.length) return '';
    const points = values.map((v, i) => ({ x: getX(i), y: getY(v) }));
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const solarValues = hourlyData.map((d) => d.solarKw);
  const origTotalValues = hourlyData.map((d) => d.originalTotalKw);
  const optTotalValues = hourlyData.map((d) => d.optimizedTotalKw);
  const baselineValues = hourlyData.map((d) => d.baselineDemandKw);

  const solarAreaPath = generateSmoothAreaPath(solarValues, true);
  const solarLinePath = generateSmoothLinePath(solarValues);

  const optDemandPath = generateSmoothLinePath(optTotalValues);
  const origDemandPath = generateSmoothLinePath(origTotalValues);
  const baselineDemandPath = generateSmoothLinePath(baselineValues);

  return (
    <div className="bg-[#111827]/90 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span className="text-amber-400">⚡</span>
            Production & Tariff Profiler
            <span className="text-[10px] tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase font-mono">
              24-Hour Horizon
            </span>
          </h2>
          <p className="text-xs text-slate-400">Generation curve vs campus demand with dynamic utility pricing zones</p>
        </div>

        {/* Legend and View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Legend Items */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
              <span className="text-slate-300">Solar Curve</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300">Optimized Demand</span>
            </div>
            {viewMode === 'comparison' && (
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 border border-rose-300"></span>
                <span className="text-rose-300">Original (Unshifted)</span>
              </div>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewMode('optimized')}
              className={`px-2.5 py-1 rounded transition-all ${
                viewMode === 'optimized' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Optimized
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-2.5 py-1 rounded transition-all ${
                viewMode === 'comparison' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Comparison Overlay
            </button>
            <button
              onClick={() => setViewMode('original')}
              className={`px-2.5 py-1 rounded transition-all ${
                viewMode === 'original' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Original
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Utility Tariff Zone Badges (NOW INTERACTIVE) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {TARIFF_ZONES.map((zone) => {
          const isSelected = activeHour >= zone.startHour && activeHour < zone.endHour;
          const displayRate = (zone.ratePerKwh * (config.currency === 'USD' ? 0.012 : 1)).toFixed(2);
          return (
            <div
              key={zone.tag}
              onClick={() => jumpToZone(zone)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer transform hover:scale-[1.02] ${
                isSelected
                  ? `${zone.colorClass} ring-2 ring-white/30 shadow-md`
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-400'
              }`}
              title={`Click to jump scrubber to ${zone.name} (${zone.startHour}:00 - ${zone.endHour}:00)`}
            >
              <div className="flex justify-between items-center text-[11px] font-mono mb-1">
                <span className="font-semibold">{zone.tag}</span>
                {isSelected ? (
                  <span className="text-[9px] px-1 py-0.2 bg-white/20 rounded font-bold uppercase">Active Zone</span>
                ) : (
                  <span className="text-[9px] text-slate-500 font-mono">Jump ↗</span>
                )}
              </div>
              <div className="text-sm font-bold font-mono text-slate-100">
                {config.currencySymbol}{displayRate} <span className="text-[10px] font-normal text-slate-400">/ kWh</span>
              </div>
              <div className="text-[11px] font-medium text-slate-300 truncate">{zone.name}</div>
            </div>
          );
        })}
      </div>

      {/* 24-Hour Graph Canvas */}
      <div className="relative w-full overflow-hidden bg-slate-950/60 rounded-xl border border-slate-800/70 p-2">
        {/* Scrubber / Tooltip Overlay Banner */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono mb-1">
          <div className="flex items-center space-x-2 text-slate-200">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Time Selected: <strong className="text-cyan-300">{selectedData.timeLabel}</strong></span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-amber-400">Solar: <strong>{selectedData.solarKw.toFixed(1)} kW</strong></span>
            <span className="text-emerald-400">
              Demand: <strong>{(viewMode === 'original' ? selectedData.originalTotalKw : selectedData.optimizedTotalKw).toFixed(1)} kW</strong>
            </span>
            <span className={surplus >= 0 ? 'text-cyan-400' : 'text-rose-400'}>
              Net: <strong>{surplus >= 0 ? `+${surplus.toFixed(1)} kW Surplus` : `${surplus.toFixed(1)} kW Grid Import`}</strong>
            </span>
          </div>
        </div>

        {/* SVG Visualization */}
        <div className="relative h-64 w-full">
          <svg
            className="w-full h-full cursor-crosshair"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="solarAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.38" />
                <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="optDemandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
              const y = paddingY + chartH * (1 - ratio);
              const kwVal = (maxVal * 1.15 * ratio).toFixed(1);
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="3,3"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {kwVal}kW
                  </text>
                </g>
              );
            })}

            {/* Tariff zone background shading */}
            {TARIFF_ZONES.map((zone) => {
              const x1 = getX(zone.startHour);
              const x2 = getX(Math.min(23, zone.endHour));
              const zoneColor =
                zone.startHour >= 15 && zone.endHour <= 21
                  ? 'rgba(244, 63, 94, 0.05)'
                  : zone.startHour >= 8 && zone.endHour <= 15
                  ? 'rgba(245, 158, 11, 0.05)'
                  : 'transparent';
              return (
                <rect
                  key={zone.name}
                  x={x1}
                  y={paddingY}
                  width={Math.max(0, x2 - x1)}
                  height={chartH}
                  fill={zoneColor}
                />
              );
            })}

            {/* Solar Area Fill */}
            <path d={solarAreaPath} fill="url(#solarAreaGradient)" />
            {/* Solar Stroke Line */}
            <path
              d={solarLinePath}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Campus Baseline Demand Line */}
            <path
              d={baselineDemandPath}
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              opacity="0.6"
            />

            {/* Original Total Demand Line (if comparison or original) */}
            {(viewMode === 'comparison' || viewMode === 'original') && (
              <path
                d={origDemandPath}
                fill="none"
                stroke="#f43f5e"
                strokeWidth={viewMode === 'original' ? '2.5' : '2'}
                strokeDasharray={viewMode === 'comparison' ? '5,5' : undefined}
                strokeLinecap="round"
                opacity={viewMode === 'comparison' ? '0.8' : '1'}
              />
            )}

            {/* Optimized Total Demand Line (if optimized or comparison) */}
            {(viewMode === 'optimized' || viewMode === 'comparison') && (
              <path
                d={optDemandPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* Active Vertical Scrubber Line */}
            {(() => {
              const scrubX = getX(activeHour);
              return (
                <g>
                  <line
                    x1={scrubX}
                    y1={paddingY}
                    x2={scrubX}
                    y2={paddingY + chartH}
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                  {/* Solar point */}
                  <circle
                    cx={scrubX}
                    cy={getY(selectedData.solarKw)}
                    r="4.5"
                    fill="#fbbf24"
                    stroke="#111827"
                    strokeWidth="1.5"
                  />
                  {/* Demand point */}
                  <circle
                    cx={scrubX}
                    cy={getY(viewMode === 'original' ? selectedData.originalTotalKw : selectedData.optimizedTotalKw)}
                    r="4.5"
                    fill={viewMode === 'original' ? '#f43f5e' : '#10b981'}
                    stroke="#111827"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })()}

            {/* Interactive click columns for each of the 24 hours */}
            {hourlyData.map((d, i) => {
              const x = getX(i);
              const colW = chartW / 24;
              return (
                <rect
                  key={i}
                  x={x - colW / 2}
                  y={paddingY}
                  width={colW}
                  height={chartH}
                  fill="transparent"
                  className="hover:fill-cyan-500/10 transition-colors"
                  onClick={() => handleHourSelect(i)}
                />
              );
            })}
          </svg>
        </div>

        {/* Timeline hour axis matching the image */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-6 pt-2 pb-1 border-t border-slate-800/60">
          <span>00:00</span>
          <span>04:00</span>
          <span>08:00</span>
          <span className="text-amber-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            12:00 PM (Solar Peak)
          </span>
          <span>16:00</span>
          <span>20:00</span>
          <span>23:59</span>
        </div>
      </div>

      {/* Hourly Quick Bar Scrubber Slider with Play & Step Controls */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleStepBack}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Step back 1 hour"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
            title={isPlaying ? 'Pause 24-hour day cycle simulation' : 'Play 24-hour day cycle simulation'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Cycle</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Day</span>
              </>
            )}
          </button>

          <button
            onClick={handleStepForward}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Step forward 1 hour"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex items-center gap-2 min-w-[200px]">
          <span className="text-[11px] font-mono text-slate-400 shrink-0">Scrub:</span>
          <input
            type="range"
            min="0"
            max="23"
            value={activeHour}
            onChange={(e) => handleHourSelect(parseInt(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-slate-400 text-[11px]">Selected:</span>
          <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
            {hourlyData[activeHour]?.timeLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
