'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  ArrowRight,
  Sparkles,
  Wallet as WalletIcon,
  PiggyBank,
  Eye,
  EyeOff,
} from 'lucide-react';
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

export default function DashboardPage() {
  const { wallets, totalBalance, isBalanceHidden, toggleBalanceHidden } = useWalletStore();
  const { currentMonth, setCurrentMonth, transactions, monthlySummary, deleteTransaction } = useTransactionStore();
  const { openTransactionModal } = useUIStore();

  const [categories, setCategories] = useState<Map<string, Category>>(new Map());
  const [overallBudget, setOverallBudget] = useState<BudgetProgress | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

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
    }

    loadDashboardData();
  }, [currentMonth, transactions]);

  const walletMap = new Map(wallets.map((w) => [w.id, w]));
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* 1. Card Saldo Total (Hero Card) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#943F28] via-[#C86446] to-[#7D341F] p-6 text-white shadow-xl shadow-primary/20 transition-all">
        {/* Modern glowing blurred meshes */}
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-48 h-48 rounded-full bg-white/15 blur-2xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 -translate-x-6 translate-y-6 w-36 h-36 rounded-full bg-black/15 blur-xl pointer-events-none" />

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
            <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white font-medium">
              <Sparkles className="w-3 h-3 text-[#E8A590]" />
              Aktif
            </span>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" suppressHydrationWarning>
              {isBalanceHidden ? 'Rp ••••••••' : formatRupiah(totalBalance)}
            </h2>
          </div>

          {/* Sub-card: Pemasukan vs Pengeluaran Bulan Ini */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-[#9AB8A2] shadow-xs">
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
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-[#E8A590] shadow-xs">
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

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => openTransactionModal('expense')}
          className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-surface border border-border shadow-xs hover:border-danger/40 hover:bg-surface-alt/40 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-danger/10 text-danger flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-text-primary">Catat Pengeluaran</span>
        </button>

        <button
          onClick={() => openTransactionModal('income')}
          className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-surface border border-border shadow-xs hover:border-secondary/40 hover:bg-surface-alt/40 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-text-primary">Catat Pemasukan</span>
        </button>
      </div>

      {/* 2. Progress Target Bulanan */}
      {overallBudget ? (
        <BudgetProgressBar
          title="Target Pengeluaran Bulan Ini"
          spentAmount={overallBudget.spentAmount}
          targetAmount={overallBudget.budget.targetAmount}
        />
      ) : (
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

      {/* 3. Daftar Dompet (Horizontal Scroll) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WalletIcon className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">Dompet & Sumber Dana</h3>
          </div>
          <Link
            href="/wallets"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Kelola</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {wallets.map((w) => (
            <WalletCard key={w.id} wallet={w} isCompact />
          ))}

          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-3 rounded-2xl border border-dashed border-border bg-surface hover:bg-surface-alt text-xs font-semibold text-text-secondary shrink-0 transition-colors h-[58px] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-primary" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Kalender Pengeluaran Interaktif */}
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

      {/* Modal Tambah Dompet Cepat */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
}
