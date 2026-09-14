'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { backupService } from '@/lib/services/backupService';
import { categoryService } from '@/lib/services/categoryService';
import { Category, TransactionType } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Badge } from '@/components/ui/Badge';
import { confirmWithToast } from '@/lib/utils/confirmToast';
import {
  Download,
  Upload,
  ShieldCheck,
  Tag,
  Plus,
  Trash2,
  FileCheck,
} from 'lucide-react';

const CATEGORY_COLORS = [
  '#C86446', // Primary
  '#4A6B53', // Secondary
  '#A84D32', // Tertiary
  '#2D2A26', // Neutral
  '#C98A3A', // Mustard
  '#3D7068', // Teal
  '#405865', // Slate
  '#B0473C', // Clay Red
];

export default function SettingsPage() {
  const { fetchWallets } = useWalletStore();
  const { fetchMonthlyData, currentMonth } = useTransactionStore();
  const { showToast } = useUIStore();

  const [categories, setCategories] = useState<Category[]>([]);
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

  // 1. Export Backup
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const jsonStr = await backupService.exportAll();
      backupService.downloadBackupFile(jsonStr);
      showToast('File backup berhasil diunduh!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengekspor data.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Import Restore dengan Popup Konfirmasi React-Toastify
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    confirmWithToast({
      title: 'Peringatan Pemulihan Data',
      message: 'Memulihkan file backup akan menimpa seluruh data catatan saat ini secara permanen. Lanjutkan?',
      confirmLabel: 'Ya, Timpa & Pulihkan',
      cancelLabel: 'Batalkan',
      isDestructive: true,
      onConfirm: async () => {
        setIsImporting(true);
        try {
          const content = await file.text();
          const result = await backupService.importAll(content);
          await Promise.all([fetchWallets(), fetchMonthlyData(currentMonth), loadCategories()]);
          showToast(`Data berhasil dipulihkan! (${result.txCount} transaksi)`, 'success');
        } catch (err: any) {
          showToast(err.message || 'Gagal memulihkan backup.', 'error');
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
    } catch (err: any) {
      showToast(err.message || 'Gagal menambah kategori.', 'error');
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
        } catch (err: any) {
          showToast(err.message || 'Gagal menghapus kategori.', 'error');
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* 1. Card Backup & Restore Data */}
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-[#E5DCD0]/70 pb-3">
          <div className="w-10 h-10 rounded-xl bg-[#C86446]/15 text-[#C86446] flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2D2A26]">Backup & Pemulihan Data</h3>
            <p className="text-xs text-[#68635B]">
              Ekspor seluruh data keuangan Anda ke file JSON atau pulihkan dari cadangan sebelumnya.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-[#2D2A26] flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[#C86446]" />
                <span>Export Data (JSON)</span>
              </h4>
              <p className="text-[11px] text-[#68635B] mt-1">
                Unduh salinan data dompet, transaksi, kategori, dan target anggaran Anda ke perangkat.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExport}
              isLoading={isExporting}
              className="w-full gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Sekarang</span>
            </Button>
          </div>

          {/* Import */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-[#2D2A26] flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#4A6B53]" />
                <span>Import Data (Restore)</span>
              </h4>
              <p className="text-[11px] text-[#68635B] mt-1">
                Pulihkan file JSON cadangan yang sebelumnya diekspor dari aplikasi Nyatet Gan.
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isImporting}
              className="w-full gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Pilih File JSON</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. Manajemen Kategori */}
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#E5DCD0]/70 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A6B53]/15 text-[#4A6B53] flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2D2A26]">Kategori Transaksi</h3>
              <p className="text-xs text-[#68635B]">
                Kelola kategori bawaan dan tambahkan kategori kustom Anda.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCatModalOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-[#E5DCD0]/70 bg-white"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CategoryIcon name={c.icon} color={c.color} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#2D2A26] truncate">{c.name}</p>
                  <span className="text-[10px] text-[#68635B]">
                    {c.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {c.isDefault ? (
                  <Badge variant="neutral">Bawaan</Badge>
                ) : (
                  <button
                    onClick={() => handleDeleteCategory(c)}
                    className="p-1 rounded-lg text-[#B0473C] hover:bg-[#FAF7F2]"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Privacy & Offline Info */}
      <Card className="p-4 bg-[#F2ECE1]/60 border-[#E5DCD0] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#4A6B53] shrink-0 mt-0.5" />
        <div className="text-xs text-[#68635B] leading-relaxed">
          <strong className="text-[#2D2A26]">Privasi 100% Terjaga:</strong> Seluruh data disimpan di
          penyimpanan lokal browser (IndexedDB). Tidak ada data transaksi yang dikirim ke server luar.
          Pastikan untuk mengekspor backup berkala sebelum membersihkan riwayat browser atau mengganti perangkat.
        </div>
      </Card>

      {/* Modal Tambah Kategori */}
      <BottomSheet
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title="Tambah Kategori Kustom"
        description="Buat pos kategori baru sesuai kebutuhan pencatatan Anda"
      >
        <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 p-1 bg-[#F2ECE1] rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setCatType('expense')}
              className={`py-2 rounded-lg font-semibold text-xs ${
                catType === 'expense' ? 'bg-white text-[#B0473C] shadow-xs' : 'text-[#68635B]'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setCatType('income')}
              className={`py-2 rounded-lg font-semibold text-xs ${
                catType === 'income' ? 'bg-white text-[#4A6B53] shadow-xs' : 'text-[#68635B]'
              }`}
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
            <label className="text-xs font-semibold text-[#2D2A26]">Pilih Warna Kategori</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCatColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    catColor === c ? 'ring-2 ring-offset-2 ring-[#C86446] scale-110' : ''
                  }`}
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
