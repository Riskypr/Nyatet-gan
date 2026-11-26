import { create } from 'zustand';
import { Transaction, TransactionType } from '../types';
import { toast, ToastOptions } from 'react-toastify';

interface UIState {
  // Modal Transaksi (Input / Edit Bottom Sheet)
  isTransactionModalOpen: boolean;
  transactionModalType: TransactionType;
  editingTransactionId: string | null;
  editingTransactionData: Transaction | null;
  initialTransactionDate: string | null;
  openTransactionModal: (
    type?: TransactionType,
    editingTarget?: string | Transaction | null,
    date?: string | null
  ) => void;
  closeTransactionModal: () => void;

  // Modal Detail Transaksi (Saat klik transaksi)
  isDetailModalOpen: boolean;
  detailTransaction: Transaction | null;
  openTransactionDetail: (tx: Transaction) => void;
  closeTransactionDetail: () => void;

  // Quick Search Overlay (Dari tombol search di Header)
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  // React-Toastify Helper
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', options?: ToastOptions) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isTransactionModalOpen: false,
  transactionModalType: 'expense',
  editingTransactionId: null,
  editingTransactionData: null,
  initialTransactionDate: null,

  openTransactionModal: (type = 'expense', editingTarget = null, date = null) => {
    let targetId: string | null = null;
    let targetData: Transaction | null = null;
    let resolvedType: TransactionType = type;

    if (editingTarget) {
      if (typeof editingTarget === 'string') {
        targetId = editingTarget;
      } else {
        targetId = editingTarget.id;
        targetData = editingTarget;
        resolvedType = editingTarget.type;
      }
    }

    set({
      isTransactionModalOpen: true,
      transactionModalType: resolvedType,
      editingTransactionId: targetId,
      editingTransactionData: targetData,
      initialTransactionDate: date || (targetData ? targetData.date : null),
    });
  },

  closeTransactionModal: () => {
    set({
      isTransactionModalOpen: false,
      editingTransactionId: null,
      editingTransactionData: null,
      initialTransactionDate: null,
    });
  },

  // Modal Detail Transaksi
  isDetailModalOpen: false,
  detailTransaction: null,

  openTransactionDetail: (tx: Transaction) => {
    set({
      isDetailModalOpen: true,
      detailTransaction: tx,
    });
  },

  closeTransactionDetail: () => {
    set({
      isDetailModalOpen: false,
      detailTransaction: null,
    });
  },

  // Quick Search Overlay
  isSearchOpen: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  showToast: (message: string, type = 'success', options?: ToastOptions) => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const defaultOptions: ToastOptions = {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: isDark ? 'dark' : 'light',
      ...options,
    };

    switch (type) {
      case 'success':
        toast.success(message, defaultOptions);
        break;
      case 'error':
        toast.error(message, defaultOptions);
        break;
      case 'warning':
        toast.warning(message, defaultOptions);
        break;
      case 'info':
      default:
        toast.info(message, defaultOptions);
        break;
    }
  },
}));
