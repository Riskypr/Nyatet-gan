'use client';

import React, { useState, useEffect } from 'react';
import { Wallet } from '@/lib/types';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Input } from '@/components/ui/Input';
import { NumberInput } from '@/components/ui/NumberInput';
import { Button } from '@/components/ui/Button';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { cn } from '@/lib/utils/cn';

export interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet?: Wallet | null;
}

const COLOR_OPTIONS = [
  '#C86446', // Primary: Terracotta Rust
  '#4A6B53', // Secondary: Sage / Forest Green
  '#A84D32', // Tertiary: Deep Burnt Sienna
  '#2D2A26', // Neutral: Charcoal Brown
  '#C98A3A', // Mustard
  '#3D7068', // Deep Teal
  '#405865', // Slate
  '#B0473C', // Clay Red
];

export function WalletModal({ isOpen, onClose, wallet }: WalletModalProps) {
  const { addWallet, updateWallet } = useWalletStore();
  const { showToast } = useUIStore();

  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState(0);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [icon] = useState('Wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (wallet) {
      setName(wallet.name);
      setInitialBalance(wallet.initialBalance);
      setColor(wallet.color || COLOR_OPTIONS[0]);
    } else {
      setName('');
      setInitialBalance(0);
      setColor(COLOR_OPTIONS[0]);
    }
    setError('');
  }, [wallet, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama dompet/rekening tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (wallet) {
        await updateWallet(wallet.id, {
          name: name.trim(),
          initialBalance,
          color,
          icon,
        });
        showToast('Dompet berhasil diperbarui!', 'success');
      } else {
        await addWallet({
          name: name.trim(),
          initialBalance,
          color,
          icon,
        });
        showToast('Dompet baru berhasil ditambahkan!', 'success');
      }
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan dompet.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={wallet ? 'Ubah Dompet' : 'Tambah Dompet Baru'}
      description="Kelola akun atau sumber dana (Cash, Rekening, E-Wallet)"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nama Dompet / Rekening"
          placeholder="Mis: Rekening BCA, GoPay, Tunai Dompet"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value) setError('');
          }}
          error={error}
          autoFocus
        />

        <NumberInput
          label="Saldo Awal"
          value={initialBalance}
          onChange={(val) => setInitialBalance(val)}
          placeholder="0"
          helperText="Saldo sebelum transaksi pertama kali dicatat di aplikasi"
        />

        {/* Pilihan Warna Earth Tone Baru */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#2D2A26]">Pilih Warna Identitas</label>
          <div className="flex gap-2.5 flex-wrap">
            {COLOR_OPTIONS.map((c) => {
              const isSelected = color === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-transform',
                    isSelected && 'ring-3 ring-offset-2 ring-[#C86446] scale-110'
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Pilih warna ${c}`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {wallet ? 'Simpan Perubahan' : 'Tambah Dompet'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
