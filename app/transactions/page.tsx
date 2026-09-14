'use client';

import React, { useState, useEffect } from 'react';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { categoryService } from '@/lib/services/categoryService';
import { transactionService } from '@/lib/services/transactionService';
import { Transaction, Category } from '@/lib/types';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { TransactionSearchBar, FilterState } from '@/components/transactions/TransactionSearchBar';
import { confirmWithToast } from '@/lib/utils/confirmToast';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatGroupDateHeader } from '@/lib/utils/date';
import { formatRupiah } from '@/lib/utils/currency';
import { ReceiptText } from 'lucide-react';

export default function TransactionsPage() {
  const { wallets } = useWalletStore();
  const { currentMonth, deleteTransaction, transactions: storeTransactions } = useTransactionStore();
  const { openTransactionModal, showToast } = useUIStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
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

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const walletMap = new Map(wallets.map((w) => [w.id, w]));

  // Group by date
  const groupedTransactions = filteredTransactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = [];
    acc[tx.date].push(tx);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

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
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      {/* Search & Filter Bar */}
      <TransactionSearchBar
        filters={filters}
        onChange={setFilters}
        categories={categories}
        wallets={wallets}
      />

      {/* Summary of Filtered Items */}
      {filteredTransactions.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-[#E5DCD0]/80 text-xs">
          <span className="text-[#68635B]">
            Menampilkan <strong>{filteredTransactions.length}</strong> transaksi
          </span>
          <div className="flex items-center gap-3 font-semibold">
            {totalFilteredIncome > 0 && (
              <span className="text-[#4A6B53]">+{formatRupiah(totalFilteredIncome)}</span>
            )}
            {totalFilteredExpense > 0 && (
              <span className="text-[#B0473C]">-{formatRupiah(totalFilteredExpense)}</span>
            )}
          </div>
        </div>
      )}

      {/* Transaction List Grouped by Date */}
      {sortedDates.length > 0 ? (
        <div className="flex flex-col gap-4">
          {sortedDates.map((dateStr) => {
            const txs = groupedTransactions[dateStr];
            return (
              <div key={dateStr} className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-[#68635B] uppercase tracking-wider">
                    {formatGroupDateHeader(dateStr)}
                  </h3>
                  <span className="text-[11px] text-[#9E968B]">
                    {txs.length} transaksi
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {txs.map((tx) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      category={categoryMap.get(tx.categoryId)}
                      wallet={walletMap.get(tx.walletId)}
                      onEdit={(item) => openTransactionModal(item.type, item.id)}
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
            filters.keyword || filters.type !== 'all' || filters.categoryId
              ? 'Coba ubah kata kunci atau hapus filter untuk melihat riwayat transaksi.'
              : 'Belum ada transaksi di bulan ini. Yuk catat sekarang!'
          }
          actionLabel="Catat Transaksi"
          onAction={() => openTransactionModal('expense')}
        />
      )}
    </div>
  );
}
