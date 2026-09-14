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
  let progressColor = 'bg-[#4A6B53]'; // Secondary: hijau sage/forest
  let badgeColor = 'text-[#4A6B53] bg-[#4A6B53]/10';

  if (percentage >= 90) {
    progressColor = 'bg-[#B0473C]'; // Merah bahaya
    badgeColor = 'text-[#B0473C] bg-[#B0473C]/10';
  } else if (percentage >= 70) {
    progressColor = 'bg-[#C98A3A]'; // Kuning peringatan
    badgeColor = 'text-[#C98A3A] bg-[#C98A3A]/10';
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 bg-white rounded-2xl border border-[#E5DCD0] shadow-xs flex flex-col gap-2.5',
        onClick && 'cursor-pointer hover:bg-[#FAF7F2]/80 transition-colors',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs sm:text-sm font-bold text-[#2D2A26]">{title}</span>
          {isOver && <AlertTriangle className="w-4 h-4 text-[#B0473C]" />}
        </div>
        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', badgeColor)}>
          {percentage}% terpakai
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-3 rounded-full bg-[#F2ECE1] overflow-hidden p-0.5">
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', progressColor)}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>

      {showDetails && (
        <div className="flex items-center justify-between text-xs text-[#68635B] pt-0.5">
          <span>
            Terpakai: <strong className="text-[#2D2A26]">{formatRupiah(spentAmount)}</strong>
          </span>
          <span>
            {isOver ? (
              <span className="text-[#B0473C] font-semibold">
                Lebih {formatRupiah(Math.abs(remaining))}
              </span>
            ) : (
              <span>
                Sisa: <strong className="text-[#4A6B53]">{formatRupiah(remaining)}</strong>
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
