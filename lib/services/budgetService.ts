import { db } from '../db/dexie';
import { Budget, BudgetProgress } from '../types';
import { transactionService } from './transactionService';
import { categoryService } from './categoryService';

export const budgetService = {
  async getBudgets(monthKey: string): Promise<Budget[]> {
    return await db.budgets.where('month').equals(monthKey).toArray();
  },

  async getTotalBudget(monthKey: string): Promise<Budget | undefined> {
    const budgets = await this.getBudgets(monthKey);
    return budgets.find((b) => b.categoryId === null);
  },

  async setBudget(monthKey: string, targetAmount: number, categoryId: string | null = null): Promise<Budget> {
    const existing = await db.budgets
      .where('[month+categoryId]')
      .equals([monthKey, categoryId || ''])
      .first();

    const now = new Date().toISOString();

    if (existing) {
      const updated: Budget = {
        ...existing,
        targetAmount,
        updatedAt: now,
      };
      await db.budgets.put(updated);
      return updated;
    } else {
      const id = `budget-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newBudget: Budget = {
        id,
        month: monthKey,
        categoryId,
        targetAmount,
        createdAt: now,
        updatedAt: now,
      };
      await db.budgets.add(newBudget);
      return newBudget;
    }
  },

  async deleteBudget(id: string): Promise<void> {
    await db.budgets.delete(id);
  },

  async getBudgetProgress(monthKey: string): Promise<{
    overall: BudgetProgress | null;
    categoryProgress: BudgetProgress[];
  }> {
    const budgets = await this.getBudgets(monthKey);
    const txs = await transactionService.getByMonth(monthKey);
    // Transfer pokok antar dompet bukan pengeluaran konsumtif.
    // Biaya admin transfer tetap dihitung karena tidak memiliki toWalletId.
    const expenseTxs = txs.filter(
      (tx) => tx.type === 'expense' && !(tx.transferPairId && tx.toWalletId)
    );

    const totalSpent = expenseTxs.reduce((sum, tx) => sum + tx.amount, 0);

    // Hitung per kategori
    const spentByCat = new Map<string, number>();
    for (const tx of expenseTxs) {
      const current = spentByCat.get(tx.categoryId) || 0;
      spentByCat.set(tx.categoryId, current + tx.amount);
    }

    const categories = await categoryService.getAll('expense');
    const catLookup = new Map(categories.map((c) => [c.id, c]));

    let overall: BudgetProgress | null = null;
    const totalBudget = budgets.find((b) => b.categoryId === null);
    if (totalBudget) {
      const percentage = totalBudget.targetAmount > 0 
        ? Math.round((totalSpent / totalBudget.targetAmount) * 100) 
        : 0;
      overall = {
        budget: totalBudget,
        spentAmount: totalSpent,
        percentage,
        remainingAmount: totalBudget.targetAmount - totalSpent,
        isOverBudget: totalSpent > totalBudget.targetAmount,
      };
    }

    const categoryBudgets = budgets.filter((b) => b.categoryId !== null);
    const categoryProgress: BudgetProgress[] = categoryBudgets.map((b) => {
      const cat = catLookup.get(b.categoryId!);
      const spent = spentByCat.get(b.categoryId!) || 0;
      const percentage = b.targetAmount > 0 
        ? Math.round((spent / b.targetAmount) * 100) 
        : 0;

      return {
        budget: b,
        spentAmount: spent,
        percentage,
        remainingAmount: b.targetAmount - spent,
        isOverBudget: spent > b.targetAmount,
        category: cat,
      };
    });

    return { overall, categoryProgress };
  },
};
