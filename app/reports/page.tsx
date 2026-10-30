'use client';

import React, { useState } from 'react';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { ExpensePieChart } from '@/components/charts/ExpensePieChart';
import { IncomePieChart } from '@/components/charts/IncomePieChart';
import { Card } from '@/components/ui/Card';
import { formatRupiah } from '@/lib/utils/currency';
import { formatMonthYear } from '@/lib/utils/date';
import { ArrowDownLeft, ArrowUpRight, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ReportTab = 'expense' | 'income';

export default function ReportsPage() {
  const { currentMonth, monthlySummary, expenseByCategory, incomeByCategory } = useTransactionStore();
  const [activeTab, setActiveTab] = useState<ReportTab>('expense');

  const totalExpense = monthlySummary?.totalExpense || 0;
  const totalIncome = monthlySummary?.totalIncome || 0;
  const netSavings = monthlySummary?.netSavings || 0;

  const savingsRate =
    totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

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

      {/* Tab Switcher — Pengeluaran / Pemasukan */}
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <div className="flex items-center gap-1 bg-surface-alt border border-border rounded-xl p-1">
            <button
              onClick={() => setActiveTab('expense')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                activeTab === 'expense'
                  ? 'bg-danger text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              )}
            >
              <span className="flex items-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                Pengeluaran
              </span>
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                activeTab === 'income'
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              )}
            >
              <span className="flex items-center gap-1.5">
                <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                Pemasukan
              </span>
            </button>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-[11px] text-text-secondary">
              {activeTab === 'expense' ? 'Total Pengeluaran' : 'Total Pemasukan'}
            </p>
            <p className={cn('text-sm font-bold', activeTab === 'expense' ? 'text-danger' : 'text-secondary')}>
              {formatRupiah(activeTab === 'expense' ? totalExpense : totalIncome)}
            </p>
          </div>
        </div>

        {/* Chart Section */}
        <div>
          <div className="mb-3">
            <h3 className="text-sm font-bold text-text-primary">
              {activeTab === 'expense'
                ? 'Komposisi Pengeluaran per Kategori'
                : 'Komposisi Pemasukan per Kategori'}
            </h3>
            <p className="text-xs text-text-secondary">
              Sentuh atau arahkan kursor ke slice grafik untuk melihat persentase
            </p>
          </div>

          {activeTab === 'expense' ? (
            <ExpensePieChart data={expenseByCategory} totalExpense={totalExpense} />
          ) : (
            <IncomePieChart data={incomeByCategory} totalIncome={totalIncome} />
          )}
        </div>
      </Card>
    </div>
  );
}
