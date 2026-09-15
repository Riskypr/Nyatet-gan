import { db } from '../db/dexie';
import { TransferPayload, Transaction, Wallet } from '../types';
import { walletService } from './walletService';
import { categoryService } from './categoryService';

export const transferService = {
  /**
   * Helper untuk mendapatkan atau membuat kategori transfer
   */
  async getTransferCategories() {
    const categories = await categoryService.getAll();

    let outCat = categories.find((c) => c.name === 'Transfer Keluar' && c.type === 'expense');
    if (!outCat) {
      outCat = await categoryService.create({
        name: 'Transfer Keluar',
        type: 'expense',
        icon: 'ArrowRightLeft',
        color: '#A84D32',
      });
    }

    let inCat = categories.find((c) => c.name === 'Transfer Masuk' && c.type === 'income');
    if (!inCat) {
      inCat = await categoryService.create({
        name: 'Transfer Masuk',
        type: 'income',
        icon: 'ArrowRightLeft',
        color: '#3D7068',
      });
    }

    let feeCat = categories.find((c) => c.name === 'Biaya Admin Transfer' && c.type === 'expense');
    if (!feeCat) {
      feeCat = await categoryService.create({
        name: 'Biaya Admin Transfer',
        type: 'expense',
        icon: 'Receipt',
        color: '#B0473C',
      });
    }

    return { outCat, inCat, feeCat };
  },

  /**
   * Eksekusi transfer antar dompet
   */
  async executeTransfer(payload: TransferPayload): Promise<{ outTx: Transaction; inTx: Transaction; feeTx?: Transaction }> {
    const { fromWalletId, toWalletId, amount, fee = 0, date, note } = payload;

    if (fromWalletId === toWalletId) {
      throw new Error('Dompet asal dan dompet tujuan tidak boleh sama.');
    }

    if (amount <= 0) {
      throw new Error('Nominal transfer harus lebih dari 0.');
    }

    const fromWallet = await db.wallets.get(fromWalletId);
    const toWallet = await db.wallets.get(toWalletId);

    if (!fromWallet || !toWallet) {
      throw new Error('Dompet asal atau dompet tujuan tidak ditemukan.');
    }

    const { outCat, inCat, feeCat } = await this.getTransferCategories();
    const now = new Date().toISOString();
    const transferPairId = `pair-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const outTxId = `tx-tr-out-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const inTxId = `tx-tr-in-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;

    const baseNoteOut = note ? `Transfer ke ${toWallet.name}: ${note}` : `Transfer ke ${toWallet.name}`;
    const baseNoteIn = note ? `Transfer dari ${fromWallet.name}: ${note}` : `Transfer dari ${fromWallet.name}`;

    const outTx: Transaction = {
      id: outTxId,
      walletId: fromWalletId,
      categoryId: outCat.id,
      type: 'expense',
      amount,
      date,
      note: baseNoteOut,
      transferPairId,
      toWalletId,
      createdAt: now,
      updatedAt: now,
    };

    const inTx: Transaction = {
      id: inTxId,
      walletId: toWalletId,
      categoryId: inCat.id,
      type: 'income',
      amount,
      date,
      note: baseNoteIn,
      transferPairId,
      toWalletId: fromWalletId,
      createdAt: now,
      updatedAt: now,
    };

    let feeTx: Transaction | undefined = undefined;
    if (fee > 0) {
      const feeTxId = `tx-tr-fee-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      feeTx = {
        id: feeTxId,
        walletId: fromWalletId,
        categoryId: feeCat.id,
        type: 'expense',
        amount: fee,
        date,
        note: `Biaya admin transfer ke ${toWallet.name}`,
        transferPairId,
        createdAt: now,
        updatedAt: now,
      };
    }

    // Tulis ke database secara terisolasi (transaction)
    await db.transaction('rw', [db.transactions, db.wallets], async () => {
      await db.transactions.add(outTx);
      await db.transactions.add(inTx);
      if (feeTx) {
        await db.transactions.add(feeTx);
      }
    });

    // Rekalkulasi saldo berjalan dompet
    await walletService.recalculateBalance(fromWalletId);
    await walletService.recalculateBalance(toWalletId);

    return { outTx, inTx, feeTx };
  },

  /**
   * Menghapus seluruh transaksi berpasangan transfer (Expense, Income, dan Biaya Admin bila ada)
   */
  async deleteTransferPair(transferPairId: string): Promise<void> {
    const pairedTxs = await db.transactions.where('transferPairId').equals(transferPairId).toArray();
    if (pairedTxs.length === 0) return;

    const affectedWalletIds = new Set<string>();
    pairedTxs.forEach((tx) => affectedWalletIds.add(tx.walletId));

    await db.transaction('rw', [db.transactions, db.wallets], async () => {
      for (const tx of pairedTxs) {
        await db.transactions.delete(tx.id);
      }
    });

    for (const wId of affectedWalletIds) {
      await walletService.recalculateBalance(wId);
    }
  },
};
