# Design.md — UI/UX & Design System

## 1. Prinsip Desain
- **Mobile-first**: semua layout dirancang untuk layar ±360–430px terlebih dulu, lalu diperluas ke tablet/desktop.
- **Cepat & minim gesekan**: tambah transaksi harus bisa dilakukan dalam ≤ 3 tap dari layar mana pun (via tombol Floating Action Button).
- **Earth tone**: nuansa hangat, natural, dan tenang — cocok untuk konteks keuangan pribadi (mengurangi kesan "menegangkan" saat lihat pengeluaran).
- **Data-first, bukan dekoratif**: chart dan angka harus jelas terbaca, bukan hanya estetik.

## 2. Design Tokens

### 2.1 Warna (Base: Earth Tone)
```css
:root {
  /* Primary - warm terracotta/clay */
  --color-primary: #A8562D;
  --color-primary-dark: #7C3F20;
  --color-primary-light: #E8C4A0;

  /* Secondary - sage/olive green (aksen positif/pemasukan) */
  --color-secondary: #6B7C5A;
  --color-secondary-light: #B8C4A8;

  /* Alert - untuk pengeluaran/warning budget */
  --color-danger: #B0473C;
  --color-warning: #C98A3A;

  /* Neutral - cream & coklat tanah */
  --color-bg: #FAF6EF;          /* background utama */
  --color-surface: #FFFFFF;     /* card/surface */
  --color-surface-alt: #F0E6D8; /* card sekunder */
  --color-border: #E3D5C3;
  --color-text-primary: #3B2E23;
  --color-text-secondary: #7A6B5C;
  --color-text-muted: #A79683;
}
```

### 2.2 Tipografi
- **Font:** Google Sans Flex (variable font), fallback `system-ui, sans-serif`.
- Skala (mobile):
  - Display (saldo utama): 28px / bold
  - H1 (judul halaman): 20px / semibold
  - H2 (judul section/card): 16px / semibold
  - Body: 14px / regular
  - Caption/label: 12px / medium

### 2.3 Spacing & Radius
- Spacing scale (Tailwind default 4px base): 4, 8, 12, 16, 24, 32.
- Radius: card `rounded-2xl` (16px), button `rounded-xl` (12px), badge `rounded-full`.
- Shadow: lembut, `shadow-sm` warna coklat transparan (`shadow-[#3B2E23]/10`), hindari shadow hitam pekat agar tetap earthy.

## 3. Komponen Utama (Design System)

| Komponen | Deskripsi | Varian |
|---|---|---|
| `Button` | Primary (terracotta solid), Secondary (outline), Danger (hapus) | size: sm/md/lg |
| `Card` | Container surface dengan padding & radius konsisten | flat / elevated |
| `Input` / `NumberInput` | Input teks & nominal dengan format ribuan otomatis | default, error state |
| `SelectDompet` / `SelectKategori` | Dropdown/bottom-sheet pemilihan dompet & kategori (icon + warna) | — |
| `BottomNav` | Navigasi utama mobile (Dashboard, Transaksi, Tambah [FAB], Laporan, Setting) | 5 item, item tengah menonjol |
| `FAB` (Floating Action Button) | Tombol tambah transaksi cepat, warna primary, posisi fixed bottom-center | expense/income toggle |
| `TransactionItem` | Baris list transaksi: icon kategori, nama, tanggal, nominal (merah utk keluar/hijau utk masuk) | — |
| `BudgetProgressBar` | Progress bar target vs realisasi, berubah warna (hijau→kuning→merah) sesuai persentase terpakai | — |
| `ExpensePieChart` | Pie chart kategori pengeluaran, palet warna earth tone bervariasi (terracotta, olive, mustard, coklat tua) | interaktif (tap slice → detail) |
| `SearchBar` | Input pencarian + filter chip (kategori, dompet, tanggal) | expandable filter panel |
| `EmptyState` | Ilustrasi sederhana saat data kosong | — |
| `Modal` / `BottomSheet` | Untuk form tambah/edit di mobile menggunakan bottom-sheet (bukan modal tengah) agar ergonomis satu tangan | — |
| `Toast` | Notifikasi sukses/gagal (simpan, backup, restore) | success/error/info |

## 4. Struktur Navigasi (Mobile-first)

**Bottom Navigation (5 slot):**
1. 🏠 Dashboard
2. 📋 Transaksi (list + search)
3. ➕ Tambah (FAB menonjol, buka bottom-sheet pilih Pengeluaran/Pemasukan)
4. 📊 Laporan (pie chart, insight)
5. ⚙️ Setting (dompet, target, backup/restore)

## 5. Alur Pengguna Utama (User Flow)

### 5.1 Flow: Tambah Transaksi
```
BottomNav [+] 
  → Bottom Sheet: pilih "Pengeluaran" / "Pemasukan"
    → Form: nominal (numpad besar) → kategori → dompet → tanggal (default hari ini) → catatan (opsional)
      → Simpan → Toast sukses → kembali ke Dashboard (data ter-update)
```

### 5.2 Flow: Set Target Pengeluaran
```
Setting → Target Bulanan 
  → Pilih bulan aktif → Input target total dan/atau per kategori 
    → Simpan → Dashboard menampilkan progress bar
```

### 5.3 Flow: Cari Transaksi
```
Menu Transaksi → tap SearchBar 
  → ketik kata kunci dan/atau buka filter (kategori/dompet/tanggal) 
    → hasil list ter-filter realtime
```

### 5.4 Flow: Backup & Restore
```
Setting → Backup & Restore
  → [Backup]: tombol "Export Data" → file .json terunduh
  → [Restore]: tombol "Import Data" → pilih file → konfirmasi (peringatan: menimpa data saat ini) → sukses
```

## 6. Layout Dashboard (Wireframe Deskriptif — Mobile)
```
┌─────────────────────────────┐
│ Header: Bulan ◀ Sept 2026 ▶  │
├─────────────────────────────┤
│  Card Saldo Total (besar)    │
│  Pemasukan | Pengeluaran      │
├─────────────────────────────┤
│  Progress Target Bulanan      │
│  [██████░░░░] 60% terpakai    │
├─────────────────────────────┤
│  Daftar Dompet (scroll horiz) │
│  [Cash][BCA][GoPay][+]        │
├─────────────────────────────┤
│  Transaksi Terbaru (5 item)   │
│  → "Lihat semua"              │
├─────────────────────────────┤
│  BottomNav                    │
└─────────────────────────────┘
```

## 7. Aksesibilitas & Responsif
- Kontras teks minimal WCAG AA terhadap background `--color-bg` dan `--color-surface`.
- Target tap minimal 44x44px untuk semua elemen interaktif.
- Breakpoint Tailwind: mobile default (<640px) → `sm:` tablet kecil → `md:` tablet/desktop kecil (layout berubah jadi 2 kolom: sidebar + konten, BottomNav disembunyikan diganti sidebar).
