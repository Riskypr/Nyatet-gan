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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg/90 backdrop-blur-lg border-t border-border px-3 pb-safe pt-1 transition-colors">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item, idx) => {
          if (item.isFab) {
            return (
              <div key={idx} className="relative -top-5 flex flex-col items-center">
                <button
                  onClick={() => openTransactionModal('expense')}
                  className="w-13 h-13 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/35 active:scale-95 transition-transform hover:bg-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Catat Transaksi Baru"
                >
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </button>
                <span className="text-[10px] font-semibold text-primary mt-1">Catat</span>
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
                isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-xl transition-all',
                  isActive ? 'bg-primary/10' : 'group-hover:bg-surface-alt'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              </div>
              <span className={cn('text-[10px] mt-0.5 font-medium', isActive && 'font-bold text-primary')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
