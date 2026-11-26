'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  Clock,
  History,
  Lightbulb,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import { db } from '@/lib/db/dexie';
import { categoryService } from '@/lib/services/categoryService';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { Category, Transaction, TransactionType } from '@/lib/types';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { formatDateDisplay } from '@/lib/utils/date';
import { formatRupiah } from '@/lib/utils/currency';
import { cn } from '@/lib/utils/cn';

const RECENT_SEARCH_KEY = 'nyatet_recent_searches';

function parseSmartQuery(raw: string): {
  minAmount?: number;
  maxAmount?: number;
  textQuery: string;
} {
  const trimmed = raw.trim().toLowerCase();
  const match = trimmed.match(/^([<>]=?)\s*(\d+(?:[.,]\d+)?)\s*(rb|ribu|k|jt|juta)?$/i);
  if (match) {
    const op = match[1];
    let num = parseFloat(match[2].replace(',', '.'));
    const unit = (match[3] || '').toLowerCase();
    if (unit === 'rb' || unit === 'ribu' || unit === 'k') num *= 1_000;
    if (unit === 'jt' || unit === 'juta') num *= 1_000_000;
    if (op.startsWith('>')) return { minAmount: num, textQuery: '' };
    return { maxAmount: num, textQuery: '' };
  }
  return { textQuery: trimmed };
}

export function QuickSearchModal() {
  const { isSearchOpen, closeSearch, openTransactionDetail } = useUIStore();
  const { wallets } = useWalletStore();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load semua transaksi lokal, kategori, & riwayat pencarian saat modal dibuka
  useEffect(() => {
    if (!isSearchOpen) return;

    Promise.all([
      db.transactions.orderBy('date').reverse().toArray(),
      categoryService.getAll(),
    ]).then(([txs, cats]) => {
      setAllTransactions(txs);
      setCategories(cats);
    });

    try {
      const saved = localStorage.getItem(RECENT_SEARCH_KEY);
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {
      // Abaikan error storage
    }
  }, [isSearchOpen]);

  // Tutup dengan tombol Escape
  useEffect(() => {
    if (!isSearchOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSearchOpen, closeSearch]);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );
  const walletMap = useMemo(
    () => new Map(wallets.map((w) => [w.id, w])),
    [wallets]
  );

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    const updated = [clean, ...recentSearches.filter((r) => r !== clean)].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(updated));
    } catch {
      // Abaikan error storage
    }
  };

  const removeRecentItem = (term: string) => {
    const updated = recentSearches.filter((r) => r !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(updated));
    } catch {
      // Abaikan error storage
    }
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCH_KEY);
    } catch {
      // Abaikan error storage
    }
  };

  // Hitung jumlah transaksi per kategori untuk "Cari Cepat Kategori"
  const quickCategories = useMemo(() => {
    const counts = new Map<string, number>();
    allTransactions.forEach((t) => {
      counts.set(t.categoryId, (counts.get(t.categoryId) || 0) + 1);
    });

    return categories
      .map((c) => ({ ...c, txCount: counts.get(c.id) || 0 }))
      .sort((a, b) => b.txCount - a.txCount)
      .slice(0, 6);
  }, [categories, allTransactions]);

  // Filter real-time
  const filteredResults = useMemo(() => {
    const { minAmount, maxAmount, textQuery } = parseSmartQuery(query);

    return allTransactions.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (selectedCatId && tx.categoryId !== selectedCatId) return false;

      if (minAmount !== undefined && tx.amount < minAmount) return false;
      if (maxAmount !== undefined && tx.amount > maxAmount) return false;

      if (textQuery) {
        const cat = categoryMap.get(tx.categoryId);
        const wallet = walletMap.get(tx.walletId);
        const searchable = [
          tx.note || '',
          cat?.name || '',
          wallet?.name || '',
          String(tx.amount),
        ]
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(textQuery)) return false;
      }

      return true;
    });
  }, [
    allTransactions,
    query,
    typeFilter,
    selectedCatId,
    categoryMap,
    walletMap,
  ]);

  const displayedResults = useMemo(() => {
    // Jika belum mengetik/memfilter, tampilkan 5 transaksi terbaru
    if (!query.trim() && typeFilter === 'all' && !selectedCatId) {
      return filteredResults.slice(0, 5);
    }
    return filteredResults.slice(0, 20);
  }, [filteredResults, query, typeFilter, selectedCatId]);

  if (!isSearchOpen) return null;

  const handleSelectTransaction = (tx: Transaction) => {
    if (query.trim()) saveRecentSearch(query);
    closeSearch();
    openTransactionDetail(tx);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-[61px] sm:top-[65px] z-40 bg-bg/98 backdrop-blur-md overflow-y-auto border-t border-border/40">
      <div className="max-w-2xl mx-auto px-4 py-3.5 flex flex-col gap-4 pb-12">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Pencarian Offline Cepat (Lokal)
          </span>

          <button
            type="button"
            onClick={closeSearch}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
            aria-label="Tutup Pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-primary absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari catatan, kategori, dompet, atau >100rb..."
            className="w-full h-11 pl-11 pr-10 rounded-2xl bg-surface-alt border border-border/80 text-sm font-medium text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
              aria-label="Hapus kata kunci"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills: Semua | Pengeluaran | Pemasukan | Kategori */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {(
            [
              { id: 'all', label: 'Semua' },
              { id: 'expense', label: 'Pengeluaran' },
              { id: 'income', label: 'Pemasukan' },
            ] as const
          ).map((tab) => {
            const isSelected = typeFilter === tab.id && !selectedCatId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setTypeFilter(tab.id);
                  setSelectedCatId(null);
                }}
                className={cn(
                  'shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer',
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface text-text-secondary border-border hover:text-text-primary'
                )}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('quick-search-categories');
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className={cn(
              'shrink-0 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer',
              selectedCatId
                ? 'bg-secondary text-white border-secondary shadow-xs'
                : 'bg-surface text-text-secondary border-border hover:text-text-primary'
            )}
          >
            <span>
              {selectedCatId
                ? categoryMap.get(selectedCatId)?.name || 'Kategori'
                : 'Kategori'}
            </span>
            {selectedCatId && (
              <X
                className="w-3 h-3 ml-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCatId(null);
                }}
              />
            )}
          </button>
        </div>

        {/* Hasil Pencarian */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-primary">
                Hasil Pencarian
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-alt border border-border text-[10px] font-bold text-text-secondary">
                {filteredResults.length} item
              </span>
            </div>
            <span className="text-[11px] text-text-muted">Real-time</span>
          </div>

          {displayedResults.length > 0 ? (
            <div className="bg-surface rounded-2xl border border-border shadow-xs p-2 flex flex-col gap-1">
              {displayedResults.map((tx, idx) => {
                const cat = categoryMap.get(tx.categoryId);
                const wallet = walletMap.get(tx.walletId);
                const isExpense = tx.type === 'expense';
                return (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => handleSelectTransaction(tx)}
                    className={cn(
                      'w-full p-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors text-left cursor-pointer',
                      idx === 0
                        ? 'bg-surface-alt/70 hover:bg-surface-alt'
                        : 'hover:bg-surface-alt/60'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CategoryIcon
                        name={cat?.icon || (isExpense ? 'Tag' : 'Coins')}
                        color={cat?.color || (isExpense ? '#0A66C2' : '#057642')}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-text-primary truncate">
                          {tx.note || cat?.name || 'Transaksi'}
                        </p>
                        <p className="text-[11px] text-text-secondary truncate">
                          {formatDateDisplay(tx.date)} • {wallet?.name || 'Dompet'} •{' '}
                          {cat?.name || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={cn(
                          'text-xs sm:text-sm font-extrabold',
                          isExpense ? 'text-danger' : 'text-secondary'
                        )}
                      >
                        {isExpense ? '-' : '+'}
                        {formatRupiah(tx.amount)}
                      </p>
                      <span
                        className={cn(
                          'text-[10px] font-medium',
                          isExpense ? 'text-danger/80' : 'text-secondary'
                        )}
                      >
                        {isExpense ? 'Pengeluaran' : 'Masuk'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-surface border border-border text-center text-xs text-text-muted">
              Tidak ditemukan transaksi yang cocok dengan pencarian Anda.
            </div>
          )}
        </div>

        {/* Pencarian Terakhir */}
        {recentSearches.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-bold text-text-primary">
                Pencarian Terakhir
              </span>
              <button
                type="button"
                onClick={clearAllRecent}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                <History className="w-3 h-3" />
                <span>Hapus</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((term) => (
                <div
                  key={term}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border text-xs text-text-primary"
                >
                  <button
                    type="button"
                    onClick={() => setQuery(term)}
                    className="inline-flex items-center gap-1.5 cursor-pointer hover:text-primary"
                  >
                    <Clock className="w-3 h-3 text-text-muted" />
                    <span>{term}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRecentItem(term)}
                    className="text-text-muted hover:text-danger cursor-pointer"
                    aria-label={`Hapus ${term}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cari Cepat Kategori */}
        {quickCategories.length > 0 && (
          <div id="quick-search-categories" className="flex flex-col gap-2">
            <span className="text-xs font-bold text-text-primary px-0.5">
              Cari Cepat Kategori
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {quickCategories.map((c) => {
                const isSelected = selectedCatId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCatId(isSelected ? null : c.id);
                      setTypeFilter('all');
                    }}
                    className={cn(
                      'p-3 rounded-2xl bg-surface border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer shadow-2xs',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/40'
                    )}
                  >
                    <CategoryIcon name={c.icon} color={c.color} size="sm" />
                    <span className="text-xs font-bold text-text-primary truncate w-full">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {c.txCount} transaksi
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pintasan Cerdas */}
        <div className="rounded-2xl bg-surface-alt/70 border border-border/70 p-3.5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="text-xs leading-relaxed">
            <p className="font-bold text-text-primary">Pintasan Cerdas</p>
            <p className="text-[11px] text-text-secondary">
              Ketik nominal seperti{' '}
              <code className="px-1.5 py-0.5 rounded bg-surface border border-border text-danger font-bold">
                &gt;100rb
              </code>{' '}
              untuk transaksi di atas seratus ribu, atau tulis nama dompet seperti{' '}
              <code className="px-1.5 py-0.5 rounded bg-surface border border-border text-primary font-bold">
                BCA
              </code>{' '}
              untuk menyaring langsung.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
