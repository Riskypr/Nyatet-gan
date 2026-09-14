import { db } from '../db/dexie';
import { Category, TransactionType } from '../types';

export const categoryService = {
  async getAll(type?: TransactionType): Promise<Category[]> {
    if (type) {
      return await db.categories.where('type').equals(type).toArray();
    }
    return await db.categories.toArray();
  },

  async getById(id: string): Promise<Category | undefined> {
    return await db.categories.get(id);
  },

  async create(payload: Omit<Category, 'id' | 'createdAt' | 'isDefault'>): Promise<Category> {
    const now = new Date().toISOString();
    const id = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newCategory: Category = {
      ...payload,
      id,
      isDefault: false,
      createdAt: now,
    };

    await db.categories.add(newCategory);
    return newCategory;
  },

  async update(id: string, payload: Partial<Omit<Category, 'id' | 'createdAt' | 'isDefault'>>): Promise<Category> {
    const existing = await db.categories.get(id);
    if (!existing) {
      throw new Error(`Kategori dengan ID ${id} tidak ditemukan.`);
    }

    const updated: Category = {
      ...existing,
      ...payload,
    };

    await db.categories.put(updated);
    return updated;
  },

  /**
   * Hapus kategori:
   * Sesuai Schema.md: Kategori bawaan (isDefault = true) tidak boleh dihapus.
   */
  async delete(id: string): Promise<void> {
    const cat = await db.categories.get(id);
    if (!cat) return;

    if (cat.isDefault) {
      throw new Error('Kategori bawaan sistem tidak dapat dihapus.');
    }

    // Cek apakah kategori sedang dipakai transaksi
    const txCount = await db.transactions.where('categoryId').equals(id).count();
    if (txCount > 0) {
      throw new Error('Kategori tidak dapat dihapus karena masih digunakan oleh transaksi.');
    }

    await db.categories.delete(id);
  }
};
