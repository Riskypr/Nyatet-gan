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
  toast(
    ({ closeToast }) => (
      <div className="flex flex-col gap-2.5 p-1 select-none">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#2D2A26]">{title}</span>
          <p className="text-xs text-[#68635B] mt-0.5 leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#E5DCD0]/70">
          <button
            type="button"
            onClick={() => {
              closeToast();
              if (onCancel) onCancel();
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#E5DCD0] bg-white text-[#68635B] hover:bg-[#F2ECE1] transition-colors"
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
                ? 'bg-[#B0473C] hover:bg-[#8F3930]'
                : 'bg-[#C86446] hover:bg-[#A84D32]'
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
      theme: 'light',
    }
  );
}
