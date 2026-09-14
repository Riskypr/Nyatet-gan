import { z } from 'zod';
import { db } from '../db/dexie';
import { BackupPayload } from '../types';
import { walletService } from './walletService';

const WalletSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  initialBalance: z.number(),
  currentBalance: z.number(),
  isArchived: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['expense', 'income']),
  icon: z.string(),
  color: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string(),
});

const TransactionSchema = z.object({
  id: z.string(),
  walletId: z.string(),
  categoryId: z.string(),
  type: z.enum(['expense', 'income']),
  amount: z.number().positive(),
  date: z.string(),
  note: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const BudgetSchema = z.object({
  id: z.string(),
  month: z.string(),
  categoryId: z.string().nullable(),
  targetAmount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const SettingSchema = z.object({
  key: z.string(),
  value: z.unknown(),
}) as z.ZodType<import('../types').Setting>;

const BackupPayloadSchema = z.object({
  meta: z.object({
    app: z.string(),
    schemaVersion: z.number(),
    exportedAt: z.string(),
  }),
  data: z.object({
    wallets: z.array(WalletSchema),
    categories: z.array(CategorySchema),
    transactions: z.array(TransactionSchema),
    budgets: z.array(BudgetSchema),
    settings: z.array(SettingSchema).default([]),
  }),
});

export const backupService = {
  async exportAll(): Promise<string> {
    const wallets = await db.wallets.toArray();
    const categories = await db.categories.toArray();
    const transactions = await db.transactions.toArray();
    const budgets = await db.budgets.toArray();
    const settings = await db.settings.toArray();

    const payload: BackupPayload = {
      meta: {
        app: 'nyatetGan',
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
      },
      data: {
        wallets,
        categories,
        transactions,
        budgets,
        settings,
      },
    };

    return JSON.stringify(payload, null, 2);
  },

  downloadBackupFile(jsonString: string): void {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyatetgan-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  async importAll(jsonString: string): Promise<{ success: boolean; message: string; txCount: number }> {
    let parsedJson: any;
    try {
      parsedJson = JSON.parse(jsonString);
    } catch {
      throw new Error('Format file tidak valid. Pastikan file berformat JSON.');
    }

    // Validasi Zod schema
    const parseResult = BackupPayloadSchema.safeParse(parsedJson);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validasi struktur backup gagal: ${errorMsg}`);
    }

    const { data } = parseResult.data;

    // Tulis atomik ke Dexie menggunakan Dexie Transaction
    await db.transaction('rw', [db.wallets, db.categories, db.transactions, db.budgets, db.settings], async () => {
      await db.wallets.clear();
      await db.categories.clear();
      await db.transactions.clear();
      await db.budgets.clear();
      await db.settings.clear();

      if (data.wallets.length > 0) await db.wallets.bulkAdd(data.wallets);
      if (data.categories.length > 0) await db.categories.bulkAdd(data.categories);
      if (data.transactions.length > 0) await db.transactions.bulkAdd(data.transactions);
      if (data.budgets.length > 0) await db.budgets.bulkAdd(data.budgets);
      if (data.settings.length > 0) await db.settings.bulkAdd(data.settings);
    });

    // Rekalkulasi saldo semua dompet untuk konsistensi data
    await walletService.recalculateAll();

    return {
      success: true,
      message: 'Data berhasil dipulihkan 100%.',
      txCount: data.transactions.length,
    };
  },
};
