import React, { useState } from 'react';
import { Bell, X, CheckCheck, Trash2, AlertTriangle, CheckCircle, Info, Sparkles, Volume2 } from 'lucide-react';
import { MicrogridAlert } from '../data/sampleData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: MicrogridAlert[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onAddSimulatedAlert: () => void;
}

export const NotificationCenterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onAddSimulatedAlert,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filtered = filter === 'all' ? notifications : notifications.filter((n) => !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden font-mono text-xs flex flex-col max-h-[90vh] sm:mt-12 sm:mr-4">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Microgrid Alert Stream
                {unreadCount > 0 && (
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    {unreadCount} new
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-slate-400">Autonomous edge optimizer event log</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar & Actions */}
        <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 text-[11px]">
          <div className="flex space-x-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-slate-800 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-slate-800 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onMarkAllRead}
              className="text-slate-400 hover:text-emerald-400 p-1 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onClearAll}
              className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
              title="Clear all alerts"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-3 space-y-2.5 flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-slate-600" />
              <p>No alerts in current view</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all ${
                  item.read
                    ? 'bg-slate-900/50 border-slate-800/60 text-slate-400'
                    : 'bg-slate-900 border-emerald-500/30 text-slate-200 shadow-md'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className="mt-0.5 shrink-0">
                    {item.type === 'success' && (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    )}
                    {item.type === 'warning' && (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    {item.type === 'info' && (
                      <Info className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-slate-200 truncate">{item.title}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{item.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Test Alert Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={onAddSimulatedAlert}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Microgrid Telemetry Alert</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
