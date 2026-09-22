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

export default function DashboardPage() {
  const { wallets, totalBalance, isBalanceHidden, toggleBalanceHidden } = useWalletStore();
  const { currentMonth, transactions, monthlySummary, deleteTransaction } = useTransactionStore();
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
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#A84D32] via-[#C86446] to-[#A84D32] p-6 text-white shadow-lg shadow-[#C86446]/25">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        
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
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-[#9AB8A2]">
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
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-[#E8A590]">
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
          className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-white border border-[#E5DCD0] shadow-xs hover:border-[#B0473C] transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#B0473C]/10 text-[#B0473C] flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#2D2A26]">Catat Pengeluaran</span>
        </button>

        <button
          onClick={() => openTransactionModal('income')}
          className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-white border border-[#E5DCD0] shadow-xs hover:border-[#4A6B53] transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#4A6B53]/10 text-[#4A6B53] flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#2D2A26]">Catat Pemasukan</span>
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
        <Card className="flex items-center justify-between p-4 bg-[#F2ECE1]/60 border-dashed border-[#E5DCD0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C86446]/10 text-[#C86446] flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#2D2A26]">Belum Pasang Target Anggaran</p>
              <p className="text-[11px] text-[#68635B]">Kendalikan belanja Anda dengan memasang limit bulanan</p>
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
            <WalletIcon className="w-4 h-4 text-[#C86446]" />
            <h3 className="text-sm font-bold text-[#2D2A26]">Dompet & Sumber Dana</h3>
          </div>
          <Link
            href="/wallets"
            className="text-xs font-semibold text-[#C86446] hover:underline flex items-center gap-1"
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
            className="flex items-center gap-2 px-3.5 py-3 rounded-2xl border border-dashed border-[#E5DCD0] bg-[#FAF7F2] hover:bg-[#F2ECE1] text-xs font-semibold text-[#68635B] shrink-0 transition-colors h-[58px]"
          >
            <Plus className="w-4 h-4 text-[#C86446]" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* 4. Transaksi Terbaru (5 items) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2D2A26]">Transaksi Terbaru</h3>
          {transactions.length > 0 && (
            <Link
              href="/transactions"
              className="text-xs font-semibold text-[#C86446] hover:underline flex items-center gap-1"
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
