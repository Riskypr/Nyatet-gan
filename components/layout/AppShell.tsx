'use client';

import React, { useEffect, useState } from 'react';
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
import { transactionService } from '@/lib/services/transactionService';
import { Transaction } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isDbReady, setIsDbReady] = useState(false);
  const { fetchWallets } = useWalletStore();
  const { fetchMonthlyData, currentMonth } = useTransactionStore();
  const {
    isTransactionModalOpen,
    transactionModalType,
    editingTransactionId,
    closeTransactionModal,
  } = useUIStore();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Inisialisasi Database IndexedDB
  useEffect(() => {
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
  }, []);

  // Ambil data transaksi saat mode edit
  useEffect(() => {
    if (editingTransactionId) {
      transactionService.getById(editingTransactionId).then((tx) => {
        setEditingTransaction(tx || null);
      });
    } else {
      setEditingTransaction(null);
    }
  }, [editingTransactionId]);

  if (!isDbReady) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#C86446] text-white flex items-center justify-center text-xl shadow-md animate-bounce mb-3">
          🌱
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-[#2D2A26]">
          <Loader2 className="w-4 h-4 animate-spin text-[#C86446]" />
          <span>Memuat Nyatet Gan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2A26] flex flex-col md:flex-row antialiased">
      {/* React-Toastify Container */}
      <ToastContainer />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <Header />
        <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Transaction Modal / Bottom Sheet */}
      <BottomSheet
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        title={
          editingTransaction
            ? 'Ubah Transaksi'
            : transactionModalType === 'expense'
            ? 'Catat Pengeluaran'
            : 'Catat Pemasukan'
        }
        description={
          editingTransaction
            ? 'Perbarui detail transaksi yang dipilih'
            : 'Masukkan nominal dan detail transaksi Anda'
        }
      >
        <TransactionForm
          initialType={transactionModalType}
          editingTransaction={editingTransaction}
          onSuccess={closeTransactionModal}
          onCancel={closeTransactionModal}
        />
      </BottomSheet>
    </div>
  );
}
