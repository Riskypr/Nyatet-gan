import { create } from 'zustand';
import { Transaction, MonthlySummary, ExpenseByCategorySummary } from '../types';
import { transactionService } from '../services/transactionService';
import { getCurrentMonth } from '../utils/date';
import { useWalletStore } from './walletStore';

interface TransactionState {
  currentMonth: string;
  transactions: Transaction[];
  monthlySummary: MonthlySummary | null;
  expenseByCategory: ExpenseByCategorySummary[];
  isLoading: boolean;

  setCurrentMonth: (month: string) => void;
  fetchMonthlyData: (month?: string) => Promise<void>;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  currentMonth: getCurrentMonth(),
  transactions: [],
  monthlySummary: null,
  expenseByCategory: [],
  isLoading: false,

  setCurrentMonth: (month: string) => {
    set({ currentMonth: month });
    get().fetchMonthlyData(month);
  },

  fetchMonthlyData: async (monthToFetch?: string) => {
    const m = monthToFetch || get().currentMonth;
    set({ isLoading: true });
    try {
      const [transactions, monthlySummary, expenseByCategory] = await Promise.all([
        transactionService.getByMonth(m),
        transactionService.getMonthlySummary(m),
        transactionService.getExpenseByCategory(m),
      ]);

      set({
        currentMonth: m,
        transactions,
        monthlySummary,
        expenseByCategory,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error fetching monthly transaction data:', err);
      set({ isLoading: false });
    }
  },

  addTransaction: async (data) => {
    const newTx = await transactionService.create(data);
    await Promise.all([
      get().fetchMonthlyData(get().currentMonth),
      useWalletStore.getState().fetchWallets(),
    ]);
    return newTx;
  },

  updateTransaction: async (id, data) => {
    const updated = await transactionService.update(id, data);
    await Promise.all([
      get().fetchMonthlyData(get().currentMonth),
      useWalletStore.getState().fetchWallets(),
    ]);
    return updated;
  },

  deleteTransaction: async (id) => {
    await transactionService.delete(id);
    await Promise.all([
      get().fetchMonthlyData(get().currentMonth),
      useWalletStore.getState().fetchWallets(),
    ]);
  },
}));
