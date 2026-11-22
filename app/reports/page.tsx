'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { categoryService } from '@/lib/services/categoryService';
import { Category, ExpenseByCategorySummary } from '@/lib/types';
import { ExpensePieChart } from '@/components/charts/ExpensePieChart';
import { IncomePieChart } from '@/components/charts/IncomePieChart';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Card } from '@/components/ui/Card';
import { formatRupiah } from '@/lib/utils/currency';
import { formatMonthYear, getWeeksForMonth } from '@/lib/utils/date';
import { confirmWithToast } from '@/lib/utils/confirmToast';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ReportTab = 'expense' | 'income';

export default function ReportsPage() {
  const { currentMonth, monthlySummary, expenseByCategory, incomeByCategory, transactions, deleteTransaction } =
    useTransactionStore();
  const { wallets, fetchWallets } = useWalletStore();
  const { openTransactionModal, showToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<ReportTab>('expense');
  const [selectedWeekId, setSelectedWeekId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories and wallets on mount
  useEffect(() => {
    categoryService.getAll().then(setCategories);
    if (wallets.length === 0) {
      fetchWallets();
    }
  }, [wallets.length, fetchWallets]);

  // Reset selected category if month changes
  useEffect(() => {
    setSelectedCategoryId(null);
  }, [currentMonth]);

  const totalExpense = monthlySummary?.totalExpense || 0;
  const totalIncome = monthlySummary?.totalIncome || 0;
  const netSavings = monthlySummary?.netSavings || 0;

  const savingsRate =
    totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Weeks for current month
  const weeks = useMemo(() => getWeeksForMonth(currentMonth), [currentMonth]);
  const activeWeek = useMemo(
    () => weeks.find((w) => w.id === selectedWeekId) || weeks[0],
    [weeks, selectedWeekId]
  );

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const walletMap = useMemo(() => new Map(wallets.map((w) => [w.id, w])), [wallets]);

  // Tab switch handler
  const handleTabChange = (tab: ReportTab) => {
    setActiveTab(tab);
    setSelectedCategoryId(null);
  };

  // Filter transactions for current tab
  const tabTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === activeTab);
  }, [transactions, activeTab]);

  // Filter transactions by selected week
  const weekFilteredTransactions = useMemo(() => {
    if (selectedWeekId === 'all') return tabTransactions;
    const week = weeks.find((w) => w.id === selectedWeekId);
    if (!week) return tabTransactions;
    return tabTransactions.filter((t) => t.date >= week.startDate && t.date <= week.endDate);
  }, [tabTransactions, selectedWeekId, weeks]);

  // Dynamic category summary and total based on active week
  const { dynamicCategoryData, dynamicTotal } = useMemo(() => {
    if (selectedWeekId === 'all') {
      const defaultData = activeTab === 'expense' ? expenseByCategory : incomeByCategory;
      const defaultTotal = activeTab === 'expense' ? totalExpense : totalIncome;
      return { dynamicCategoryData: defaultData, dynamicTotal: defaultTotal };
    }

    const total = weekFilteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const catCounts = new Map<string, { totalAmount: number; count: number }>();

    weekFilteredTransactions.forEach((t) => {
      const existing = catCounts.get(t.categoryId) || { totalAmount: 0, count: 0 };
      catCounts.set(t.categoryId, {
        totalAmount: existing.totalAmount + t.amount,
        count: existing.count + 1,
      });
    });

    const list: ExpenseByCategorySummary[] = Array.from(catCounts.entries()).map(([catId, val]) => {
      const cat = categoryMap.get(catId);
      return {
        categoryId: catId,
        categoryName: cat?.name || 'Lainnya',
        categoryIcon: cat?.icon || (activeTab === 'expense' ? 'Tag' : 'Coins'),
        color: cat?.color || (activeTab === 'expense' ? '#0A66C2' : '#057642'),
        totalAmount: val.totalAmount,
        count: val.count,
        percentage: total > 0 ? Math.round((val.totalAmount / total) * 100) : 0,
      };
    });

    list.sort((a, b) => b.totalAmount - a.totalAmount);
    return { dynamicCategoryData: list, dynamicTotal: total };
  }, [
    selectedWeekId,
    activeTab,
    expenseByCategory,
    incomeByCategory,
    totalExpense,
    totalIncome,
    weekFilteredTransactions,
    categoryMap,
  ]);

  // Transactions belonging to clicked category
  const selectedCategoryTransactions = useMemo(() => {
    if (!selectedCategoryId) return [];
    return weekFilteredTransactions
      .filter((t) => t.categoryId === selectedCategoryId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [weekFilteredTransactions, selectedCategoryId]);

  const selectedCategoryObj = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categoryMap.get(selectedCategoryId) || null;
  }, [selectedCategoryId, categoryMap]);

  const selectedCategoryTotal = useMemo(() => {
    return selectedCategoryTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [selectedCategoryTransactions]);

  const handleDeleteTransaction = useCallback(
    (id: string) => {
      confirmWithToast({
        title: 'Hapus Transaksi',
        message: 'Yakin ingin menghapus transaksi ini? Saldo dompet akan disesuaikan otomatis.',
        confirmLabel: 'Hapus',
        onConfirm: async () => {
          try {
            await deleteTransaction(id);
            showToast('Transaksi berhasil dihapus', 'success');
          } catch {
            showToast('Gagal menghapus transaksi', 'error');
          }
        },
      });
    },
    [deleteTransaction, showToast]
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-text-primary">
            Analisis & Grafik Keuangan
          </h2>
          <p className="text-xs text-text-secondary">
            Periode {formatMonthYear(currentMonth)}
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0 shadow-xs">
            <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-text-secondary">Total Masuk</p>
            <p className="text-sm sm:text-base font-bold text-secondary truncate">
              {formatRupiah(totalIncome)}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-danger/15 text-danger flex items-center justify-center shrink-0 shadow-xs">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-text-secondary">Total Keluar</p>
            <p className="text-sm sm:text-base font-bold text-danger truncate">
              {formatRupiah(totalExpense)}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-xs">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-text-secondary">Arus Kas Bersih</p>
            <p
              className={`text-sm sm:text-base font-bold truncate ${
                netSavings >= 0 ? 'text-text-primary' : 'text-danger'
              }`}
            >
              {formatRupiah(netSavings)}
            </p>
            {totalIncome > 0 && (
              <span className="text-[10px] text-text-muted">Rasio tabungan: {savingsRate}%</span>
            )}
          </div>
        </Card>
      </div>

      {/* Tab Switcher & Reports Card */}
      <Card className="p-5 flex flex-col gap-5">
        {/* Tab & Total Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
          <div className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:items-center gap-1 bg-surface-alt border border-border rounded-xl p-1">
            <button
              onClick={() => handleTabChange('expense')}
              className={cn(
                'w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center',
                activeTab === 'expense'
                  ? 'bg-danger text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              )}
            >
              <span className="flex items-center justify-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                Pengeluaran
              </span>
            </button>
            <button
              onClick={() => handleTabChange('income')}
              className={cn(
                'w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center',
                activeTab === 'income'
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              )}
            >
              <span className="flex items-center justify-center gap-1.5">
                <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                Pemasukan
              </span>
            </button>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-[11px] text-text-secondary">
              {activeTab === 'expense' ? 'Total Pengeluaran' : 'Total Pemasukan'} (
              {selectedWeekId === 'all' ? '1 Bulan' : activeWeek.label})
            </p>
            <p
              className={cn(
                'text-sm font-bold',
                activeTab === 'expense' ? 'text-danger' : 'text-secondary'
              )}
            >
              {formatRupiah(dynamicTotal)}
            </p>
          </div>
        </div>

        {/* Weekly Filter Pills */}
        <div className="flex flex-col gap-2 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Filter per Minggu</span>
              {selectedWeekId !== 'all' && (
                <span className="text-[11px] text-text-secondary font-normal">
                  ({activeWeek.rangeLabel})
                </span>
              )}
            </div>
            {selectedWeekId !== 'all' && (
              <button
                onClick={() => setSelectedWeekId('all')}
                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                Tampilkan Semua
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
            {weeks.map((week) => {
              const isSelected = selectedWeekId === week.id;
              return (
                <button
                  key={week.id}
                  onClick={() => {
                    setSelectedWeekId(week.id);
                  }}
                  className={cn(
                    'shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border',
                    isSelected
                      ? activeTab === 'expense'
                        ? 'bg-danger text-white border-danger shadow-xs'
                        : 'bg-secondary text-white border-secondary shadow-xs'
                      : 'bg-surface text-text-secondary border-border/80 hover:bg-surface-alt hover:text-text-primary'
                  )}
                >
                  <span>{week.label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-md font-normal',
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-surface-alt text-text-muted'
                    )}
                  >
                    {week.id === 'all' ? '1 Bln' : `${week.startDay}-${week.endDay}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart Section */}
        <div>
          <div className="mb-3">
            <h3 className="text-sm font-bold text-text-primary">
              {activeTab === 'expense'
                ? `Komposisi Pengeluaran (${activeWeek.label})`
                : `Komposisi Pemasukan (${activeWeek.label})`}
            </h3>
            <p className="text-xs text-text-secondary">
              Sentuh atau klik slice grafik / kartu kategori di bawah untuk memfilter daftar transaksi
            </p>
          </div>

          {activeTab === 'expense' ? (
            <ExpensePieChart
              data={dynamicCategoryData}
              totalExpense={dynamicTotal}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
          ) : (
            <IncomePieChart
              data={dynamicCategoryData}
              totalIncome={dynamicTotal}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
          )}
        </div>

        {/* Selected Category Transactions Section */}
        {selectedCategoryId && (
          <div className="mt-2 pt-4 border-t border-border/80 flex flex-col gap-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
            {/* Category Header */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-alt/70 border border-border">
              <div className="flex items-center gap-2.5 min-w-0">
                <CategoryIcon
                  name={selectedCategoryObj?.icon || (activeTab === 'expense' ? 'Tag' : 'Coins')}
                  color={selectedCategoryObj?.color || (activeTab === 'expense' ? '#0A66C2' : '#057642')}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-text-primary truncate">
                      {selectedCategoryObj?.name || 'Kategori Terpilih'}
                    </h4>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary shrink-0">
                      {activeWeek.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    Total:{' '}
                    <span className="font-bold text-text-primary">
                      {formatRupiah(selectedCategoryTotal)}
                    </span>{' '}
                    • {selectedCategoryTransactions.length} transaksi
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCategoryId(null)}
                className="p-1.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface border border-border/60 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold shrink-0"
                title="Tutup daftar transaksi"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Tutup</span>
              </button>
            </div>

            {/* Transaction Items */}
            {selectedCategoryTransactions.length > 0 ? (
              <div className="flex flex-col gap-2">
                {selectedCategoryTransactions.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    category={categoryMap.get(tx.categoryId)}
                    wallet={walletMap.get(tx.walletId)}
                    onEdit={tx.transferPairId ? undefined : (item) => openTransactionModal(item.type, item.id)}
                    onDelete={handleDeleteTransaction}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl bg-surface border border-border/60 text-text-muted text-xs">
                Tidak ada transaksi untuk kategori ini pada {activeWeek.label.toLowerCase()} ({activeWeek.rangeLabel}).
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
