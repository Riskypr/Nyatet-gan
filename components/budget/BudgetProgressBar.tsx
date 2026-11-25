'use client';

import React from 'react';
import { formatRupiah } from '@/lib/utils/currency';
import { getRemainingDaysLabel } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { Target } from 'lucide-react';

export interface BudgetProgressBarProps {
  title?: string;
  spentAmount: number;
  targetAmount: number;
  month?: string;
  icon?: React.ReactNode;
  showDetails?: boolean;
  className?: string;
  onClick?: () => void;
  actions?: React.ReactNode;
}

export function BudgetProgressBar({
  title = 'Anggaran Bulanan',
  spentAmount,
  targetAmount,
  month,
  icon,
  showDetails = true,
  className,
  onClick,
  actions,
}: BudgetProgressBarProps) {
  const percentage = targetAmount > 0 ? Math.round((spentAmount / targetAmount) * 100) : 0;
  const clampedPercentage = Math.min(percentage, 100);
  const remaining = targetAmount - spentAmount;
  const isOver = spentAmount > targetAmount;

  // Warna progress bar & badge adaptif sesuai persentase terpakai (gunakan warna app sebelumnya)
  let progressColor = 'bg-secondary';
  let badgeColor = 'text-secondary bg-secondary/15';
  let dotColor = 'bg-secondary';
  let statusText = 'Aman';

  if (isOver) {
    progressColor = 'bg-danger';
    badgeColor = 'text-danger bg-danger/15';
    dotColor = 'bg-danger';
    statusText = 'Melebihi';
  } else if (percentage >= 90) {
    progressColor = 'bg-danger';
    badgeColor = 'text-danger bg-danger/15';
    dotColor = 'bg-danger';
    statusText = 'Kritis';
  } else if (percentage >= 70) {
    progressColor = 'bg-warning';
    badgeColor = 'text-warning bg-warning/15';
    dotColor = 'bg-warning';
    statusText = 'Waspada';
  }

  const remainingDaysLabel = month ? getRemainingDaysLabel(month) : '';

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 sm:p-5 bg-surface rounded-2xl border border-border shadow-xs flex flex-col gap-3 transition-all',
        onClick && 'cursor-pointer hover:border-primary/40 hover:bg-surface-alt/40',
        className
      )}
    >
      {/* Header: Icon + Judul di kiri, Badge Status di kanan */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon || <Target className="w-4 h-4 text-primary shrink-0" />}
          <span className="text-sm sm:text-base font-bold text-text-primary truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap', badgeColor)}>
            {statusText} ({percentage}%)
          </span>
          {actions}
        </div>
      </div>

      {/* Baris 2 kolom: Terpakai (kiri, besar) & Target Maksimal (kanan) */}
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] text-text-secondary">Terpakai</span>
          <span className="text-lg sm:text-xl font-extrabold text-text-primary truncate">
            {formatRupiah(spentAmount)}
          </span>
        </div>
        <div className="flex flex-col items-end shrink-0 text-right">
          <span className="text-[11px] text-text-secondary">Target Maksimal</span>
          <span className="text-sm sm:text-base font-bold text-text-primary">
            {formatRupiah(targetAmount)}
          </span>
        </div>
      </div>

      {/* Progress Bar Container with fill animation */}
      <div className="w-full h-2.5 sm:h-3 rounded-full bg-surface-alt overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out animate-progress-fill', progressColor)}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>

      {showDetails && (
        <div className="flex items-center justify-between text-xs text-text-secondary pt-0.5 gap-2">
          <span className="inline-flex items-center gap-1.5 truncate">
            <span className={cn('w-2 h-2 rounded-full shrink-0', dotColor)} />
            {isOver ? (
              <span className="text-danger font-semibold">
                Lebih: {formatRupiah(Math.abs(remaining))}
              </span>
            ) : (
              <span>
                Sisa: <strong className="text-text-primary font-semibold">{formatRupiah(remaining)}</strong>
              </span>
            )}
          </span>
          {remainingDaysLabel && (
            <span className="shrink-0 text-right text-[11px] text-text-secondary">
              {remainingDaysLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
