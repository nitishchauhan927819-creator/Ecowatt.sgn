import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  AlertOctagon, 
  X, 
  ArrowRight,
  Zap,
  TrendingDown,
  Trash2
} from 'lucide-react';
import { ToastItem, ToastType } from '../types';
import { useToast } from '../context/ToastContext';

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(toast.duration ?? 5500);

  useEffect(() => {
    if (isPaused) return;

    const totalDuration = toast.duration ?? 5500;
    const intervalMs = 25;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, remainingTimeRef.current - elapsed);
      const pct = (remaining / totalDuration) * 100;
      setProgress(pct);

      if (remaining <= 0) {
        clearInterval(timer);
        onDismiss(toast.id);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, toast.duration, toast.id, onDismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    // calculate remaining
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now();
    setIsPaused(false);
  };

  const getStyleByType = (type: ToastType) => {
    switch (type) {
      case 'savings':
        return {
          icon: <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />,
          iconBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
          border: 'border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.25)]',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
          titleColor: 'text-emerald-300',
        };
      case 'success':
        return {
          icon: <Zap className="w-5 h-5 text-emerald-400 shrink-0" />,
          iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          border: 'border-emerald-500/40 shadow-xl shadow-emerald-950/40',
          badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          progressBar: 'bg-emerald-500',
          titleColor: 'text-slate-100',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          border: 'border-amber-500/40 shadow-xl shadow-amber-950/30',
          badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          progressBar: 'bg-amber-500',
          titleColor: 'text-amber-200',
        };
      case 'alert':
        return {
          icon: <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />,
          iconBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
          border: 'border-rose-500/50 shadow-xl shadow-rose-950/40',
          badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          progressBar: 'bg-rose-500',
          titleColor: 'text-rose-200',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
          iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
          border: 'border-cyan-500/40 shadow-xl shadow-cyan-950/30',
          badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          progressBar: 'bg-cyan-500',
          titleColor: 'text-cyan-200',
        };
    }
  };

  const style = getStyleByType(toast.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto w-full bg-[#0d1526]/95 border ${style.border} rounded-2xl p-4 backdrop-blur-xl relative overflow-hidden group`}
      role="alert"
      aria-live="assertive"
    >
      {/* Top row: Icon, Title, Badges, Close */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${style.iconBg} shadow-inner`}>
            {style.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <h4 className={`text-sm font-bold tracking-tight ${style.titleColor}`}>
                {toast.title}
              </h4>
              {toast.badge && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${style.badgeBg}`}>
                  {toast.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans pr-2">
              {toast.message}
            </p>

            {/* Metric highlight delta if present */}
            {toast.metricDelta && (
              <div className="mt-2 inline-flex items-center space-x-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{toast.metricDelta}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Footer if available */}
      {toast.action && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-end">
          <button
            onClick={() => {
              if (toast.action) toast.action.onClick();
              onDismiss(toast.id);
            }}
            className="flex items-center space-x-1.5 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
          >
            <span>{toast.action.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Progress countdown indicator line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/60 overflow-hidden">
        <div 
          className={`h-full ${style.progressBar} transition-all duration-75`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast, clearAllToasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-[9999] pointer-events-none flex flex-col gap-2.5 w-full max-w-[420px] px-3 sm:px-0"
      aria-label="Notifications"
    >
      {/* Clear All banner if multiple toasts exist */}
      {toasts.length > 1 && (
        <div className="pointer-events-auto self-end flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 shadow-md">
          <span>{toasts.length} notifications</span>
          <button
            onClick={clearAllToasts}
            className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 font-semibold"
            title="Dismiss all notifications"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear all</span>
          </button>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard 
            key={toast.id} 
            toast={toast} 
            onDismiss={dismissToast} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
