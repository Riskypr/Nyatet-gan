'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ReceiptText, Plus, PieChart, Settings } from 'lucide-react';
import { useUIStore } from '@/lib/stores/uiStore';
import { cn } from '@/lib/utils/cn';

export function BottomNav() {
  const pathname = usePathname();
  const { openTransactionModal } = useUIStore();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Transaksi', href: '/transactions', icon: ReceiptText },
    // FAB tengah
    { label: 'Tambah', href: '#', icon: Plus, isFab: true },
    { label: 'Laporan', href: '/reports', icon: PieChart },
    { label: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E5DCD0] px-3 pb-safe pt-1">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item, idx) => {
          if (item.isFab) {
            return (
              <div key={idx} className="relative -top-5 flex flex-col items-center">
                <button
                  onClick={() => openTransactionModal('expense')}
                  className="w-13 h-13 rounded-2xl bg-[#C86446] text-white flex items-center justify-center shadow-lg shadow-[#C86446]/35 active:scale-95 transition-transform hover:bg-[#A84D32] focus:outline-none focus:ring-2 focus:ring-[#C86446]"
                  aria-label="Catat Transaksi Baru"
                >
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </button>
                <span className="text-[10px] font-semibold text-[#C86446] mt-1">Catat</span>
              </div>
            );
          }

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={idx}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-14 py-1 transition-colors group',
                isActive ? 'text-[#C86446]' : 'text-[#68635B] hover:text-[#2D2A26]'
              )}
            >
              <div
                className={cn(
                  'p-1 rounded-xl transition-all',
                  isActive ? 'bg-[#C86446]/10' : 'group-hover:bg-[#E5DCD0]/40'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              </div>
              <span className={cn('text-[10px] mt-0.5 font-medium', isActive && 'font-bold text-[#C86446]')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
