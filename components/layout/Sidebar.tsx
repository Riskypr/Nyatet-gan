'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ReceiptText,
  Wallet,
  Target,
  PieChart,
  Settings,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useUIStore } from '@/lib/stores/uiStore';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils/cn';

export function Sidebar() {
  const pathname = usePathname();
  const { openTransactionModal } = useUIStore();

  const navLinks = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Transaksi', href: '/transactions', icon: ReceiptText },
    { label: 'Dompet & Akun', href: '/wallets', icon: Wallet },
    { label: 'Target Anggaran', href: '/budget', icon: Target },
    { label: 'Laporan & Grafik', href: '/reports', icon: PieChart },
    { label: 'Pengaturan & Backup', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-surface/90 backdrop-blur-md border-r border-border p-5 justify-between select-none transition-colors">
      <div className="flex flex-col gap-6">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25 font-bold text-lg overflow-hidden">
            <img src="/Logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-base text-text-primary leading-tight tracking-tight">
              Nyatet Gan
            </h1>
            <p className="text-[11px] text-text-secondary">Pencatatan Keuangan Pribadi</p>
          </div>
        </div>

        {/* Action Button: Catat Transaksi */}
        <Button
          variant="primary"
          size="md"
          className="w-full shadow-md shadow-primary/20 gap-2 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all"
          onClick={() => openTransactionModal('expense')}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Catat Transaksi</span>
        </Button>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/25 font-semibold'
                    : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-text-secondary')} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Offline Badge & Theme Toggle */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-alt border border-border">
          <span className="text-xs font-semibold text-text-secondary pl-1.5">Mode Tampilan</span>
          <ThemeToggle />
        </div>

        <div className="p-3 rounded-2xl bg-surface border border-border text-text-secondary text-xs flex items-center gap-2.5 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
          <span className="leading-snug text-[11px]">
            Data tersimpan <strong className="text-text-primary">lokal & offline</strong> di peramban Anda.
          </span>
        </div>
      </div>
    </aside>
  );
}
