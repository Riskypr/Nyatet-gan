'use client';

import React from 'react';
import { Wallet } from '@/lib/types';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { formatRupiah } from '@/lib/utils/currency';
import { useWalletStore } from '@/lib/stores/walletStore';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface WalletCardProps {
  wallet: Wallet;
  onEdit?: (wallet: Wallet) => void;
  onDelete?: (wallet: Wallet) => void;
  isCompact?: boolean;
}

export function WalletCard({ wallet, onEdit, onDelete, isCompact = false }: WalletCardProps) {
  const isBalanceHidden = useWalletStore((s) => s.isBalanceHidden);

  if (isCompact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-surface rounded-2xl border border-border shadow-xs shrink-0 min-w-[155px] transition-colors">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 text-xs font-bold shadow-xs"
          style={{ backgroundColor: wallet.color }}
        >
          {wallet.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-secondary truncate">{wallet.name}</p>
          <p className="text-xs font-bold text-text-primary truncate tracking-wide" suppressHydrationWarning>
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
