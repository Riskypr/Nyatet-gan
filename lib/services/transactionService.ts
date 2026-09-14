import { db } from '../db/dexie';
import { Transaction, MonthlySummary, ExpenseByCategorySummary, TransactionType } from '../types';
import { walletService } from './walletService';
import { categoryService } from './categoryService';

export interface TransactionFilterOptions {
  month?: string; // YYYY-MM
  keyword?: string;
  categoryId?: string;
  walletId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export const transactionService = {
  async getById(id: string): Promise<Transaction | undefined> {
    return await db.transactions.get(id);
  },

  async create(payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const now = new Date().toISOString();
    const id = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newTx: Transaction = {
      ...payload,
      id,
      amount: Math.abs(payload.amount),
      createdAt: now,
      updatedAt: now,
    };

    // Tulis transaksi ke Dexie
    await db.transactions.add(newTx);

    // Rekalkulasi saldo dompet terkait
    await walletService.recalculateBalance(payload.walletId);

    return newTx;
  },

  async update(id: string, payload: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Promise<Transaction> {
    const existing = await db.transactions.get(id);
    if (!existing) {
      throw new Error(`Transaksi dengan ID ${id} tidak ditemukan.`);
    }

    const previousWalletId = existing.walletId;
    const now = new Date().toISOString();

    const updated: Transaction = {
      ...existing,
      ...payload,
      amount: payload.amount !== undefined ? Math.abs(payload.amount) : existing.amount,
      updatedAt: now,
    };

    await db.transactions.put(updated);

    // Rekalkulasi saldo dompet
    await walletService.recalculateBalance(updated.walletId);
    if (previousWalletId !== updated.walletId) {
      await walletService.recalculateBalance(previousWalletId);
    }

    return updated;
  },

  async delete(id: string): Promise<void> {
    const existing = await db.transactions.get(id);
    if (!existing) return;

    await db.transactions.delete(id);
    await walletService.recalculateBalance(existing.walletId);
  },

  async getRecent(limit = 5): Promise<Transaction[]> {
    return await db.transactions
      .orderBy('date')
      .reverse()
      .limit(limit)
      .toArray();
  },

  async getByMonth(monthKey: string): Promise<Transaction[]> {
    // monthKey: YYYY-MM
    const start = `${monthKey}-01`;
    const end = `${monthKey}-31`;

    const txs = await db.transactions
      .where('date')
      .between(start, end, true, true)
      .reverse()
      .sortBy('date');

    return txs;
  },

  async filter(options: TransactionFilterOptions): Promise<Transaction[]> {
    let collection = db.transactions.toCollection();

    let results = await collection.reverse().sortBy('date');

    if (options.month) {
      results = results.filter((tx) => tx.date.startsWith(options.month!));
    }

    if (options.startDate) {
      results = results.filter((tx) => tx.date >= options.startDate!);
    }

    if (options.endDate) {
      results = results.filter((tx) => tx.date <= options.endDate!);
    }

    if (options.walletId) {
      results = results.filter((tx) => tx.walletId === options.walletId);
    }

    if (options.categoryId) {
      results = results.filter((tx) => tx.categoryId === options.categoryId);
    }

    if (options.type) {
      results = results.filter((tx) => tx.type === options.type);
    }

    if (options.minAmount !== undefined && options.minAmount > 0) {
      results = results.filter((tx) => tx.amount >= options.minAmount!);
    }

    if (options.maxAmount !== undefined && options.maxAmount > 0) {
      results = results.filter((tx) => tx.amount <= options.maxAmount!);
    }

    if (options.keyword && options.keyword.trim() !== '') {
      const q = options.keyword.toLowerCase().trim();
      results = results.filter(
        (tx) => tx.note?.toLowerCase().includes(q)
      );
    }

    return results;
  },

  async getMonthlySummary(monthKey: string): Promise<MonthlySummary> {
    const txs = await this.getByMonth(monthKey);

    let totalIncome = 0;
    let totalExpense = 0;

    for (const tx of txs) {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }
    }

    const netSavings = totalIncome - totalExpense;
    const totalBalance = await walletService.getTotalBalance();

    return {
      month: monthKey,
      totalIncome,
      totalExpense,
      netSavings,
      totalBalance,
    };
  },

  async getExpenseByCategory(monthKey: string): Promise<ExpenseByCategorySummary[]> {
    const txs = await this.getByMonth(monthKey);
    const expenseTxs = txs.filter((tx) => tx.type === 'expense');

    const totalExpense = expenseTxs.reduce((sum, tx) => sum + tx.amount, 0);

    const categoryMap = new Map<string, { amount: number; count: number }>();

    for (const tx of expenseTxs) {
      const existing = categoryMap.get(tx.categoryId) || { amount: 0, count: 0 };
      existing.amount += tx.amount;
      existing.count += 1;
      categoryMap.set(tx.categoryId, existing);
    }

    const categories = await categoryService.getAll('expense');
    const catLookup = new Map(categories.map((c) => [c.id, c]));

    const summaries: ExpenseByCategorySummary[] = [];

    categoryMap.forEach((val, catId) => {
      const cat = catLookup.get(catId);
      const percentage = totalExpense > 0 ? Math.round((val.amount / totalExpense) * 100) : 0;

      summaries.push({
        categoryId: catId,
        categoryName: cat?.name || 'Kategori Lain',
        categoryIcon: cat?.icon || 'Tag',
        color: cat?.color || '#A8562D',
        totalAmount: val.amount,
        percentage,
        count: val.count,
      });
    });

    // Urutkan dari pengeluaran terbesar
    return summaries.sort((a, b) => b.totalAmount - a.totalAmount);
  },
};
