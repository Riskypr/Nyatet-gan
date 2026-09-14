export type TransactionType = 'expense' | 'income';

export interface Wallet {
  id: string;
  name: string;
  icon: string;
  color: string;
  initialBalance: number;
  currentBalance: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO date format: YYYY-MM-DD
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  categoryId: string | null; // null = total target bulanan
  targetAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Setting {
  key: string;
  value: any;
}

export interface BackupMeta {
  app: string;
  schemaVersion: number;
  exportedAt: string;
}

export interface BackupPayload {
  meta: BackupMeta;
  data: {
    wallets: Wallet[];
    categories: Category[];
    transactions: Transaction[];
    budgets: Budget[];
    settings: Setting[];
  };
}

export interface MonthlySummary {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  totalBalance: number;
}

export interface ExpenseByCategorySummary {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  color: string;
  totalAmount: number;
  percentage: number;
  count: number;
}

export interface BudgetProgress {
  budget: Budget;
  spentAmount: number;
  percentage: number;
  remainingAmount: number;
  isOverBudget: boolean;
  category?: Category;
}
