'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { useThemeStore, ThemeMode } from '@/lib/stores/themeStore';
import { backupService } from '@/lib/services/backupService';
import { categoryService } from '@/lib/services/categoryService';
import { Category, TransactionType } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { confirmWithToast } from '@/lib/utils/confirmToast';
import {
  Download,
  Upload,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  Target,
  Wallet as WalletIcon,
  ArrowRight,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const CATEGORY_COLORS = [
  '#0A66C2', // LinkedIn Blue
  '#057642', // LinkedIn Green
  '#0073B1', // Deep Blue
  '#70B5F9', // Sky Blue
  '#E7A33E', // Amber / Gold
  '#2D6A6A', // Teal
  '#56687A', // Slate
  '#CC1016', // Red
];

export default function SettingsPage() {
  const { wallets, fetchWallets } = useWalletStore();
  const { transactions, fetchMonthlyData, currentMonth } = useTransactionStore();
  const { showToast } = useUIStore();
  const { theme, setTheme } = useThemeStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCatTab, setActiveCatTab] = useState<TransactionType>('expense');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal Custom Kategori
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<TransactionType>('expense');
  const [catColor, setCatColor] = useState(CATEGORY_COLORS[0]);
  const [catIcon] = useState('Tag');
  const [catError, setCatError] = useState('');

  const loadCategories = async () => {
    const cats = await categoryService.getAll();
    setCategories(cats);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense'),
    [categories]
  );
  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === 'income'),
    [categories]
  );
  const displayedCategories =
    activeCatTab === 'expense' ? expenseCategories : incomeCategories;

  // Hitung jumlah transaksi per kategori pada bulan aktif
  const txCountByCategory = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((t) => {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + 1);
    });
    return map;
  }, [transactions]);

  // 1. Export Backup
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const jsonStr = await backupService.exportAll();
      backupService.downloadBackupFile(jsonStr);
      showToast('File backup berhasil diunduh!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengekspor data.';
      showToast(msg, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Import Restore dengan Popup Konfirmasi
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    confirmWithToast({
      title: 'Peringatan Pemulihan Data',
      message:
        'Memulihkan file backup akan menimpa seluruh data catatan saat ini secara permanen. Lanjutkan?',
      confirmLabel: 'Ya, Timpa & Pulihkan',
      cancelLabel: 'Batalkan',
      isDestructive: true,
      onConfirm: async () => {
        setIsImporting(true);
        try {
          const content = await file.text();
          const result = await backupService.importAll(content);
          await Promise.all([
            fetchWallets(),
            fetchMonthlyData(currentMonth),
            loadCategories(),
          ]);
          showToast(
            `Data berhasil dipulihkan! (${result.txCount} transaksi)`,
            'success'
          );
        } catch (err: unknown) {
          const msg =
            err instanceof Error ? err.message : 'Gagal memulihkan backup.';
          showToast(msg, 'error');
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      onCancel: () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
    });
  };

  // 3. Tambah Kategori Custom
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCatError('Nama kategori wajib diisi.');
      return;
    }

    try {
      await categoryService.create({
        name: catName.trim(),
        type: catType,
        icon: catIcon,
        color: catColor,
      });
      showToast('Kategori baru berhasil ditambahkan!', 'success');
      setIsCatModalOpen(false);
      setCatName('');
      setCatError('');
      await loadCategories();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Gagal menambah kategori.';
      showToast(msg, 'error');
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    confirmWithToast({
      title: 'Hapus Kategori',
      message: `Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`,
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await categoryService.delete(cat.id);
          showToast('Kategori berhasil dihapus.', 'success');
          await loadCategories();
        } catch (err: unknown) {
          const msg =
            err instanceof Error ? err.message : 'Gagal menghapus kategori.';
          showToast(msg, 'error');
        }
      },
    });
  };

  const themeOptions: {
    value: ThemeMode;
    title: string;
    subtitle: string;
  }[] = [
    { value: 'light', title: 'Terang', subtitle: 'Cerah' },
    { value: 'dark', title: 'Gelap', subtitle: 'Obsidian' },
    { value: 'system', title: 'Sistem', subtitle: 'Otomatis' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-8">
      {/* 1. Header Judul + Badge Offline-First */}
      <div className="flex flex-col gap-1.5">
        <span className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          Tersimpan di Perangkat (Offline-First)
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary">
          Pengaturan &amp; Preferensi
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary">
          Kelola preferensi visual, keamanan data lokal, dan klasifikasi keuangan Anda.
        </p>
      </div>

      {/* 2. Tampilan & Tema (3 Preview Mini) */}
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Tampilan &amp; Tema
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Pilih gaya visual aplikasi yang nyaman di mata.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {themeOptions.map((opt) => {
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'relative rounded-2xl border p-2.5 sm:p-3 flex flex-col items-center gap-2 transition-all cursor-pointer bg-surface',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 shadow-xs'
                    : 'border-border hover:border-primary/40'
                )}
              >
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}

                {/* Mini Preview Visual */}
                <div className="w-full h-12 rounded-xl border border-border/70 overflow-hidden flex">
                  {opt.value === 'light' && (
                    <div className="w-full h-full bg-[#F4F6F8] p-2 flex flex-col justify-between">
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-1.5 rounded-full bg-[#0A66C2]" />
                        <span className="w-6 h-1 rounded-full bg-[#D4D7DC]" />
                      </div>
                      <div className="w-full h-4 rounded-md bg-white border border-[#E5E7EB]" />
                    </div>
                  )}
                  {opt.value === 'dark' && (
                    <div className="w-full h-full bg-[#1B1F23] p-2 flex flex-col justify-between">
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-1.5 rounded-full bg-[#70B5F9]" />
                        <span className="w-6 h-1 rounded-full bg-[#3D4449]" />
                      </div>
                      <div className="w-full h-4 rounded-md bg-[#262B30] border border-[#3D4449]" />
                    </div>
                  )}
                  {opt.value === 'system' && (
                    <>
                      <div className="w-1/2 h-full bg-[#F4F6F8] p-1.5 flex flex-col justify-between">
                        <span className="w-2.5 h-1 rounded-full bg-[#0A66C2]" />
                        <div className="w-full h-3.5 rounded-sm bg-white" />
                      </div>
                      <div className="w-1/2 h-full bg-[#1B1F23] p-1.5 flex flex-col justify-between">
                        <span className="w-2.5 h-1 rounded-full bg-[#70B5F9]" />
                        <div className="w-full h-3.5 rounded-sm bg-[#262B30]" />
                      </div>
                    </>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xs font-bold text-text-primary leading-tight">
                    {opt.title}
                  </p>
                  <p className="text-[10px] text-text-muted">{opt.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Pintasan Cepat Dompet & Target Anggaran */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/budget"
          className="p-3.5 rounded-2xl bg-surface border border-border shadow-xs hover:border-primary/40 hover:bg-surface-alt/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-text-primary truncate">
                Target Anggaran
              </h4>
              <p className="text-[11px] text-text-secondary truncate">
                Atur pagu belanja bulanan
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-primary shrink-0" />
        </Link>

        <Link
          href="/wallets"
          className="p-3.5 rounded-2xl bg-surface border border-border shadow-xs hover:border-secondary/40 hover:bg-surface-alt/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <WalletIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-text-primary truncate">
                Dompet &amp; Sumber Dana
              </h4>
              <p className="text-[11px] text-text-secondary truncate">
                Kelola {wallets.length} dompet terdaftar
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-secondary shrink-0" />
        </Link>
      </div>

      {/* 4. Cadangan & Pemulihan Data */}
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Cadangan &amp; Pemulihan Data
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Data sepenuhnya tersimpan secara lokal dan aman di perangkat Anda.
          </p>
        </div>

        <div className="bg-surface rounded-3xl border border-border shadow-xs p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-text-primary truncate">
                  Penyimpanan Lokal (IndexedDB)
                </h4>
                <p className="text-[11px] text-text-secondary truncate">
                  Format JSON Standar Nyatet-gan
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold shrink-0">
              Tersinkron
            </span>
          </div>

          {/* Info 2 Kolom */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-surface-alt/70 border border-border/60 p-3.5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Status Penyimpanan
              </p>
              <p className="text-xs font-bold text-text-primary mt-0.5">
                Offline-First Aktif
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Konten Bulan Ini
              </p>
              <p className="text-xs font-bold text-text-primary mt-0.5">
                {transactions.length} Trx, {wallets.length} Dompet
              </p>
            </div>
          </div>

          {/* Tombol Export & Import */}
          <div className="flex flex-col gap-2.5">
            <Button
              type="button"
              variant="primary"
              onClick={handleExport}
              isLoading={isExporting}
              className="w-full py-3 rounded-2xl gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Cadangkan Data (Export JSON)</span>
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full py-3 px-4 rounded-2xl bg-surface-alt border border-border hover:border-primary/40 text-text-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              <Upload className="w-4 h-4 text-secondary" />
              <span>
                {isImporting ? 'Memulihkan...' : 'Pulihkan Data (Import JSON)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Manajemen Kategori */}
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Manajemen Kategori
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Atur pos transaksi sesuai kebiasaan Anda.
          </p>
        </div>

        {/* Tab Switcher Pengeluaran / Pemasukan */}
        <div className="grid grid-cols-2 p-1 bg-surface-alt border border-border rounded-full gap-1">
          <button
            type="button"
            onClick={() => setActiveCatTab('expense')}
            className={cn(
              'py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5',
              activeCatTab === 'expense'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <span>Pengeluaran</span>
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px]',
                activeCatTab === 'expense'
                  ? 'bg-white/20 text-white'
                  : 'bg-surface text-text-muted'
              )}
            >
              {expenseCategories.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCatTab('income')}
            className={cn(
              'py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5',
              activeCatTab === 'income'
                ? 'bg-secondary text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <span>Pemasukan</span>
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px]',
                activeCatTab === 'income'
                  ? 'bg-white/20 text-white'
                  : 'bg-surface text-text-muted'
              )}
            >
              {incomeCategories.length}
            </span>
          </button>
        </div>

        {/* Daftar Kartu Kategori */}
        <div className="flex flex-col gap-2.5">
          {displayedCategories.map((c) => {
            const txCount = txCountByCategory.get(c.id) || 0;
            return (
              <div
                key={c.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-surface shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon name={c.icon} color={c.color} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-text-primary truncate">
                      {c.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-surface-alt border border-border/70 text-[10px] font-semibold text-text-secondary">
                        {c.isDefault ? 'Bawaan' : 'Kustom'}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        • {txCount} transaksi bulan ini
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!c.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(c)}
                      className="p-2 rounded-xl text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                      title="Hapus Kategori"
                      aria-label="Hapus Kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tombol Tambah Kategori Baru Full-Width */}
        <button
          type="button"
          onClick={() => {
            setCatType(activeCatTab);
            setIsCatModalOpen(true);
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-surface-alt/70 border border-border hover:border-primary/40 hover:bg-surface-alt text-text-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-primary" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      {/* 6. Info Aplikasi */}
      <div className="rounded-3xl bg-surface-alt/60 border border-border/80 p-5 text-center flex flex-col items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Database className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-extrabold text-text-primary">
          Nyatet-gan
        </h4>
        <p className="text-[11px] text-text-secondary max-w-md leading-relaxed">
          Offline-First Personal Finance Tracker. Seluruh data tersimpan aman di penyimpanan lokal browser (IndexedDB) tanpa dikirim ke server luar.
        </p>
      </div>

      {/* Modal Tambah Kategori */}
      <BottomSheet
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title="Tambah Kategori Kustom"
        description="Buat pos kategori baru sesuai kebutuhan pencatatan Anda"
      >
        <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 p-1 bg-surface-alt rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setCatType('expense')}
              className={cn(
                'py-2 rounded-lg font-semibold text-xs transition-all',
                catType === 'expense'
                  ? 'bg-surface text-danger shadow-xs'
                  : 'text-text-secondary'
              )}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setCatType('income')}
              className={cn(
                'py-2 rounded-lg font-semibold text-xs transition-all',
                catType === 'income'
                  ? 'bg-surface text-secondary shadow-xs'
                  : 'text-text-secondary'
              )}
            >
              Pemasukan
            </button>
          </div>

          <Input
            label="Nama Kategori"
            placeholder="Mis: Langganan Streaming, Kopi"
            value={catName}
            onChange={(e) => {
              setCatName(e.target.value);
              if (e.target.value) setCatError('');
            }}
            error={catError}
            autoFocus
          />

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-primary">
              Pilih Warna Kategori
            </label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCatColor(c)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-all',
                    catColor === c
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : ''
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCatModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan Kategori
            </Button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}
