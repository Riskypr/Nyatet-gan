'use client';

import React, { useState, useEffect } from 'react';
import { TransactionType, Category, Wallet, Transaction } from '@/lib/types';
import { categoryService } from '@/lib/services/categoryService';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { NumberInput } from '@/components/ui/NumberInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { toISODateOnly } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export interface TransactionFormProps {
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransactionForm({
  initialType = 'expense',
  editingTransaction,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const { wallets } = useWalletStore();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const { showToast } = useUIStore();

  const [type, setType] = useState<TransactionType>(
    editingTransaction ? editingTransaction.type : initialType
  );
  const [amount, setAmount] = useState<number>(
    editingTransaction ? editingTransaction.amount : 0
  );
  const [categoryId, setCategoryId] = useState<string>(
    editingTransaction ? editingTransaction.categoryId : ''
  );
  const [walletId, setWalletId] = useState<string>(
    editingTransaction ? editingTransaction.walletId : (wallets[0]?.id || '')
  );
  const [date, setDate] = useState<string>(
    editingTransaction ? editingTransaction.date : toISODateOnly()
  );
  const [note, setNote] = useState<string>(
    editingTransaction?.note || ''
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load categories when type changes
  useEffect(() => {
    async function loadCats() {
      const cats = await categoryService.getAll(type);
      setCategories(cats);
      if (!editingTransaction || editingTransaction.type !== type) {
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      }
    }
    loadCats();
  }, [type, editingTransaction]);

  // Set default wallet if empty
  useEffect(() => {
    if (!walletId && wallets.length > 0) {
      setWalletId(wallets[0].id);
    }
  }, [wallets, walletId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!amount || amount <= 0) {
      newErrors.amount = 'Nominal harus lebih dari 0.';
    }
    if (!categoryId) {
      newErrors.category = 'Pilih salah satu kategori.';
    }
    if (!walletId) {
      newErrors.wallet = 'Pilih salah satu dompet.';
    }
    if (!date) {
      newErrors.date = 'Tanggal wajib diisi.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          walletId,
          categoryId,
          type,
          amount,
          date,
          note: note.trim() || undefined,
        });
        showToast('Transaksi berhasil diperbarui!', 'success');
      } else {
        await addTransaction({
          walletId,
          categoryId,
          type,
          amount,
          date,
          note: note.trim() || undefined,
        });
        showToast(
          type === 'expense' ? 'Pengeluaran berhasil dicatat!' : 'Pemasukan berhasil dicatat!',
          'success'
        );
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Gagal menyimpan transaksi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Type Toggle Tabs: Pengeluaran vs Pemasukan */}
      <div className="grid grid-cols-2 p-1 bg-surface-alt rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => {
            setType('expense');
            setErrors((prev) => ({ ...prev, amount: '' }));
          }}
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150',
            type === 'expense'
              ? 'bg-surface text-danger shadow-xs'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          <span>Pengeluaran</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setType('income');
            setErrors((prev) => ({ ...prev, amount: '' }));
          }}
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150',
            type === 'income'
              ? 'bg-surface text-secondary shadow-xs'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Pemasukan</span>
        </button>
      </div>

      {/* Nominal Input (Besar) */}
      <div>
        <NumberInput
          label="Nominal Transaksi"
          value={amount}
          onChange={(val) => {
            setAmount(val);
            if (val > 0) setErrors((prev) => ({ ...prev, amount: '' }));
          }}
          placeholder="0"
          error={errors.amount}
          autoFocus={!editingTransaction}
        />
      </div>

      {/* Kategori Selector Grid */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-text-primary tracking-wide">
          Pilih Kategori {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1">
          {categories.map((cat) => {
            const isSelected = categoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategoryId(cat.id);
                  setErrors((prev) => ({ ...prev, category: '' }));
                }}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all',
                  isSelected
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs'
                    : 'border-border bg-surface hover:bg-surface-alt'
                )}
              >
                <CategoryIcon name={cat.icon} color={cat.color} size="sm" />
                <span className="text-[11px] font-medium text-text-primary mt-1.5 line-clamp-1 w-full">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
        {errors.category && <p className="text-xs text-danger font-medium">{errors.category}</p>}
      </div>

      {/* Dompet / Sumber Dana */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-text-primary tracking-wide">
          Sumber Dana / Dompet
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {wallets.map((w) => {
            const isSelected = walletId === w.id;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  setWalletId(w.id);
                  setErrors((prev) => ({ ...prev, wallet: '' }));
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium shrink-0 transition-all',
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-xs'
                    : 'border-border bg-surface text-text-primary hover:bg-surface-alt'
                )}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: isSelected ? '#FFFFFF' : w.color }}
                />
                <span>{w.name}</span>
              </button>
            );
          })}
        </div>
        {errors.wallet && <p className="text-xs text-danger font-medium">{errors.wallet}</p>}
      </div>

      {/* Tanggal & Catatan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          type="date"
          label="Tanggal"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
        />
        <Input
          type="text"
          label="Catatan (Opsional)"
          placeholder="Mis: Makan siang bareng teman"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button
          type="submit"
          variant={type === 'expense' ? 'primary' : 'success'}
          isLoading={isSubmitting}
          className="min-w-32"
        >
          {editingTransaction ? 'Simpan Perubahan' : 'Simpan Catatan'}
        </Button>
      </div>
    </form>
  );
}
