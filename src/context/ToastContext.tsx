import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { ToastItem, ToastType, OptimizationMetrics, MicrogridConfig } from '../types';

interface ToastOptions {
  type: ToastType;
  title: string;
  message: string;
  badge?: string;
  metricDelta?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  notifyOptimizationComplete: (metrics: OptimizationMetrics, config: MicrogridConfig, loadsCount: number) => void;
  notifySignificantSavings: (metrics: OptimizationMetrics, config: MicrogridConfig) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = {
      id,
      type: options.type,
      title: options.title,
      message: options.message,
      badge: options.badge,
      metricDelta: options.metricDelta,
      duration: options.duration ?? 5500,
      action: options.action,
      timestamp: Date.now(),
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep max 5 visible toasts to avoid clutter
    return id;
  }, []);

  // Dedicated helper when optimization completes
  const notifyOptimizationComplete = useCallback((
    metrics: OptimizationMetrics, 
    config: MicrogridConfig, 
    loadsCount: number
  ) => {
    const isSignificant = metrics.costSavingsPct >= 20 || metrics.moneySaved >= 8;

    // Trigger base optimization complete toast
    addToast({
      type: 'success',
      title: 'Autonomous Optimization Complete',
      message: `Mixed-Integer Linear Program scheduled ${loadsCount} deferrable loads into zero-marginal-cost solar slots.`,
      badge: `Solved in 35ms`,
      metricDelta: `${config.currencySymbol}${metrics.optimizedCost.toFixed(2)}/day`,
      duration: 6000,
      action: {
        label: 'View Impact',
        onClick: () => {
          const el = document.getElementById('impact-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        },
      },
    });

    // If significant savings are unlocked, celebrate with dedicated high-impact alert + confetti!
    if (isSignificant) {
      setTimeout(() => {
        // Trigger subtle confetti burst
        try {
          confetti({
            particleCount: 55,
            spread: 65,
            origin: { y: 0.15, x: 0.85 },
            colors: ['#10b981', '#06b6d4', '#f59e0b', '#34d399'],
            ticks: 200,
            gravity: 1.1,
          });
        } catch {
          // ignore if canvas blocked
        }

        addToast({
          type: 'savings',
          title: 'Significant Savings Achieved! 🌿',
          message: `Slashed daily energy bill by ${metrics.costSavingsPct}% (${config.currencySymbol}${metrics.moneySaved.toFixed(2)}/day). Prevented ${metrics.co2SavedKg.toFixed(1)} kg CO2!`,
          badge: `-${metrics.costSavingsPct}% Cost Reduction`,
          metricDelta: `+${metrics.solarWastedSavedKwh.toFixed(1)} kWh Captured`,
          duration: 7500,
          action: {
            label: 'Inspect Scorecard',
            onClick: () => {
              const el = document.getElementById('impact-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            },
          },
        });
      }, 400);
    }
  }, [addToast]);

  const notifySignificantSavings = useCallback((metrics: OptimizationMetrics, config: MicrogridConfig) => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.15, x: 0.85 },
        colors: ['#10b981', '#34d399', '#06b6d4'],
      });
    } catch {
      // ignore
    }

    addToast({
      type: 'savings',
      title: 'High-Yield Peak Achieved! ⚡',
      message: `Solar self-consumption reached ${metrics.optimizedSolarUtilPct}%. Daily energy expenditure dropped to ${config.currencySymbol}${metrics.optimizedCost.toFixed(2)}.`,
      badge: `${config.currencySymbol}${metrics.moneySaved.toFixed(2)} Saved`,
      duration: 6500,
    });
  }, [addToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        dismissToast,
        clearAllToasts,
        notifyOptimizationComplete,
        notifySignificantSavings,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
