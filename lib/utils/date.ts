import { format, parseISO, addMonths, subMonths, isToday as checkToday, isYesterday as checkYesterday } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format tanggal tampilan standar: `d MMM yyyy` (mis. `14 Sep 2026`)
 */
export function formatDateDisplay(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'd MMM yyyy', { locale: id });
  } catch {
    return String(date);
  }
}

/**
 * Format bulan dan tahun untuk judul navigasi dashboard: `MMMM yyyy` (mis. `September 2026`)
 */
export function formatMonthYear(monthKey: string | Date): string {
  try {
    const d = typeof monthKey === 'string' 
      ? parseISO(monthKey.length === 7 ? `${monthKey}-01` : monthKey) 
      : monthKey;
    return format(d, 'MMMM yyyy', { locale: id });
  } catch {
    return String(monthKey);
  }
}

/**
 * Mendapatkan format bulan saat ini: `YYYY-MM`
 */
export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

/**
 * Mengambil bulan sebelumnya dari key `YYYY-MM`
 */
export function getPreviousMonth(monthKey: string): string {
  const d = parseISO(`${monthKey}-01`);
  return format(subMonths(d, 1), 'yyyy-MM');
}

/**
 * Mengambil bulan berikutnya dari key `YYYY-MM`
 */
export function getNextMonth(monthKey: string): string {
  const d = parseISO(`${monthKey}-01`);
  return format(addMonths(d, 1), 'yyyy-MM');
}

/**
 * Format tanggal ISO date-only: `YYYY-MM-DD`
 */
export function toISODateOnly(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Label ramah untuk kelompok tanggal transaksi
 */
export function formatGroupDateHeader(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    if (checkToday(d)) return 'Hari Ini';
    if (checkYesterday(d)) return 'Kemarin';
    return format(d, 'EEEE, d MMM yyyy', { locale: id });
  } catch {
    return dateStr;
  }
}
