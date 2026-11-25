'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { categoryService } from '@/lib/services/categoryService';
import { transactionService } from '@/lib/services/transactionService';
import { budgetService } from '@/lib/services/budgetService';
import {
  BudgetProgress,
  Category,
  ExpenseByCategorySummary,
  MonthlySummary,
} from '@/lib/types';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRupiah, formatCompactNumber } from '@/lib/utils/currency';
import {
  formatDateDisplay,
  formatMonthYear,
  getCurrentMonth,
  getPreviousMonth,
  getRemainingDaysLabel,
  getWeeksForMonth,
} from '@/lib/utils/date';
import { confirmWithToast } from '@/lib/utils/confirmToast';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  FileText,
  PieChart as PieIcon,
  Printer,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet as WalletIcon,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ReportTab = 'expense' | 'income';

const CHART_PALETTE = [
  '#0A66C2', // LinkedIn Blue
  '#057642', // LinkedIn Green
  '#CC1016', // Alert Red
  '#E7A33E', // Warm Gold
  '#2D6A6A', // Teal
  '#0073B1', // Professional Blue
  '#5E8C6A', // Sage
  '#56687A', // Slate
];

export default function ReportsPage() {
  const {
    currentMonth,
    monthlySummary,
    expenseByCategory,
    incomeByCategory,
    transactions,
    deleteTransaction,
  } = useTransactionStore();
  const { wallets, fetchWallets } = useWalletStore();
  const { openTransactionModal, showToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<ReportTab>('expense');
  const [selectedWeekId, setSelectedWeekId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDark, setIsDark] = useState(false);

  // Data pembanding bulan sebelumnya & target anggaran kategori
  const [prevSummary, setPrevSummary] = useState<MonthlySummary | null>(null);
  const [prevExpenseCats, setPrevExpenseCats] = useState<ExpenseByCategorySummary[]>([]);
  const [prevIncomeCats, setPrevIncomeCats] = useState<ExpenseByCategorySummary[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<BudgetProgress[]>([]);

  // Deteksi tema gelap/terang untuk Tooltip & stroke Donut Chart
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  // Load kategori dan dompet
  useEffect(() => {
    categoryService.getAll().then(setCategories);
    if (wallets.length === 0) {
      fetchWallets();
    }
  }, [wallets.length, fetchWallets]);

  // Reset filter kategori & minggu saat bulan berubah, lalu load data pembanding & budget
  useEffect(() => {
    setSelectedCategoryId(null);
    setSelectedWeekId('all');

    let isMounted = true;
    const prevMonth = getPreviousMonth(currentMonth);

    Promise.all([
      transactionService.getMonthlySummary(prevMonth),
      transactionService.getExpenseByCategory(prevMonth),
      transactionService.getIncomeByCategory(prevMonth),
      budgetService.getBudgetProgress(currentMonth),
    ]).then(([pSummary, pExp, pInc, budgets]) => {
      if (!isMounted) return;
      setPrevSummary(pSummary);
      setPrevExpenseCats(pExp);
      setPrevIncomeCats(pInc);
      setCategoryBudgets(budgets.categoryProgress);
    });

    return () => {
      isMounted = false;
    };
  }, [currentMonth, transactions]);

  const totalExpense = monthlySummary?.totalExpense || 0;
  const totalIncome = monthlySummary?.totalIncome || 0;
  const netSavings = monthlySummary?.netSavings || 0;
  const savingsRate =
    totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const weeks = useMemo(() => getWeeksForMonth(currentMonth), [currentMonth]);
  const weekOnlyList = useMemo(
    () => weeks.filter((w) => w.id !== 'all'),
    [weeks]
  );
  const activeWeek = useMemo(
    () => weeks.find((w) => w.id === selectedWeekId) || weeks[0],
    [weeks, selectedWeekId]
  );

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );
  const walletMap = useMemo(
    () => new Map(wallets.map((w) => [w.id, w])),
    [wallets]
  );
  const budgetByCatMap = useMemo(
    () => new Map(categoryBudgets.map((b) => [b.budget.categoryId, b])),
    [categoryBudgets]
  );

  const handleTabChange = (tab: ReportTab) => {
    setActiveTab(tab);
    setSelectedCategoryId(null);
  };

  // Transaksi berdasarkan tab aktif
  const tabTransactions = useMemo(
    () => transactions.filter((t) => t.type === activeTab),
    [transactions, activeTab]
  );

  const expenseCount = useMemo(
    () => transactions.filter((t) => t.type === 'expense').length,
    [transactions]
  );
  const incomeCount = useMemo(
    () => transactions.filter((t) => t.type === 'income').length,
    [transactions]
  );

  // Filter berdasarkan minggu terpilih
  const weekFilteredTransactions = useMemo(() => {
    if (selectedWeekId === 'all') return tabTransactions;
    const week = weeks.find((w) => w.id === selectedWeekId);
    if (!week) return tabTransactions;
    return tabTransactions.filter(
      (t) => t.date >= week.startDate && t.date <= week.endDate
    );
  }, [tabTransactions, selectedWeekId, weeks]);

  // Ringkasan kategori dinamis berdasarkan minggu terpilih
  const { dynamicCategoryData, dynamicTotal } = useMemo(() => {
    if (selectedWeekId === 'all') {
      const defaultData =
        activeTab === 'expense' ? expenseByCategory : incomeByCategory;
      const defaultTotal = activeTab === 'expense' ? totalExpense : totalIncome;
      return { dynamicCategoryData: defaultData, dynamicTotal: defaultTotal };
    }

    const total = weekFilteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const catCounts = new Map<string, { totalAmount: number; count: number }>();

    weekFilteredTransactions.forEach((t) => {
      const existing = catCounts.get(t.categoryId) || {
        totalAmount: 0,
        count: 0,
      };
      catCounts.set(t.categoryId, {
        totalAmount: existing.totalAmount + t.amount,
        count: existing.count + 1,
      });
    });

    const list: ExpenseByCategorySummary[] = Array.from(catCounts.entries()).map(
      ([catId, val]) => {
        const cat = categoryMap.get(catId);
        return {
          categoryId: catId,
          categoryName: cat?.name || 'Lainnya',
          categoryIcon:
            cat?.icon || (activeTab === 'expense' ? 'Tag' : 'Coins'),
          color:
            cat?.color || (activeTab === 'expense' ? '#0A66C2' : '#057642'),
          totalAmount: val.totalAmount,
          count: val.count,
          percentage: total > 0 ? Math.round((val.totalAmount / total) * 100) : 0,
        };
      }
    );

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

  // Tren per minggu (M1 - M5) & puncak pengeluaran harian
  const { weeklyBars, maxBarAmount, peakWeekId, dailyAverage, peakDay } =
    useMemo(() => {
      const bars = weekOnlyList.map((w, idx) => {
        const amount = tabTransactions
          .filter((t) => t.date >= w.startDate && t.date <= w.endDate)
          .reduce((sum, t) => sum + t.amount, 0);
        return {
          id: w.id,
          shortLabel: `M${idx + 1}`,
          label: w.label,
          rangeLabel: w.rangeLabel,
          amount,
        };
      });

      const maxAmt = Math.max(...bars.map((b) => b.amount), 0);
      const peakBar = bars.find((b) => b.amount === maxAmt && maxAmt > 0);

      // Hitung jumlah hari berjalan untuk rata-rata harian
      const [yStr, mStr] = currentMonth.split('-');
      const daysInMonth = new Date(
        parseInt(yStr, 10),
        parseInt(mStr, 10),
        0
      ).getDate();
      const activeDays =
        selectedWeekId !== 'all'
          ? Math.max(1, activeWeek.endDay - activeWeek.startDay + 1)
          : currentMonth === getCurrentMonth()
            ? Math.max(1, new Date().getDate())
            : daysInMonth;

      const avg = Math.round(dynamicTotal / activeDays);

      // Cari tanggal dengan nominal tertinggi
      const dayTotals = new Map<string, number>();
      weekFilteredTransactions.forEach((t) => {
        dayTotals.set(t.date, (dayTotals.get(t.date) || 0) + t.amount);
      });
      let topDate = '';
      let topAmount = 0;
      dayTotals.forEach((amt, date) => {
        if (amt > topAmount) {
          topAmount = amt;
          topDate = date;
        }
      });

      return {
        weeklyBars: bars,
        maxBarAmount: maxAmt,
        peakWeekId: peakBar?.id || null,
        dailyAverage: avg,
        peakDay: topDate ? { date: topDate, amount: topAmount } : null,
      };
    }, [
      weekOnlyList,
      tabTransactions,
      currentMonth,
      selectedWeekId,
      activeWeek,
      dynamicTotal,
      weekFilteredTransactions,
    ]);

  // Sumber dana terpakai
  const walletUsage = useMemo(() => {
    const totals = new Map<string, number>();
    weekFilteredTransactions.forEach((t) => {
      totals.set(t.walletId, (totals.get(t.walletId) || 0) + t.amount);
    });

    const list = Array.from(totals.entries()).map(([wId, amt], idx) => {
      const w = walletMap.get(wId);
      return {
        walletId: wId,
        name: w?.name || 'Dompet',
        amount: amt,
        percentage:
          dynamicTotal > 0 ? Math.round((amt / dynamicTotal) * 100) : 0,
        color: CHART_PALETTE[idx % CHART_PALETTE.length],
      };
    });

    list.sort((a, b) => b.amount - a.amount);
    return list;
  }, [weekFilteredTransactions, walletMap, dynamicTotal]);

  // Komparasi vs bulan sebelumnya
  const comparison = useMemo(() => {
    const prevMonthTotal =
      activeTab === 'expense'
        ? prevSummary?.totalExpense || 0
        : prevSummary?.totalIncome || 0;
    const currentMonthTotal =
      activeTab === 'expense' ? totalExpense : totalIncome;
    const diff = currentMonthTotal - prevMonthTotal;
    const pct =
      prevMonthTotal > 0 ? Math.round((diff / prevMonthTotal) * 100) : 0;

    // Cari kategori dengan penurunan paling signifikan (untuk pengeluaran) atau kenaikan (untuk pemasukan)
    const currCats =
      activeTab === 'expense' ? expenseByCategory : incomeByCategory;
    const prevCats = activeTab === 'expense' ? prevExpenseCats : prevIncomeCats;
    const prevCatMap = new Map(prevCats.map((c) => [c.categoryId, c]));

    let highlightCat: { name: string; pctChange: number } | null = null;
    if (prevCats.length > 0) {
      currCats.forEach((c) => {
        const prev = prevCatMap.get(c.categoryId);
        if (prev && prev.totalAmount > 0) {
          const catPct = Math.round(
            ((c.totalAmount - prev.totalAmount) / prev.totalAmount) * 100
          );
          if (activeTab === 'expense') {
            if (
              catPct < 0 &&
              (!highlightCat || catPct < highlightCat.pctChange)
            ) {
              highlightCat = { name: c.categoryName, pctChange: catPct };
            }
          } else if (
            catPct > 0 &&
            (!highlightCat || catPct > highlightCat.pctChange)
          ) {
            highlightCat = { name: c.categoryName, pctChange: catPct };
          }
        }
      });
    }

    return {
      prevMonthName: formatMonthYear(getPreviousMonth(currentMonth)),
      prevTotal: prevMonthTotal,
      currTotal: currentMonthTotal,
      diff,
      pct,
      highlightCat: highlightCat as { name: string; pctChange: number } | null,
    };
  }, [
    activeTab,
    prevSummary,
    totalExpense,
    totalIncome,
    expenseByCategory,
    incomeByCategory,
    prevExpenseCats,
    prevIncomeCats,
    currentMonth,
  ]);

  // Transaksi pada kategori yang diklik
  const selectedCategoryTransactions = useMemo(() => {
    if (!selectedCategoryId) return [];
    return weekFilteredTransactions
      .filter((t) => t.categoryId === selectedCategoryId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [weekFilteredTransactions, selectedCategoryId]);

  const selectedCategoryObj = useMemo(
    () => (selectedCategoryId ? categoryMap.get(selectedCategoryId) || null : null),
    [selectedCategoryId, categoryMap]
  );

  const selectedCategoryTotal = useMemo(
    () => selectedCategoryTransactions.reduce((sum, t) => sum + t.amount, 0),
    [selectedCategoryTransactions]
  );

  const handleDeleteTransaction = useCallback(
    (id: string) => {
      confirmWithToast({
        title: 'Hapus Transaksi',
        message:
          'Yakin ingin menghapus transaksi ini? Saldo dompet akan disesuaikan otomatis.',
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

  // Data Donut Chart
  const donutData = useMemo(
    () =>
      dynamicCategoryData.map((item, idx) => ({
        categoryId: item.categoryId,
        name: item.categoryName,
        value: item.totalAmount,
        color: item.color || CHART_PALETTE[idx % CHART_PALETTE.length],
        percentage: item.percentage,
      })),
    [dynamicCategoryData]
  );

  const monthNameOnly = useMemo(
    () => formatMonthYear(currentMonth).split(' ')[0],
    [currentMonth]
  );
  const remainingDaysText = getRemainingDaysLabel(currentMonth);

  // Pesan evaluasi finansial otomatis berdasarkan data nyata
  const evaluationMessage = useMemo(() => {
    if (totalIncome === 0 && totalExpense === 0) {
      return `Belum ada transaksi tercatat di bulan ${formatMonthYear(currentMonth)}. Mulailah mencatat pemasukan dan pengeluaran agar analisis finansial muncul otomatis.`;
    }
    const topExpCat = expenseByCategory[0];
    const parts: string[] = [];

    if (totalIncome > 0) {
      if (netSavings >= 0) {
        parts.push(
          `Kamu berhasil menyisihkan ${savingsRate}% dari pemasukan bulan ini (${formatRupiah(netSavings)}).`
        );
      } else {
        parts.push(
          `Pengeluaran bulan ini melebihi pemasukan sebesar ${formatRupiah(Math.abs(netSavings))}.`
        );
      }
    }

    if (topExpCat) {
      parts.push(
        `Pos pengeluaran terbesar ada pada ${topExpCat.categoryName} (${topExpCat.percentage}%).`
      );
    }

    const overBudget = categoryBudgets.find((b) => b.isOverBudget);
    if (overBudget) {
      parts.push(
        `Perhatikan kategori ${overBudget.category?.name || 'terkait'} yang sudah melampaui pagu anggaran.`
      );
    } else if (remainingDaysText.startsWith('Tersisa')) {
      parts.push(
        `Pertahankan kendali belanja untuk ${remainingDaysText.replace('Tersisa ', '')} guna menjaga keseimbangan kas.`
      );
    }

    return parts.join(' ');
  }, [
    totalIncome,
    totalExpense,
    currentMonth,
    expenseByCategory,
    netSavings,
    savingsRate,
    categoryBudgets,
    remainingDaysText,
  ]);

  const activeWalletsCount = useMemo(() => {
    const usedIds = new Set(
      transactions.filter((t) => t.type === 'income').map((t) => t.walletId)
    );
    return usedIds.size;
  }, [transactions]);

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto pb-8">
      {/* 1. Header Switcher Tipe & Filter Minggu */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-text-primary">
              Laporan Finansial
            </h2>
            <p className="text-xs text-text-secondary">
              Analisis arus kas &amp; distribusi periode {formatMonthYear(currentMonth)}
            </p>
          </div>

          {/* Switcher Pengeluaran vs Pemasukan */}
          <div className="flex items-center gap-1 bg-surface border border-border rounded-full p-1 shadow-xs">
            <button
              type="button"
              onClick={() => handleTabChange('expense')}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                activeTab === 'expense'
                  ? 'bg-danger text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Keluar</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('income')}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                activeTab === 'income'
                  ? 'bg-secondary text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Masuk</span>
            </button>
          </div>
        </div>

        {/* Weekly Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {weeks.map((week) => {
            const isSelected = selectedWeekId === week.id;
            return (
              <button
                key={week.id}
                type="button"
                onClick={() => setSelectedWeekId(week.id)}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border',
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface text-text-secondary border-border hover:bg-surface-alt hover:text-text-primary'
                )}
              >
                {week.id === 'all' ? 'Bulan Ini' : week.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Kartu Ringkasan Arus Kas */}
      <div className="bg-surface rounded-3xl border border-border shadow-xs p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Ringkasan Arus Kas
              </p>
              <h3 className="text-base sm:text-lg font-extrabold text-text-primary">
                {formatMonthYear(currentMonth)}
              </h3>
            </div>
          </div>

          <span
            className={cn(
              'text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0',
              netSavings < 0
                ? 'bg-danger/15 text-danger'
                : savingsRate >= 20
                  ? 'bg-secondary/15 text-secondary'
                  : 'bg-primary/15 text-primary'
            )}
          >
            {netSavings < 0
              ? 'Defisit Kas'
              : savingsRate >= 20
                ? 'Hemat & Sehat'
                : 'Surplus'}
          </span>
        </div>

        {/* Sub-kartu Pemasukan & Pengeluaran */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface-alt/70 border border-border/60 p-3.5 flex flex-col gap-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary">
              <ArrowDownLeft className="w-3.5 h-3.5 text-secondary stroke-[2.5]" />
              Pemasukan
            </span>
            <p className="text-sm sm:text-base font-extrabold text-secondary truncate">
              +{formatRupiah(totalIncome)}
            </p>
            <span className="text-[11px] text-text-muted">
              {incomeCount} transaksi • {activeWalletsCount} sumber
            </span>
          </div>

          <div className="rounded-2xl bg-surface-alt/70 border border-border/60 p-3.5 flex flex-col gap-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary">
              <ArrowUpRight className="w-3.5 h-3.5 text-danger stroke-[2.5]" />
              Pengeluaran
            </span>
            <p className="text-sm sm:text-base font-extrabold text-danger truncate">
              -{formatRupiah(totalExpense)}
            </p>
            <span className="text-[11px] text-text-muted">
              {expenseCount} transaksi
            </span>
          </div>
        </div>

        {/* Sub-kartu Sisa / Saldo Tersimpan & Rasio Tabungan */}
        <div className="rounded-2xl bg-surface-alt/50 border border-border/60 p-3.5 flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium text-text-secondary">
                Sisa / Saldo Tersimpan
              </p>
              <p
                className={cn(
                  'text-lg sm:text-xl font-extrabold',
                  netSavings >= 0 ? 'text-secondary' : 'text-danger'
                )}
              >
                {netSavings >= 0 ? '+' : ''}
                {formatRupiah(netSavings)}
              </p>
            </div>
            <div className="text-right flex flex-col items-end gap-0.5">
              <span
                className={cn(
                  'text-[11px] font-bold px-2.5 py-0.5 rounded-full',
                  savingsRate >= 20
                    ? 'bg-secondary text-white'
                    : savingsRate > 0
                      ? 'bg-primary text-white'
                      : 'bg-danger text-white'
                )}
              >
                {Math.max(0, savingsRate)}% Tersimpan
              </span>
              <span className="text-[10px] text-text-muted">
                Target sehat: ≥ 20%
              </span>
            </div>
          </div>

          {/* Progress bar rasio tabungan */}
          <div className="w-full h-2 rounded-full bg-surface-alt overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                savingsRate >= 20
                  ? 'bg-secondary'
                  : savingsRate > 0
                    ? 'bg-primary'
                    : 'bg-danger'
              )}
              style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-text-muted">
            <span>0%</span>
            <span>Ambang Sehat (20%)</span>
            <span className="font-bold text-secondary">
              {Math.max(0, savingsRate)}% Terpenuhi
            </span>
          </div>
        </div>
      </div>

      {/* 3. Kartu Tren Mingguan */}
      <div className="bg-surface rounded-3xl border border-border shadow-xs p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Analitik Mingguan
            </p>
            <h3 className="text-base font-extrabold text-text-primary">
              Tren {activeTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'}{' '}
              {monthNameOnly}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] text-text-secondary">Rata-rata Harian</p>
            <p className="text-sm font-extrabold text-text-primary">
              {formatRupiah(dailyAverage)}
            </p>
          </div>
        </div>

        {/* Bar Chart Mingguan M1..M5 */}
        {maxBarAmount > 0 ? (
          <div className="pt-2 pb-1">
            <div className="grid grid-cols-5 gap-2 sm:gap-4 items-end h-36 px-1">
              {weeklyBars.map((bar) => {
                const heightPct =
                  maxBarAmount > 0
                    ? Math.max(8, Math.round((bar.amount / maxBarAmount) * 100))
                    : 8;
                const isPeak = bar.id === peakWeekId;
                const isSelected = selectedWeekId === bar.id;
                return (
                  <button
                    key={bar.id}
                    type="button"
                    onClick={() =>
                      setSelectedWeekId(isSelected ? 'all' : bar.id)
                    }
                    className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
                    title={`${bar.label} (${bar.rangeLabel}): ${formatRupiah(bar.amount)}`}
                  >
                    <span
                      className={cn(
                        'text-[10px] font-bold truncate max-w-full',
                        isPeak || isSelected
                          ? activeTab === 'expense'
                            ? 'text-danger'
                            : 'text-secondary'
                          : 'text-text-secondary'
                      )}
                    >
                      {bar.amount > 0 ? formatCompactNumber(bar.amount) : '-'}
                    </span>
                    <div className="w-full max-w-[44px] flex-1 flex items-end justify-center">
                      <div
                        className={cn(
                          'w-full rounded-t-xl transition-all duration-500',
                          bar.amount === 0
                            ? 'bg-surface-alt border border-dashed border-border'
                            : isSelected || isPeak
                              ? activeTab === 'expense'
                                ? 'bg-danger shadow-xs'
                                : 'bg-secondary shadow-xs'
                              : 'bg-primary/30 group-hover:bg-primary/50'
                        )}
                        style={{ height: bar.amount === 0 ? '14%' : `${heightPct}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        'text-[11px] font-bold',
                        isSelected
                          ? 'text-primary'
                          : isPeak
                            ? 'text-text-primary'
                            : 'text-text-muted'
                      )}
                    >
                      {bar.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-text-muted rounded-2xl bg-surface-alt/40">
            Belum ada data tren untuk periode ini.
          </div>
        )}

        {/* Footer Puncak Transaksi */}
        {peakDay && (
          <div className="rounded-2xl bg-surface-alt/70 border border-border/60 px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-2 text-text-secondary min-w-0">
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  activeTab === 'expense' ? 'bg-danger' : 'bg-secondary'
                )}
              />
              <span className="truncate">
                Puncak {activeTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'}:{' '}
                <strong className="text-text-primary">
                  {formatDateDisplay(peakDay.date)}
                </strong>{' '}
                ({formatRupiah(peakDay.amount)})
              </span>
            </span>
          </div>
        )}
      </div>

      {/* 4. Kartu Distribusi Kategori */}
      <div className="bg-surface rounded-3xl border border-border shadow-xs p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              {activeTab === 'expense' ? 'Struktur Biaya' : 'Struktur Pemasukan'}
            </p>
            <h3 className="text-base font-extrabold text-text-primary">
              Distribusi Kategori
            </h3>
          </div>
          <span className="text-xs font-semibold text-text-secondary shrink-0">
            {dynamicCategoryData.length} Kategori
          </span>
        </div>

        {dynamicCategoryData.length === 0 || dynamicTotal === 0 ? (
          <EmptyState
            icon={PieIcon}
            title={
              activeTab === 'expense'
                ? 'Belum Ada Pengeluaran'
                : 'Belum Ada Pemasukan'
            }
            description="Tidak ada transaksi pada periode atau filter minggu yang dipilih."
          />
        ) : (
          <>
            {/* Donut Chart (kiri) + Legenda Persentase (kanan) */}
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-4">
              <div className="relative w-40 h-40 mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      onClick={(_, idx) => {
                        const clicked = donutData[idx];
                        if (clicked) {
                          setSelectedCategoryId(
                            clicked.categoryId === selectedCategoryId
                              ? null
                              : clicked.categoryId
                          );
                        }
                      }}
                      cursor="pointer"
                    >
                      {donutData.map((entry, idx) => {
                        const isSelected =
                          entry.categoryId === selectedCategoryId;
                        const isDimmed = Boolean(
                          selectedCategoryId && !isSelected
                        );
                        return (
                          <Cell
                            key={`cell-${idx}`}
                            fill={entry.color}
                            stroke={isDark ? '#262B30' : '#FFFFFF'}
                            strokeWidth={isSelected ? 3 : 1.5}
                            className={cn(
                              'transition-opacity duration-200 cursor-pointer',
                              isDimmed ? 'opacity-40' : 'opacity-100'
                            )}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip
                      formatter={(val: unknown) => [
                        formatRupiah(Number(val) || 0),
                        activeTab === 'expense' ? 'Pengeluaran' : 'Pemasukan',
                      ]}
                      contentStyle={{
                        backgroundColor: isDark ? '#262B30' : '#FFFFFF',
                        borderColor: isDark ? '#3D4449' : '#D4D7DC',
                        borderRadius: '12px',
                        color: isDark ? '#E8E8E8' : '#191919',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                  <span className="text-[10px] text-text-secondary">Total</span>
                  <span className="text-sm font-extrabold text-text-primary">
                    {formatCompactNumber(dynamicTotal)}
                  </span>
                </div>
              </div>

              {/* Legenda di kanan */}
              <div className="flex flex-col gap-2">
                {donutData.slice(0, 6).map((item) => {
                  const isSelected = item.categoryId === selectedCategoryId;
                  return (
                    <button
                      key={item.categoryId}
                      type="button"
                      onClick={() =>
                        setSelectedCategoryId(
                          isSelected ? null : item.categoryId
                        )
                      }
                      className={cn(
                        'flex items-center justify-between text-xs px-2 py-1 rounded-lg transition-colors cursor-pointer text-left',
                        isSelected
                          ? 'bg-primary/10 font-bold'
                          : 'hover:bg-surface-alt'
                      )}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-text-primary truncate">
                          {item.name}
                        </span>
                      </span>
                      <span className="font-bold text-text-primary shrink-0 ml-2">
                        {item.percentage}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daftar Kartu Kategori (bisa diklik untuk lihat daftar transaksi) */}
            <div className="flex flex-col gap-2.5 pt-1">
              {dynamicCategoryData.map((item, idx) => {
                const isSelected = item.categoryId === selectedCategoryId;
                const budget =
                  activeTab === 'expense'
                    ? budgetByCatMap.get(item.categoryId)
                    : undefined;
                const barColor =
                  item.color || CHART_PALETTE[idx % CHART_PALETTE.length];
                const barPct = budget
                  ? Math.min(budget.percentage, 100)
                  : item.percentage;

                return (
                  <button
                    key={item.categoryId}
                    type="button"
                    onClick={() =>
                      setSelectedCategoryId(
                        isSelected ? null : item.categoryId
                      )
                    }
                    className={cn(
                      'w-full text-left rounded-2xl border p-3.5 flex flex-col gap-2.5 transition-all cursor-pointer',
                      isSelected
                        ? 'bg-primary/5 border-primary ring-1 ring-primary/30'
                        : 'bg-surface-alt/50 border-border/60 hover:border-primary/40 hover:bg-surface-alt'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CategoryIcon
                          name={item.categoryIcon}
                          color={barColor}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-text-primary truncate">
                            {item.categoryName}
                          </p>
                          <p className="text-[11px] text-text-secondary">
                            {budget
                              ? `Pagu: ${formatRupiah(budget.budget.targetAmount)}`
                              : `${item.count} transaksi`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                        <span className="text-xs sm:text-sm font-extrabold text-text-primary">
                          {formatRupiah(item.totalAmount)}
                        </span>
                        {budget ? (
                          <span
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full',
                              budget.isOverBudget || budget.percentage >= 90
                                ? 'bg-danger/15 text-danger'
                                : budget.percentage >= 70
                                  ? 'bg-warning/15 text-warning'
                                  : 'bg-secondary/15 text-secondary'
                            )}
                          >
                            {budget.percentage}% •{' '}
                            {budget.isOverBudget
                              ? 'Melebihi'
                              : budget.percentage >= 70
                                ? 'Waspada'
                                : 'Aman'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary">
                            {item.percentage}% dari total
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barPct}%`,
                          backgroundColor:
                            budget && budget.isOverBudget
                              ? '#CC1016'
                              : barColor,
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Daftar Transaksi Kategori Terpilih */}
            {selectedCategoryId && (
              <div className="mt-1 pt-4 border-t border-border/80 flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-alt/70 border border-border">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CategoryIcon
                      name={
                        selectedCategoryObj?.icon ||
                        (activeTab === 'expense' ? 'Tag' : 'Coins')
                      }
                      color={
                        selectedCategoryObj?.color ||
                        (activeTab === 'expense' ? '#0A66C2' : '#057642')
                      }
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
                        <strong className="text-text-primary">
                          {formatRupiah(selectedCategoryTotal)}
                        </strong>{' '}
                        • {selectedCategoryTransactions.length} transaksi
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(null)}
                    className="p-1.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface border border-border/60 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold shrink-0"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Tutup</span>
                  </button>
                </div>

                {selectedCategoryTransactions.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedCategoryTransactions.map((tx) => (
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
                        onDelete={handleDeleteTransaction}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-5 text-center rounded-2xl bg-surface border border-border/60 text-text-muted text-xs">
                    Tidak ada transaksi untuk kategori ini pada{' '}
                    {activeWeek.label.toLowerCase()}.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 5. Kilas Balik Finansial (Komparasi vs Bulan Sebelumnya) */}
      <div className="bg-surface rounded-3xl border border-border shadow-xs p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Kilas Balik Finansial
            </p>
            <h3 className="text-base font-extrabold text-text-primary">
              Komparasi vs {comparison.prevMonthName}
            </h3>
          </div>
          <div className="w-8 h-8 rounded-xl bg-surface-alt flex items-center justify-center text-text-secondary">
            {comparison.diff <= 0 ? (
              <TrendingDown className="w-4 h-4 text-secondary" />
            ) : (
              <TrendingUp className="w-4 h-4 text-danger" />
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-surface-alt/70 border border-border/60 p-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-text-secondary">
              Selisih {activeTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'}{' '}
              Bulanan
            </p>
            {comparison.prevTotal === 0 ? (
              <p className="text-sm font-bold text-text-primary mt-0.5">
                Belum ada data pembanding di {comparison.prevMonthName}
              </p>
            ) : (
              <>
                <p
                  className={cn(
                    'text-sm sm:text-base font-extrabold mt-0.5',
                    activeTab === 'expense'
                      ? comparison.diff <= 0
                        ? 'text-secondary'
                        : 'text-danger'
                      : comparison.diff >= 0
                        ? 'text-secondary'
                        : 'text-danger'
                  )}
                >
                  {comparison.diff <= 0 ? 'Turun' : 'Naik'}{' '}
                  {Math.abs(comparison.pct)}% ({comparison.diff > 0 ? '+' : ''}
                  {formatRupiah(comparison.diff)})
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Lalu: {formatRupiah(comparison.prevTotal)} → Kini:{' '}
                  {formatRupiah(comparison.currTotal)}
                </p>
              </>
            )}
          </div>

          {comparison.prevTotal > 0 && (
            <span
              className={cn(
                'text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0',
                activeTab === 'expense'
                  ? comparison.diff <= 0
                    ? 'bg-secondary text-white'
                    : 'bg-danger/15 text-danger'
                  : comparison.diff >= 0
                    ? 'bg-secondary text-white'
                    : 'bg-danger/15 text-danger'
              )}
            >
              {activeTab === 'expense'
                ? comparison.diff <= 0
                  ? 'Lebih Hemat'
                  : 'Lebih Tinggi'
                : comparison.diff >= 0
                  ? 'Meningkat'
                  : 'Menurun'}
            </span>
          )}
        </div>

        {comparison.highlightCat && (
          <div className="rounded-2xl bg-surface-alt/50 border border-border/60 px-3.5 py-2.5 text-xs text-text-secondary flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>
              Kategori paling{' '}
              {activeTab === 'expense' ? 'hemat' : 'bertumbuh'}:{' '}
              <strong className="text-text-primary">
                {comparison.highlightCat.name} (
                {comparison.highlightCat.pctChange > 0 ? '+' : ''}
                {comparison.highlightCat.pctChange}%)
              </strong>{' '}
              dibanding bulan lalu.
            </span>
          </div>
        )}
      </div>

      {/* 6. Evaluasi Finansial (Banner Gradient Biru Aplikasi) */}
      <div
        className="rounded-3xl p-5 text-white shadow-md flex flex-col gap-3"
        style={{
          backgroundColor: '#0A66C2',
          backgroundImage:
            'linear-gradient(135deg, #0A66C2 0%, #0073B1 55%, #004F9A 100%)',
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white/90" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
            Evaluasi Finansial Bulanan
          </span>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed text-white/95 font-medium">
          {evaluationMessage}
        </p>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/20">
          <span className="text-[11px] text-white/85">
            {remainingDaysText || formatMonthYear(currentMonth)}
          </span>
          <Link
            href="/budget"
            className="px-3 py-1 rounded-full bg-white text-primary text-xs font-bold hover:bg-white/90 transition-colors shrink-0"
          >
            Kelola Target
          </Link>
        </div>
      </div>

      {/* 7. Sumber Dana Terpakai */}
      <div className="bg-surface rounded-3xl border border-border shadow-xs p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Kanal Pembayaran
            </p>
            <h3 className="text-base font-extrabold text-text-primary">
              Sumber Dana Terpakai
            </h3>
          </div>
          <span className="text-xs font-semibold text-text-secondary flex items-center gap-1">
            <WalletIcon className="w-3.5 h-3.5" />
            {walletUsage.length} Saluran
          </span>
        </div>

        {walletUsage.length === 0 ? (
          <p className="text-xs text-text-muted py-3 text-center">
            Belum ada pergerakan saldo pada filter ini.
          </p>
        ) : (
          <>
            {/* Stacked horizontal bar */}
            <div className="w-full h-2.5 rounded-full bg-surface-alt overflow-hidden flex gap-0.5">
              {walletUsage.map((w) => (
                <div
                  key={w.walletId}
                  className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${Math.max(w.percentage, 3)}%`,
                    backgroundColor: w.color,
                  }}
                  title={`${w.name}: ${w.percentage}%`}
                />
              ))}
            </div>

            {/* Grid dompet */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {walletUsage.map((w) => (
                <div
                  key={w.walletId}
                  className="rounded-2xl bg-surface-alt/60 border border-border/60 p-3 flex flex-col items-center text-center gap-0.5"
                >
                  <span className="text-[11px] font-semibold text-text-secondary truncate w-full">
                    {w.name}
                  </span>
                  <span
                    className="text-sm font-extrabold"
                    style={{ color: w.color }}
                  >
                    {w.percentage}%
                  </span>
                  <span className="text-[11px] font-medium text-text-primary truncate w-full">
                    {formatRupiah(w.amount)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 8. Tombol Cetak / Unduh Laporan */}
      <button
        type="button"
        onClick={() => window.print()}
        className="w-full py-3 px-4 rounded-2xl bg-surface border border-border hover:bg-surface-alt text-text-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer print:hidden"
      >
        <Printer className="w-4 h-4 text-primary" />
        <span>Cetak / Simpan PDF Bulanan</span>
      </button>
    </div>
  );
}
