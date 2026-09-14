import Dexie, { Table } from 'dexie';
import { Wallet, Transaction, Category, Budget, Setting } from '../types';

export class AppDatabase extends Dexie {
  wallets!: Table<Wallet, string>;
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  budgets!: Table<Budget, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super('moneyEarthDB');
    this.version(1).stores({
      wallets: 'id, name, createdAt',
      transactions: 'id, walletId, categoryId, type, date, [date+type], createdAt',
      categories: 'id, name, type',
      budgets: 'id, month, categoryId, [month+categoryId]',
      settings: 'key',
    });
  }
}

// Singleton database instance
export const db = new AppDatabase();
