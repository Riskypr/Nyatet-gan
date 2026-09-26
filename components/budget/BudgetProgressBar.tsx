'use client';

import React from 'react';
import { formatRupiah } from '@/lib/utils/currency';
import { cn } from '@/lib/utils/cn';
import { AlertTriangle } from 'lucide-react';

export interface BudgetProgressBarProps {
  title?: string;
  spentAmount: number;
  targetAmount: number;
  showDetails?: boolean;
  className?: string;
  onClick?: () => void;
}

export function BudgetProgressBar({
  title = 'Target Pengeluaran Bulanan',
  spentAmount,
  targetAmount,
  showDetails = true,
  className,
  onClick,
}: BudgetProgressBarProps) {
  const percentage = targetAmount > 0 ? Math.round((spentAmount / targetAmount) * 100) : 0;
  const clampedPercentage = Math.min(percentage, 100);
  const remaining = targetAmount - spentAmount;
  const isOver = spentAmount > targetAmount;

  // Warna progress bar adaptif sesuai persentase terpakai
  let progressColor = 'bg-secondary';
  let badgeColor = 'text-secondary bg-secondary/15';

  if (percentage >= 90) {
    progressColor = 'bg-danger';
    badgeColor = 'text-danger bg-danger/15';
  } else if (percentage >= 70) {
    progressColor = 'bg-warning';
    badgeColor = 'text-warning bg-warning/15';
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col gap-2.5 transition-all',
        onClick && 'cursor-pointer hover:border-primary/40 hover:bg-surface-alt/40',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs sm:text-sm font-bold text-text-primary">{title}</span>
          {isOver && <AlertTriangle className="w-4 h-4 text-danger shrink-0" />}
        </div>
        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', badgeColor)}>
          {percentage}% terpakai
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-3 rounded-full bg-surface-alt overflow-hidden p-0.5">
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', progressColor)}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>

      {showDetails && (
        <div className="flex items-center justify-between text-xs text-text-secondary pt-0.5">
          <span>
            Terpakai: <strong className="text-text-primary">{formatRupiah(spentAmount)}</strong>
          </span>
          <span>
            {isOver ? (
              <span className="text-danger font-semibold">
                Lebih {formatRupiah(Math.abs(remaining))}
              </span>
            ) : (
              <span>
                Sisa: <strong className="text-secondary">{formatRupiah(remaining)}</strong>
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
