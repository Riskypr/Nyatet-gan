'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { formatMonthYear, getPreviousMonth, getNextMonth } from '@/lib/utils/date';

export function Header() {
  const pathname = usePathname();
  const { currentMonth, setCurrentMonth } = useTransactionStore();

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
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E5DCD0]/70 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="md:hidden w-7 h-7 rounded-xl bg-[#C86446] text-white flex items-center justify-center overflow-hidden shadow-xs">
          <img src="/Logo.png" alt="Nyatet Gan" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#2D2A26] leading-tight">
            {pageTitles[pathname] || 'Nyatet Gan'}
          </h1>
          <p className="text-[11px] text-[#68635B] hidden sm:block">
            {isDashboard && 'Ringkasan keuangan pribadi Anda'}
            {pathname === '/transactions' && 'Semua riwayat pemasukan dan pengeluaran'}
            {pathname === '/wallets' && 'Kelola sumber dana tunai, bank, dan e-wallet'}
            {pathname === '/budget' && 'Kendalikan pengeluaran bulanan'}
            {pathname === '/reports' && 'Komposisi dan analisis pengeluaran'}
            {pathname === '/settings' && 'Backup, restore, dan preferensi'}
          </p>
        </div>
      </div>

      {showMonthSelector && (
        <div className="flex items-center gap-1 bg-white border border-[#E5DCD0] rounded-xl px-2 py-1 shadow-xs">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-lg text-[#68635B] hover:bg-[#F2ECE1] transition-colors"
            aria-label="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-1.5 select-none">
            <Calendar className="w-3.5 h-3.5 text-[#C86446]" />
            <span className="text-xs sm:text-sm font-semibold text-[#2D2A26] whitespace-nowrap">
              {formatMonthYear(currentMonth)}
            </span>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg text-[#68635B] hover:bg-[#F2ECE1] transition-colors"
            aria-label="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
