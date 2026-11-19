'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Wallet as WalletIcon,
  PiggyBank,
  Eye,
  EyeOff,
  Target,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { budgetService } from '@/lib/services/budgetService';
import { categoryService } from '@/lib/services/categoryService';
import { BudgetProgress, Category } from '@/lib/types';
import { formatRupiah } from '@/lib/utils/currency';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WalletCard } from '@/components/wallets/WalletCard';
import { WalletModal } from '@/components/wallets/WalletModal';
import { BudgetProgressBar } from '@/components/budget/BudgetProgressBar';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { ExpenseCalendar } from '@/components/calendar/ExpenseCalendar';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

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
  const budgetCount = (overallBudget ? 1 : 0) + categoryBudgets.length;
  const firstBudget = overallBudget || categoryBudgets[0];
  const firstBudgetTitle = overallBudget
    ? 'Target Keseluruhan Bulan Ini'
    : categoryBudgets[0]?.category?.name || 'Target Kategori';

  return (
    <div className="flex flex-col gap-5 sm:gap-6 max-w-3xl mx-auto">
      {/* 1. Card Saldo Total (Hero Card) */}
      <div
        className="relative overflow-hidden rounded-3xl p-4 sm:p-6 text-white shadow-md transition-colors duration-200"
        style={{ backgroundColor: 'var(--hero-card-bg, #0A66C2)' }}
      >
        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/85">
                Total Saldo Semua Dompet
              </span>
              <button
                type="button"
                onClick={toggleBalanceHidden}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                title={isBalanceHidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
                aria-label={isBalanceHidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
              >
                {isBalanceHidden ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight transition-all duration-200" suppressHydrationWarning>
              {isBalanceHidden ? 'Rp ••••••••' : formatRupiah(totalBalance)}
            </h2>
          </div>

          {/* Sub-card: Pemasukan vs Pengeluaran Bulan Ini */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-[#7FC15E] shadow-xs">
                <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-white/80">Pemasukan Bulan Ini</p>
                <p className="text-xs sm:text-sm font-bold text-white truncate">
                  {formatRupiah(monthlySummary?.totalIncome || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-[#F87171] shadow-xs">
                <ArrowUpRight className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-white/80">Pengeluaran Bulan Ini</p>
                <p className="text-xs sm:text-sm font-bold text-white truncate">
                  {formatRupiah(monthlySummary?.totalExpense || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Target Anggaran (Progress Target Bulanan & Kategori) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-text-primary">Target Anggaran</h3>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5 ml-6">
              {overallBudget || categoryBudgets.length > 0
                ? `${(overallBudget ? 1 : 0) + categoryBudgets.length} Target aktif bulan ini`
                : 'Pantau batas pengeluaran Anda'}
            </p>
          </div>
          <Link
            href="/budget"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Kelola</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Jika belum ada target sama sekali */}
        {budgetCount === 0 ? (
          <Card className="flex items-center justify-between p-4 bg-surface-alt/50 border-dashed border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-text-primary">Belum Pasang Target Anggaran</p>
                <p className="text-[11px] text-text-secondary">Kendalikan belanja Anda dengan memasang limit bulanan</p>
              </div>
            </div>
            <Link href="/budget">
              <Button size="sm" variant="secondary">
                Pasang Target
              </Button>
            </Link>
          </Card>
        ) : null}

        {/* Collapsed view — 1 card + stacked shadow */}
        {budgetCount > 0 && !showAllBudgets && (
          <div className="motion-enter flex flex-col items-center gap-1">
            <div
              className="relative isolate w-full"
              style={{ paddingBottom: budgetCount > 1 ? '1rem' : '0' }}
            >
              {/* Stacked card shadows — hanya jika ada lebih dari 1 target */}
              {budgetCount > 1 && (
                <>
                  <div
                    className="absolute z-0 rounded-2xl border border-border bg-surface-alt"
                    style={{ inset: '0.75rem 0.75rem 0 0.75rem', top: '0.75rem' }}
                  />
                  <div
                    className="absolute z-0 rounded-2xl border border-border bg-surface"
                    style={{ inset: '0.375rem 0.375rem 0 0.375rem', top: '0.375rem' }}
                  />
                </>
              )}
              {firstBudget && (
                <Link
                  href="/budget"
                  className="relative z-10 block rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-text-primary">{firstBudgetTitle}</p>
                      <p className="mt-1 text-[11px] text-text-secondary">
                        Total Target:{' '}
                        <strong className="font-semibold text-text-primary">
                          {formatRupiah(firstBudget.budget.targetAmount)}
                        </strong>
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold',
                        firstBudget.percentage >= 90
                          ? 'text-danger bg-danger/15'
                          : firstBudget.percentage >= 70
                          ? 'text-warning bg-warning/15'
                          : 'text-secondary bg-secondary/15'
                      )}
                    >
                      {firstBudget.percentage}%
                    </span>
                  </div>

                  <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-surface-alt">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        firstBudget.percentage >= 90
                          ? 'bg-danger'
                          : firstBudget.percentage >= 70
                          ? 'bg-warning'
                          : 'bg-secondary'
                      )}
                      style={{ width: `${Math.min(firstBudget.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-text-secondary">
                    <span className="truncate">
                      Terpakai:{' '}
                      <strong className="text-text-primary">{formatRupiah(firstBudget.spentAmount)}</strong>
                    </span>
                    <span
                      className={cn(
                        'shrink-0 font-semibold',
                        firstBudget.isOverBudget ? 'text-danger' : 'text-secondary'
                      )}
                    >
                      {firstBudget.isOverBudget
                        ? `Lebih ${formatRupiah(Math.abs(firstBudget.remainingAmount))}`
                        : `Sisa ${formatRupiah(firstBudget.remainingAmount)}`}
                    </span>
                  </div>
                </Link>
              )}
            </div>

            {budgetCount > 1 && (
              <button
                type="button"
                onClick={() => setShowAllBudgets(true)}
                className="inline-flex min-h-10 items-center gap-2 px-4 rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
              >
                Lihat semua ({budgetCount})
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Expanded view — semua target */}
        {budgetCount > 0 && showAllBudgets && (
          <div className="motion-enter flex flex-col gap-3">
            {overallBudget && (
              <Link href="/budget" className="block group">
                <BudgetProgressBar
                  title="Target Keseluruhan Bulan Ini"
                  spentAmount={overallBudget.spentAmount}
                  targetAmount={overallBudget.budget.targetAmount}
                  className="group-hover:border-primary/40 group-hover:bg-surface-alt/20 transition-all cursor-pointer"
                />
              </Link>
            )}

            {categoryBudgets.length > 0 && (
              <div className="flex flex-col gap-2">
                {overallBudget && (
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider pt-1">
                    Target Per Kategori ({categoryBudgets.length})
                  </h4>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {categoryBudgets.map((cp) => (
                    <Link key={cp.budget.id} href="/budget" className="block group">
                      <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs flex flex-col gap-2.5 transition-all group-hover:border-primary/40 group-hover:bg-surface-alt/20">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <CategoryIcon
                              name={cp.category?.icon || 'Tag'}
                              color={cp.category?.color || '#0A66C2'}
                              size="sm"
                            />
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs sm:text-sm font-bold text-text-primary truncate">
                                  {cp.category?.name || 'Kategori'}
                                </span>
                                {cp.isOverBudget && (
                                  <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0" />
                                )}
                              </div>
                              <span className="text-[11px] text-text-secondary">
                                Target:{' '}
                                <strong className="text-text-primary font-semibold">
                                  {formatRupiah(cp.budget.targetAmount)}
                                </strong>
                              </span>
                            </div>
                          </div>
                          <span
                            className={cn(
                              'text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0',
                              cp.percentage >= 90
                                ? 'text-danger bg-danger/15'
                                : cp.percentage >= 70
                                ? 'text-warning bg-warning/15'
                                : 'text-secondary bg-secondary/15'
                            )}
                          >
                            {cp.percentage}%
                          </span>
                        </div>

                        <div className="w-full h-2.5 rounded-full bg-surface-alt overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500 ease-out',
                              cp.percentage >= 90
                                ? 'bg-danger'
                                : cp.percentage >= 70
                                ? 'bg-warning'
                                : 'bg-secondary'
                            )}
                            style={{ width: `${Math.min(cp.percentage, 100)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-text-secondary">
                          <span className="truncate">
                            Terpakai:{' '}
                            <strong className="text-text-primary">{formatRupiah(cp.spentAmount)}</strong>
                          </span>
                          <span className="shrink-0">
                            {cp.isOverBudget ? (
                              <span className="text-danger font-semibold">
                                Lebih {formatRupiah(Math.abs(cp.remainingAmount))}
                              </span>
                            ) : (
                              <span className="text-secondary font-semibold">
                                Sisa {formatRupiah(cp.remainingAmount)}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowAllBudgets(false)}
              className="self-center inline-flex min-h-10 items-center gap-2 px-4 rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
              Sembunyikan
            </button>
          </div>
        )}
      </div>

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

        {/* Smooth snap-scroll carousel — shows ~1.5-2 cards on mobile */}
        <div className="flex items-stretch gap-3.5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scroll-smooth scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {wallets.map((w) => (
            <div key={w.id} className="snap-start">
              <WalletCard wallet={w} isCompact />
            </div>
          ))}

          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface/50 hover:bg-surface-alt/60 text-text-secondary shrink-0 transition-all hover:border-primary/40 cursor-pointer min-w-[120px] h-[130px] select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold">Tambah</span>
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
        onEditTransaction={(tx) => openTransactionModal(tx.type, tx.id)}
        onDeleteTransaction={(id) => deleteTransaction(id)}
        onAddTransaction={(type) => openTransactionModal(type)}
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
                onEdit={() => openTransactionModal(tx.type, tx.id)}
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
