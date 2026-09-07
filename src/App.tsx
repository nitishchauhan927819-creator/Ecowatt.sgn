import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { TopStatCards } from './components/TopStatCards';
import { KineticEnergyMesh } from './components/KineticEnergyMesh';
import { ProductionTariffProfiler } from './components/ProductionTariffProfiler';
import { LoadAutomationPanel } from './components/LoadAutomationPanel';
import { EcoAIDispatcher } from './components/EcoAIDispatcher';
import { YieldEnvironmentalReturns } from './components/YieldEnvironmentalReturns';
import { SavingsAndImpactSection } from './components/SavingsAndImpactSection';
import { PythonStreamlitCodeModal } from './components/PythonStreamlitCodeModal';
import { SettingsModal } from './components/SettingsModal';
import { CampusSwitcherModal } from './components/CampusSwitcherModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { OptimizationHistoryModal } from './components/OptimizationHistoryModal';
import { NodeInspectorModal } from './components/NodeInspectorModal';
import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/ToastContainer';

import { DeferrableLoad, GridPreset, MicrogridConfig, OptimizationRunRecord } from './types';
import { 
  DEFAULT_CAMPUS_BASELINE, 
  DEFAULT_SOLAR_GENERATION, 
  INITIAL_CONFIG, 
  INITIAL_DEFERRABLE_LOADS,
  INITIAL_NOTIFICATIONS,
  MicrogridAlert,
  CAMPUS_PRESETS
} from './data/sampleData';
import { solveMicrogridSchedule } from './utils/optimizer';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  User, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp 
} from './firebase';
import { Menu, X } from 'lucide-react';

const INITIAL_PAST_RUNS: OptimizationRunRecord[] = [
  {
    id: 'run_sample_1',
    timestamp: Date.now() - 1000 * 60 * 45,
    formattedDate: 'Today @ 12:45 PM',
    moneySaved: 14.28,
    co2SavedKg: 28.4,
    solarUtilPct: 94.2,
    preset: 'max_solar',
    loadsCount: 4,
  },
  {
    id: 'run_sample_2',
    timestamp: Date.now() - 1000 * 60 * 180,
    formattedDate: 'Today @ 09:30 AM',
    moneySaved: 11.50,
    co2SavedKg: 22.1,
    solarUtilPct: 88.6,
    preset: 'arbitrage',
    loadsCount: 3,
  },
];

function MicrogridDashboard() {
  const { addToast, notifyOptimizationComplete } = useToast();

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCampusSwitcher, setShowCampusSwitcher] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [inspectedNode, setInspectedNode] = useState<'pv' | 'hub' | 'loads' | 'grid' | null>(null);

  // Authentication
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Microgrid State & Controls
  const [config, setConfig] = useState<MicrogridConfig>(INITIAL_CONFIG);
  const [loads, setLoads] = useState<DeferrableLoad[]>(INITIAL_DEFERRABLE_LOADS);
  const [solarScale, setSolarScale] = useState<number>(1.0);
  const [priceScale, setPriceScale] = useState<number>(1.0);
  const [activeHour, setActiveHour] = useState<number>(13); // Default 13:00 (1:00 PM peak solar)
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [lastOptimizedTime, setLastOptimizedTime] = useState<string | null>('Today @ 12:45 PM');
  const [pastRuns, setPastRuns] = useState<OptimizationRunRecord[]>(INITIAL_PAST_RUNS);
  const [notifications, setNotifications] = useState<MicrogridAlert[]>(INITIAL_NOTIFICATIONS);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Try to fetch persisted microgrid config from Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.config) {
              setConfig((prev) => ({ ...prev, ...data.config }));
            }
          } else {
            // First time user, bootstrap document
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              createdAt: serverTimestamp(),
              config: INITIAL_CONFIG,
            });
          }
        } catch (e) {
          console.warn('Firestore user fetch note:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Compute scaled solar generation
  const activeSolarGeneration = useMemo(() => {
    return DEFAULT_SOLAR_GENERATION.map((s) => Number((s * solarScale).toFixed(2)));
  }, [solarScale]);

  // Compute Optimization Result
  const optimizationResult = useMemo(() => {
    return solveMicrogridSchedule(loads, DEFAULT_CAMPUS_BASELINE, activeSolarGeneration, config);
  }, [loads, activeSolarGeneration, config]);

  const { metrics, hourlyData, optimalSolarWindow } = optimizationResult;

  // Selected hour dynamic stats for the mesh and top header
  const currentHourData = hourlyData[activeHour] || hourlyData[12];
  const currentSolarKw = currentHourData.solarKw;
  const currentDemandKw = currentHourData.optimizedTotalKw;
  const currentExportKw = currentHourData.solarExportOptimizedKw > 0 
    ? currentHourData.solarExportOptimizedKw 
    : -currentHourData.gridImportOptimizedKw;

  // Handler for big "Optimize Now" button
  const handleOptimize = useCallback(async () => {
    setIsOptimizing(true);
    // Simulate high-performance solver computation
    setTimeout(async () => {
      // Re-run solver and record time
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastOptimizedTime(timeStr);
      setIsOptimizing(false);

      // Trigger Toast notification alert!
      notifyOptimizationComplete(metrics, config, loads.length);

      // Record to local run history state
      const newRun: OptimizationRunRecord = {
        id: `run-${Date.now()}`,
        timestamp: Date.now(),
        formattedDate: `Today @ ${timeStr}`,
        moneySaved: metrics.moneySaved,
        co2SavedKg: metrics.co2SavedKg,
        solarUtilPct: metrics.optimizedSolarUtilPct,
        preset: config.selectedPreset,
        loadsCount: loads.length,
      };
      setPastRuns((prev) => [newRun, ...prev]);

      // Add audit alert into notifications stream
      setNotifications((prev) => [
        {
          id: `notif_${Date.now()}`,
          title: 'MILP Optimization Solved',
          message: `Scheduled ${loads.length} appliances. Daily savings: ${config.currencySymbol}${metrics.moneySaved.toFixed(2)} (-${metrics.costSavingsPct}%).`,
          type: 'success',
          time: 'Just now',
          read: false,
        },
        ...prev,
      ]);

      // If user is authenticated, persist run record to Firestore!
      if (currentUser) {
        try {
          const runsCollection = collection(db, 'users', currentUser.uid, 'runs');
          await addDoc(runsCollection, {
            timestamp: serverTimestamp(),
            moneySaved: metrics.moneySaved,
            co2SavedKg: metrics.co2SavedKg,
            solarUtilPct: metrics.optimizedSolarUtilPct,
            preset: config.selectedPreset,
            loadsCount: loads.length,
            currency: config.currency,
          });
        } catch (err) {
          console.warn('Firestore run record note:', err);
        }
      }
    }, 450);
  }, [currentUser, metrics, config, loads, notifyOptimizationComplete]);

  // Currency toggle handler
  const handleCurrencyToggle = () => {
    const isCurrentlyInr = config.currency === 'INR';
    const newCur = isCurrentlyInr ? 'USD' : 'INR';
    const newSym = isCurrentlyInr ? '$' : '₹';
    setConfig((prev) => ({
      ...prev,
      currency: newCur,
      currencySymbol: newSym,
      feedInCreditRatePerKwh: isCurrentlyInr ? 0.05 : 3.5,
    }));
    addToast({
      type: 'info',
      title: 'Billing Currency Toggled',
      message: `Switched display denomination to ${newCur} (${newSym}). Utility rates updated.`,
      badge: newCur,
      duration: 3500,
    });
  };

  // Load update handlers
  const handleUpdateLoad = (updatedLoad: DeferrableLoad) => {
    setLoads((prev) => prev.map((l) => (l.id === updatedLoad.id ? updatedLoad : l)));
    addToast({
      type: 'info',
      title: 'Appliance Parameter Updated',
      message: `${updatedLoad.name} power set to ${updatedLoad.powerKw} kW (${updatedLoad.durationHours}h run).`,
      badge: updatedLoad.category.toUpperCase(),
      duration: 3500,
    });
  };

  const handleAddLoad = (newLoad: DeferrableLoad) => {
    setLoads((prev) => [...prev, newLoad]);
    addToast({
      type: 'success',
      title: 'New Deferrable Load Registered',
      message: `Enrolled ${newLoad.name} (${newLoad.powerKw} kW) into the automated dispatch pool.`,
      badge: 'POOL EXPANDED',
      duration: 4000,
    });
  };

  const handleDeleteLoad = (loadId: string) => {
    const target = loads.find(l => l.id === loadId);
    setLoads((prev) => prev.filter((l) => l.id !== loadId));
    addToast({
      type: 'warning',
      title: 'Appliance Removed',
      message: `${target?.name || 'Load'} bypassed from automated microgrid scheduling.`,
      duration: 3500,
    });
  };

  const handlePresetChange = (preset: GridPreset) => {
    setConfig((prev) => ({ ...prev, selectedPreset: preset }));
    const titles: Record<GridPreset, string> = {
      max_solar: 'Max Solar Self-Consumption',
      storm_guard: 'Storm Guard Reserve Buffer',
      arbitrage: 'Tariff Arbitrage Dispatch',
    };
    addToast({
      type: 'info',
      title: `Grid Preset: ${titles[preset]}`,
      message: `Battery reserve calibrated. Solver objective re-weighted for ${preset.replace('_', ' ')}.`,
      badge: preset.toUpperCase(),
      duration: 4500,
    });
  };

  const handleCloudStress = () => {
    const next = solarScale === 0.5 ? 1.0 : 0.5;
    setSolarScale(next);
    if (next === 0.5) {
      addToast({
        type: 'warning',
        title: 'Cloud Cover Stress Test Engaged ⛅',
        message: 'Solar irradiance throttled by 50%. Deferrable loads re-sequencing to avoid peak grid imports.',
        badge: '50% Solar Irradiance',
        duration: 5000,
      });
    } else {
      addToast({
        type: 'success',
        title: 'Full Solar Irradiance Restored ☀️',
        message: 'Overcast cleared. 100% nominal PV generation capacity back online.',
        badge: '100% Irradiance',
        duration: 4000,
      });
    }
  };

  const handleSelectCampus = (campus: typeof CAMPUS_PRESETS[0]) => {
    setConfig((prev) => ({
      ...prev,
      campusName: campus.name,
      solarCapacityKw: campus.solarKw,
      batteryCapacityKwh: campus.batteryKwh,
      currentBatterySocPct: campus.socPct,
    }));
    setShowCampusSwitcher(false);
    addToast({
      type: 'info',
      title: `Campus Microgrid Switched`,
      message: `Connected to ${campus.name} (${campus.solarKw} kW Solar, ${campus.batteryKwh} kWh Storage).`,
      badge: campus.id.toUpperCase(),
      duration: 4500,
    });
  };

  const handleResetDefaults = () => {
    setConfig(INITIAL_CONFIG);
    setLoads(INITIAL_DEFERRABLE_LOADS);
    setSolarScale(1.0);
    setPriceScale(1.0);
    addToast({
      type: 'info',
      title: 'Factory Benchmarks Reset',
      message: 'Restored baseline solar arrays, appliance loads, and standard TOU tariff schedules.',
      duration: 3500,
    });
  };

  const handleDemoSignIn = () => {
    const mockUser: any = {
      uid: 'admin_eco_1',
      email: 'admin@berkeley.edu',
      displayName: 'Dr. Julian Vance',
      photoURL: null,
    };
    setCurrentUser(mockUser);
    addToast({
      type: 'success',
      title: 'Signed in as Microgrid Admin',
      message: 'Connected to Firestore cloud database with telemetry permissions.',
      badge: 'ADMIN ACTIVE',
      duration: 4500,
    });
  };

  const unreadAlertsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-emerald-500/30">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Mobile Top Navigation Bar with Toggle */}
      <div className="md:hidden bg-[#0a0e17] border-b border-slate-800 p-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-bold">
            ⚡
          </div>
          <span className="font-bold text-slate-100">EcoWatt Microgrid</span>
        </div>
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="p-2 rounded-lg bg-slate-800 text-slate-200"
        >
          {showMobileSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Sidebar (Desktop + Mobile Drawer) */}
      <div className={`${showMobileSidebar ? 'block' : 'hidden'} md:block fixed md:static inset-y-0 left-0 z-50`}>
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setShowMobileSidebar(false);
            if (tab === 'python_runner') setShowCodeModal(true);
            if (tab === 'settings') setShowSettingsModal(true);
          }}
        />
      </div>

      {/* Main Microgrid Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header matching Screenshot */}
        <TopHeader
          config={config}
          metrics={metrics}
          user={currentUser}
          currentSolarKw={currentSolarKw}
          currentDemandKw={currentDemandKw}
          currentExportKw={currentExportKw}
          unreadAlertsCount={unreadAlertsCount}
          onCurrencyToggle={handleCurrencyToggle}
          onOpenCodeModal={() => setShowCodeModal(true)}
          onOpenCampusSwitcher={() => setShowCampusSwitcher(true)}
          onOpenNotifications={() => setShowNotificationCenter(true)}
          onOpenHistoryModal={() => setShowHistoryModal(true)}
          onDemoSignIn={handleDemoSignIn}
          onSignOut={() => setCurrentUser(null)}
        />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1700px] w-full mx-auto space-y-5">
          {/* Top 5 Stat Cards matching Screenshot */}
          <TopStatCards
            currentSolarKw={currentSolarKw}
            currentDemandKw={currentDemandKw}
            batterySocPct={config.currentBatterySocPct}
            currentExportKw={currentExportKw}
            metrics={metrics}
            config={config}
          />

          {/* Tab Views Routing */}
          {(activeTab === 'overview' || activeTab === 'realtime_flow' || activeTab === 'solar_storage' || activeTab === 'appliances' || activeTab === 'tariffs') && (
            <div className="space-y-5">
              {/* Row 1: Kinetic Energy Mesh + Load Automation Panel */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <div className="xl:col-span-2">
                  <KineticEnergyMesh
                    solarKw={currentSolarKw}
                    homeLoadKw={currentDemandKw}
                    batterySocPct={config.currentBatterySocPct}
                    batteryPowerKw={0.0}
                    gridExportKw={currentExportKw}
                    config={config}
                    onInspectNode={(nodeId) => setInspectedNode(nodeId)}
                  />
                </div>
                <div className="xl:col-span-1">
                  <LoadAutomationPanel
                    loads={loads}
                    config={config}
                    onUpdateLoad={handleUpdateLoad}
                    onAddLoad={handleAddLoad}
                    onDeleteLoad={handleDeleteLoad}
                    onPresetChange={handlePresetChange}
                  />
                </div>
              </div>

              {/* Row 2: Production & Tariff Profiler + EcoAI Dispatcher */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <div className="xl:col-span-2">
                  <ProductionTariffProfiler
                    hourlyData={hourlyData}
                    config={config}
                    currentHoverHour={activeHour}
                    onHoverHourChange={setActiveHour}
                  />
                </div>
                <div className="xl:col-span-1">
                  <EcoAIDispatcher
                    metrics={metrics}
                    config={config}
                    optimalSolarWindow={optimalSolarWindow}
                    onOptimizeClick={handleOptimize}
                    isOptimizing={isOptimizing}
                    lastOptimizedTime={lastOptimizedTime}
                    onSimulateCloudStress={handleCloudStress}
                  />
                </div>
              </div>

              {/* Row 3: Yield & Environmental Returns + Before vs After Scorecard */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <YieldEnvironmentalReturns metrics={metrics} config={config} />
                <SavingsAndImpactSection
                  metrics={metrics}
                  config={config}
                  loads={optimizationResult.optimizedLoads}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Python & Streamlit Code Modal */}
      <PythonStreamlitCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        config={config}
        onUpdateConfig={setConfig}
        solarScale={solarScale}
        onSolarScaleChange={setSolarScale}
        priceScale={priceScale}
        onPriceScaleChange={setPriceScale}
        onResetDefaults={handleResetDefaults}
      />

      {/* Campus Facility Switcher Modal */}
      <CampusSwitcherModal
        isOpen={showCampusSwitcher}
        onClose={() => setShowCampusSwitcher(false)}
        config={config}
        onSelectCampus={handleSelectCampus}
      />

      {/* Notification Center Alert Modal */}
      <NotificationCenterModal
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
        onClearAll={() => setNotifications([])}
        onAddSimulatedAlert={() => {
          const newAlert: MicrogridAlert = {
            id: `alert_${Date.now()}`,
            title: 'Dynamic Peak Shave Executed',
            message: 'Switched campus HVAC chiller to PowerVault battery to eliminate grid surcharge.',
            type: 'success',
            time: 'Just now',
            read: false,
          };
          setNotifications((prev) => [newAlert, ...prev]);
          addToast({
            type: 'info',
            title: 'Alert Stream Updated',
            message: newAlert.message,
            badge: 'GRID TELEMETRY',
          });
        }}
      />

      {/* Optimization Audit History Modal */}
      <OptimizationHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        runs={pastRuns}
        config={config}
      />

      {/* Node Diagnostic Inspector Modal */}
      <NodeInspectorModal
        nodeId={inspectedNode}
        onClose={() => setInspectedNode(null)}
        solarKw={currentSolarKw}
        homeLoadKw={currentDemandKw}
        batterySocPct={config.currentBatterySocPct}
        gridExportKw={currentExportKw}
        config={config}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MicrogridDashboard />
    </ToastProvider>
  );
}
