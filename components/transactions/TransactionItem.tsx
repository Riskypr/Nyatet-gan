'use client';

import React from 'react';
import { Transaction, Category, Wallet } from '@/lib/types';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { formatRupiah } from '@/lib/utils/currency';
import { formatDateDisplay } from '@/lib/utils/date';
import { ArrowDownLeft, ArrowUpRight, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  wallet?: Wallet;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionItem({
  transaction,
  category,
  wallet,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const isIncome = transaction.type === 'income';

  return (
    <div className="relative group flex items-center justify-between p-3.5 bg-surface hover:bg-surface-alt/60 rounded-2xl border border-border/80 shadow-xs transition-all duration-150">
      <div className="flex items-center gap-3 min-w-0">
        <CategoryIcon
          name={category?.icon || (isIncome ? 'Coins' : 'Tag')}
          color={category?.color || (isIncome ? '#4A6B53' : '#C86446')}
          size="md"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text-primary truncate">
              {category?.name || (isIncome ? 'Pemasukan' : 'Pengeluaran')}
            </p>
            {wallet && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface-alt text-text-secondary truncate max-w-[90px]">
                {wallet.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-text-secondary">
            <span>{formatDateDisplay(transaction.date)}</span>
            {transaction.note && (
              <>
                <span>•</span>
                <span className="truncate max-w-[130px] sm:max-w-[200px] italic text-text-muted">
                  &ldquo;{transaction.note}&rdquo;
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <div
            className={cn(
              'flex items-center justify-end gap-1 font-bold text-sm sm:text-base',
              isIncome ? 'text-secondary' : 'text-danger'
            )}
          >
            {isIncome ? (
              <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
            <span>{isIncome ? '+' : '-'}{formatRupiah(transaction.amount)}</span>
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors"
              aria-label="Opsi transaksi"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-30 w-32 bg-surface rounded-xl shadow-xl border border-border py-1 text-xs animate-in fade-in duration-100">
                  {onEdit && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(transaction);
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-text-primary hover:bg-surface-alt transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-text-secondary" />
                      <span>Ubah</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(transaction.id);
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-danger hover:bg-surface-alt transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-danger" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
