import React, { useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const TOAST_STYLE = {
  success: { icon: CheckCircle2, iconCls: 'text-emerald-500' },
  error: { icon: AlertCircle, iconCls: 'text-rose-500' },
  info: { icon: Info, iconCls: 'text-indigo-500' },
};

// Hook quản lý danh sách toast: pushToast('success' | 'error' | 'info', 'Nội dung')
export const useToasts = () => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (type, message) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismissToast(id), 4000);
    },
    [dismissToast]
  );

  return { toasts, pushToast, dismissToast };
};

export const ToastContainer = ({ toasts, onDismiss }) => (
  <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-[calc(100%-2rem)] sm:w-96 pointer-events-none">
    {toasts.map((t) => {
      const { icon: Icon, iconCls } = TOAST_STYLE[t.type] || TOAST_STYLE.info;
      return (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex items-start gap-3 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/5 px-4 py-3 animate-slide-up"
        >
          <Icon size={18} className={`mt-0.5 shrink-0 ${iconCls}`} />
          <p className="flex-1 text-sm text-slate-700 leading-5">{t.message}</p>
          <button
            onClick={() => onDismiss(t.id)}
            className="shrink-0 p-0.5 rounded text-slate-400 hover:text-slate-600 transition cursor-pointer"
            aria-label="Đóng thông báo"
          >
            <X size={14} />
          </button>
        </div>
      );
    })}
  </div>
);