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
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white/75 backdrop-blur-md border-r border-[#E5DCD0] p-5 justify-between select-none">
      <div className="flex flex-col gap-6">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-[#C86446] text-white flex items-center justify-center shadow-sm shadow-[#C86446]/30 font-bold text-lg">
            🌱
          </div>
          <div>
            <h1 className="font-bold text-base text-[#2D2A26] leading-tight tracking-tight">
              Nyatet Gan
            </h1>
            <p className="text-[11px] text-[#68635B]">Pencatatan Keuangan Pribadi</p>
          </div>
        </div>

        {/* Action Button: Catat Transaksi */}
        <Button
          variant="primary"
          size="md"
          className="w-full shadow-md shadow-[#C86446]/20 gap-2"
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
                    ? 'bg-[#C86446] text-white shadow-xs font-semibold'
                    : 'text-[#68635B] hover:bg-[#F2ECE1]/70 hover:text-[#2D2A26]'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-[#68635B]')} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Offline Badge */}
      <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] text-[#68635B] text-xs flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#4A6B53] shrink-0" />
        <span className="leading-snug text-[11px]">
          Data tersimpan <strong>lokal & offline</strong> di peramban Anda.
        </span>
      </div>
    </aside>
  );
}
