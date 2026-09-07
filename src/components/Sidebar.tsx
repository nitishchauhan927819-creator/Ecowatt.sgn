import React from 'react';
import { 
  LayoutDashboard, 
  Workflow, 
  SunMedium, 
  Cpu, 
  Zap, 
  Settings, 
  Code, 
  Radio, 
  Activity,
  Layers
} from 'lucide-react';

export type NavigationTab = 
  | 'overview' 
  | 'realtime_flow' 
  | 'solar_storage' 
  | 'appliances' 
  | 'tariffs' 
  | 'python_runner'
  | 'settings';

interface Props {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
}) => {
  const navItems = [
    { id: 'overview' as NavigationTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'realtime_flow' as NavigationTab, label: 'Real-time Flow', icon: Workflow },
    { id: 'solar_storage' as NavigationTab, label: 'Solar & Storage', icon: SunMedium },
    { id: 'appliances' as NavigationTab, label: 'Appliance Analytics', icon: Cpu },
    { id: 'tariffs' as NavigationTab, label: 'Grid & Tariffs', icon: Zap },
    { id: 'python_runner' as NavigationTab, label: 'Python & Streamlit', icon: Code, badge: 'Code' },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0a0e17] border-r border-slate-800/80 flex flex-col justify-between p-4 shrink-0 min-h-screen">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 px-2 py-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
              EcoWatt
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            </div>
            <div className="text-[10px] tracking-widest text-cyan-400/90 uppercase font-mono font-semibold">
              INTELLIGENCE OS
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1.5 font-medium text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-800/90 text-emerald-400 font-semibold shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom DER Telemetry status box matching screenshot */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[10px] tracking-wider uppercase text-slate-400">DER TELEMETRY</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <div className="text-sm font-bold text-slate-100 flex items-baseline gap-1">
          99.8% <span className="text-[11px] font-normal text-emerald-400">Uptime</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">Edge Gateway Active</div>
      </div>
    </aside>
  );
};
