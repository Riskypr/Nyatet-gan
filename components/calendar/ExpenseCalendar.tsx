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
} from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Flame,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Info,
  ChevronDown,
  ChevronUp,
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
  onEditTransaction,
  onDeleteTransaction,
  onAddTransaction,
}: ExpenseCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(true);

  // Parse current month as Date
  const currentMonthDate = useMemo(() => {
    try {
      return parseISO(`${currentMonth}-01`);
    } catch {
      return new Date();
    }
  }, [currentMonth]);

  const todayStr = useMemo(() => toISODateOnly(new Date()), []);

  // Aggregate transactions (expenses + income) by date, filtering out transfers
  const { transactionsByDate, totalExpenseByDate, totalIncomeByDate, maxExpenseAmount, maxExpenseDates } = useMemo(() => {
    const txMap = new Map<string, Transaction[]>();
    const expenseMap = new Map<string, number>();
    const incomeMap = new Map<string, number>();

    transactions.forEach((tx) => {
      // Abaikan transaksi pemindahan dana/kas (transfer antar rekening/kas/dompet)
      const isInternalTransfer = Boolean(tx.transferPairId && tx.toWalletId);
      const cat = categories.get(tx.categoryId);
      const isTransferCategory = cat?.name === 'Transfer Keluar' || cat?.name === 'Transfer Masuk';
      const isTransferType = (tx.type as string) === 'transfer';

      if (isInternalTransfer || isTransferCategory || isTransferType) {
        return;
      }

      const list = txMap.get(tx.date) || [];
      list.push(tx);
      txMap.set(tx.date, list);

      if (tx.type === 'expense') {
        const currentTotal = expenseMap.get(tx.date) || 0;
        expenseMap.set(tx.date, currentTotal + tx.amount);
      } else if (tx.type === 'income') {
        const currentTotal = incomeMap.get(tx.date) || 0;
        incomeMap.set(tx.date, currentTotal + tx.amount);
      }
    });

    let maxAmount = 0;
    const maxDates = new Set<string>();

    expenseMap.forEach((amount, dateStr) => {
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
      transactionsByDate: txMap,
      totalExpenseByDate: expenseMap,
      totalIncomeByDate: incomeMap,
      maxExpenseAmount: maxAmount,
      maxExpenseDates: maxDates,
    };
  }, [transactions, currentMonth, categories]);

  // Generate grid days for current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Senin
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonthDate]);

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    setIsDetailOpen(true);
  };

  // Selected date details
  const selectedDateTransactions = selectedDate ? transactionsByDate.get(selectedDate) || [] : [];
  const selectedDateExpense = selectedDate ? totalExpenseByDate.get(selectedDate) || 0 : 0;
  const selectedDateIncome = selectedDate ? totalIncomeByDate.get(selectedDate) || 0 : 0;
  const isSelectedDatePeak = selectedDate ? maxExpenseDates.has(selectedDate) && maxExpenseAmount > 0 : false;
  const isSelectedDateToday = selectedDate === todayStr;

  return (
    <Card className="p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 border-border/80 shadow-xs">
      {/* Header Kalender — without month selector (already in Header) */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/70">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-xs">
            <CalendarIcon className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-text-primary">Kalender Transaksi</h3>
            <p className="hidden sm:block text-[11px] text-text-secondary">
              Pantau ritme pemasukan dan belanja harian Anda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {maxExpenseAmount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-danger/15 text-danger text-[11px] font-semibold border border-danger/25">
              <Flame className="w-3.5 h-3.5 fill-danger" />
              <span>Puncak: {formatRupiah(maxExpenseAmount)}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsCalendarVisible((visible) => !visible)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={isCalendarVisible ? 'Sembunyikan kalender' : 'Tampilkan kalender'}
            aria-expanded={isCalendarVisible}
            title={isCalendarVisible ? 'Sembunyikan kalender' : 'Tampilkan kalender'}
          >
            {isCalendarVisible ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
          isCalendarVisible ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
        aria-hidden={!isCalendarVisible}
      >
        <div className="min-h-0 overflow-hidden flex flex-col gap-3 sm:gap-4" inert={!isCalendarVisible}>
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
          const totalIncome = totalIncomeByDate.get(dateStr) || 0;
          const hasExpense = totalExpense > 0;
          const hasIncome = totalIncome > 0;
          const hasTransaction = hasExpense || hasIncome;
          const isPeakExpense = isCurrentMonthDay && maxExpenseAmount > 0 && maxExpenseDates.has(dateStr);
          const isSelected = selectedDate === dateStr && isDetailOpen;

          const formatShortAmount = (amount: number) => {
            if (amount >= 1000000) return `${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}jt`;
            if (amount >= 1000) return `${Math.round(amount / 1000)}k`;
            return `${amount}`;
          };

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => handleDayClick(day)}
              className={cn(
                'relative flex flex-col items-center justify-between p-1 sm:p-2 rounded-xl sm:rounded-2xl min-h-[56px] sm:min-h-[58px] transition-all duration-150 cursor-pointer select-none text-left',
                // Non-current month styling
                !isCurrentMonthDay && 'opacity-20 pointer-events-none bg-transparent',
                // Default current month cell
                isCurrentMonthDay && !isPeakExpense && !isTodayDay && 'bg-surface-alt/60 hover:bg-surface-alt border border-border/80 hover:border-primary/50',
                // Hari Ini
                isCurrentMonthDay && isTodayDay && !isPeakExpense && 'bg-primary/15 border-2 border-primary shadow-xs hover:bg-primary/20',
                // Pengeluaran Terbanyak
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

              {/* Transaction Indicator / Amount Preview */}
              <div className="w-full mt-auto flex flex-col items-center justify-end gap-0">
                {hasTransaction && isCurrentMonthDay ? (
                  <div className="w-full text-center flex flex-col">
                    {hasIncome && (
                      <span
                        className={cn(
                          'block text-[8px] sm:text-[9px] font-extrabold truncate leading-tight',
                          isPeakExpense ? 'text-green-200' : 'text-secondary'
                        )}
                      >
                        +{formatShortAmount(totalIncome)}
                      </span>
                    )}
                    {hasExpense && (
                      <span
                        className={cn(
                          'block text-[8px] sm:text-[9px] font-extrabold truncate leading-tight',
                          isPeakExpense ? 'text-white/95' : 'text-danger'
                        )}
                      >
                        -{formatShortAmount(totalExpense)}
                      </span>
                    )}
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
            <span className="font-semibold text-danger">Puncak Belanja</span>
          </div>

          {/* Pemasukan */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-secondary text-[10px]">+5k</span>
            <span>Pemasukan</span>
          </div>

          {/* Pengeluaran */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-danger text-[10px]">-15k</span>
            <span>Pengeluaran</span>
          </div>
        </div>

        <span className="text-[10px] text-text-muted italic hidden xs:inline">
          * Klik tanggal untuk melihat rincian
        </span>
      </div>
        </div>
      </div>

      {/* BottomSheet Rincian Transaksi Tanggal Terpilih */}
      <BottomSheet
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedDate ? formatDateDisplay(selectedDate) : 'Detail Transaksi'}
        description={
          selectedDate && isSelectedDateToday
            ? 'Transaksi Anda hari ini'
            : selectedDate
            ? `Riwayat transaksi pada ${format(parseISO(selectedDate), 'EEEE', { locale: id })}`
            : undefined
        }
      >
        <div className="flex flex-col gap-4">
          {/* Summary Card Hari Terpilih */}
          <div
            className={cn(
              'p-4 rounded-2xl border flex flex-col gap-2 transition-all',
              isSelectedDatePeak
                ? 'bg-danger/10 border-danger/30'
                : 'bg-surface-alt border-border'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-secondary">Ringkasan Hari Ini</span>
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
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-surface border border-border text-text-primary shadow-xs">
                {selectedDateTransactions.length} transaksi
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
                  <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted">Pemasukan</p>
                  <p className="text-sm font-bold text-secondary">{formatRupiah(selectedDateIncome)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-danger/15 text-danger flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted">Pengeluaran</p>
                  <p className="text-sm font-bold text-danger">{formatRupiah(selectedDateExpense)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* List Item Transaksi */}
          {selectedDateTransactions.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-text-secondary px-1">
                <span>Daftar Transaksi</span>
                <span>Nominal</span>
              </div>
              {selectedDateTransactions.map((tx) => (
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
              <p className="text-sm font-bold text-text-primary">Tidak Ada Transaksi</p>
              <p className="text-xs text-text-secondary mt-0.5 max-w-xs">
                Tidak ada catatan transaksi pada tanggal ini.
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
                  <span>Catat Transaksi</span>
                </Button>
              )}
            </div>
          )}

          {/* Action button: Catat transaksi tambahan */}
          {selectedDateTransactions.length > 0 && onAddTransaction && (
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
              <span>Tambah Transaksi</span>
            </Button>
          )}
        </div>
      </BottomSheet>
    </Card>
  );
}
