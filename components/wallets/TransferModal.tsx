'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { NumberInput } from '@/components/ui/NumberInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { transferService } from '@/lib/services/transferService';
import { formatRupiah } from '@/lib/utils/currency';
import { formatDateDisplay, toISODateOnly } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Clock,
  Info,
  Receipt,
} from 'lucide-react';

const QUICK_AMOUNTS = [
  { label: '+50rb', value: 50_000 },
  { label: '+100rb', value: 100_000 },
  { label: '+500rb', value: 500_000 },
];

const FEE_PRESETS = [
  { label: 'Gratis (Rp 0)', value: 0 },
  { label: 'Rp 1.000', value: 1_000 },
  { label: 'Rp 2.000', value: 2_000 },
  { label: 'Rp 2.500', value: 2_500 },
];

export function TransferModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { wallets } = useWalletStore();
  const { fetchMonthlyData, currentMonth } = useTransactionStore();
  const { showToast } = useUIStore();

  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [pickingSide, setPickingSide] = useState<'from' | 'to' | null>(null);
  const [amount, setAmount] = useState(0);
  const [fee, setFee] = useState(0);
  const [date, setDate] = useState(toISODateOnly());
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFromWalletId(wallets[0]?.id || '');
    setToWalletId(wallets[1]?.id || '');
    setPickingSide(null);
    setAmount(0);
    setFee(0);
    setDate(toISODateOnly());
    setNote('');
    setError('');
  }, [isOpen, wallets]);

  const fromWallet = useMemo(
    () => wallets.find((w) => w.id === fromWalletId) || null,
    [wallets, fromWalletId]
  );
  const toWallet = useMemo(
    () => wallets.find((w) => w.id === toWalletId) || null,
    [wallets, toWalletId]
  );

  const handleSwapWallets = () => {
    if (!fromWalletId || !toWalletId) return;
    const prevFrom = fromWalletId;
    setFromWalletId(toWalletId);
    setToWalletId(prevFrom);
    setError('');
  };

  const handleSelectWallet = (side: 'from' | 'to', id: string) => {
    if (side === 'from') {
      if (id === toWalletId && fromWalletId) {
        setToWalletId(fromWalletId);
      }
      setFromWalletId(id);
    } else {
      if (id === fromWalletId && toWalletId) {
        setFromWalletId(toWalletId);
      }
      setToWalletId(id);
    }
    setPickingSide(null);
    setError('');
  };

  const maxTransferable = fromWallet
    ? Math.max(0, fromWallet.currentBalance - fee)
    : 0;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!fromWalletId || !toWalletId) {
      return setError('Pilih dompet asal dan tujuan.');
    }
    if (fromWalletId === toWalletId) {
      return setError('Dompet asal dan tujuan harus berbeda.');
    }
    if (amount <= 0) {
      return setError('Nominal transfer harus lebih dari 0.');
    }
    if (fee < 0) {
      return setError('Biaya admin tidak boleh negatif.');
    }

    setIsSubmitting(true);
    try {
      await transferService.executeTransfer({
        fromWalletId,
        toWalletId,
        amount,
        fee,
        date,
        note: note.trim() || undefined,
      });
      await Promise.all([
        fetchMonthlyData(currentMonth),
        useWalletStore.getState().fetchWallets(),
      ]);
      showToast('Dana berhasil dipindahkan antar dompet!', 'success');
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Gagal memindahkan dana.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickTargetWallets = useMemo(
    () => wallets.filter((w) => w.id !== fromWalletId),
    [wallets, fromWalletId]
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Pindah Saldo Antar-Dompet"
      description="Transfer internal tanpa mempengaruhi catatan pemasukan/pengeluaran riil"
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {/* 1. Kartu Dari Sumber <-> Ke Tujuan */}
        <div className="rounded-2xl bg-surface-alt/50 border border-border/60 p-3.5 flex flex-col gap-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            {/* Dari Sumber */}
            <button
              type="button"
              onClick={() =>
                setPickingSide(pickingSide === 'from' ? null : 'from')
              }
              className={cn(
                'rounded-2xl bg-surface border p-2.5 text-left transition-all cursor-pointer min-w-0',
                pickingSide === 'from'
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border/80 hover:border-primary/40'
              )}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                  Dari Sumber
                </span>
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: fromWallet?.color || '#0A66C2' }}
                />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <CategoryIcon
                  name={fromWallet?.icon || 'Wallet'}
                  color={fromWallet?.color || '#0A66C2'}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">
                    {fromWallet?.name || 'Pilih'}
                  </p>
                  <p className="text-[11px] font-medium text-text-secondary truncate">
                    {fromWallet ? formatRupiah(fromWallet.currentBalance) : '-'}
                  </p>
                </div>
              </div>
            </button>

            {/* Tombol Tukar */}
            <button
              type="button"
              onClick={handleSwapWallets}
              className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-sm hover:bg-primary/90 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Tukar dompet asal dan tujuan"
              aria-label="Tukar dompet asal dan tujuan"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            {/* Ke Tujuan */}
            <button
              type="button"
              onClick={() =>
                setPickingSide(pickingSide === 'to' ? null : 'to')
              }
              className={cn(
                'rounded-2xl bg-surface border p-2.5 text-left transition-all cursor-pointer min-w-0',
                pickingSide === 'to'
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border/80 hover:border-primary/40'
              )}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                  Ke Tujuan
                </span>
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: toWallet?.color || '#057642' }}
                />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <CategoryIcon
                  name={toWallet?.icon || 'Wallet'}
                  color={toWallet?.color || '#057642'}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">
                    {toWallet?.name || 'Pilih'}
                  </p>
                  <p className="text-[11px] font-medium text-text-secondary truncate">
                    {toWallet ? formatRupiah(toWallet.currentBalance) : '-'}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Picker Dropdown Inline jika salah satu kotak diklik */}
          {pickingSide && (
            <div className="rounded-xl bg-surface border border-border p-2.5 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-text-secondary">
                {pickingSide === 'from'
                  ? 'Pilih Dompet Sumber:'
                  : 'Pilih Dompet Tujuan:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {wallets.map((w) => {
                  const isActive =
                    pickingSide === 'from'
                      ? w.id === fromWalletId
                      : w.id === toWalletId;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleSelectWallet(pickingSide, w.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer',
                        isActive
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface-alt text-text-primary border-border/70 hover:border-primary/40'
                      )}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: isActive ? '#FFF' : w.color }}
                      />
                      <span>{w.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pilihan Cepat Tujuan */}
          {quickTargetWallets.length > 0 && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50 flex-wrap">
              <span className="text-[11px] text-text-secondary">
                Pilihan cepat tujuan:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {quickTargetWallets.map((w) => {
                  const isTarget = w.id === toWalletId;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleSelectWallet('to', w.id)}
                      className={cn(
                        'px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer',
                        isTarget
                          ? 'bg-primary/15 text-primary border-primary/40'
                          : 'bg-surface text-text-secondary border-border/70 hover:text-text-primary'
                      )}
                    >
                      {w.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. Kartu Nominal Transfer */}
        <div className="rounded-2xl bg-surface-alt/50 border border-border/60 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Nominal Transfer
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
              <Receipt className="w-3 h-3" />
              Biaya Admin: {formatRupiah(fee)}
            </span>
          </div>

          <NumberInput
            variant="hero"
            value={amount}
            onChange={(val) => {
              setAmount(val);
              setError('');
            }}
            placeholder="0"
            autoFocus
            className="py-1"
          />

          {/* Quick Add & Maksimal */}
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setAmount((prev) => prev + item.value);
                  setError('');
                }}
                className="py-2 px-2 rounded-xl bg-surface border border-border/80 hover:border-primary/40 hover:bg-primary/5 text-xs font-bold text-text-primary transition-all cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setAmount(maxTransferable);
                setError('');
              }}
              className="py-2 px-1.5 rounded-xl bg-surface border border-border/80 hover:border-primary/40 hover:bg-primary/5 text-[11px] font-bold text-primary transition-all cursor-pointer leading-tight"
            >
              Semua (Maks)
            </button>
          </div>
        </div>

        {/* 3. Kartu Biaya Admin & Ringkasan */}
        <div className="rounded-2xl bg-surface-alt/50 border border-border/60 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-text-primary">
              <Receipt className="w-4 h-4 text-primary" />
              Biaya Admin Transfer
            </span>
            <div className="w-32">
              <NumberInput
                value={fee}
                onChange={(val) => {
                  setFee(val);
                  setError('');
                }}
                placeholder="0"
                className="!h-9 text-sm text-right"
              />
            </div>
          </div>

          {/* Preset Biaya Admin */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {FEE_PRESETS.map((preset) => {
              const isSelected = fee === preset.value;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setFee(preset.value)}
                  className={cn(
                    'py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border',
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface text-text-secondary border-border/70 hover:text-text-primary'
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Info Note Biaya Admin */}
          <div className="rounded-xl bg-surface border border-border/70 p-2.5 flex items-start gap-2 text-[11px] text-text-secondary leading-relaxed">
            <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span>
              Biaya admin dicatat otomatis sebagai pengeluaran terpisah &amp; dipotong dari saldo dompet sumber (
              <strong className="text-text-primary">
                {fromWallet?.name || 'Sumber'}
              </strong>
              ).
            </span>
          </div>

          {/* Ringkasan Keluar / Masuk / Waktu */}
          <div className="flex flex-col gap-1.5 pt-1 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-text-secondary truncate">
                <ArrowUpRight className="w-3.5 h-3.5 text-danger shrink-0" />
                Total Keluar dari {fromWallet?.name || 'Sumber'}
              </span>
              <span className="font-bold text-danger shrink-0">
                {formatRupiah(amount + fee)}{' '}
                <span className="text-[10px] font-normal text-text-muted">
                  (pokok + admin)
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-text-secondary truncate">
                <ArrowDownLeft className="w-3.5 h-3.5 text-secondary shrink-0" />
                Total Masuk ke {toWallet?.name || 'Tujuan'}
              </span>
              <span className="font-bold text-secondary shrink-0">
                {formatRupiah(amount)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-text-secondary">
                <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
                Tanggal Eksekusi
              </span>
              <span className="font-semibold text-text-primary">
                {date === toISODateOnly()
                  ? `Hari ini, ${formatDateDisplay(date)}`
                  : formatDateDisplay(date)}
              </span>
            </div>
          </div>

          {/* Tanggal & Catatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-border/50">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Catatan (Opsional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-danger font-semibold text-center">
            {error}
          </p>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="gap-2 flex-1 sm:flex-initial"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Pindahkan Dana</span>
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
