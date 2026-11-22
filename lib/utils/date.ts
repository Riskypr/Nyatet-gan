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

/** Format bulan dan tahun ringkas untuk ruang sempit: `Nov 2026`. */
export function formatMonthYearShort(monthKey: string | Date): string {
  try {
    const d = typeof monthKey === 'string'
      ? parseISO(monthKey.length === 7 ? `${monthKey}-01` : monthKey)
      : monthKey;
    return format(d, 'MMM yyyy', { locale: id });
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

export interface WeekOption {
  id: string; // 'all' | 'w1' | 'w2' | 'w3' | 'w4' | 'w5'
  label: string; // 'Semua', 'Minggu 1', 'Minggu 2', ...
  rangeLabel: string; // '1 - 7 Nov'
  startDay: number;
  endDay: number;
  startDate: string; // 'YYYY-MM-01'
  endDate: string; // 'YYYY-MM-07'
}

/**
 * Menghasilkan daftar rentang minggu untuk bulan tertentu (YYYY-MM)
 */
export function getWeeksForMonth(monthKey: string): WeekOption[] {
  try {
    const [yearStr, monthStr] = monthKey.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();
    const d = parseISO(`${monthKey}-01`);
    const monthShort = format(d, 'MMM', { locale: id });

    const weeks: WeekOption[] = [
      {
        id: 'all',
        label: 'Semua',
        rangeLabel: '1 Bulan Penuh',
        startDay: 1,
        endDay: daysInMonth,
        startDate: `${monthKey}-01`,
        endDate: `${monthKey}-${String(daysInMonth).padStart(2, '0')}`,
      },
    ];

    const weekRanges = [
      { start: 1, end: 7, label: 'Minggu 1' },
      { start: 8, end: 14, label: 'Minggu 2' },
      { start: 15, end: 21, label: 'Minggu 3' },
      { start: 22, end: 28, label: 'Minggu 4' },
    ];

    if (daysInMonth > 28) {
      weekRanges.push({ start: 29, end: daysInMonth, label: 'Minggu 5' });
    }

    weekRanges.forEach((w, idx) => {
      const sDate = `${monthKey}-${String(w.start).padStart(2, '0')}`;
      const eDate = `${monthKey}-${String(w.end).padStart(2, '0')}`;
      weeks.push({
        id: `w${idx + 1}`,
        label: w.label,
        rangeLabel: `${w.start} - ${w.end} ${monthShort}`,
        startDay: w.start,
        endDay: w.end,
        startDate: sDate,
        endDate: eDate,
      });
    });

    return weeks;
  } catch {
    return [
      {
        id: 'all',
        label: 'Semua',
        rangeLabel: '1 Bulan Penuh',
        startDay: 1,
        endDay: 31,
        startDate: `${monthKey}-01`,
        endDate: `${monthKey}-31`,
      },
    ];
  }
}
