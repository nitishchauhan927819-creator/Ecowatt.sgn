export type GridPreset = 'max_solar' | 'storm_guard' | 'arbitrage';

export interface DeferrableLoad {
  id: string;
  name: string;
  category: 'ev' | 'hvac' | 'pump' | 'lab' | 'laundry' | 'custom';
  powerKw: number;
  durationHours: number;
  earliestStart: number; // 0-23
  latestFinish: number;  // 1-24
  enabled: boolean;
  originalStart: number; // Hour index 0-23 where it initially was scheduled
  optimizedStart: number; // Hour index 0-23 computed by optimizer
  badgeLabel?: string;
  badgeDetail?: string;
  iconName?: string;
}

export interface HourlyData {
  hour: number;
  timeLabel: string;
  solarKw: number;
  baselineDemandKw: number;
  tariffPerKwh: number;
  tariffZone: 'super_off_peak' | 'solar_abundance' | 'peak' | 'standard';
  // Schedules computed
  originalLoadKw: number;
  optimizedLoadKw: number;
  originalTotalKw: number;
  optimizedTotalKw: number;
  // Energy flow details
  solarUsedOriginalKw: number;
  solarUsedOptimizedKw: number;
  gridImportOriginalKw: number;
  gridImportOptimizedKw: number;
  solarExportOriginalKw: number;
  solarExportOptimizedKw: number;
  batterySocOriginalPct?: number;
  batterySocOptimizedPct?: number;
}

export interface TariffZoneInfo {
  startHour: number;
  endHour: number;
  name: string;
  ratePerKwh: number;
  tag: string;
  colorClass: string;
}

export interface OptimizationMetrics {
  originalCost: number;
  optimizedCost: number;
  moneySaved: number;
  costSavingsPct: number;
  
  originalEmissionsKg: number;
  optimizedEmissionsKg: number;
  co2SavedKg: number;
  emissionsReductionPct: number;

  solarGeneratedTotalKwh: number;
  originalSolarUtilPct: number;
  optimizedSolarUtilPct: number;
  solarEnergyUtilizedKwh: number;
  solarWastedSavedKwh: number;

  treesEquivalent: number;
  gridExportRevenue: number;
}

export interface MicrogridConfig {
  campusName: string;
  solarCapacityKw: number;
  batteryCapacityKwh: number;
  currentBatterySocPct: number;
  reserveSocPct: number;
  carbonEmissionFactorKgPerKwh: number; // e.g. 0.82 kg CO2 / kWh (grid average)
  currency: 'INR' | 'USD';
  currencySymbol: string;
  feedInCreditRatePerKwh: number;
  selectedPreset: GridPreset;
}

export interface OptimizationRunRecord {
  id: string;
  timestamp: number;
  formattedDate: string;
  moneySaved: number;
  co2SavedKg: number;
  solarUtilPct: number;
  preset: GridPreset;
  loadsCount: number;
}

export type ToastType = 'savings' | 'success' | 'info' | 'warning' | 'alert';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  badge?: string;
  metricDelta?: string;
  timestamp: number;
  duration?: number; // duration in ms, default 5500
  action?: ToastAction;
}
