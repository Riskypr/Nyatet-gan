import { db } from './dexie';
import { Category, Wallet } from '../types';

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  // Pengeluaran (Expense)
  { name: 'Makan & Minum', type: 'expense', icon: 'Utensils', color: '#C86446', isDefault: true },
  { name: 'Transportasi', type: 'expense', icon: 'Car', color: '#4A6B53', isDefault: true },
  { name: 'Belanja', type: 'expense', icon: 'ShoppingBag', color: '#C98A3A', isDefault: true },
  { name: 'Tagihan', type: 'expense', icon: 'Receipt', color: '#B0473C', isDefault: true },
  { name: 'Hiburan', type: 'expense', icon: 'Film', color: '#A84D32', isDefault: true },
  { name: 'Kesehatan', type: 'expense', icon: 'HeartPulse', color: '#3D7068', isDefault: true },
  { name: 'Pendidikan', type: 'expense', icon: 'GraduationCap', color: '#405865', isDefault: true },
  { name: 'Lainnya', type: 'expense', icon: 'MoreHorizontal', color: '#68635B', isDefault: true },

  // Pemasukan (Income)
  { name: 'Gaji', type: 'income', icon: 'Banknote', color: '#4A6B53', isDefault: true },
  { name: 'Bonus', type: 'income', icon: 'Award', color: '#C98A3A', isDefault: true },
  { name: 'Hadiah', type: 'income', icon: 'Gift', color: '#C86446', isDefault: true },
  { name: 'Investasi', type: 'income', icon: 'TrendingUp', color: '#3D7068', isDefault: true },
  { name: 'Lainnya', type: 'income', icon: 'Coins', color: '#68635B', isDefault: true },
];

export async function seedInitialDataIfNeeded(): Promise<void> {
  // Cek apakah kategori sudah ada
  const catCount = await db.categories.count();
  const now = new Date().toISOString();

  if (catCount === 0) {
    const categoriesToInsert: Category[] = DEFAULT_CATEGORIES.map((cat, idx) => ({
      ...cat,
      id: `default-cat-${cat.type}-${idx + 1}`,
      createdAt: now,
    }));
    await db.categories.bulkAdd(categoriesToInsert);
  }

  // Cek apakah dompet sudah ada
  const walletCount = await db.wallets.count();
  if (walletCount === 0) {
    const defaultWallet: Wallet = {
      id: 'default-wallet-cash',
      name: 'Uang Tunai / Cash',
      icon: 'Wallet',
      color: '#C86446',
      initialBalance: 0,
      currentBalance: 0,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.wallets.add(defaultWallet);
  }
}
