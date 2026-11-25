'use client';

import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import {
  formatMonthYear,
  formatMonthYearShort,
  getNextMonth,
  getPreviousMonth,
} from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

export interface MonthSelectorProps {
  /** 'full': pill lebar penuh dengan ikon kalender; 'compact': pill ringkas inline */
  variant?: 'full' | 'compact';
  className?: string;
}

export function MonthSelector({
  variant = 'full',
  className,
}: MonthSelectorProps) {
  const { currentMonth, setCurrentMonth } = useTransactionStore();

  const handlePrev = () => setCurrentMonth(getPreviousMonth(currentMonth));
  const handleNext = () => setCurrentMonth(getNextMonth(currentMonth));

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-0.5 bg-surface border border-border rounded-full px-1.5 py-0.5 shadow-xs',
          className
        )}
      >
        <button
          type="button"
          onClick={handlePrev}
          className="h-7 w-7 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
          aria-label="Bulan Sebelumnya"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-bold text-text-primary px-1.5 whitespace-nowrap select-none">
          {formatMonthYearShort(currentMonth)}
        </span>
        <button
          type="button"
          onClick={handleNext}
          className="h-7 w-7 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
          aria-label="Bulan Berikutnya"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full flex items-center justify-between bg-surface border border-border rounded-full px-2 py-1 shadow-xs',
        className
      )}
    >
      <button
        type="button"
        onClick={handlePrev}
        className="h-8 w-8 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
        aria-label="Bulan Sebelumnya"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-1.5 select-none">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
          {formatMonthYear(currentMonth)}
        </span>
      </div>
      <button
        type="button"
        onClick={handleNext}
        className="h-8 w-8 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
        aria-label="Bulan Berikutnya"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
