'use client';

import React, { useState, useMemo } from 'react';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  ArrowUpRight,
  Plus,
  Info,
} from 'lucide-react';
import { Transaction, Category, Wallet } from '@/lib/types';
import { formatRupiah } from '@/lib/utils/currency';
import { formatDateDisplay, toISODateOnly } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { TransactionItem } from '@/components/transactions/TransactionItem';

export interface ExpenseCalendarProps {
  transactions: Transaction[];
  categories: Map<string, Category>;
  wallets: Map<string, Wallet>;
  currentMonth: string; // YYYY-MM
  onMonthChange?: (month: string) => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onAddTransaction?: (type: 'expense' | 'income') => void;
}

const WEEKDAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function ExpenseCalendar({
  transactions,
  categories,
  wallets,
  currentMonth,
  onMonthChange,
  onEditTransaction,
  onDeleteTransaction,
  onAddTransaction,
}: ExpenseCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Parse current month as Date
  const currentMonthDate = useMemo(() => {
    try {
      return parseISO(`${currentMonth}-01`);
    } catch {
      return new Date();
    }
  }, [currentMonth]);

  const todayStr = useMemo(() => toISODateOnly(new Date()), []);

  // Aggregate expenses by date
  const { expensesByDate, totalExpenseByDate, maxExpenseAmount, maxExpenseDates } = useMemo(() => {
    const expensesMap = new Map<string, Transaction[]>();
    const totalMap = new Map<string, number>();

    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        const list = expensesMap.get(tx.date) || [];
        list.push(tx);
        expensesMap.set(tx.date, list);

        const currentTotal = totalMap.get(tx.date) || 0;
        totalMap.set(tx.date, currentTotal + tx.amount);
      }
    });

    let maxAmount = 0;
    const maxDates = new Set<string>();

    totalMap.forEach((amount, dateStr) => {
      // Hanya bandingkan tanggal yang masuk ke dalam bulan yang sedang aktif
      if (dateStr.startsWith(currentMonth) && amount > 0) {
        if (amount > maxAmount) {
          maxAmount = amount;
          maxDates.clear();
          maxDates.add(dateStr);
        } else if (amount === maxAmount) {
          maxDates.add(dateStr);
        }
      }
    });

    return {
      expensesByDate: expensesMap,
      totalExpenseByDate: totalMap,
      maxExpenseAmount: maxAmount,
      maxExpenseDates: maxDates,
    };
  }, [transactions, currentMonth]);

  // Generate grid days for current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Senin
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonthDate]);

  const handlePrevMonth = () => {
    if (onMonthChange) {
      const prev = subMonths(currentMonthDate, 1);
      onMonthChange(format(prev, 'yyyy-MM'));
    }
  };

  const handleNextMonth = () => {
    if (onMonthChange) {
      const next = addMonths(currentMonthDate, 1);
      onMonthChange(format(next, 'yyyy-MM'));
    }
  };

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    setIsDetailOpen(true);
  };

  // Selected date details
  const selectedDateExpenses = selectedDate ? expensesByDate.get(selectedDate) || [] : [];
  const selectedDateTotal = selectedDate ? totalExpenseByDate.get(selectedDate) || 0 : 0;
  const isSelectedDatePeak = selectedDate ? maxExpenseDates.has(selectedDate) && maxExpenseAmount > 0 : false;
  const isSelectedDateToday = selectedDate === todayStr;

  return (
    <Card className="p-4 sm:p-5 flex flex-col gap-4 border-border/80 shadow-xs">
      {/* Header Kalender */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-xs">
            <CalendarIcon className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">Kalender Pengeluaran</h3>
            <p className="text-[11px] text-text-secondary">
              Pantau ritme dan puncak belanja harian Anda
            </p>
          </div>
        </div>

        {/* Month selector & highest spending badge */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {maxExpenseAmount > 0 && (
            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-danger/15 text-danger text-[11px] font-semibold border border-danger/25">
              <Flame className="w-3.5 h-3.5 fill-danger" />
              <span>Puncak: {formatRupiah(maxExpenseAmount)}</span>
            </div>
          )}

          <div className="flex items-center gap-1 bg-surface-alt border border-border rounded-xl px-1.5 py-0.5">
            <button
              onClick={handlePrevMonth}
              aria-label="Bulan sebelumnya"
              className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-text-primary px-1.5 min-w-[100px] text-center">
              {format(currentMonthDate, 'MMMM yyyy', { locale: id })}
            </span>
            <button
              onClick={handleNextMonth}
              aria-label="Bulan berikutnya"
              className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_NAMES.map((day, idx) => (
          <div
            key={day}
            className={cn(
              'text-[11px] font-semibold py-1',
              idx >= 5 ? 'text-danger' : 'text-text-secondary'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {calendarDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonthDay = isSameMonth(day, currentMonthDate);
          const isTodayDay = isSameDay(day, new Date());
          const totalExpense = totalExpenseByDate.get(dateStr) || 0;
          const hasExpense = totalExpense > 0;
          const isPeakExpense = isCurrentMonthDay && maxExpenseAmount > 0 && maxExpenseDates.has(dateStr);
          const isSelected = selectedDate === dateStr && isDetailOpen;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => handleDayClick(day)}
              className={cn(
                'relative flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-2xl min-h-[52px] sm:min-h-[58px] transition-all duration-150 cursor-pointer select-none text-left',
                // Non-current month styling
                !isCurrentMonthDay && 'opacity-20 pointer-events-none bg-transparent',
                // Default current month cell
                isCurrentMonthDay && !isPeakExpense && !isTodayDay && 'bg-surface-alt/60 hover:bg-surface-alt border border-border/80 hover:border-primary/50',
                // Hari Ini (Terracotta accent)
                isCurrentMonthDay && isTodayDay && !isPeakExpense && 'bg-primary/15 border-2 border-primary shadow-xs hover:bg-primary/20',
                // Pengeluaran Terbanyak (Bold Crimson / Maroon styling)
                isCurrentMonthDay && isPeakExpense && !isTodayDay && 'bg-danger text-white border-2 border-danger/80 shadow-sm shadow-danger/25 hover:brightness-105',
                // Both Hari Ini & Pengeluaran Terbanyak
                isCurrentMonthDay && isPeakExpense && isTodayDay && 'bg-danger text-white border-2 border-primary ring-2 ring-primary shadow-sm shadow-danger/30',
                // Selected border highlight
                isSelected && 'ring-2 ring-text-primary'
              )}
            >
              {/* Day header: number + badges */}
              <div className="w-full flex items-center justify-between">
                <span
                  className={cn(
                    'text-xs font-bold leading-none',
                    isPeakExpense ? 'text-white' : isTodayDay ? 'text-primary' : 'text-text-primary'
                  )}
                >
                  {format(day, 'd')}
                </span>

                {/* Badge Pengeluaran Terbanyak / Hari ini */}
                <div className="flex items-center gap-0.5">
                  {isPeakExpense && (
                    <Flame
                      className={cn(
                        'w-3 h-3',
                        isPeakExpense ? 'text-[#FFD700] fill-[#FFD700]' : 'text-danger'
                      )}
                      aria-label="Pengeluaran Terbanyak"
                    />
                  )}
                  {isTodayDay && !isPeakExpense && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" title="Hari ini" />
                  )}
                </div>
              </div>

              {/* Expense Indicator / Amount Preview */}
              <div className="w-full mt-auto flex flex-col items-center justify-end">
                {hasExpense && isCurrentMonthDay ? (
                  <div className="w-full text-center">
                    <span
                      className={cn(
                        'block text-[9px] sm:text-[10px] font-extrabold truncate leading-tight',
                        isPeakExpense ? 'text-white/95' : 'text-danger'
                      )}
                    >
                      {totalExpense >= 1000000
                        ? `${(totalExpense / 1000000).toFixed(totalExpense % 1000000 === 0 ? 0 : 1)}jt`
                        : totalExpense >= 1000
                        ? `${Math.round(totalExpense / 1000)}k`
                        : `${totalExpense}`}
                    </span>
                  </div>
                ) : isCurrentMonthDay ? (
                  <span className="text-[9px] text-text-muted leading-none pb-0.5">-</span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legenda Keterangan Warna */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/70 text-[11px] text-text-secondary">
        <div className="flex flex-wrap items-center gap-3">
          {/* Hari Ini */}
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-primary/15 border-2 border-primary" />
            <span>Hari Ini</span>
          </div>

          {/* Pengeluaran Terbanyak */}
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-danger flex items-center justify-center text-white">
              <Flame className="w-2.5 h-2.5 fill-[#FFD700] text-[#FFD700]" />
            </div>
            <span className="font-semibold text-danger">Pengeluaran Terbanyak</span>
          </div>

          {/* Hari dengan Belanja */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-danger text-[10px]">15k</span>
            <span>Ada Pengeluaran</span>
          </div>
        </div>

        <span className="text-[10px] text-text-muted italic hidden xs:inline">
          * Klik tanggal untuk melihat rincian
        </span>
      </div>

      {/* BottomSheet Rincian Pengeluaran Tanggal Terpilih */}
      <BottomSheet
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedDate ? formatDateDisplay(selectedDate) : 'Detail Transaksi'}
        description={
          selectedDate && isSelectedDateToday
            ? 'Pengeluaran Anda hari ini'
            : selectedDate
            ? `Riwayat belanja pada ${format(parseISO(selectedDate), 'EEEE', { locale: id })}`
            : undefined
        }
      >
        <div className="flex flex-col gap-4">
          {/* Summary Card Hari Terpilih */}
          <div
            className={cn(
              'p-4 rounded-2xl border flex items-center justify-between transition-all',
              isSelectedDatePeak
                ? 'bg-gradient-to-r from-danger/15 via-danger/5 to-transparent border-danger/30'
                : 'bg-surface-alt border-border'
            )}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-secondary">Total Belanja Hari Ini</span>
                {isSelectedDatePeak && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger text-white text-[10px] font-bold shadow-xs">
                    <Flame className="w-3 h-3 fill-[#FFD700] text-[#FFD700]" />
                    Puncak Bulan Ini
                  </span>
                )}
                {isSelectedDateToday && !isSelectedDatePeak && (
                  <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                    Hari Ini
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-extrabold text-text-primary">
                {formatRupiah(selectedDateTotal)}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-surface border border-border text-text-primary shadow-xs">
                {selectedDateExpenses.length} transaksi
              </span>
            </div>
          </div>

          {/* List Item Pengeluaran */}
          {selectedDateExpenses.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-text-secondary px-1">
                <span>Daftar Pengeluaran</span>
                <span>Nominal</span>
              </div>
              {selectedDateExpenses.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  category={categories.get(tx.categoryId)}
                  wallet={wallets.get(tx.walletId)}
                  onEdit={() => {
                    setIsDetailOpen(false);
                    if (onEditTransaction) onEditTransaction(tx);
                  }}
                  onDelete={(id) => {
                    if (onDeleteTransaction) onDeleteTransaction(id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center bg-surface rounded-2xl border border-dashed border-border">
              <div className="w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center text-text-secondary mb-2">
                <Info className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-text-primary">Tidak Ada Pengeluaran</p>
              <p className="text-xs text-text-secondary mt-0.5 max-w-xs">
                Tidak ada catatan pengeluaran pada tanggal ini.
              </p>
              {onAddTransaction && (
                <Button
                  size="sm"
                  variant="primary"
                  className="mt-3.5 flex items-center gap-1.5"
                  onClick={() => {
                    setIsDetailOpen(false);
                    onAddTransaction('expense');
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Catat Pengeluaran</span>
                </Button>
              )}
            </div>
          )}

          {/* Action button: Catat pengeluaran tambahan */}
          {selectedDateExpenses.length > 0 && onAddTransaction && (
            <Button
              size="sm"
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 mt-1"
              onClick={() => {
                setIsDetailOpen(false);
                onAddTransaction('expense');
              }}
            >
              <Plus className="w-4 h-4 text-primary" />
              <span>Tambah Pengeluaran</span>
            </Button>
          )}
        </div>
      </BottomSheet>
    </Card>
  );
}
