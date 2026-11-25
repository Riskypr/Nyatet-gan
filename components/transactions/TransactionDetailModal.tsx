'use client';

import React, { useState, useEffect } from 'react';
import { Transaction, Category } from '@/lib/types';
import { categoryService } from '@/lib/services/categoryService';
import { useWalletStore } from '@/lib/stores/walletStore';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Button } from '@/components/ui/Button';
import { formatRupiah } from '@/lib/utils/currency';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Wallet as WalletIcon,
  Shapes,
  Clock,
  AlignLeft,
  Hash,
  CloudOff,
  CheckCircle2,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface TransactionDetailModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionDetailModal({
  isOpen,
  transaction,
  onClose,
  onEdit,
  onDelete,
}: TransactionDetailModalProps) {
  const { wallets } = useWalletStore();
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (transaction?.categoryId) {
      categoryService.getById(transaction.categoryId).then((cat) => {
        setCategory(cat || null);
      });
    } else {
      setCategory(null);
    }
  }, [transaction?.categoryId]);

  if (!transaction) return null;

  const isIncome = transaction.type === 'income';
  const isTransfer = Boolean(transaction.transferPairId || transaction.type === 'transfer');
  const wallet = wallets.find((w) => w.id === transaction.walletId);
  const targetWallet = transaction.toWalletId
    ? wallets.find((w) => w.id === transaction.toWalletId)
    : null;

  const categoryName = category?.name || (isIncome ? 'Pemasukan' : isTransfer ? 'Pemindahan Dana' : 'Pengeluaran');
  const titleText = transaction.note?.trim() || categoryName;

  // Format date (e.g., "Senin, 24 Mar 2025")
  let formattedDate = transaction.date;
  try {
    const d = parseISO(transaction.date);
    formattedDate = format(d, 'EEEE, d MMM yyyy', { locale: id });
  } catch {
    // fallback
  }

  // Format created time (e.g., "15:30")
  let formattedTime = '';
  try {
    if (transaction.createdAt) {
      const createdDate = parseISO(transaction.createdAt);
      formattedTime = format(createdDate, 'HH:mm');
    }
  } catch {
    // fallback
  }

  const canEdit = Boolean(onEdit && !transaction.transferPairId);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="relative flex flex-col gap-5">
        {/* Close Button (Top Right) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 top-0 w-9 h-9 rounded-full bg-surface-alt text-text-secondary hover:text-text-primary hover:bg-border/60 transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Centered Hero Section */}
        <div className="flex flex-col items-center text-center pt-2">
          <CategoryIcon
            name={category?.icon || (isIncome ? 'Coins' : 'Tag')}
            color={category?.color || (isIncome ? '#057642' : isTransfer ? '#0A66C2' : '#CC1016')}
            size="lg"
            className="w-14 h-14 rounded-2xl mb-3 shadow-2xs"
          />

          {/* Transaction Title */}
          <h3 className="text-base sm:text-lg font-bold text-text-primary max-w-[85%] truncate">
            {titleText}
          </h3>

          {/* Big Amount */}
          <p
            className={cn(
              'text-3xl sm:text-4xl font-extrabold tracking-tight mt-0.5',
              isIncome ? 'text-secondary' : isTransfer ? 'text-primary' : 'text-danger'
            )}
          >
            {isIncome ? '+' : isTransfer ? '' : '-'}
            {formatRupiah(transaction.amount)}
          </p>
        </div>

        {/* Details Card */}
        <div className="bg-surface-alt/50 rounded-2xl border border-border/80 px-4 divide-y divide-border/60 text-xs">
          {/* Sumber Dana */}
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-2 text-text-secondary shrink-0">
              <WalletIcon className="w-4 h-4 text-text-muted" />
              <span>{isTransfer ? 'Dari Dompet' : 'Sumber Dana'}</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              {wallet?.color && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: wallet.color }}
                />
              )}
              <span className="font-bold text-text-primary truncate">
                {wallet?.name || 'Dompet'}
              </span>
            </div>
          </div>

          {/* Ke Dompet (jika transfer) */}
          {isTransfer && targetWallet && (
            <div className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-2 text-text-secondary shrink-0">
                <WalletIcon className="w-4 h-4 text-text-muted" />
                <span>Ke Dompet</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                {targetWallet.color && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: targetWallet.color }}
                  />
                )}
                <span className="font-bold text-text-primary truncate">
                  {targetWallet.name}
                </span>
              </div>
            </div>
          )}

          {/* Kategori */}
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-2 text-text-secondary shrink-0">
              <Shapes className="w-4 h-4 text-text-muted" />
              <span>Kategori</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-lg bg-surface border border-border/80 font-semibold text-text-primary truncate max-w-[60%]">
              {categoryName}
            </span>
          </div>

          {/* Waktu & Tanggal */}
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-2 text-text-secondary shrink-0">
              <Clock className="w-4 h-4 text-text-muted" />
              <span>Waktu & Tanggal</span>
            </div>
            <span className="font-medium text-text-primary text-right">
              {formattedDate}
              {formattedTime ? ` • ${formattedTime}` : ''}
            </span>
          </div>

          {/* Catatan */}
          <div className="flex items-start justify-between gap-3 py-3">
            <div className="flex items-center gap-2 text-text-secondary shrink-0">
              <AlignLeft className="w-4 h-4 text-text-muted" />
              <span>Catatan</span>
            </div>
            <span
              className={cn(
                'text-right break-words max-w-[62%]',
                transaction.note?.trim()
                  ? 'italic text-text-primary'
                  : 'italic text-text-muted'
              )}
            >
              {transaction.note?.trim() ? `"${transaction.note.trim()}"` : 'Tidak ada catatan'}
            </span>
          </div>

          {/* ID Transaksi */}
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-2 text-text-secondary shrink-0">
              <Hash className="w-4 h-4 text-text-muted" />
              <span>ID Transaksi</span>
            </div>
            <span className="font-mono text-[11px] text-text-secondary truncate max-w-[58%]">
              #{transaction.id.toUpperCase()}
            </span>
          </div>

          {/* Status Simpan */}
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-2 text-text-secondary shrink-0">
              <CloudOff className="w-4 h-4 text-text-muted" />
              <span>Status Simpan</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary/12 text-secondary border border-secondary/20 text-[11px] font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              Lokal (Offline-First)
            </span>
          </div>
        </div>

        {/* Action Buttons Footer */}
        {(canEdit || onDelete) && (
          <div className={cn('grid gap-3 pt-1', canEdit && onDelete ? 'grid-cols-2' : 'grid-cols-1')}>
            {canEdit && onEdit && (
              <Button
                type="button"
                variant="primary"
                onClick={() => onEdit(transaction)}
                className="w-full flex items-center justify-center gap-2 py-2.5 shadow-sm"
              >
                <Pencil className="w-4 h-4" />
                <span>Ubah Transaksi</span>
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onDelete(transaction.id)}
                className="w-full bg-danger/12 text-danger hover:bg-danger/20 border border-danger/20 flex items-center justify-center gap-2 py-2.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
