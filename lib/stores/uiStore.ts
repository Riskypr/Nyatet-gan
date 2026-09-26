import { create } from 'zustand';
import { TransactionType } from '../types';
import { toast, ToastOptions } from 'react-toastify';

interface UIState {
  // Modal Transaksi (Bottom Sheet)
  isTransactionModalOpen: boolean;
  transactionModalType: TransactionType;
  editingTransactionId: string | null;
  openTransactionModal: (type?: TransactionType, editingId?: string | null) => void;
  closeTransactionModal: () => void;

  // React-Toastify Helper
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', options?: ToastOptions) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isTransactionModalOpen: false,
  transactionModalType: 'expense',
  editingTransactionId: null,

  openTransactionModal: (type = 'expense', editingId = null) => {
    set({
      isTransactionModalOpen: true,
      transactionModalType: type,
      editingTransactionId: editingId,
    });
  },

  closeTransactionModal: () => {
    set({
      isTransactionModalOpen: false,
      editingTransactionId: null,
    });
  },

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
