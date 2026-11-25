'use client';

import React, { useState } from 'react';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { Wallet } from '@/lib/types';
import { WalletCard } from '@/components/wallets/WalletCard';
import { WalletModal } from '@/components/wallets/WalletModal';
import { TransferModal } from '@/components/wallets/TransferModal';
import { formatRupiah } from '@/lib/utils/currency';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { confirmWithToast } from '@/lib/utils/confirmToast';
import { Plus, Info, ArrowRightLeft, Eye, EyeOff, ShieldCheck, PiggyBank } from 'lucide-react';

export default function WalletsPage() {
  const { wallets, totalBalance, isBalanceHidden, toggleBalanceHidden, deleteOrArchiveWallet } = useWalletStore();
  const { showToast } = useUIStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const handleEdit = (w: Wallet) => {
    setEditingWallet(w);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingWallet(null);
    setIsModalOpen(true);
  };

  const handleDelete = (w: Wallet) => {
    confirmWithToast({
      title: 'Hapus / Arsipkan Dompet',
      message: `Apakah Anda yakin ingin menghapus atau mengarsipkan dompet "${w.name}"?`,
      confirmLabel: 'Ya, Lanjutkan',
      cancelLabel: 'Batal',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const result = await deleteOrArchiveWallet(w.id);
          if (result.archived) {
            showToast(
              `Dompet "${w.name}" diarsipkan karena memiliki riwayat transaksi agar data tetap konsisten.`,
              'info'
            );
          } else {
            showToast(`Dompet "${w.name}" berhasil dihapus.`, 'success');
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Gagal menghapus dompet.';
          showToast(msg, 'error');
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto pb-6">
      {/* 1. Header Judul & Badge Privasi */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary">
            Dompet &amp; Akun Lokal
          </h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold uppercase tracking-wider shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Privat
          </span>
        </div>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          Kelola alokasi saldo fisik &amp; digital serta pindahkan dana antar dompet secara instan.
        </p>
      </div>

      {/* 2. Kartu Total Likuiditas Aktif + Tombol Transfer Dana */}
      <Card className="p-4 bg-surface border-border shadow-xs">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Total Saldo Aktif
                </p>
                <button
                  type="button"
                  onClick={toggleBalanceHidden}
                  className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
                  title={isBalanceHidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
                  aria-label={isBalanceHidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
                >
                  {isBalanceHidden ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-text-primary truncate" suppressHydrationWarning>
                {isBalanceHidden ? 'Rp ••••••••' : formatRupiah(totalBalance)}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-full bg-surface-alt border border-border text-[11px] font-bold text-text-secondary">
              {wallets.length} Sumber
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTransferModalOpen(true)}
              className="gap-1.5 rounded-full"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer Dana</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Daftar Sumber Dana */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">Daftar Sumber Dana</h3>
          <span className="text-[11px] text-text-muted">
            {wallets.length} dompet aktif
          </span>
        </div>

        <div className="flex flex-col gap-3.5">
          {wallets.map((w) => (
            <WalletCard
              key={w.id}
              wallet={w}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Tombol Tambah Sumber Dana Baru Full-Width */}
        <button
          type="button"
          onClick={handleAddNew}
          className="w-full py-3.5 px-4 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:bg-surface-alt text-text-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer mt-1"
        >
          <span className="w-5 h-5 rounded-full border border-primary text-primary flex items-center justify-center">
            <Plus className="w-3.5 h-3.5" />
          </span>
          <span>Tambah Sumber Dana / Dompet Baru</span>
        </button>
      </div>

      {/* Info notice about safe archive */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-alt/70 border border-border/70 text-[11px] text-text-secondary">
        <Info className="w-4 h-4 text-primary shrink-0" />
        <span>
          Dompet yang sudah memiliki riwayat transaksi akan diarsipkan otomatis saat dihapus untuk menjaga riwayat keuangan tetap utuh.
        </span>
      </div>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWallet(null);
        }}
        wallet={editingWallet}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
    </div>
  );
}
