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
  ChevronLeft,
  ChevronRight,
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
import { getRemainingDaysLabel } from '@/lib/utils/date';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WalletCard } from '@/components/wallets/WalletCard';
import { WalletModal } from '@/components/wallets/WalletModal';
import { BudgetProgressBar } from '@/components/budget/BudgetProgressBar';
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
  const [activeBudgetIndex, setActiveBudgetIndex] = useState(0);

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
  const allBudgets = [...(overallBudget ? [overallBudget] : []), ...categoryBudgets];
  const budgetCount = allBudgets.length;
  const safeIndex = Math.min(activeBudgetIndex, Math.max(0, budgetCount - 1));
  const currentBudget = allBudgets[safeIndex];
  const isOverall = currentBudget && currentBudget === overallBudget;
  const currentTitle = currentBudget
    ? isOverall
      ? 'Target Keseluruhan Bulan Ini'
      : currentBudget.category?.name || 'Target Kategori'
    : '';
  const currentIcon = isOverall ? 'Target' : currentBudget?.category?.icon || 'Tag';
  const currentColor = isOverall ? '#0A66C2' : currentBudget?.category?.color || '#0A66C2';
  const remainingDaysLabel = getRemainingDaysLabel(currentMonth);

  const getBudgetStatusLabel = (percentage: number, isOver: boolean) => {
    if (isOver) return 'Melebihi';
    if (percentage >= 90) return 'Kritis';
    if (percentage >= 70) return 'Waspada';
    return 'Aman';
  };

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

      {/* 2. Target Anggaran (Progress Target Bulanan & Kategori) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-text-primary">Target Anggaran</h3>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5 ml-6">
              {budgetCount > 0
                ? `${budgetCount} Target aktif bulan ini`
                : 'Pantau batas pengeluaran Anda'}
            </p>
          </div>
          {budgetCount > 0 && (
            <Link
              href="/budget"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Kelola</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Jika belum ada target sama sekali */}
        {budgetCount === 0 && (
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
        )}

        {/* Tampilan Tumpukan Kartu (Stacked Deck - sesuai desain referensi) */}
        {budgetCount > 0 && !showAllBudgets && currentBudget && (
          <div className="flex flex-col gap-3">
            {/* Wrapper tumpukan kartu bertingkat */}
            <div className="relative isolate pt-1 pb-4">
              {/* Layer 2: Paling bawah (hanya jika ada >= 3 target) */}
              {budgetCount >= 3 && (
                <div
                  className="absolute -bottom-3 left-6 right-6 h-8 rounded-2xl bg-surface-alt/80 border border-border/80 shadow-2xs pointer-events-none transition-all duration-300"
                  aria-hidden="true"
                />
              )}

              {/* Layer 1: Tengah (hanya jika ada >= 2 target) */}
              {budgetCount >= 2 && (
                <div
                  className="absolute -bottom-1.5 left-3 right-3 h-8 rounded-2xl bg-surface-alt border border-border shadow-2xs pointer-events-none transition-all duration-300"
                  aria-hidden="true"
                />
              )}

              {/* Kartu Utama (Active Front Card) */}
              <div className="relative z-10 bg-surface rounded-2xl sm:rounded-3xl border border-border shadow-xs p-4 sm:p-5 flex flex-col gap-3 transition-all hover:border-primary/40 hover:shadow-sm">
                {/* Header: Icon + Judul di kiri, Badge Status di kanan */}
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <CategoryIcon
                      name={currentIcon}
                      color={currentColor}
                      size="sm"
                    />
                    <span className="text-sm sm:text-base font-bold text-text-primary truncate">
                      {currentTitle}
                    </span>
                  </div>

                  <span
                    className={cn(
                      'text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap',
                      currentBudget.isOverBudget || currentBudget.percentage >= 90
                        ? 'text-danger bg-danger/15'
                        : currentBudget.percentage >= 70
                          ? 'text-warning bg-warning/15'
                          : 'text-secondary bg-secondary/15'
                    )}
                  >
                    {getBudgetStatusLabel(currentBudget.percentage, currentBudget.isOverBudget)} ({currentBudget.percentage}%)
                  </span>
                </div>

                {/* Baris 2 kolom: Terpakai (kiri, besar) & Target Maksimal (kanan) */}
                <div className="flex items-end justify-between gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] text-text-secondary">Terpakai</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-text-primary truncate">
                      {formatRupiah(currentBudget.spentAmount)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end shrink-0 text-right">
                    <span className="text-[11px] text-text-secondary">Target Maksimal</span>
                    <span className="text-sm sm:text-base font-bold text-text-primary">
                      {formatRupiah(currentBudget.budget.targetAmount)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-2.5 sm:h-3 rounded-full bg-surface-alt overflow-hidden">
                  <div
                    key={`bar-${safeIndex}`}
                    className={cn(
                      'h-full rounded-full transition-all duration-700 ease-out animate-progress-fill',
                      currentBudget.isOverBudget || currentBudget.percentage >= 90
                        ? 'bg-danger'
                        : currentBudget.percentage >= 70
                          ? 'bg-warning'
                          : 'bg-secondary'
                    )}
                    style={{ width: `${Math.min(currentBudget.percentage, 100)}%` }}
                  />
                </div>

                {/* Footer: Dot + Sisa/Lebih di kiri, Tersisa X hari lagi di kanan */}
                <div className="flex items-center justify-between text-xs text-text-secondary gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        currentBudget.isOverBudget || currentBudget.percentage >= 90
                          ? 'bg-danger'
                          : currentBudget.percentage >= 70
                            ? 'bg-warning'
                            : 'bg-secondary'
                      )}
                    />
                    {currentBudget.isOverBudget ? (
                      <span className="text-danger font-semibold">
                        Lebih: {formatRupiah(Math.abs(currentBudget.remainingAmount))}
                      </span>
                    ) : (
                      <span>
                        Sisa:{' '}
                        <strong className="text-text-primary font-semibold">
                          {formatRupiah(currentBudget.remainingAmount)}
                        </strong>
                      </span>
                    )}
                  </span>
                  {remainingDaysLabel && (
                    <span className="shrink-0 text-right text-[11px] text-text-secondary">
                      {remainingDaysLabel}
                    </span>
                  )}
                </div>

                {/* Navigasi Ganti Kartu dalam Tumpukan */}
                {budgetCount > 1 && (
                  <div className="flex items-center justify-between pt-2.5 border-t border-border/70 text-xs text-text-secondary">
                    <span className="font-semibold text-[11px] text-text-primary">
                      Target {safeIndex + 1} dari {budgetCount}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveBudgetIndex((prev) => (prev > 0 ? prev - 1 : allBudgets.length - 1));
                        }}
                        className="h-7 w-7 flex items-center justify-center rounded-lg border border-border bg-surface hover:bg-surface-alt text-text-primary transition-colors cursor-pointer"
                        title="Target Sebelumnya"
                        aria-label="Target Sebelumnya"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveBudgetIndex((prev) => (prev < allBudgets.length - 1 ? prev + 1 : 0));
                        }}
                        className="h-7 w-7 flex items-center justify-center rounded-lg border border-border bg-surface hover:bg-surface-alt text-text-primary transition-colors cursor-pointer"
                        title="Target Berikutnya"
                        aria-label="Target Berikutnya"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tombol Lihat Semua Tumpukan */}
            {budgetCount > 1 && (
              <button
                type="button"
                onClick={() => setShowAllBudgets(true)}
                className="self-center inline-flex min-h-10 items-center gap-2 px-4 rounded-xl text-xs sm:text-sm font-semibold text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors cursor-pointer"
              >
                <span>Lihat semua target ({budgetCount})</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Tampilan Buka Semua Target (Expanded View) */}
        {budgetCount > 0 && showAllBudgets && (
          <div className="motion-enter flex flex-col gap-3">
            {/* Target Keseluruhan (Total) jika ada */}
            {overallBudget && (
              <Link href="/budget" className="block group">
                <BudgetProgressBar
                  title="Target Keseluruhan Bulan Ini"
                  spentAmount={overallBudget.spentAmount}
                  targetAmount={overallBudget.budget.targetAmount}
                  month={currentMonth}
                  className="group-hover:border-primary/40 group-hover:bg-surface-alt/20 transition-all cursor-pointer"
                />
              </Link>
            )}

            {/* Target Per Kategori dalam grid 2 kolom */}
            {categoryBudgets.length > 0 && (
              <div className="flex flex-col gap-2">
                {overallBudget && (
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider pt-1">
                    Target Per Kategori ({categoryBudgets.length})
                  </h4>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryBudgets.map((cp) => (
                    <Link key={cp.budget.id} href="/budget" className="block group">
                      <BudgetProgressBar
                        title={cp.category?.name || 'Kategori'}
                        spentAmount={cp.spentAmount}
                        targetAmount={cp.budget.targetAmount}
                        month={currentMonth}
                        icon={
                          <CategoryIcon
                            name={cp.category?.icon || 'Tag'}
                            color={cp.category?.color || '#0A66C2'}
                            size="sm"
                          />
                        }
                        className="group-hover:border-primary/40 group-hover:bg-surface-alt/20 hover:shadow-sm cursor-pointer"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowAllBudgets(false)}
              className="self-center inline-flex min-h-10 items-center gap-2 px-4 mt-1 rounded-xl text-xs sm:text-sm font-semibold text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors cursor-pointer"
            >
              <ChevronUp className="w-4 h-4" />
              <span>Tumpuk kembali</span>
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
