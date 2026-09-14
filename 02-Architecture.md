# Architecture.md — Aplikasi Pencatatan Keuangan Pribadi

## 1. Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| Framework | Next.js 14+ (App Router, TypeScript) | SSR/SSG untuk shell PWA cepat, routing built-in |
| Styling | Tailwind CSS | Utility-first, cepat untuk mobile-first design |
| Font | Google Sans Flex (self-host / next/font) | Sesuai identitas visual |
| State Management | Zustand | Ringan, cocok untuk state client-side (dompet, transaksi aktif, filter) |
| Local Database | IndexedDB via **Dexie.js** | Persisten, mendukung query & index, cocok untuk data relasional ringan, bekerja offline |
| Charting | Recharts | Pie chart & bar chart ringan, mudah dikustom warna earth tone |
| PWA | `next-pwa` (Workbox) + manifest.json | Offline caching, installable |
| Form & Validasi | React Hook Form + Zod | Validasi input transaksi & target |
| Date Utility | date-fns | Manipulasi bulan/tanggal untuk filter periode |
| Testing | Vitest + React Testing Library | Unit & component test |

> **Catatan arsitektur penting:** Karena MVP bersifat *offline-first* dan *privacy-first* (tanpa server backend), seluruh "service" di bawah adalah **client-side service layer**, bukan REST API. Tidak ada server database di MVP ini.

## 2. Struktur Folder

```
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx                  # Dashboard utama
│   │   ├── transactions/
│   │   │   ├── page.tsx              # List + search transaksi
│   │   │   └── [id]/page.tsx         # Edit transaksi
│   │   ├── wallets/
│   │   │   └── page.tsx              # CRUD dompet
│   │   ├── budget/
│   │   │   └── page.tsx              # Set target pengeluaran
│   │   ├── reports/
│   │   │   └── page.tsx              # Pie chart & analisis
│   │   └── settings/
│   │       └── page.tsx              # Backup & restore, tema
│   ├── layout.tsx
│   ├── manifest.ts                   # Web app manifest (PWA)
│   └── globals.css
├── components/
│   ├── ui/                           # Button, Input, Modal, Card, dsb (design system)
│   ├── charts/
│   │   └── ExpensePieChart.tsx
│   ├── transactions/
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionItem.tsx
│   │   └── TransactionSearchBar.tsx
│   ├── wallets/
│   │   └── WalletCard.tsx
│   ├── budget/
│   │   └── BudgetProgressBar.tsx
│   └── layout/
│       ├── BottomNav.tsx             # Navigasi mobile-first
│       └── Header.tsx
├── lib/
│   ├── db/
│   │   ├── dexie.ts                  # Inisialisasi Dexie + schema
│   │   └── migrations.ts
│   ├── services/
│   │   ├── walletService.ts
│   │   ├── transactionService.ts
│   │   ├── budgetService.ts
│   │   ├── categoryService.ts
│   │   └── backupService.ts          # Export/import JSON
│   ├── stores/
│   │   ├── walletStore.ts            # Zustand store
│   │   ├── transactionStore.ts
│   │   └── uiStore.ts
│   └── utils/
│       ├── currency.ts
│       └── date.ts
├── public/
│   ├── icons/                        # PWA icons
│   └── sw.js (auto-generated)
├── styles/
│   └── theme.css                     # CSS variables warna earth tone
├── tailwind.config.ts
├── next.config.js
└── Rules.md, PRD.md, Design.md, Schema.md, Architecture.md
```

## 3. Flow Data Antar "Service" (Client-Side)

Karena tidak ada backend, alur data sepenuhnya berjalan di browser:

```
[UI Component]
     │  (user action: tambah transaksi)
     ▼
[Zustand Store] ──(dispatch action)──▶ [Service Layer] (transactionService.ts)
     ▲                                        │
     │                                        ▼
     └────────(update state)──────── [Dexie.js / IndexedDB]
```

### Contoh alur: Tambah Transaksi Pengeluaran
1. User isi form di `TransactionForm.tsx` → submit.
2. Komponen memanggil `transactionStore.addTransaction(data)`.
3. Store memanggil `transactionService.create(data)`.
4. `transactionService` menulis ke tabel `transactions` di Dexie, sekaligus update saldo dompet terkait lewat `walletService.updateBalance()`.
5. Setelah sukses, store memperbarui state lokal → UI re-render (list transaksi, dashboard, pie chart ter-update reaktif).

### Contoh alur: Backup & Restore
1. **Backup:** `backupService.exportAll()` membaca seluruh tabel Dexie (`wallets`, `transactions`, `categories`, `budgets`) → digabung jadi satu objek JSON → di-download sebagai file `.json` via Blob + anchor download.
2. **Restore:** User upload file `.json` → `backupService.importAll(file)` memvalidasi struktur (schema check) → menulis ulang seluruh tabel Dexie dalam satu transaction (transaction Dexie, bukan transaksi keuangan) agar atomik → refresh seluruh store.

### Contoh alur: Pie Chart Pengeluaran
1. Halaman `reports/page.tsx` memanggil `transactionService.getExpenseByCategory(month, year)`.
2. Service melakukan query & aggregate (group by kategori, sum nominal) langsung dari Dexie.
3. Data hasil agregasi dikirim ke `ExpensePieChart.tsx` (Recharts) untuk dirender.

## 4. Offline & PWA Strategy
- **App shell caching:** Workbox precache untuk halaman utama, CSS, font.
- **Data:** seluruhnya di IndexedDB, otomatis tersedia offline (bukan network cache, tapi database lokal asli).
- **Service worker:** update-prompt saat versi baru terdeteksi (skip waiting + reload confirmation ke user).
- **Manifest:** nama app, ikon (earth tone), theme_color, display: `standalone`.

## 5. Skalabilitas & Migrasi ke Depan
- Jika nanti dibutuhkan cloud sync: service layer (`walletService`, `transactionService`, dst.) cukup diberi implementasi alternatif yang memanggil API remote, tanpa mengubah kontrak/interface yang dipakai store & komponen UI (pola *repository pattern*).
- Skema Dexie diberi versi (lihat `Schema.md`) agar migrasi struktur data di masa depan aman.
