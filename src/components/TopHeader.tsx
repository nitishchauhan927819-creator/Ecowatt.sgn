import React, { useState } from 'react';
import { 
  Sun, 
  Home, 
  ArrowUpRight, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  ChevronDown, 
  Code2, 
  DollarSign, 
  Globe, 
  Sparkles,
  Zap,
  RotateCw
} from 'lucide-react';
import { MicrogridConfig, OptimizationMetrics } from '../types';
import { auth, googleProvider, signInWithPopup, signOut, User } from '../firebase';

interface Props {
  config: MicrogridConfig;
  metrics: OptimizationMetrics;
  user: User | null;
  currentSolarKw: number;
  currentDemandKw: number;
  currentExportKw: number;
  unreadAlertsCount: number;
  onCurrencyToggle: () => void;
  onOpenCodeModal: () => void;
  onOpenCampusSwitcher: () => void;
  onOpenNotifications: () => void;
  onOpenHistoryModal: () => void;
  onDemoSignIn?: () => void;
  onSignOut?: () => void;
}

export const TopHeader: React.FC<Props> = ({
  config,
  metrics,
  user,
  currentSolarKw,
  currentDemandKw,
  currentExportKw,
  unreadAlertsCount,
  onCurrencyToggle,
  onOpenCodeModal,
  onOpenCampusSwitcher,
  onOpenNotifications,
  onOpenHistoryModal,
  onDemoSignIn,
  onSignOut,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.warn('Google sign in popup blocked or unavailable, enabling local admin session:', err);
      if (onDemoSignIn) onDemoSignIn();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
    if (onSignOut) onSignOut();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-[#0f172a]/95 border-b border-slate-800/80 px-4 py-3 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Campus / Node Switcher (NOW FULLY CLICKABLE) */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenCampusSwitcher}
            className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-xl px-3 py-1.5 shadow-sm transition-all text-left group"
            title="Click to switch campus facility"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform"></div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5 group-hover:text-emerald-300">
                <span>{config.campusName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-transform group-hover:translate-y-0.5" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {config.solarCapacityKw} kW Solar • {config.batteryCapacityKwh} kWh LFP
              </div>
            </div>
          </button>

          {/* Grid Connected Status */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-900/60 border border-slate-800/80 rounded-xl px-2.5 py-1 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">Grid Connected</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold">Net Zero {metrics.optimizedSolarUtilPct}% Self-Sufficiency</span>
          </div>
        </div>

        {/* Middle Status Badges matching Screenshot */}
        <div className="hidden lg:flex items-center space-x-2 font-mono text-xs">
          {/* Solar badge */}
          <div className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-xl">
            <Sun className="w-3.5 h-3.5" />
            <span className="font-bold">+{currentSolarKw.toFixed(1)} kW</span>
          </div>

          {/* Demand badge */}
          <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl">
            <Home className="w-3.5 h-3.5" />
            <span className="font-bold">{currentDemandKw.toFixed(1)} kW</span>
          </div>

          {/* Export badge */}
          <div className="flex items-center space-x-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-xl">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="font-bold">+{currentExportKw.toFixed(1)} kW Export</span>
          </div>
        </div>

        {/* Right Tools & Profile */}
        <div className="flex items-center space-x-2.5">
          {/* Currency Switcher */}
          <button
            onClick={onCurrencyToggle}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 px-2.5 py-1.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white transition-all active:scale-95"
            title="Toggle Currency (₹ INR / $ USD)"
          >
            <span className="font-bold text-amber-400">{config.currencySymbol}</span>
            <span>{config.currency}</span>
          </button>

          {/* Python & Streamlit Code Modal Button */}
          <button
            onClick={onOpenCodeModal}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-500/30 hover:border-emerald-400 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-300 hover:text-emerald-200 transition-all shadow-sm active:scale-95"
            title="View Python, Streamlit & PuLP optimization formulation"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">Python/Streamlit</span>
          </button>

          {/* Notification bell (NOW FULLY CLICKABLE) */}
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-slate-200 transition-all relative active:scale-95"
            title="Open Microgrid Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5 animate-pulse"></span>
            )}
          </button>

          {/* User Profile / Firebase Auth */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-1.5 transition-colors"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-lg object-cover border border-emerald-500/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="text-left hidden sm:block pr-1 font-mono">
                  <div className="text-xs font-bold text-slate-200 truncate max-w-[100px]">
                    {user.displayName || user.email?.split('@')[0] || 'Julian Vance'}
                  </div>
                  <div className="text-[9px] text-emerald-400">Microgrid Admin</div>
                </div>
              </button>
            ) : (
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 px-3 py-1.5 rounded-xl text-xs text-slate-200 hover:text-emerald-300 transition-all font-mono shadow-sm active:scale-95 cursor-pointer disabled:opacity-75 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  title="Sign In to EcoWatt"
                >
                  {isSigningIn ? (
                    <RotateCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  ) : (
                    <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>{isSigningIn ? 'Connecting...' : 'Sign In'}</span>
                </button>
                {onDemoSignIn && (
                  <button
                    onClick={onDemoSignIn}
                    className="hidden sm:inline-flex items-center px-2 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono hover:bg-emerald-500/20 transition-colors cursor-pointer active:scale-95"
                    title="Instant Demo Admin Login"
                  >
                    Demo
                  </button>
                )}
              </div>
            )}

            {/* Dropdown Menu */}
            {showUserMenu && user && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 text-xs font-mono z-50">
                <div className="p-2 border-b border-slate-800">
                  <div className="font-bold text-slate-200 truncate">{user.displayName || 'Campus Admin'}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                  <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Cloud Firestore Sync Active
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenHistoryModal();
                  }}
                  className="w-full text-left p-2 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors mt-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Audit Run History
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left p-2 rounded-lg text-rose-400 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
