'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Transaction, Category, Wallet } from '@/lib/types';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { formatRupiah } from '@/lib/utils/currency';
import { useUIStore } from '@/lib/stores/uiStore';
import { cn } from '@/lib/utils/cn';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { id } from 'date-fns/locale';
import { Pencil, Trash2 } from 'lucide-react';

export interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  wallet?: Wallet;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
  onClick?: (tx: Transaction) => void;
}

const ACTION_WIDTH = 72; // Lebar tiap tombol aksi (Ubah / Hapus)
const SWIPE_OPEN_EVENT = 'nyatet:transaction-swipe-open';

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
  onEdit,
  onDelete,
  onClick,
}: TransactionItemProps) {
  const openTransactionDetail = useUIStore((s) => s.openTransactionDetail);
  const isIncome = transaction.type === 'income';
  const categoryLabel = category?.name || (isIncome ? 'Pemasukan' : 'Pengeluaran');
  const titleText = transaction.note?.trim() || categoryLabel;
  const timestampText = formatTransactionTimestamp(transaction.date, transaction.createdAt);

  const actionCount = (onEdit ? 1 : 0) + (onDelete ? 1 : 0);
  const canSwipe = actionCount > 0;
  const maxSwipe = actionCount * ACTION_WIDTH;

  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startOffsetRef = useRef(0);
  const isHorizontalRef = useRef<boolean | null>(null);
  const didDragRef = useRef(false);

  // Tutup item ini otomatis jika item lain digeser terbuka
  useEffect(() => {
    if (!canSwipe) return;
    const handleOtherOpen = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail !== transaction.id) {
        setOffset(0);
      }
    };
    window.addEventListener(SWIPE_OPEN_EVENT, handleOtherOpen);
    return () => window.removeEventListener(SWIPE_OPEN_EVENT, handleOtherOpen);
  }, [canSwipe, transaction.id]);

  // Reset offset jika maxSwipe berubah
  useEffect(() => {
    if (offset < -maxSwipe) {
      setOffset(-maxSwipe);
    }
  }, [maxSwipe, offset]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canSwipe) return;
    // Hanya respon klik kiri mouse atau touch/pen
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startOffsetRef.current = offset;
    isHorizontalRef.current = null;
    didDragRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canSwipe || !isDragging) return;

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    if (isHorizontalRef.current === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      isHorizontalRef.current = Math.abs(dx) > Math.abs(dy);
      if (!isHorizontalRef.current) {
        // User sedang scroll vertikal -> batalkan drag horizontal
        setIsDragging(false);
        return;
      }
      // Kunci pointer agar drag tetap mulus
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore if pointer capture fails
      }
    }

    if (isHorizontalRef.current) {
      didDragRef.current = true;
      const nextOffset = Math.max(-maxSwipe, Math.min(0, startOffsetRef.current + dx));
      setOffset(nextOffset);
    }
  };

  const finishDrag = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (!canSwipe || !isDragging) return;
    setIsDragging(false);

    if (e) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // ignore
      }
    }

    if (isHorizontalRef.current) {
      const shouldOpen = offset < -maxSwipe * 0.35;
      if (shouldOpen) {
        setOffset(-maxSwipe);
        window.dispatchEvent(
          new CustomEvent(SWIPE_OPEN_EVENT, { detail: transaction.id })
        );
      } else {
        setOffset(0);
      }
    }
    isHorizontalRef.current = null;
  };

  const handleItemClick = () => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (offset < 0) {
      setOffset(0);
      return;
    }
    if (onClick) {
      onClick(transaction);
    } else {
      openTransactionDetail(transaction);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOffset(0);
    onEdit?.(transaction);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOffset(0);
    onDelete?.(transaction.id);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 shadow-xs bg-surface select-none">
      {/* Background Action Buttons (Terungkap saat digeser ke kiri) */}
      {canSwipe && (
        <div
          className="absolute inset-y-0 right-0 flex items-stretch z-0"
          aria-hidden={offset === 0}
        >
          {onEdit && (
            <button
              type="button"
              onClick={handleEditClick}
              style={{ width: ACTION_WIDTH }}
              className={cn(
                'flex flex-col items-center justify-center gap-1 bg-secondary text-white dark:text-bg font-bold transition-colors hover:brightness-110 active:brightness-95 cursor-pointer',
                onDelete && 'border-r border-white/15 dark:border-black/15'
              )}
              aria-label="Ubah transaksi"
            >
              <Pencil className="w-4 h-4" />
              <span className="text-[11px] leading-none">Ubah</span>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={handleDeleteClick}
              style={{ width: ACTION_WIDTH }}
              className="flex flex-col items-center justify-center gap-1 bg-danger text-white font-bold transition-colors hover:brightness-110 active:brightness-95 cursor-pointer"
              aria-label="Hapus transaksi"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-[11px] leading-none">Hapus</span>
            </button>
          )}
        </div>
      )}

      {/* Foreground Card Content */}
      <div
        onClick={handleItemClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        style={{
          transform: canSwipe ? `translateX(${offset}px)` : undefined,
        }}
        className={cn(
          'relative z-10 flex items-center justify-between gap-3 px-3.5 py-3 bg-surface hover:bg-surface-alt/70 cursor-pointer touch-pan-y',
          !isDragging && 'transition-transform duration-200 ease-out',
          offset < 0 && 'rounded-r-none'
        )}
      >
        {/* Left: Circular Icon + Title + Date/Time • Wallet */}
        <div className="flex items-center gap-3 min-w-0 flex-1 pointer-events-none">
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
        <div className="shrink-0 text-right pointer-events-none">
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
    </div>
  );
}
