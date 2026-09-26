'use client';

import React, { useState, useEffect } from 'react';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { budgetService } from '@/lib/services/budgetService';
import { categoryService } from '@/lib/services/categoryService';
import { BudgetProgress, Category } from '@/lib/types';
import { BudgetProgressBar } from '@/components/budget/BudgetProgressBar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { NumberInput } from '@/components/ui/NumberInput';
import { Button } from '@/components/ui/Button';
import { confirmWithToast } from '@/lib/utils/confirmToast';
import { formatMonthYear } from '@/lib/utils/date';
import { Target, Plus, Pencil, Trash2 } from 'lucide-react';

export default function BudgetPage() {
  const { currentMonth, transactions } = useTransactionStore();
  const { showToast } = useUIStore();

  const [overallBudget, setOverallBudget] = useState<BudgetProgress | null>(null);
  const [categoryBudgets, setCategoryBudgets] = useState<BudgetProgress[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [targetAmount, setTargetAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load budgets and categories
  const loadBudgetData = async () => {
    try {
      const [progress, cats] = await Promise.all([
        budgetService.getBudgetProgress(currentMonth),
        categoryService.getAll('expense'),
      ]);
      setOverallBudget(progress.overall);
      setCategoryBudgets(progress.categoryProgress);
      setExpenseCategories(cats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBudgetData();
  }, [currentMonth, transactions]);

  const handleOpenModal = (categoryId: string | null = null, currentTarget = 0) => {
    setSelectedCategoryId(categoryId);
    setTargetAmount(currentTarget);
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetAmount <= 0) {
      showToast('Nominal target anggaran harus lebih dari 0.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await budgetService.setBudget(currentMonth, targetAmount, selectedCategoryId);
      showToast('Target anggaran berhasil disimpan!', 'success');
      setIsModalOpen(false);
      await loadBudgetData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan target.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = (id: string) => {
    confirmWithToast({
      title: 'Hapus Target Anggaran',
      message: 'Apakah Anda yakin ingin menghapus target batas anggaran ini?',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await budgetService.deleteBudget(id);
          showToast('Target anggaran dihapus.', 'success');
          await loadBudgetData();
        } catch (err: any) {
          showToast(err.message || 'Gagal menghapus target.', 'error');
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Page Header Notice */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-text-primary">
            Target Anggaran Bulan {formatMonthYear(currentMonth)}
          </h2>
          <p className="text-xs text-text-secondary">
            Batasi pengeluaran bulanan Anda agar keuangan tetap terkendali.
          </p>
        </div>
      </div>

      {/* 1. Target Pengeluaran Keseluruhan (Total Budget) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Target Keseluruhan Bulan Ini
          </h3>
          {overallBudget && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleOpenModal(null, overallBudget.budget.targetAmount)}
                className="p-1 rounded-lg text-text-secondary hover:bg-surface-alt transition-colors"
                title="Ubah Target"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeleteBudget(overallBudget.budget.id)}
                className="p-1 rounded-lg text-danger hover:bg-surface-alt transition-colors"
                title="Hapus Target"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {overallBudget ? (
          <BudgetProgressBar
            spentAmount={overallBudget.spentAmount}
            targetAmount={overallBudget.budget.targetAmount}
            onClick={() => handleOpenModal(null, overallBudget.budget.targetAmount)}
          />
        ) : (
          <div className="p-5 bg-surface rounded-2xl border border-dashed border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <h4 className="text-sm font-bold text-text-primary">Belum Ada Target Keseluruhan</h4>
              <p className="text-xs text-text-secondary">
                Tetapkan batas maksimal pengeluaran Anda di bulan {formatMonthYear(currentMonth)}.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenModal(null, 0)}
              className="gap-2 shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Pasang Target Total</span>
            </Button>
          </div>
        )}
      </div>

      {/* 2. Target Per Kategori */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Target Per Kategori
          </h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenModal(expenseCategories[0]?.id || null, 0)}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Target Kategori</span>
          </Button>
        </div>

        {categoryBudgets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {categoryBudgets.map((cp) => (
              <div key={cp.budget.id} className="relative group">
                <BudgetProgressBar
                  title={cp.category?.name || 'Kategori'}
                  spentAmount={cp.spentAmount}
                  targetAmount={cp.budget.targetAmount}
                />
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(cp.budget.categoryId, cp.budget.targetAmount)}
                    className="p-1 rounded-lg text-text-secondary hover:bg-surface-alt"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(cp.budget.id)}
                    className="p-1 rounded-lg text-danger hover:bg-surface-alt"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-surface rounded-2xl border border-dashed border-border text-center">
            <Target className="w-8 h-8 text-primary mx-auto mb-2 opacity-60" />
            <p className="text-xs font-semibold text-text-primary">Belum ada target per kategori</p>
            <p className="text-[11px] text-text-secondary mt-1 max-w-sm mx-auto">
              Anda dapat memasang target khusus untuk pos tertentu seperti Makan & Minum, Belanja, atau Hiburan.
            </p>
          </div>
        )}
      </div>

      {/* Modal Setting Budget */}
      <BottomSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCategoryId === null ? 'Target Total Bulanan' : 'Target Anggaran Kategori'}
        description={`Atur batas pengeluaran untuk periode ${formatMonthYear(currentMonth)}`}
      >
        <form onSubmit={handleSaveBudget} className="flex flex-col gap-4">
          {/* Pilihan kategori bila bukan total */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary">Tipe Target</label>
            <select
              value={selectedCategoryId || '__total__'}
              onChange={(e) =>
                setSelectedCategoryId(e.target.value === '__total__' ? null : e.target.value)
              }
              className="h-11 px-3.5 rounded-xl border border-border bg-surface text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            >
              <option value="__total__">🌟 Target Keseluruhan Bulanan (Total)</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  🏷️ {c.name}
                </option>
              ))}
            </select>
          </div>

          <NumberInput
            label="Nominal Target (Rp)"
            value={targetAmount}
            onChange={(val) => setTargetAmount(val)}
            placeholder="0"
            autoFocus
          />

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Simpan Target
            </Button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}
