import React from 'react';
import { toast } from 'react-toastify';

export interface ConfirmToastOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function confirmWithToast({
  title = 'Konfirmasi Tindakan',
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  isDestructive = true,
  onConfirm,
  onCancel,
}: ConfirmToastOptions): void {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  toast(
    ({ closeToast }) => (
      <div className="flex flex-col gap-2.5 p-1 select-none">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-text-primary">{title}</span>
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/70">
          <button
            type="button"
            onClick={() => {
              closeToast();
              if (onCancel) onCancel();
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-alt transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              closeToast();
              onConfirm();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl text-white shadow-xs transition-colors ${
              isDestructive
                ? 'bg-danger hover:opacity-90'
                : 'bg-primary hover:opacity-90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    ),
    {
      position: 'top-center',
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      theme: isDark ? 'dark' : 'light',
    }
  );
}
