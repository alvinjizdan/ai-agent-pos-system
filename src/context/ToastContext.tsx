import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  toast: {
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const removeToast = useCallback((id: string) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, title?: string, duration = 3800) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastItem = { id, type, message, title, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (message: string, title = 'Sukses', duration = 3800) => showToast('success', message, title, duration),
    error: (message: string, title = 'Terjadi Kesalahan', duration = 4500) => showToast('error', message, title, duration),
    warning: (message: string, title = 'Perhatian', duration = 4000) => showToast('warning', message, title, duration),
    info: (message: string, title = 'Informasi', duration = 3500) => showToast('info', message, title, duration),
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
    }
  };

  const getBadgeStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'error':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'info':
      default:
        return 'bg-sky-500/10 border-sky-500/20 text-sky-400';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, toast, removeToast }}>
      {children}
      
      {/* Floating Notification Portal */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white shadow-2xl shadow-black/30 transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-3 hover:bg-slate-900/95"
          >
            {/* Semantic Icon Wrapper */}
            <div className={`p-2 rounded-xl border shrink-0 ${getBadgeStyle(item.type)}`}>
              {getIcon(item.type)}
            </div>

            {/* Message Body */}
            <div className="flex-1 pt-0.5 min-w-0">
              {item.title && (
                <h5 className="font-semibold text-sm text-slate-100 tracking-tight leading-none mb-1">
                  {item.title}
                </h5>
              )}
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed break-words">
                {item.message}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => removeToast(item.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="Tutup notifikasi"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
