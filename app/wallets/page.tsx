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
import { Plus, Wallet as WalletIcon, Info, ArrowRightLeft, Eye, EyeOff } from 'lucide-react';

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
        } catch (err: any) {
          showToast(err.message || 'Gagal menghapus dompet.', 'error');
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header Overview Card */}
      <Card className="p-5 bg-linear-to-r from-[#F2ECE1] to-white border-[#E5DCD0]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#C86446] text-white flex items-center justify-center shadow-sm shadow-[#C86446]/30">
              <WalletIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-[#68635B]">Total Saldo Seluruh Dompet</p>
                <button
                  type="button"
                  onClick={toggleBalanceHidden}
                  className="p-1 rounded-lg text-[#68635B] hover:text-[#2D2A26] hover:bg-[#E5DCD0]/50 transition-colors cursor-pointer"
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
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D2A26]" suppressHydrationWarning>
                {isBalanceHidden ? 'Rp ••••••••' : formatRupiah(totalBalance)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <Button variant="secondary" size="md" onClick={() => setIsTransferModalOpen(true)} className="gap-2 flex-1 sm:flex-initial">
              <ArrowRightLeft className="w-4 h-4" />
              <span>Transfer Dana</span>
            </Button>
            <Button variant="primary" size="md" onClick={handleAddNew} className="gap-2 flex-1 sm:flex-initial">
              <Plus className="w-4 h-4" />
              <span>Tambah Dompet</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Info notice about safe archive */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] text-xs text-[#68635B]">
        <Info className="w-4 h-4 text-[#C86446] shrink-0" />
        <span>
          Dompet yang sudah memiliki riwayat transaksi akan diarsipkan otomatis saat dihapus untuk menjaga riwayat keuangan tetap utuh.
        </span>
      </div>

      {/* Grid of Wallets */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[#2D2A26]">Daftar Sumber Dana ({wallets.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {wallets.map((w) => (
            <WalletCard
              key={w.id}
              wallet={w}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
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
