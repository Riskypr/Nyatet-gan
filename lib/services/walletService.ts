import { db } from '../db/dexie';
import { Wallet } from '../types';

export const walletService = {
  async getAll(includeArchived = false): Promise<Wallet[]> {
    if (includeArchived) {
      return await db.wallets.toArray();
    }
    return await db.wallets.filter((w) => !w.isArchived).toArray();
  },

  async getById(id: string): Promise<Wallet | undefined> {
    return await db.wallets.get(id);
  },

  async create(payload: Omit<Wallet, 'id' | 'currentBalance' | 'isArchived' | 'createdAt' | 'updatedAt'>): Promise<Wallet> {
    const now = new Date().toISOString();
    const id = `wallet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    const newWallet: Wallet = {
      ...payload,
      id,
      currentBalance: payload.initialBalance,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.wallets.add(newWallet);
    return newWallet;
  },

  async update(id: string, payload: Partial<Omit<Wallet, 'id' | 'createdAt'>>): Promise<Wallet> {
    const existing = await db.wallets.get(id);
    if (!existing) {
      throw new Error(`Dompet dengan ID ${id} tidak ditemukan.`);
    }

    const now = new Date().toISOString();
    const updated: Wallet = {
      ...existing,
      ...payload,
      updatedAt: now,
    };

    await db.wallets.put(updated);

    // Bila initialBalance berubah, rekalkulasi saldo berjalan
    if (payload.initialBalance !== undefined && payload.initialBalance !== existing.initialBalance) {
      await this.recalculateBalance(id);
      return (await db.wallets.get(id))!;
    }

    return updated;
  },

  /**
   * Menghapus dompet:
   * Sesuai Schema.md: jika dompet masih memiliki transaksi, arsipkan (isArchived = true)
   * Jika tidak ada transaksi sama sekali, dapat dihapus permanen.
   */
  async deleteOrArchive(id: string): Promise<{ archived: boolean }> {
    const txCount = await db.transactions.where('walletId').equals(id).count();
    
    if (txCount > 0) {
      await db.wallets.update(id, {
        isArchived: true,
        updatedAt: new Date().toISOString(),
      });
      return { archived: true };
    } else {
      await db.wallets.delete(id);
      return { archived: false };
    }
  },

  /**
   * Rekalkulasi saldo berjalan (currentBalance) dari initialBalance + total transaksi
   * Aturan konsistensi data dari Schema.md: dilarang menghitung manual agar tidak drift.
   */
  async recalculateBalance(walletId: string): Promise<number> {
    const wallet = await db.wallets.get(walletId);
    if (!wallet) return 0;

    const txs = await db.transactions.where('walletId').equals(walletId).toArray();

    let balance = wallet.initialBalance;
    for (const tx of txs) {
      if (tx.type === 'income') {
        balance += tx.amount;
      } else {
        balance -= tx.amount;
      }
    }

    await db.wallets.update(walletId, {
      currentBalance: balance,
      updatedAt: new Date().toISOString(),
    });

    return balance;
  },

  async recalculateAll(): Promise<void> {
    const wallets = await db.wallets.toArray();
    for (const w of wallets) {
      await this.recalculateBalance(w.id);
    }
  },

  async getTotalBalance(): Promise<number> {
    const wallets = await this.getAll(false);
    return wallets.reduce((sum, w) => sum + w.currentBalance, 0);
  }
};
