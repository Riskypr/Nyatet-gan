'use client';

import React, { useEffect, useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { NumberInput } from '@/components/ui/NumberInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { transferService } from '@/lib/services/transferService';
import { toISODateOnly } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { ArrowRightLeft } from 'lucide-react';

export function TransferModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { wallets } = useWalletStore();
  const { fetchMonthlyData, currentMonth } = useTransactionStore();
  const { showToast } = useUIStore();
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
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
    setAmount(0);
    setFee(0);
    setDate(toISODateOnly());
    setNote('');
    setError('');
  }, [isOpen, wallets]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!fromWalletId || !toWalletId) return setError('Pilih dompet asal dan tujuan.');
    if (fromWalletId === toWalletId) return setError('Dompet asal dan tujuan harus berbeda.');
    if (amount <= 0) return setError('Nominal transfer harus lebih dari 0.');
    if (fee < 0) return setError('Biaya admin tidak boleh negatif.');
    setIsSubmitting(true);
    try {
      await transferService.executeTransfer({ fromWalletId, toWalletId, amount, fee, date, note: note.trim() || undefined });
      await Promise.all([fetchMonthlyData(currentMonth), useWalletStore.getState().fetchWallets()]);
      showToast('Dana berhasil dipindahkan antar dompet!', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Gagal memindahkan dana.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Transfer Dana" description="Pindahkan saldo antar dompet atau sumber dana">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(['from', 'to'] as const).map((kind) => {
            const isFrom = kind === 'from';
            const selected = isFrom ? fromWalletId : toWalletId;
            const setter = isFrom ? setFromWalletId : setToWalletId;
            return (
              <div key={kind} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#2D2A26]">{isFrom ? 'Dari Dompet' : 'Ke Dompet'}</label>
                <div className="flex flex-col gap-2">
                  {wallets.map((wallet) => (
                    <button key={wallet.id} type="button" onClick={() => { setter(wallet.id); setError(''); }} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-xs font-medium transition-all', selected === wallet.id ? 'border-[#C86446] bg-[#C86446] text-white' : 'border-[#E5DCD0] bg-white text-[#2D2A26] hover:bg-[#FAF7F2]')}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selected === wallet.id ? '#FFF' : wallet.color }} />
                      <span className="truncate">{wallet.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {error && <p className="text-xs text-[#B0473C] font-medium">{error}</p>}
        <NumberInput label="Nominal Transfer" value={amount} onChange={setAmount} placeholder="0" autoFocus />
        <NumberInput label="Biaya Admin (Opsional)" value={fee} onChange={setFee} placeholder="0" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input type="date" label="Tanggal" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input type="text" label="Catatan (Opsional)" placeholder="Mis: Isi saldo e-wallet" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Batal</Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} className="gap-2"><ArrowRightLeft className="w-4 h-4" />Pindahkan Dana</Button>
        </div>
      </form>
    </BottomSheet>
  );
}
