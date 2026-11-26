'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar, Search, User } from 'lucide-react';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { formatMonthYear, getPreviousMonth, getNextMonth } from '@/lib/utils/date';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Header() {
  const pathname = usePathname();
  const { currentMonth, setCurrentMonth } = useTransactionStore();
  const { openSearch } = useUIStore();

  const isDashboard = pathname === '/';
  const isReports = pathname === '/reports';
  const isBudget = pathname === '/budget';
  const showMonthSelector = isDashboard || isReports || isBudget;

  const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/transactions': 'Riwayat Transaksi',
    '/wallets': 'Dompet & Rekening',
    '/budget': 'Target Anggaran',
    '/reports': 'Laporan Pengeluaran',
    '/settings': 'Pengaturan & Backup',
  };

  const handlePrevMonth = () => {
    setCurrentMonth(getPreviousMonth(currentMonth));
  };

  const handleNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth));
  };

  return (
    <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur-md border-b border-border/80 px-4 py-3 flex items-center justify-between gap-2 transition-colors">
      <div className="flex items-center gap-2.5">
        <div className="md:hidden w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center overflow-hidden shadow-sm">
          <img src="/Logo.png" alt="Nyatet Gan" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-text-primary leading-tight">
            {pageTitles[pathname] || 'Nyatet Gan'}
          </h1>
          <p className="text-[11px] text-text-secondary hidden sm:block">
            {isDashboard && 'Ringkasan keuangan pribadi Anda'}
            {pathname === '/transactions' && 'Semua riwayat pemasukan dan pengeluaran'}
            {pathname === '/wallets' && 'Kelola sumber dana tunai, bank, dan e-wallet'}
            {pathname === '/budget' && 'Kendalikan pengeluaran bulanan'}
            {pathname === '/reports' && 'Komposisi dan analisis pengeluaran'}
            {pathname === '/settings' && 'Backup, restore, dan preferensi'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Selector bulan untuk tablet & desktop */}
        {showMonthSelector && (
          <div className="hidden sm:flex items-center gap-1 bg-surface border border-border rounded-xl px-2 py-1 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
              aria-label="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-1.5 select-none">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
                {formatMonthYear(currentMonth)}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
              aria-label="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Dark Mode / Light Mode Switch */}
        <ThemeToggle />

        {/* Tombol Pencarian Cepat */}
        <button
          type="button"
          onClick={openSearch}
          className="h-9 w-9 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
          title="Cari Transaksi Cepat"
          aria-label="Cari Transaksi Cepat"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Tombol Profil (Menuju Pengaturan) */}
        <Link
          href="/settings"
          className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center shadow-xs hover:bg-primary/90 transition-colors"
          title="Profil & Pengaturan"
          aria-label="Profil & Pengaturan"
        >
          <User className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
