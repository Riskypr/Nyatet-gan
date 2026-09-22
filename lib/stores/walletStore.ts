import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Wallet } from '../types';
import { walletService } from '../services/walletService';

interface WalletState {
  wallets: Wallet[];
  isLoading: boolean;
  totalBalance: number;
  isBalanceHidden: boolean;
  toggleBalanceHidden: () => void;
  setBalanceHidden: (hidden: boolean) => void;
  fetchWallets: () => Promise<void>;
  addWallet: (data: Omit<Wallet, 'id' | 'currentBalance' | 'isArchived' | 'createdAt' | 'updatedAt'>) => Promise<Wallet>;
  updateWallet: (id: string, data: Partial<Omit<Wallet, 'id' | 'createdAt'>>) => Promise<Wallet>;
  deleteOrArchiveWallet: (id: string) => Promise<{ archived: boolean }>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallets: [],
      isLoading: false,
      totalBalance: 0,
      isBalanceHidden: false,

      toggleBalanceHidden: () => {
        set((state) => ({ isBalanceHidden: !state.isBalanceHidden }));
      },

      setBalanceHidden: (hidden: boolean) => {
        set({ isBalanceHidden: hidden });
      },

      fetchWallets: async () => {
        set({ isLoading: true });
        try {
          const wallets = await walletService.getAll(false);
          const totalBalance = wallets.reduce((sum, w) => sum + w.currentBalance, 0);
          set({ wallets, totalBalance, isLoading: false });
        } catch (err) {
          console.error('Error fetching wallets:', err);
          set({ isLoading: false });
        }
      },

      addWallet: async (data) => {
        const newWallet = await walletService.create(data);
        await get().fetchWallets();
        return newWallet;
      },

      updateWallet: async (id, data) => {
        const updated = await walletService.update(id, data);
        await get().fetchWallets();
        return updated;
      },

      deleteOrArchiveWallet: async (id) => {
        const result = await walletService.deleteOrArchive(id);
        await get().fetchWallets();
        return result;
      },
    }),
    {
      name: 'nyatetgan_wallet_settings',
      partialize: (state) => ({ isBalanceHidden: state.isBalanceHidden }),
    }
  )
);

