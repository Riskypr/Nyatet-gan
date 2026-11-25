'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { budgetService } from '@/lib/services/budgetService';
import { categoryService } from '@/lib/services/categoryService';
import { BudgetProgress, Category } from '@/lib/types';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { NumberInput } from '@/components/ui/NumberInput';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { confirmWithToast } from '@/lib/utils/confirmToast';
import { formatRupiah } from '@/lib/utils/currency';
import {
  formatMonthYear,
  getCurrentMonth,
  getPreviousMonth,
  getRemainingDaysLabel,
} from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Copy,
  Pencil,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react';

export default function BudgetPage() {
  const { currentMonth, transactions } = useTransactionStore();
  const { showToast } = useUIStore();

  const [overallBudget, setOverallBudget] = useState<BudgetProgress | null>(null);
  const [categoryBudgets, setCategoryBudgets] = useState<BudgetProgress[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [isCopyingPrev, setIsCopyingPrev] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [targetAmount, setTargetAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load budgets and categories
  const loadBudgetData = useCallback(async () => {
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
  }, [currentMonth]);

  useEffect(() => {
    loadBudgetData();
  }, [loadBudgetData, transactions]);

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan target.';
      showToast(msg, 'error');
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
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Gagal menghapus target.';
          showToast(msg, 'error');
        }
      },
    });
  };

  // Salin target anggaran dari bulan sebelumnya
  const handleCopyPreviousMonth = async () => {
    setIsCopyingPrev(true);
    try {
      const prevMonth = getPreviousMonth(currentMonth);
      const prevBudgets = await budgetService.getBudgets(prevMonth);
      if (prevBudgets.length === 0) {
        showToast(
          `Tidak ada target anggaran pada bulan ${formatMonthYear(prevMonth)}.`,
          'info'
        );
        return;
      }

      await Promise.all(
        prevBudgets.map((b) =>
          budgetService.setBudget(currentMonth, b.targetAmount, b.categoryId)
        )
      );
      await loadBudgetData();
      showToast(
        `${prevBudgets.length} target anggaran dari ${formatMonthYear(prevMonth)} berhasil disalin!`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyalin anggaran bulan lalu.';
      showToast(msg, 'error');
    } finally {
      setIsCopyingPrev(false);
    }
  };

  // Hitung sisa hari efektif untuk pagu harian maksimal
  const { remainingDaysCount, remainingDaysLabel } = useMemo(() => {
    const [yStr, mStr] = currentMonth.split('-');
    const daysInMonth = new Date(parseInt(yStr, 10), parseInt(mStr, 10), 0).getDate();
    const currKey = getCurrentMonth();
    let count = daysInMonth;
    if (currentMonth === currKey) {
      count = Math.max(1, daysInMonth - new Date().getDate() + 1);
    } else if (currentMonth < currKey) {
      count = 1;
    }
    return {
      remainingDaysCount: count,
      remainingDaysLabel: getRemainingDaysLabel(currentMonth),
    };
  }, [currentMonth]);

  const dailyMaxBudget = useMemo(() => {
    if (!overallBudget) return 0;
    return Math.max(0, Math.round(overallBudget.remainingAmount / remainingDaysCount));
  }, [overallBudget, remainingDaysCount]);

  // Kategori pertama yang belum punya target (untuk tombol + Tambah)
  const nextUnbudgetedCategoryId = useMemo(() => {
    const budgetedIds = new Set(categoryBudgets.map((b) => b.budget.categoryId));
    const unbudgeted = expenseCategories.find((c) => !budgetedIds.has(c.id));
    return unbudgeted?.id || expenseCategories[0]?.id || null;
  }, [categoryBudgets, expenseCategories]);

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto pb-8">
      {/* 1. Header Judul + Badge Bulan Aktif */}
      <div className="flex flex-col gap-1.5">
        <span className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          Bulan Aktif: {formatMonthYear(currentMonth)}
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary">
          Target Anggaran
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary">
          Atur batas pengeluaran per kategori agar arus kas tetap seimbang dan terencana.
        </p>
      </div>

      {/* 2. Kartu Pagu Anggaran Keseluruhan */}
      <div className="bg-surface rounded-3xl border border-border shadow-xs p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Pagu Anggaran Keseluruhan
            </p>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mt-1">
              {overallBudget
                ? formatRupiah(overallBudget.budget.targetAmount)
                : 'Belum Diatur'}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                handleOpenModal(null, overallBudget?.budget.targetAmount || 0)
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-alt border border-border hover:border-primary/40 text-xs font-bold text-text-primary transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              <span>{overallBudget ? 'Sesuaikan' : 'Pasang Target'}</span>
            </button>
            {overallBudget && (
              <button
                type="button"
                onClick={() => handleDeleteBudget(overallBudget.budget.id)}
                className="p-1.5 rounded-xl bg-surface-alt border border-border text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                title="Hapus Target Keseluruhan"
                aria-label="Hapus Target Keseluruhan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {overallBudget ? (
          <>
            {/* Realisasi & Persentase */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-text-secondary">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      overallBudget.isOverBudget || overallBudget.percentage >= 90
                        ? 'bg-danger'
                        : overallBudget.percentage >= 70
                          ? 'bg-warning'
                          : 'bg-secondary'
                    )}
                  />
                  Realisasi Terpakai:{' '}
                  <strong className="text-text-primary">
                    {formatRupiah(overallBudget.spentAmount)}
                  </strong>
                </span>
                <span className="font-bold text-text-primary">
                  {overallBudget.percentage}%
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-surface-alt overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700',
                    overallBudget.isOverBudget || overallBudget.percentage >= 90
                      ? 'bg-danger'
                      : overallBudget.percentage >= 70
                        ? 'bg-warning'
                        : 'bg-secondary'
                  )}
                  style={{ width: `${Math.min(overallBudget.percentage, 100)}%` }}
                />
              </div>
            </div>

            {/* 2 Sub-kartu: Sisa Aman & Pagu Harian Maks */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-2xl bg-surface-alt/70 border border-border/60 p-3.5 flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                  {overallBudget.isOverBudget ? 'Melebihi Pagu' : 'Sisa Aman'}
                </span>
                <p
                  className={cn(
                    'text-base sm:text-lg font-extrabold truncate mt-0.5',
                    overallBudget.isOverBudget ? 'text-danger' : 'text-secondary'
                  )}
                >
                  {formatRupiah(Math.abs(overallBudget.remainingAmount))}
                </p>
                <span className="text-[11px] text-text-muted">
                  {remainingDaysLabel || formatMonthYear(currentMonth)}
                </span>
              </div>

              <div className="rounded-2xl bg-surface-alt/70 border border-border/60 p-3.5 flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Pagu Harian Maks
                </span>
                <p className="text-base sm:text-lg font-extrabold text-text-primary truncate mt-0.5">
                  {formatRupiah(dailyMaxBudget)}
                </p>
                <span className="text-[11px] text-text-muted">
                  per hari hingga akhir bulan
                </span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-xs text-text-secondary leading-relaxed">
            Tetapkan batas pengeluaran bulanan keseluruhan agar Anda dapat memantau sisa aman dan pagu harian maksimal secara otomatis.
          </p>
        )}
      </div>

      {/* 3. Baris Tombol Aksi Cepat */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={handleCopyPreviousMonth}
          disabled={isCopyingPrev}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface border border-border hover:border-primary/40 hover:bg-surface-alt text-xs font-semibold text-text-primary transition-colors cursor-pointer disabled:opacity-60"
        >
          <Copy className="w-3.5 h-3.5 text-primary" />
          <span>{isCopyingPrev ? 'Menyalin...' : 'Salin Pagu Bulan Lalu'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleOpenModal(nextUnbudgetedCategoryId, 0)}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary text-white hover:bg-primary/90 text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Target Kategori</span>
        </button>
      </div>

      {/* 4. Kategori Pengeluaran */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-text-primary">
              Kategori Pengeluaran
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-surface-alt border border-border text-[11px] font-bold text-text-secondary">
              {categoryBudgets.length} Aktif
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleOpenModal(nextUnbudgetedCategoryId, 0)}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>

        {categoryBudgets.length > 0 ? (
          <div className="flex flex-col gap-3">
            {categoryBudgets.map((cp) => {
              const isCritical = cp.isOverBudget || cp.percentage >= 90;
              const isWarning = !isCritical && cp.percentage >= 70;
              const barColor = isCritical
                ? 'bg-danger'
                : isWarning
                  ? 'bg-warning'
                  : 'bg-secondary';
              const badgeColor = isCritical
                ? 'bg-danger/15 text-danger'
                : isWarning
                  ? 'bg-warning/15 text-warning'
                  : 'bg-secondary/15 text-secondary';
              const statusText = cp.isOverBudget
                ? `Melebihi ${cp.percentage}%`
                : isCritical
                  ? `Kritis ${cp.percentage}%`
                  : isWarning
                    ? `Waspada ${cp.percentage}%`
                    : 'Aman';

              return (
                <div
                  key={cp.budget.id}
                  className="bg-surface rounded-2xl border border-border shadow-xs p-4 flex flex-col gap-3 transition-all hover:border-primary/40"
                >
                  {/* Baris Atas */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <CategoryIcon
                        name={cp.category?.icon || 'Tag'}
                        color={cp.category?.color || '#0A66C2'}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-text-primary truncate">
                            {cp.category?.name || 'Kategori'}
                          </h4>
                          <span
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap',
                              badgeColor
                            )}
                          >
                            {statusText}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary mt-0.5">
                          {cp.isOverBudget ? (
                            <span className="text-danger font-semibold">
                              Lebih: {formatRupiah(Math.abs(cp.remainingAmount))}
                            </span>
                          ) : (
                            <span>
                              Sisa: {formatRupiah(cp.remainingAmount)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenModal(
                            cp.budget.categoryId,
                            cp.budget.targetAmount
                          )
                        }
                        className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors cursor-pointer"
                        title="Ubah Target"
                        aria-label="Ubah Target"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBudget(cp.budget.id)}
                        className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                        title="Hapus Target"
                        aria-label="Hapus Target"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Baris Tengah: Terpakai & Pagu */}
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-text-secondary">
                      Terpakai:{' '}
                      <strong className="text-text-primary font-bold">
                        {formatRupiah(cp.spentAmount)}
                      </strong>
                    </span>
                    <span className="text-text-secondary text-right">
                      Pagu:{' '}
                      <strong className="text-text-primary font-bold">
                        {formatRupiah(cp.budget.targetAmount)}
                      </strong>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-surface-alt overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        barColor
                      )}
                      style={{ width: `${Math.min(cp.percentage, 100)}%` }}
                    />
                  </div>

                  {/* Baris Bawah */}
                  <div className="flex items-center justify-between text-[11px] text-text-muted gap-2">
                    <span className="inline-flex items-center gap-1">
                      {isWarning || isCritical ? (
                        <>
                          <AlertTriangle
                            className={cn(
                              'w-3 h-3',
                              isCritical ? 'text-danger' : 'text-warning'
                            )}
                          />
                          <span
                            className={
                              isCritical ? 'text-danger font-medium' : 'text-warning font-medium'
                            }
                          >
                            {cp.isOverBudget
                              ? 'Melebihi batas pagu'
                              : 'Hampir mencapai batas'}
                          </span>
                        </>
                      ) : (
                        <span>{cp.percentage}% teralokasi</span>
                      )}
                    </span>
                    <span>
                      {isCritical || isWarning
                        ? remainingDaysLabel
                        : 'Pengeluaran terkendali'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 bg-surface rounded-2xl border border-dashed border-border text-center">
            <Target className="w-8 h-8 text-primary mx-auto mb-2 opacity-60" />
            <p className="text-xs font-semibold text-text-primary">
              Belum ada target per kategori
            </p>
            <p className="text-[11px] text-text-secondary mt-1 max-w-sm mx-auto">
              Anda dapat memasang target khusus untuk pos tertentu seperti Makan &amp; Minum, Transportasi, atau Belanja.
            </p>
          </div>
        )}
      </div>

      {/* 5. Banner Mindful Spending */}
      <div className="rounded-2xl bg-secondary/10 border border-secondary/25 p-4 flex items-start gap-3 text-xs text-text-primary leading-relaxed">
        <Sparkles className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
        <p>
          <strong className="text-secondary">Mindful Spending:</strong>{' '}
          Menetapkan pagu bukan untuk membatasi kenikmatan hidup, melainkan memberi ruang sadar bagi hal-hal yang benar-benar bermakna untuk masa depan Anda.
        </p>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted text-center">
        <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />
        <span>Perubahan otomatis tersinkronisasi offline di memori lokal.</span>
      </p>

      {/* Modal Setting Budget */}
      <BottomSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          selectedCategoryId === null
            ? 'Target Total Bulanan'
            : 'Target Anggaran Kategori'
        }
        description={`Atur batas pengeluaran untuk periode ${formatMonthYear(currentMonth)}`}
      >
        <form onSubmit={handleSaveBudget} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary">
              Tipe Target
            </label>
            <select
              value={selectedCategoryId || '__total__'}
              onChange={(e) =>
                setSelectedCategoryId(
                  e.target.value === '__total__' ? null : e.target.value
                )
              }
              className="h-11 px-3.5 rounded-xl border border-border bg-surface text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            >
              <option value="__total__">
                Target Keseluruhan Bulanan (Total)
              </option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <NumberInput
            label="Nominal Target (Rp)"
            variant="hero"
            value={targetAmount}
            onChange={(val) => setTargetAmount(val)}
            placeholder="0"
            autoFocus
          />

          <div className="flex items-center justify-end gap-3 pt-2">
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
