import { DeferrableLoad, MicrogridConfig, TariffZoneInfo } from '../types';

export const CAMPUS_PRESETS: {
  id: string;
  name: string;
  solarKw: number;
  batteryKwh: number;
  socPct: number;
  description: string;
  baselineMultiplier: number;
}[] = [
  {
    id: 'oakridge',
    name: 'Oakridge Eco Campus Microgrid',
    solarKw: 12.4,
    batteryKwh: 15.0,
    socPct: 88,
    description: 'Residential & Admin Hybrid Net-Zero Cluster',
    baselineMultiplier: 1.0,
  },
  {
    id: 'scitech',
    name: 'Main Science & Tech Campus',
    solarKw: 48.0,
    batteryKwh: 60.0,
    socPct: 92,
    description: 'Heavy laboratory, clean rooms & server clusters',
    baselineMultiplier: 3.5,
  },
  {
    id: 'hostel',
    name: 'Hostel & Dormitory Microgrid Node 4',
    solarKw: 24.0,
    batteryKwh: 30.0,
    socPct: 75,
    description: 'Student residential quarters & laundromat complex',
    baselineMultiplier: 1.8,
  },
  {
    id: 'engineering',
    name: 'Engineering Labs & Autoclave Wing',
    solarKw: 36.0,
    batteryKwh: 45.0,
    socPct: 84,
    description: 'Thermal wind tunnel & industrial machinery wing',
    baselineMultiplier: 2.6,
  },
];

export interface MicrogridAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  time: string;
  read: boolean;
}

export const INITIAL_NOTIFICATIONS: MicrogridAlert[] = [
  {
    id: 'notif_1',
    title: 'Optimal Solar Peak Forecasted',
    message: 'Solar surplus peak +9.8 kW between 11:00 AM – 2:00 PM. High-draw deferrable loads successfully synchronized.',
    type: 'success',
    time: '5m ago',
    read: false,
  },
  {
    id: 'notif_2',
    title: 'EV Shuttle Dispatched to Solar Window',
    message: 'EV Campus Shuttle moved from 18:00 (peak tariff $0.34/kWh) to 11:00 (free solar energy).',
    type: 'info',
    time: '20m ago',
    read: false,
  },
  {
    id: 'notif_3',
    title: 'Grid Feed-in Credit Active',
    message: 'PowerVault reached 88% SOC threshold. Net export feeding regional grid at incentive rate.',
    type: 'success',
    time: '1h ago',
    read: true,
  },
  {
    id: 'notif_4',
    title: 'Evening Peak Tariff Ahead',
    message: 'High utility tariff ($0.34/₹14.5) starts at 15:00. PowerVault reserve battery scheduled to shave peak.',
    type: 'warning',
    time: '2h ago',
    read: true,
  },
];

export const INITIAL_CONFIG: MicrogridConfig = {
  campusName: 'Oakridge Eco Campus Microgrid',
  solarCapacityKw: 12.4,
  batteryCapacityKwh: 15.0,
  currentBatterySocPct: 88,
  reserveSocPct: 20,
  carbonEmissionFactorKgPerKwh: 0.82, // Standard grid factor: 0.82 kg CO2 / kWh
  currency: 'INR',
  currencySymbol: '₹',
  feedInCreditRatePerKwh: 3.5, // Feed-in tariff credit
  selectedPreset: 'max_solar',
};

// 24-hour baseline demand for a college campus (kW)
// Night: 1.8 - 2.4 kW (security, server racks, baseline lighting)
// Day: rises at 08:00 (classes, admin), peaks at 11:00-14:00 (labs, canteen), evening peak 18:00-21:00 (hostels, study halls)
export const DEFAULT_CAMPUS_BASELINE: number[] = [
  2.1, 2.0, 1.9, 1.9, 2.1, 2.3, 
  3.2, 4.1, 5.5, 6.2, 6.8, 7.0, 
  6.5, 6.2, 5.8, 5.2, 4.9, 5.6, 
  6.8, 7.2, 6.4, 5.0, 3.8, 2.6
];

// 24-hour solar generation profile for 12.4 kW array (kW)
// Sunrise ~06:00, climbs to peak 9.8 kW around 12:45 PM, sunset ~18:30
export const DEFAULT_SOLAR_GENERATION: number[] = [
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 
  0.6, 2.2, 4.8, 7.1, 8.9, 9.8, 
  9.6, 8.4, 6.9, 4.5, 2.3, 0.7, 
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0
];

export const TARIFF_ZONES: TariffZoneInfo[] = [
  {
    startHour: 0,
    endHour: 8,
    name: 'Super Off-Peak',
    ratePerKwh: 6.5, // USD equivalent: 0.08
    tag: '00:00 - 08:00',
    colorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  },
  {
    startHour: 8,
    endHour: 15,
    name: 'Solar Abundance',
    ratePerKwh: 8.0, // USD equivalent: 0.14
    tag: '08:00 - 15:00',
    colorClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  },
  {
    startHour: 15,
    endHour: 21,
    name: 'Peak Tariff (Shave)',
    ratePerKwh: 14.5, // USD equivalent: 0.34
    tag: '15:00 - 21:00',
    colorClass: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  },
  {
    startHour: 21,
    endHour: 24,
    name: 'Standard',
    ratePerKwh: 7.2, // USD equivalent: 0.12
    tag: '21:00 - 24:00',
    colorClass: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  },
];

export const INITIAL_DEFERRABLE_LOADS: DeferrableLoad[] = [
  {
    id: 'load_ev',
    name: 'EV Campus Shuttle / Model Y',
    category: 'ev',
    powerKw: 3.6,
    durationHours: 3,
    earliestStart: 8,
    latestFinish: 18,
    enabled: true,
    originalStart: 18, // Scheduled at 18:00 (peak tariff, 0 solar) initially!
    optimizedStart: 11, // Moved to 11:00 (peak solar)
    badgeLabel: 'Solar Match • 100% Green',
    badgeDetail: '+28 mi/hr',
    iconName: 'Car',
  },
  {
    id: 'load_hvac',
    name: 'HVAC Thermal Pre-Cooling',
    category: 'hvac',
    powerKw: 2.8,
    durationHours: 3,
    earliestStart: 9,
    latestFinish: 17,
    enabled: true,
    originalStart: 15, // Scheduled at 15:00 (afternoon peak)
    optimizedStart: 12, // Moved to 12:00 (solar zenith)
    badgeLabel: 'Zone 1 & 2 • Set: 71°F',
    badgeDetail: 'Eco Profile',
    iconName: 'Wind',
  },
  {
    id: 'load_pump',
    name: 'Campus Water Supply Pump',
    category: 'pump',
    powerKw: 4.0,
    durationHours: 2,
    earliestStart: 7,
    latestFinish: 17,
    enabled: true,
    originalStart: 6, // Scheduled at 06:00 (early morning before solar)
    optimizedStart: 13, // Moved to 13:00 (high solar surplus)
    badgeLabel: 'Storage Tank Level 92%',
    badgeDetail: 'Thermal & Hydro Stored',
    iconName: 'Droplets',
  },
  {
    id: 'load_lab',
    name: 'Research Lab Autoclaves & Centrifuge',
    category: 'lab',
    powerKw: 2.5,
    durationHours: 2,
    earliestStart: 9,
    latestFinish: 16,
    enabled: true,
    originalStart: 16, // Scheduled at 16:00 (peak pricing)
    optimizedStart: 10, // Moved to 10:00 (surplus solar)
    badgeLabel: 'Sterilization Batch Cycle',
    badgeDetail: 'High Thermal Demand',
    iconName: 'FlaskConical',
  },
  {
    id: 'load_laundry',
    name: 'Student Dormitory Washers',
    category: 'laundry',
    powerKw: 2.0,
    durationHours: 2,
    earliestStart: 8,
    latestFinish: 20,
    enabled: true,
    originalStart: 19, // Scheduled at 19:00 (night peak, expensive grid)
    optimizedStart: 14, // Moved to 14:00 (utilizing afternoon solar)
    badgeLabel: 'Eco Cycle Batch 4',
    badgeDetail: 'Cold Wash Green',
    iconName: 'Sparkles',
  },
];
