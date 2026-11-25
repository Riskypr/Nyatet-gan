'use client';

import React from 'react';
import { Wallet } from '@/lib/types';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { formatRupiah } from '@/lib/utils/currency';
import { formatDateDisplay } from '@/lib/utils/date';
import { useWalletStore } from '@/lib/stores/walletStore';
import {
  Pencil,
  Trash2,
  Wallet as WalletIcon,
  CreditCard,
  Smartphone,
  Banknote,
  Briefcase,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/** Map wallet icon names to a decorative watermark icon */
const watermarkIconMap: Record<string, LucideIcon> = {
  Wallet: WalletIcon,
  CreditCard: CreditCard,
  Smartphone: Smartphone,
  Banknote: Banknote,
  Briefcase: Briefcase,
};

export interface WalletCardProps {
  wallet: Wallet;
  onEdit?: (wallet: Wallet) => void;
  onDelete?: (wallet: Wallet) => void;
  isCompact?: boolean;
}

export function WalletCard({ wallet, onEdit, onDelete, isCompact = false }: WalletCardProps) {
  const isBalanceHidden = useWalletStore((s) => s.isBalanceHidden);

  if (isCompact) {
    const WatermarkIcon = watermarkIconMap[wallet.icon || 'Wallet'] || WalletIcon;

    return (
      <div
        className="relative flex flex-col justify-between rounded-2xl p-4 min-w-[172px] w-[172px] sm:min-w-[192px] sm:w-[192px] h-[132px] shrink-0 overflow-hidden shadow-xs transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] select-none"
        style={{
          backgroundColor: wallet.color,
        }}
      >
        {/* Decorative watermark icon — top-right, blended softly */}
        <div className="absolute -top-2 -right-2 pointer-events-none opacity-[0.12]">
          <WatermarkIcon className="w-24 h-24" style={{ color: '#fff' }} strokeWidth={1} />
        </div>

        {/* Top-left: Category icon (lingkaran sesuai referensi) */}
        <div className="relative z-10 flex items-center justify-between">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xs"
            style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
          >
            <CategoryIcon name={wallet.icon || 'Wallet'} color="#ffffff" size="sm" className="!bg-transparent !p-0 !w-auto !h-auto" />
          </div>
        </div>

        {/* Bottom-left: Name + Balance */}
        <div className="relative z-10 mt-auto min-w-0">
          <p
            className="text-xs font-medium truncate leading-tight"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            {wallet.name}
          </p>
          <p
            className="text-base sm:text-lg font-extrabold tracking-tight truncate mt-0.5"
            style={{ color: '#ffffff' }}
            suppressHydrationWarning
          >
            {isBalanceHidden ? '••••••••' : formatRupiah(wallet.currentBalance)}
          </p>
        </div>
      </div>
    );
  }

  const WatermarkIcon = watermarkIconMap[wallet.icon || 'Wallet'] || WalletIcon;

  return (
    <div
      className="relative group overflow-hidden rounded-3xl p-5 text-white shadow-sm flex flex-col justify-between gap-5 transition-all hover:shadow-md"
      style={{ backgroundColor: wallet.color }}
    >
      {/* Dekorasi lingkaran halus di sisi kanan seperti kartu bank */}
      <div
        className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full border border-white/15 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -right-2 -bottom-2 w-28 h-28 rounded-full border border-white/10 pointer-events-none"
        aria-hidden="true"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.08]">
        <WatermarkIcon className="w-24 h-24 text-white" strokeWidth={1.2} />
      </div>

      {/* Baris Atas: Ikon + Nama Dompet di kiri, Tombol Edit/Hapus di kanan */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <CategoryIcon
              name={wallet.icon || 'Wallet'}
              color="#ffffff"
              size="sm"
              className="!bg-transparent !p-0 !w-auto !h-auto"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-bold text-white leading-tight truncate">
              {wallet.name}
            </h4>
            <p className="text-[11px] text-white/75 mt-0.5 truncate" suppressHydrationWarning>
              Saldo Awal: {isBalanceHidden ? '••••••••' : formatRupiah(wallet.initialBalance)}
            </p>
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(wallet)}
                className="h-9 w-9 flex items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Ubah Dompet"
                title="Ubah Dompet"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(wallet)}
                className="h-9 w-9 flex items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Hapus atau Arsip Dompet"
                title="Hapus / Arsipkan Dompet"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Baris Bawah: Saldo Tersedia di kiri, Terakhir diperbarui di kanan */}
      <div className="relative z-10 flex items-end justify-between gap-3 pt-1">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/75">
            Saldo Tersedia
          </p>
          <p
            className={cn(
              'text-2xl sm:text-3xl font-extrabold tracking-tight truncate mt-0.5',
              wallet.currentBalance < 0 ? 'text-red-200' : 'text-white'
            )}
            suppressHydrationWarning
          >
            {isBalanceHidden ? 'Rp ••••••••' : formatRupiah(wallet.currentBalance)}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[10px] text-white/70">Diperbarui</p>
          <p className="text-xs font-semibold text-white/95">
            {formatDateDisplay(wallet.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
