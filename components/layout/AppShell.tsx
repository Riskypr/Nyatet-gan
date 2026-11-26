'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { seedInitialDataIfNeeded } from '@/lib/db/seed';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { ToastContainer } from 'react-toastify';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionDetailModal } from '@/components/transactions/TransactionDetailModal';
import { QuickSearchModal } from '@/components/transactions/QuickSearchModal';
import { confirmWithToast } from '@/lib/utils/confirmToast';
import { transactionService } from '@/lib/services/transactionService';
import { Transaction } from '@/lib/types';
import { useThemeStore } from '@/lib/stores/themeStore';
import { Loader2 } from 'lucide-react';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { OfflineBanner } from '@/components/pwa/OfflineBanner';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDbReady, setIsDbReady] = useState(false);
  const { fetchWallets } = useWalletStore();
  const { fetchMonthlyData, currentMonth, deleteTransaction } = useTransactionStore();
  const { initTheme } = useThemeStore();
  const {
    isTransactionModalOpen,
    transactionModalType,
    editingTransactionId,
    editingTransactionData,
    initialTransactionDate,
    openTransactionModal,
    closeTransactionModal,
    isDetailModalOpen,
    detailTransaction,
    closeTransactionDetail,
    showToast,
  } = useUIStore();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleDeleteTransaction = (id: string) => {
    confirmWithToast({
      title: 'Hapus Transaksi',
      message: 'Yakin ingin menghapus transaksi ini? Saldo dompet akan disesuaikan otomatis.',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteTransaction(id);
          showToast('Transaksi berhasil dihapus', 'success');
          closeTransactionDetail();
        } catch {
          showToast('Gagal menghapus transaksi', 'error');
        }
      },
    });
  };

  // Inisialisasi Tema & Database IndexedDB
  useEffect(() => {
    initTheme();

    async function init() {
      try {
        await seedInitialDataIfNeeded();
        await Promise.all([fetchWallets(), fetchMonthlyData(currentMonth)]);
      } catch (err) {
        console.error('Error initializing database:', err);
      } finally {
        setIsDbReady(true);
      }
    }
    init();
  }, [initTheme, fetchWallets, fetchMonthlyData, currentMonth]);

  // Ambil data transaksi saat mode edit
  useEffect(() => {
    if (editingTransactionData) {
      setEditingTransaction(editingTransactionData);
    } else if (editingTransactionId) {
      transactionService.getById(editingTransactionId).then((tx) => {
        setEditingTransaction(tx || null);
      });
    } else {
      setEditingTransaction(null);
    }
  }, [editingTransactionId, editingTransactionData]);

  if (!isDbReady) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg animate-bounce mb-4">
          <img src="/Logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Memuat Nyatet Gan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col md:flex-row antialiased">
      {/* PWA Service Worker Registration */}
      <ServiceWorkerRegister />

      {/* React-Toastify Container */}
      <ToastContainer
        position="top-center"
        toastClassName="!rounded-2xl !font-sans"
      />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <Header />
        <OfflineBanner />
        <main key={pathname} className="motion-enter flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Transaction Modal / Bottom Sheet */}
      <BottomSheet
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        title={
          editingTransactionId
            ? 'Ubah Transaksi'
            : transactionModalType === 'expense'
              ? 'Catat Pengeluaran'
              : 'Catat Pemasukan'
        }
        description={
          editingTransactionId
            ? 'Perbarui detail transaksi yang dipilih'
            : 'Masukkan nominal dan detail transaksi Anda'
        }
      >
        {editingTransactionId && !editingTransaction ? (
          <div className="flex flex-col items-center justify-center p-8 gap-3 min-h-[180px]">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs font-semibold text-text-secondary">Memuat data transaksi...</span>
          </div>
        ) : (
          <TransactionForm
            key={
              editingTransaction
                ? `edit-${editingTransaction.id}-${editingTransaction.updatedAt || ''}`
                : `new-${initialTransactionDate || 'today'}-${transactionModalType}`
            }
            initialType={transactionModalType}
            initialDate={initialTransactionDate}
            editingTransaction={editingTransaction}
            onSuccess={closeTransactionModal}
            onCancel={closeTransactionModal}
          />
        )}
      </BottomSheet>

      {/* Global Transaction Detail Modal / Bottom Sheet */}
      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        transaction={detailTransaction}
        onClose={closeTransactionDetail}
        onEdit={(tx) => {
          closeTransactionDetail();
          openTransactionModal(tx.type, tx);
        }}
        onDelete={handleDeleteTransaction}
      />

      {/* Global Quick Search Overlay */}
      <QuickSearchModal />
    </div>
  );
}
