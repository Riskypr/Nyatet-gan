import { db } from './dexie';
import { Category, Wallet } from '../types';

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  // Pengeluaran (Expense)
  { name: 'Makan & Minum', type: 'expense', icon: 'Utensils', color: '#0A66C2', isDefault: true },
  { name: 'Transportasi', type: 'expense', icon: 'Car', color: '#057642', isDefault: true },
  { name: 'Belanja', type: 'expense', icon: 'ShoppingBag', color: '#E7A33E', isDefault: true },
  { name: 'Tagihan', type: 'expense', icon: 'Receipt', color: '#CC1016', isDefault: true },
  { name: 'Hiburan', type: 'expense', icon: 'Film', color: '#0073B1', isDefault: true },
  { name: 'Kesehatan', type: 'expense', icon: 'HeartPulse', color: '#2D6A6A', isDefault: true },
  { name: 'Pendidikan', type: 'expense', icon: 'GraduationCap', color: '#56687A', isDefault: true },
  { name: 'Lainnya', type: 'expense', icon: 'MoreHorizontal', color: '#70B5F9', isDefault: true },

  // Pemasukan (Income)
  { name: 'Gaji', type: 'income', icon: 'Banknote', color: '#057642', isDefault: true },
  { name: 'Bonus', type: 'income', icon: 'Award', color: '#E7A33E', isDefault: true },
  { name: 'Hadiah', type: 'income', icon: 'Gift', color: '#0A66C2', isDefault: true },
  { name: 'Investasi', type: 'income', icon: 'TrendingUp', color: '#2D6A6A', isDefault: true },
  { name: 'Lainnya', type: 'income', icon: 'Coins', color: '#70B5F9', isDefault: true },

  // Transfer System Categories
  { name: 'Transfer Keluar', type: 'expense', icon: 'ArrowRightLeft', color: '#0073B1', isDefault: true },
  { name: 'Transfer Masuk', type: 'income', icon: 'ArrowRightLeft', color: '#057642', isDefault: true },
  { name: 'Biaya Admin Transfer', type: 'expense', icon: 'Receipt', color: '#CC1016', isDefault: true },
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
      color: '#0A66C2',
      initialBalance: 0,
      currentBalance: 0,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.wallets.add(defaultWallet);
  }

  // Migrasi otomatis warna lama (Earth tone -> LinkedIn) untuk database lokal yang sudah ada
  try {
    const legacyMap: Record<string, string> = {
      '#C86446': '#0A66C2',
      '#4A6B53': '#057642',
      '#A84D32': '#0073B1',
      '#C98A3A': '#E7A33E',
      '#B0473C': '#CC1016',
      '#3D7068': '#2D6A6A',
      '#405865': '#56687A',
      '#68635B': '#70B5F9',
      '#2D2A26': '#191919',
    };

    const allCategories = await db.categories.toArray();
    for (const cat of allCategories) {
      const match = legacyMap[cat.color?.toUpperCase()] || legacyMap[cat.color];
      if (match) {
        await db.categories.update(cat.id, { color: match });
      }
    }

    const allWallets = await db.wallets.toArray();
    for (const w of allWallets) {
      const match = legacyMap[w.color?.toUpperCase()] || legacyMap[w.color];
      if (match) {
        await db.wallets.update(w.id, { color: match });
      }
    }
  } catch (err) {
    console.error('Migration color error:', err);
  }
}
