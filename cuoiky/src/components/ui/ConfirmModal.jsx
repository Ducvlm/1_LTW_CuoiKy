import React, { useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in"
      onClick={() => !loading && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="h-9 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition disabled:opacity-60 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 h-9 px-4 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition disabled:opacity-60 cursor-pointer"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;