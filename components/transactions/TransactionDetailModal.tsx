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
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Calendar,
  Wallet as WalletIcon,
  FileText,
  Clock,
  Pencil,
  Trash2,
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

  // Format full date (e.g., "Rabu, 24 November 2026")
  let formattedDate = transaction.date;
  try {
    const d = parseISO(transaction.date);
    formattedDate = format(d, 'EEEE, d MMMM yyyy', { locale: id });
  } catch {
    // fallback
  }

  // Format created time (e.g., "14:30 WIB")
  let formattedTime = '';
  try {
    if (transaction.createdAt) {
      const createdDate = parseISO(transaction.createdAt);
      formattedTime = format(createdDate, 'd MMM yyyy, HH:mm', { locale: id });
    }
  } catch {
    // fallback
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Transaksi"
      description="Rincian informasi lengkap transaksi"
    >
      <div className="flex flex-col gap-5 pt-1">
        {/* Hero Card Amount */}
        <div
          className={cn(
            'p-5 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 shadow-xs transition-all',
            isIncome
              ? 'bg-secondary/10 border-secondary/25 text-secondary'
              : isTransfer
              ? 'bg-primary/10 border-primary/25 text-primary'
              : 'bg-danger/10 border-danger/25 text-danger'
          )}
        >
          {/* Badge Type */}
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs',
              isIncome
                ? 'bg-secondary text-white border-secondary'
                : isTransfer
                ? 'bg-primary text-white border-primary'
                : 'bg-danger text-white border-danger'
            )}
          >
            {isIncome ? (
              <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : isTransfer ? (
              <ArrowRightLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
            <span>
              {isIncome ? 'Pemasukan' : isTransfer ? 'Pemindahan Dana' : 'Pengeluaran'}
            </span>
          </div>

          {/* Amount Display */}
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-text-primary">
            {isIncome ? '+' : isTransfer ? '' : '-'}
            {formatRupiah(transaction.amount)}
          </h2>
        </div>

        {/* Detailed Attribute Rows */}
        <div className="flex flex-col gap-2.5 bg-surface-alt/60 rounded-2xl p-4 border border-border/80">
          {/* Category */}
          <div className="flex items-center justify-between py-2 border-b border-border/60">
            <div className="flex items-center gap-2.5 text-xs text-text-secondary">
              <CategoryIcon
                name={category?.icon || (isIncome ? 'Coins' : 'Tag')}
                color={category?.color || (isIncome ? '#057642' : '#0A66C2')}
                size="sm"
              />
              <span className="font-medium">Kategori</span>
            </div>
            <span className="text-sm font-bold text-text-primary">
              {category?.name || (isIncome ? 'Pemasukan' : 'Pengeluaran')}
            </span>
          </div>

          {/* Wallet / Sumber Dana */}
          <div className="flex items-center justify-between py-2 border-b border-border/60">
            <div className="flex items-center gap-2.5 text-xs text-text-secondary">
              <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-text-secondary">
                <WalletIcon className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">
                {isTransfer ? 'Dari Dompet' : 'Sumber Dana'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {wallet?.color && (
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: wallet.color }}
                />
              )}
              <span className="text-sm font-bold text-text-primary">
                {wallet?.name || 'Dompet'}
              </span>
            </div>
          </div>

          {/* Target Wallet (if transfer) */}
          {isTransfer && targetWallet && (
            <div className="flex items-center justify-between py-2 border-b border-border/60">
              <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-text-secondary">
                  <WalletIcon className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Ke Dompet</span>
              </div>
              <div className="flex items-center gap-1.5">
                {targetWallet.color && (
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: targetWallet.color }}
                  />
                )}
                <span className="text-sm font-bold text-text-primary">
                  {targetWallet.name}
                </span>
              </div>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center justify-between py-2 border-b border-border/60">
            <div className="flex items-center gap-2.5 text-xs text-text-secondary">
              <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-text-secondary">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">Tanggal Transaksi</span>
            </div>
            <span className="text-sm font-semibold text-text-primary">
              {formattedDate}
            </span>
          </div>

          {/* Note / Catatan */}
          <div className="flex flex-col gap-1.5 py-2">
            <div className="flex items-center gap-2.5 text-xs text-text-secondary">
              <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-text-secondary">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">Catatan</span>
            </div>
            <div className="pl-9.5">
              {transaction.note ? (
                <p className="text-sm text-text-primary font-medium bg-surface p-3 rounded-xl border border-border/80 whitespace-pre-wrap leading-relaxed">
                  {transaction.note}
                </p>
              ) : (
                <p className="text-xs text-text-muted italic">Tidak ada catatan.</p>
              )}
            </div>
          </div>

          {/* Waktu Input Sistem */}
          {formattedTime && (
            <div className="flex items-center justify-between pt-1 text-[11px] text-text-muted">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>Dicatat pada</span>
              </div>
              <span>{formattedTime}</span>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onDelete(transaction.id)}
              className="text-danger hover:bg-danger/10 border border-danger/30 hover:border-danger/50 flex items-center gap-1.5 px-3.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus</span>
            </Button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button type="button" variant="ghost" onClick={onClose}>
              Tutup
            </Button>
            {onEdit && !transaction.transferPairId && (
              <Button
                type="button"
                variant="primary"
                onClick={() => onEdit(transaction)}
                className="flex items-center gap-1.5 px-4 shadow-sm"
              >
                <Pencil className="w-4 h-4" />
                <span>Ubah</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
