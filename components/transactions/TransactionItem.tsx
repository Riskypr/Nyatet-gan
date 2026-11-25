'use client';

import React from 'react';
import { Transaction, Category, Wallet } from '@/lib/types';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { formatRupiah } from '@/lib/utils/currency';
import { useUIStore } from '@/lib/stores/uiStore';
import { cn } from '@/lib/utils/cn';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { id } from 'date-fns/locale';

export interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  wallet?: Wallet;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
  onClick?: (tx: Transaction) => void;
}

function formatTransactionTimestamp(dateStr: string, createdAt?: string): string {
  let dayLabel = dateStr;
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) {
      dayLabel = 'Hari ini';
    } else if (isYesterday(d)) {
      dayLabel = 'Kemarin';
    } else {
      dayLabel = format(d, 'd MMM', { locale: id });
    }
  } catch {
    // fallback to raw dateStr
  }

  let timeLabel = '';
  try {
    if (createdAt) {
      const created = parseISO(createdAt);
      timeLabel = format(created, 'HH:mm');
    }
  } catch {
    // ignore invalid createdAt
  }

  return timeLabel ? `${dayLabel}, ${timeLabel}` : dayLabel;
}

export function TransactionItem({
  transaction,
  category,
  wallet,
  onClick,
}: TransactionItemProps) {
  const openTransactionDetail = useUIStore((s) => s.openTransactionDetail);
  const isIncome = transaction.type === 'income';
  const categoryLabel = category?.name || (isIncome ? 'Pemasukan' : 'Pengeluaran');
  const titleText = transaction.note?.trim() || categoryLabel;
  const timestampText = formatTransactionTimestamp(transaction.date, transaction.createdAt);

  const handleItemClick = () => {
    if (onClick) {
      onClick(transaction);
    } else {
      openTransactionDetail(transaction);
    }
  };

  return (
    <div
      onClick={handleItemClick}
      className="relative group flex items-center justify-between gap-3 px-3.5 py-3 bg-surface hover:bg-surface-alt/70 rounded-2xl border border-border/80 shadow-xs transition-all duration-150 cursor-pointer active:scale-[0.99] select-none"
    >
      {/* Left: Circular Icon + Title + Date/Time • Wallet */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <CategoryIcon
          name={category?.icon || (isIncome ? 'Coins' : 'Tag')}
          color={category?.color || (isIncome ? '#057642' : '#0A66C2')}
          size="md"
          className="rounded-full"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-text-primary truncate leading-snug">
            {titleText}
          </p>
          <p className="text-xs text-text-secondary truncate mt-0.5">
            {timestampText}
            {wallet ? ` • ${wallet.name}` : ''}
          </p>
        </div>
      </div>

      {/* Right: Amount + Category Name */}
      <div className="shrink-0 text-right">
        <p
          className={cn(
            'font-extrabold text-sm sm:text-base tracking-tight leading-snug',
            isIncome ? 'text-secondary' : 'text-text-primary'
          )}
        >
          {isIncome ? '+' : '-'}
          {formatRupiah(transaction.amount)}
        </p>
        <p className="text-[11px] font-medium text-text-secondary mt-0.5 truncate max-w-[110px] ml-auto">
          {categoryLabel}
        </p>
      </div>
    </div>
  );
}
