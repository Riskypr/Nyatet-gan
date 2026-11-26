'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  SlidersHorizontal,
  Wallet as WalletIcon,
  PiggyBank,
  Eye,
  EyeOff,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { budgetService } from '@/lib/services/budgetService';
import { categoryService } from '@/lib/services/categoryService';
import { BudgetProgress, Category } from '@/lib/types';
import { formatRupiah } from '@/lib/utils/currency';
import { formatMonthYear, getCurrentMonth, getRemainingDaysLabel } from '@/lib/utils/date';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WalletCard } from '@/components/wallets/WalletCard';
import { WalletModal } from '@/components/wallets/WalletModal';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { ExpenseCalendar } from '@/components/calendar/ExpenseCalendar';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { MonthSelector } from '@/components/ui/MonthSelector';

export default function DashboardPage() {
  const { wallets, totalBalance, isBalanceHidden, toggleBalanceHidden } = useWalletStore();
  const { currentMonth, setCurrentMonth, transactions, monthlySummary, deleteTransaction } = useTransactionStore();
  const { openTransactionModal } = useUIStore();

  const [categories, setCategories] = useState<Map<string, Category>>(new Map());
  const [overallBudget, setOverallBudget] = useState<BudgetProgress | null>(null);
  const [categoryBudgets, setCategoryBudgets] = useState<BudgetProgress[]>([]);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [showAllBudgets, setShowAllBudgets] = useState(false);

  // Load category lookup map and budget progress for the current month
  useEffect(() => {
    async function loadDashboardData() {
      const [allCats, progressData] = await Promise.all([
        categoryService.getAll(),
        budgetService.getBudgetProgress(currentMonth),
      ]);

      const map = new Map<string, Category>();
      allCats.forEach((c) => map.set(c.id, c));
      setCategories(map);
      setOverallBudget(progressData.overall);
      setCategoryBudgets(progressData.categoryProgress);
    }

    loadDashboardData();
  }, [currentMonth, transactions]);

  const walletMap = new Map(wallets.map((w) => [w.id, w]));
  const recentTransactions = transactions.slice(0, 5);
  const hasAnyBudget = Boolean(overallBudget) || categoryBudgets.length > 0;
  const remainingDaysLabel = getRemainingDaysLabel(currentMonth);
  const remainingDaysCount = (() => {
    const [yStr, mStr] = currentMonth.split('-');
    const daysInMonth = new Date(parseInt(yStr, 10), parseInt(mStr, 10), 0).getDate();
    const currKey = getCurrentMonth();
    if (currentMonth === currKey) {
      return Math.max(1, daysInMonth - new Date().getDate() + 1);
    }
    if (currentMonth < currKey) return 1;
    return daysInMonth;
  })();
  const overallDailyQuota = overallBudget
    ? Math.max(0, Math.round(overallBudget.remainingAmount / remainingDaysCount))
    : 0;
  const visibleCategoryBudgets = showAllBudgets
    ? categoryBudgets
    : categoryBudgets.slice(0, 3);

  return (
    <div className="flex flex-col gap-5 sm:gap-6 max-w-3xl mx-auto">
      {/* Selector Bulan Mobile (menyatu dengan konten, tidak menempel header) */}
      <MonthSelector variant="full" className="sm:hidden" />

      {/* 1. Card Saldo Total (Hero Card) */}
      <div
        className="hero-total-card relative overflow-hidden rounded-3xl p-5 sm:p-6 text-white shadow-lg transition-colors duration-200"
        style={{
          backgroundColor: '#0A66C2',
          backgroundImage: 'linear-gradient(135deg, #0A66C2 0%, #0073B1 50%, #004F9A 100%)',
        }}
      >
        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/90">
              Total Saldo Semua Dompet
            </span>
          </div>

          <div className="flex items-center gap-2.5 min-w-0">
            <h2 className="min-w-0 truncate text-2xl sm:text-4xl font-extrabold tracking-tight transition-all duration-200" suppressHydrationWarning>
              {isBalanceHidden ? 'Rp ••••••••' : formatRupiah(totalBalance)}
            </h2>
            <button
              type="button"
              onClick={toggleBalanceHidden}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer shrink-0"
              title={isBalanceHidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
              aria-label={isBalanceHidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
            >
              {isBalanceHidden ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Sub-card: Pemasukan vs Pengeluaran Bulan Ini */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-[#7FC15E] shadow-xs">
                <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-white/80">Pemasukan Bulan Ini</p>
                <p className="text-xs sm:text-sm font-bold text-white truncate" suppressHydrationWarning>
                  {isBalanceHidden ? 'Rp ••••••••' : formatRupiah(monthlySummary?.totalIncome || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-[#F87171] shadow-xs">
                <ArrowUpRight className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-white/80">Pengeluaran Bulan Ini</p>
                <p className="text-xs sm:text-sm font-bold text-white truncate" suppressHydrationWarning>
                  {isBalanceHidden ? 'Rp ••••••••' : formatRupiah(monthlySummary?.totalExpense || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Target Anggaran (Kartu Terpadu Bulanan & Posisi per Kategori) */}
      {!hasAnyBudget ? (
        <Card className="flex items-center justify-between p-4 bg-surface-alt/50 border-dashed border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-text-primary">
                Belum Pasang Target Anggaran
              </p>
              <p className="text-[11px] text-text-secondary">
                Kendalikan belanja Anda dengan memasang limit bulanan
              </p>
            </div>
          </div>
          <Link href="/budget">
            <Button size="sm" variant="secondary">
              Pasang Target
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="bg-surface rounded-3xl border border-border shadow-xs p-4 sm:p-5 flex flex-col gap-4">
          {/* Header Card: Icon + Anggaran Bulanan + Badge % + Tombol Kelola */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-extrabold text-text-primary leading-tight truncate">
                  Anggaran Bulanan
                </h3>
                <p className="text-[11px] text-text-secondary truncate">
                  Target pengeluaran {formatMonthYear(currentMonth)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {overallBudget && (
                <span
                  className={cn(
                    'text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap',
                    overallBudget.isOverBudget || overallBudget.percentage >= 90
                      ? 'bg-danger/15 text-danger'
                      : overallBudget.percentage >= 70
                        ? 'bg-warning/15 text-warning'
                        : 'bg-secondary/15 text-secondary'
                  )}
                >
                  {overallBudget.percentage}% Terpakai
                </span>
              )}
              <Link
                href="/budget"
                className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-surface-alt transition-colors"
                title="Kelola Target Anggaran"
                aria-label="Kelola Target Anggaran"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Sub-kartu Anggaran Keseluruhan */}
          {overallBudget ? (
            <div className="rounded-2xl bg-surface-alt/60 border border-border/60 p-4 flex flex-col gap-3">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[11px] text-text-secondary">Terpakai</span>
                  <p className="text-xl sm:text-2xl font-extrabold text-text-primary truncate">
                    {formatRupiah(overallBudget.spentAmount)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-text-secondary">Pagu Maksimal</span>
                  <p className="text-sm sm:text-base font-bold text-text-primary">
                    {formatRupiah(overallBudget.budget.targetAmount)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-surface overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700 ease-out animate-progress-fill',
                    overallBudget.isOverBudget || overallBudget.percentage >= 90
                      ? 'bg-danger'
                      : overallBudget.percentage >= 70
                        ? 'bg-warning'
                        : 'bg-secondary'
                  )}
                  style={{ width: `${Math.min(overallBudget.percentage, 100)}%` }}
                />
              </div>

              {/* Footer: Sisa + Sisa Hari */}
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="inline-flex items-center gap-1.5 truncate">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      overallBudget.isOverBudget || overallBudget.percentage >= 90
                        ? 'bg-danger'
                        : overallBudget.percentage >= 70
                          ? 'bg-warning'
                          : 'bg-secondary'
                    )}
                  />
                  {overallBudget.isOverBudget ? (
                    <span className="text-danger font-semibold">
                      Lebih: {formatRupiah(Math.abs(overallBudget.remainingAmount))}
                    </span>
                  ) : (
                    <span className="text-text-secondary">
                      Sisa:{' '}
                      <strong className="text-secondary font-bold">
                        {formatRupiah(overallBudget.remainingAmount)}
                      </strong>
                    </span>
                  )}
                </span>

                {remainingDaysLabel && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary shrink-0">
                    <Clock className="w-3.5 h-3.5 text-text-muted" />
                    <span>{remainingDaysLabel}</span>
                  </span>
                )}
              </div>

              {/* Kotak Saran Kuota Harian */}
              <div className="rounded-xl bg-surface border border-border/70 p-3 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      overallBudget.isOverBudget || overallBudget.percentage >= 90
                        ? 'bg-danger/10 text-danger'
                        : overallBudget.percentage >= 70
                          ? 'bg-warning/10 text-warning'
                          : 'bg-secondary/10 text-secondary'
                    )}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-primary leading-tight">
                      Saran Kuota Harian
                    </p>
                    <p className="text-[10px] text-text-secondary truncate mt-0.5">
                      {remainingDaysCount} hari ke depan agar tetap aman
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={cn(
                      'text-[10px] font-bold block leading-none mb-0.5',
                      overallBudget.isOverBudget || overallBudget.percentage >= 90
                        ? 'text-danger'
                        : overallBudget.percentage >= 70
                          ? 'text-warning'
                          : 'text-secondary'
                    )}
                  >
                    {overallBudget.isOverBudget
                      ? 'Melebihi'
                      : overallBudget.percentage >= 70
                        ? 'Waspada'
                        : 'Aman'}
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-text-primary whitespace-nowrap">
                    {formatRupiah(overallDailyQuota)}{' '}
                    <span className="text-[10px] font-medium text-text-secondary">/ hari</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/budget"
              className="rounded-2xl bg-surface-alt/50 border border-dashed border-border p-3.5 flex items-center justify-between text-xs hover:border-primary/40 transition-colors"
            >
              <span className="text-text-secondary">
                Belum ada pagu keseluruhan bulan ini.
              </span>
              <span className="font-bold text-primary inline-flex items-center gap-1 shrink-0">
                <span>Atur Pagu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          )}

          {/* Posisi per Kategori */}
          {categoryBudgets.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-xs font-bold text-text-primary">
                  Posisi per Kategori
                </span>
                <span className="text-[11px] text-text-muted">
                  Plafon vs Realisasi
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {visibleCategoryBudgets.map((cp) => {
                  const isCritical = cp.isOverBudget || cp.percentage >= 90;
                  const isWarning = !isCritical && cp.percentage >= 70;
                  const barColor = isCritical
                    ? 'bg-danger'
                    : isWarning
                      ? 'bg-warning'
                      : 'bg-secondary';
                  const targetShort = formatRupiah(cp.budget.targetAmount).replace(
                    /^Rp\s*/,
                    ''
                  );

                  return (
                    <Link
                      key={cp.budget.id}
                      href="/budget"
                      className="rounded-2xl bg-surface-alt/50 border border-border/60 p-3 flex flex-col gap-2 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CategoryIcon
                            name={cp.category?.icon || 'Tag'}
                            color={cp.category?.color || '#0A66C2'}
                            size="sm"
                          />
                          <span className="text-xs font-bold text-text-primary truncate">
                            {cp.category?.name || 'Kategori'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                          <span className="font-bold text-text-primary">
                            {formatRupiah(cp.spentAmount)}
                          </span>
                          <span className="text-text-muted">/ {targetShort}</span>
                          <span
                            className={cn(
                              'font-bold px-1.5 py-0.5 rounded-full text-[10px]',
                              isCritical
                                ? 'bg-danger/15 text-danger'
                                : isWarning
                                  ? 'bg-warning/15 text-warning'
                                  : 'bg-secondary/15 text-secondary'
                            )}
                          >
                            {cp.isOverBudget
                              ? `${cp.percentage}% Lebih`
                              : isCritical || isWarning
                                ? `${cp.percentage}% Waspada`
                                : `${cp.percentage}%`}
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-700',
                            barColor
                          )}
                          style={{ width: `${Math.min(cp.percentage, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-text-secondary truncate">
                          {cp.isOverBudget ? (
                            <span className="text-danger font-semibold">
                              Lebih: {formatRupiah(Math.abs(cp.remainingAmount))}
                            </span>
                          ) : (
                            <>
                              Sisa:{' '}
                              <strong className="text-text-primary font-semibold">
                                {formatRupiah(cp.remainingAmount)}
                              </strong>
                            </>
                          )}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 whitespace-nowrap',
                            isCritical
                              ? 'bg-danger/10 text-danger'
                              : isWarning
                                ? 'bg-warning/15 text-warning'
                                : 'bg-secondary/10 text-secondary'
                          )}
                        >
                          Jatah: ~{formatRupiah(Math.max(0, Math.round(cp.remainingAmount / remainingDaysCount)))}/hari
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {categoryBudgets.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllBudgets((prev) => !prev)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-surface-alt/70 hover:bg-surface-alt border border-border/60 text-xs font-bold text-text-primary flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>
                    {showAllBudgets
                      ? 'Tampilkan Lebih Sedikit'
                      : `Lihat Semua Kategori (${categoryBudgets.length})`}
                  </span>
                  {showAllBudgets ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Dompet dan sumber dana (Horizontal Carousel) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <WalletIcon className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-text-primary">Dompet dan sumber dana</h3>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5 ml-6">
              {wallets.length > 0
                ? `${wallets.length} Sumber dana terdaftar`
                : 'Belum ada sumber dana'}
            </p>
          </div>
          <Link
            href="/wallets"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Kelola</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Smooth snap-scroll carousel — rata kiri sejajar judul, card berikutnya mengintip di kanan */}
        <div
          className="flex items-stretch gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scroll-smooth scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {wallets.map((w) => (
            <div key={w.id} className="snap-start">
              <WalletCard wallet={w} isCompact />
            </div>
          ))}

          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface/50 hover:bg-surface-alt/60 text-text-secondary shrink-0 transition-all hover:border-primary/40 cursor-pointer min-w-[116px] h-[132px] select-none"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Tambah</span>
          </button>
        </div>
      </div>

      {/* Kalender Transaksi Interaktif */}
      <ExpenseCalendar
        transactions={transactions}
        categories={categories}
        wallets={walletMap}
        currentMonth={currentMonth}
        onMonthChange={(m) => setCurrentMonth(m)}
        onEditTransaction={(tx) => openTransactionModal(tx.type, tx)}
        onDeleteTransaction={(id) => deleteTransaction(id)}
        onAddTransaction={(type, date) => openTransactionModal(type, null, date)}
      />

      {/* 4. Transaksi Terbaru (5 items) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">Transaksi Terbaru</h3>
          {transactions.length > 0 && (
            <Link
              href="/transactions"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Lihat semua ({transactions.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {recentTransactions.length > 0 ? (
          <div className="flex flex-col gap-2">
            {recentTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                category={categories.get(tx.categoryId)}
                wallet={walletMap.get(tx.walletId)}
                onEdit={() => openTransactionModal(tx.type, tx)}
                onDelete={(id) => deleteTransaction(id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Belum Ada Transaksi Bulan Ini"
            description="Mulai catat transaksi pertama Anda dalam hitungan detik. Data tersimpan aman di perangkat."
            actionLabel="Catat Sekarang"
            onAction={() => openTransactionModal('expense')}
          />
        )}
      </div>

      {/* Floating Action Button — Desktop Only (mobile has BottomNav FAB) */}
      <button
        onClick={() => openTransactionModal('expense')}
        className="hidden md:flex fixed bottom-8 right-8 z-50 w-14 h-14 rounded-2xl bg-primary text-white items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 hover:shadow-xl hover:shadow-primary/40 active:scale-95 transition-all cursor-pointer group"
        aria-label="Catat Transaksi Baru"
      >
        <Plus className="w-6 h-6 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Modal Tambah Dompet Cepat */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
}
