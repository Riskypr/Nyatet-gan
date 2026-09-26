'use client';

import React, { useState } from 'react';
import { Search, Filter, X, RotateCcw } from 'lucide-react';
import { Category, Wallet, TransactionType } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

export interface FilterState {
  keyword: string;
  type: TransactionType | 'all';
  categoryId: string;
  walletId: string;
  startDate: string;
  endDate: string;
}

export interface TransactionSearchBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categories: Category[];
  wallets: Wallet[];
}

export function TransactionSearchBar({
  filters,
  onChange,
  categories,
  wallets,
}: TransactionSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.categoryId !== '' ||
    filters.walletId !== '' ||
    filters.startDate !== '' ||
    filters.endDate !== '';

  const handleReset = () => {
    onChange({
      keyword: '',
      type: 'all',
      categoryId: '',
      walletId: '',
      startDate: '',
      endDate: '',
    });
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Search Input and Toggle Filter Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi berdasarkan catatan..."
            value={filters.keyword}
            onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
            className="w-full h-11 pl-10 pr-9 rounded-2xl bg-surface border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all shadow-xs"
          />
          {filters.keyword && (
            <button
              onClick={() => onChange({ ...filters, keyword: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'h-11 px-3.5 rounded-2xl border flex items-center gap-2 text-xs font-semibold transition-all shrink-0 cursor-pointer',
            hasActiveFilters || isOpen
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-surface border-border text-text-secondary hover:bg-surface-alt hover:text-text-primary'
          )}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </button>
      </div>

      {/* Expandable Filter Panel */}
      {isOpen && (
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-md flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <span className="text-xs font-bold text-text-primary">Filter Transaksi</span>
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-danger font-semibold hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Tipe Transaksi */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-text-secondary">Tipe</label>
              <select
                value={filters.type}
                onChange={(e) =>
                  onChange({ ...filters, type: e.target.value as TransactionType | 'all' })
                }
                className="h-9 px-2.5 rounded-xl border border-border bg-surface-alt text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Semua Tipe</option>
                <option value="expense">Hanya Pengeluaran</option>
                <option value="income">Hanya Pemasukan</option>
              </select>
            </div>

            {/* Kategori */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-text-secondary">Kategori</label>
              <select
                value={filters.categoryId}
                onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
                className="h-9 px-2.5 rounded-xl border border-border bg-surface-alt text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type === 'expense' ? 'Keluar' : 'Masuk'})
                  </option>
                ))}
              </select>
            </div>

            {/* Dompet */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-text-secondary">Dompet</label>
              <select
                value={filters.walletId}
                onChange={(e) => onChange({ ...filters, walletId: e.target.value })}
                className="h-9 px-2.5 rounded-xl border border-border bg-surface-alt text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Semua Dompet</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rentang Tanggal */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-text-secondary">Rentang Mulai</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
                className="h-9 px-2.5 rounded-xl border border-border bg-surface-alt text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
