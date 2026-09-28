'use client';

import React from 'react';
import { Wallet } from '@/lib/types';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { formatRupiah } from '@/lib/utils/currency';
import { useWalletStore } from '@/lib/stores/walletStore';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  Wallet as WalletIcon,
  CreditCard,
  Smartphone,
  Banknote,
  Briefcase,
  LucideIcon,
} from 'lucide-react';

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
        className="relative flex flex-col justify-between rounded-2xl p-4 min-w-[200px] w-[200px] h-[130px] shrink-0 overflow-hidden shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] select-none"
        style={{
          background: `linear-gradient(145deg, ${wallet.color}, ${wallet.color}CC)`,
        }}
      >
        {/* Decorative watermark icon — top-right, blended softly */}
        <div className="absolute -top-2 -right-2 pointer-events-none opacity-[0.12]">
          <WatermarkIcon className="w-24 h-24" style={{ color: '#fff' }} strokeWidth={1} />
        </div>

        {/* Top-left: Category icon */}
        <div className="relative z-10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
          >
            <CategoryIcon name={wallet.icon || 'Wallet'} color="#ffffff" size="sm" className="!bg-transparent !p-0 !w-auto !h-auto" />
          </div>
        </div>

        {/* Bottom-left: Name + Balance */}
        <div className="relative z-10 mt-auto min-w-0">
          <p
            className="text-[11px] font-medium truncate leading-tight"
            style={{ color: 'rgba(255,255,255,0.78)' }}
          >
            {wallet.name}
          </p>
          <p
            className="text-base font-extrabold tracking-tight truncate mt-0.5"
            style={{ color: '#ffffff' }}
            suppressHydrationWarning
          >
            {isBalanceHidden ? '••••••••' : formatRupiah(wallet.currentBalance)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col justify-between transition-all hover:border-primary/40 hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <CategoryIcon name={wallet.icon || 'Wallet'} color={wallet.color} size="md" />
          <div>
            <h4 className="text-sm font-bold text-text-primary leading-tight">{wallet.name}</h4>
            <p className="text-[11px] text-text-secondary mt-0.5" suppressHydrationWarning>
              Saldo Awal: {isBalanceHidden ? '••••••••' : formatRupiah(wallet.initialBalance)}
            </p>
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={() => onEdit(wallet)}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors"
                aria-label="Ubah Dompet"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(wallet)}
                className="p-1.5 rounded-lg text-danger hover:bg-surface-alt transition-colors"
                aria-label="Hapus atau Arsip Dompet"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
        <span className="text-xs text-text-secondary">Saldo Berjalan</span>
        <span
          className={cn(
            'text-base font-bold tracking-wide',
            wallet.currentBalance >= 0 ? 'text-text-primary' : 'text-danger'
          )}
          suppressHydrationWarning
        >
          {isBalanceHidden ? '••••••••' : formatRupiah(wallet.currentBalance)}
        </span>
      </div>
    </div>
  );
}
