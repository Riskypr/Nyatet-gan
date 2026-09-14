'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2D2A26]/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div
        className={cn(
          'relative w-full md:max-w-lg bg-[#FAF7F2] border-t md:border border-[#E5DCD0]',
          'rounded-t-[28px] md:rounded-3xl shadow-xl shadow-[#2D2A26]/20',
          'max-h-[90vh] flex flex-col z-10 transition-all transform animate-in slide-in-from-bottom duration-200',
          className
        )}
      >
        {/* Drag handle for mobile */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-[#E5DCD0]" />
        </div>

        {/* Header */}
        {(title || description) && (
          <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-[#E5DCD0]/60">
            <div>
              {title && <h2 className="text-base font-semibold text-[#2D2A26]">{title}</h2>}
              {description && <p className="text-xs text-[#68635B] mt-0.5">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#68635B] hover:bg-[#E5DCD0]/50 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
