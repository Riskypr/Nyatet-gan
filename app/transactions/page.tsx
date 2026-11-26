'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { categoryService } from '@/lib/services/categoryService';
import { transactionService } from '@/lib/services/transactionService';
import { Transaction, Category } from '@/lib/types';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import {
  TransactionSearchBar,
  FilterState,
} from '@/components/transactions/TransactionSearchBar';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { confirmWithToast } from '@/lib/utils/confirmToast';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  formatDateDisplay,
  formatGroupDateHeader,
  formatMonthYear,
} from '@/lib/utils/date';
import { formatRupiah } from '@/lib/utils/currency';
import { cn } from '@/lib/utils/cn';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ReceiptText,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export default function TransactionsPage() {
  const { wallets } = useWalletStore();
  const {
    currentMonth,
    deleteTransaction,
    transactions: storeTransactions,
  } = useTransactionStore();
  const { openTransactionModal, showToast } = useUIStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    type: 'all',
    categoryId: '',
    walletId: '',
    startDate: '',
    endDate: '',
  });

  // Load categories
  useEffect(() => {
    categoryService.getAll().then(setCategories);
  }, []);

  // Filter transactions
  useEffect(() => {
    async function applyFilters() {
      const results = await transactionService.filter({
        month: filters.startDate || filters.endDate ? undefined : currentMonth,
        keyword: filters.keyword,
        categoryId: filters.categoryId || undefined,
        walletId: filters.walletId || undefined,
        type: filters.type === 'all' ? undefined : filters.type,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setFilteredTransactions(results);
    }

    applyFilters();
  }, [filters, currentMonth, storeTransactions]);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );
  const walletMap = useMemo(
    () => new Map(wallets.map((w) => [w.id, w])),
    [wallets]
  );

  // Group by date
  const groupedTransactions = useMemo(
    () =>
      filteredTransactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
        if (!acc[tx.date]) acc[tx.date] = [];
        acc[tx.date].push(tx);
        return acc;
      }, {}),
    [filteredTransactions]
  );

  const sortedDates = useMemo(
    () => Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a)),
    [groupedTransactions]
  );

  const totalFilteredIncome = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const totalFilteredExpense = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const netFiltered = totalFilteredIncome - totalFilteredExpense;

  const handleDelete = (id: string) => {
    confirmWithToast({
      title: 'Hapus Transaksi',
      message: 'Apakah Anda yakin ingin menghapus catatan transaksi ini?',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteTransaction(id);
          showToast('Transaksi berhasil dihapus.', 'success');
        } catch {
          showToast('Gagal menghapus transaksi.', 'error');
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto pb-8">
      {/* 1. Header Judul & Badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary">
            Riwayat Transaksi
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {storeTransactions.length} Transaksi di Bulan{' '}
            {formatMonthYear(currentMonth)}
          </p>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/15 text-secondary text-[11px] font-bold shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Terkurasi</span>
        </span>
      </div>

      {/* 2. Search & Quick Filter Bar */}
      <TransactionSearchBar
        filters={filters}
        onChange={setFilters}
        categories={categories}
        wallets={wallets}
      />

      {/* 3. Baris Periode Bulan & Ubah Periode */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-[11px] font-semibold text-text-primary shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>
              {filters.startDate || filters.endDate
                ? `Rentang: ${filters.startDate ? formatDateDisplay(filters.startDate) : '...'} - ${filters.endDate ? formatDateDisplay(filters.endDate) : '...'}`
                : `Bulan: ${formatMonthYear(currentMonth)}`}
            </span>
          </span>

          <button
            type="button"
            onClick={() => setShowPeriodPicker((prev) => !prev)}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            <span>Ubah Periode</span>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 transition-transform',
                showPeriodPicker && 'rotate-180'
              )}
            />
          </button>
        </div>

        {showPeriodPicker && <MonthSelector variant="full" />}
      </div>

      {/* 4. Kartu Ringkasan Terfilter */}
      {filteredTransactions.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border shadow-xs p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                netFiltered >= 0
                  ? 'bg-secondary/15 text-secondary'
                  : 'bg-danger/15 text-danger'
              )}
            >
              {netFiltered >= 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Ringkasan Terfilter
              </p>
              <p className="text-sm sm:text-base font-extrabold text-text-primary truncate">
                {netFiltered > 0 ? '+' : ''}
                {formatRupiah(netFiltered)}{' '}
                <span className="text-[11px] font-normal text-text-secondary">
                  ({filteredTransactions.length} transaksi)
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-0.5 shrink-0 text-right">
            {totalFilteredIncome > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[11px] font-bold">
                +{formatRupiah(totalFilteredIncome)}
              </span>
            )}
            {totalFilteredExpense > 0 && (
              <span className="text-[11px] font-bold text-danger px-1">
                -{formatRupiah(totalFilteredExpense)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 5. Daftar Transaksi Dikelompokkan Per Tanggal */}
      {sortedDates.length > 0 ? (
        <div className="flex flex-col gap-4">
          {sortedDates.map((dateStr) => {
            const txs = groupedTransactions[dateStr];
            const dayIncome = txs
              .filter((t) => t.type === 'income')
              .reduce((s, t) => s + t.amount, 0);
            const dayExpense = txs
              .filter((t) => t.type === 'expense')
              .reduce((s, t) => s + t.amount, 0);
            const dayNet = dayIncome - dayExpense;
            const groupLabel = formatGroupDateHeader(dateStr);
            const showSubDate =
              groupLabel === 'Hari Ini' || groupLabel === 'Kemarin';

            return (
              <div key={dateStr} className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <h3 className="text-sm font-bold text-text-primary truncate">
                      {groupLabel}
                    </h3>
                    {showSubDate && (
                      <span className="text-[11px] text-text-muted">
                        • {formatDateDisplay(dateStr)}
                      </span>
                    )}
                  </div>

                  <span
                    className={cn(
                      'text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0',
                      dayNet >= 0
                        ? 'bg-secondary/15 text-secondary'
                        : 'bg-surface border border-border text-text-primary'
                    )}
                  >
                    {dayNet > 0 ? '+' : ''}
                    {formatRupiah(dayNet)}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {txs.map((tx) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      category={categoryMap.get(tx.categoryId)}
                      wallet={walletMap.get(tx.walletId)}
                      onEdit={
                        tx.transferPairId
                          ? undefined
                          : (item) => openTransactionModal(item.type, item)
                      }
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={ReceiptText}
          title="Tidak Ada Transaksi Ditemukan"
          description={
            filters.keyword ||
            filters.type !== 'all' ||
            filters.categoryId ||
            filters.walletId
              ? 'Coba ubah kata kunci atau hapus filter untuk melihat riwayat transaksi.'
              : 'Belum ada transaksi di bulan ini. Yuk catat sekarang!'
          }
          actionLabel="Catat Transaksi"
          onAction={() => openTransactionModal('expense')}
        />
      )}

      {/* 6. Footer Info Sinkronisasi Offline */}
      <div className="rounded-2xl bg-surface-alt/70 border border-border/70 p-3.5 flex items-start gap-3 mt-1">
        <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="text-xs leading-relaxed">
          <p className="font-bold text-text-primary">Data Selalu Tersinkron</p>
          <p className="text-[11px] text-text-secondary">
            Disimpan aman di memori lokal &amp; offline-first saat tidak ada sinyal internet.
          </p>
        </div>
      </div>
    </div>
  );
}
