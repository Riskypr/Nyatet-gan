'use client';

import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  LayoutGrid,
} from 'lucide-react';
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

  // Kategori yang ditampilkan di quick filter (sesuai tipe jika tipe dipilih)
  const quickCategories =
    filters.type === 'all'
      ? categories
      : categories.filter((c) => c.type === filters.type);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Search Input dan Tombol Filter Lanjutan */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, catatan, nominal..."
            value={filters.keyword}
            onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
            className="w-full h-11 pl-10 pr-9 rounded-2xl bg-surface border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all shadow-xs"
          />
          {filters.keyword && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, keyword: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'h-11 w-11 sm:w-auto sm:px-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all shrink-0 cursor-pointer relative',
            hasActiveFilters || isOpen
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-surface border-border text-text-secondary hover:bg-surface-alt hover:text-text-primary'
          )}
          aria-label="Filter lanjutan"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-white absolute top-1.5 right-1.5 sm:static" />
          )}
        </button>
      </div>

      {/* Quick Filter Baris 1: Kategori */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        <span className="text-[11px] font-semibold text-text-muted shrink-0 mr-0.5">
          Kategori:
        </span>
        <button
          type="button"
          onClick={() => onChange({ ...filters, categoryId: '' })}
          className={cn(
            'shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer',
            filters.categoryId === ''
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-surface text-text-secondary border-border hover:text-text-primary'
          )}
        >
          <LayoutGrid className="w-3 h-3" />
          <span>Semua</span>
        </button>
        {quickCategories.map((c) => {
          const isSelected = filters.categoryId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() =>
                onChange({ ...filters, categoryId: isSelected ? '' : c.id })
              }
              className={cn(
                'shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer',
                isSelected
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface text-text-secondary border-border hover:text-text-primary'
              )}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: isSelected ? '#FFFFFF' : c.color }}
              />
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Filter Baris 2: Dompet & Tipe */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        <span className="text-[11px] font-semibold text-text-muted shrink-0 mr-0.5">
          Dompet:
        </span>
        <button
          type="button"
          onClick={() => onChange({ ...filters, walletId: '' })}
          className={cn(
            'shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer',
            filters.walletId === ''
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-surface text-text-secondary border-border hover:text-text-primary'
          )}
        >
          Semua
        </button>
        {wallets.map((w) => {
          const isSelected = filters.walletId === w.id;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() =>
                onChange({ ...filters, walletId: isSelected ? '' : w.id })
              }
              className={cn(
                'shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer',
                isSelected
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface text-text-secondary border-border hover:text-text-primary'
              )}
            >
              {w.name}
            </button>
          );
        })}

        <span className="h-4 w-px bg-border mx-1 shrink-0" />

        <span className="text-[11px] font-semibold text-text-muted shrink-0">
          Tipe:
        </span>
        {(
          [
            { id: 'all', label: 'Semua' },
            { id: 'expense', label: 'Keluar' },
            { id: 'income', label: 'Masuk' },
          ] as const
        ).map((t) => {
          const isSelected = filters.type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange({ ...filters, type: t.id })}
              className={cn(
                'shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer',
                isSelected
                  ? t.id === 'expense'
                    ? 'bg-danger text-white border-danger'
                    : t.id === 'income'
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-primary text-white border-primary'
                  : 'bg-surface text-text-secondary border-border hover:text-text-primary'
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Expandable Filter Panel (Rentang Tanggal & Reset) */}
      {isOpen && (
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-md flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <span className="text-xs font-bold text-text-primary">
              Filter Rentang Tanggal
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-danger font-semibold hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Semua</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-text-secondary">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  onChange({ ...filters, startDate: e.target.value })
                }
                className="h-9 px-2.5 rounded-xl border border-border bg-surface-alt text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-text-secondary">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  onChange({ ...filters, endDate: e.target.value })
                }
                className="h-9 px-2.5 rounded-xl border border-border bg-surface-alt text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
