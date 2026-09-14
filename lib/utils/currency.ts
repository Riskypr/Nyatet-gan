/**
 * Utility mata uang Rupiah sesuai spesifikasi Rules.md:
 * - Format: `Rp` + pemisah ribuan titik, tanpa desimal (contoh: `Rp 150.000`)
 * - Angka negatif diformat seperti `-Rp 50.000`
 */

export function formatRupiah(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.round(Math.abs(amount));
  const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${isNegative ? '-' : ''}Rp ${formatted}`;
}

/**
 * Format angka ribuan tanpa prefix 'Rp ' (untuk input form)
 */
export function formatThousands(val: number | string): string {
  if (val === '' || val === null || val === undefined) return '';
  const numStr = val.toString().replace(/\D/g, '');
  if (!numStr) return '';
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Mengubah string format ribuan ke tipe number
 */
export function parseRupiahInput(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/\D/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}
