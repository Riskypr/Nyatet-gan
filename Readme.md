# 💰 Nyatet Gan — Catat Keuangan Pribadi

> Aplikasi pencatatan keuangan pribadi yang **offline-first** & **mobile-first**, dibangun pakai Next.js 15 + React 19. Semua data disimpan di browser (IndexedDB via Dexie), jadi nggak perlu server — tinggal buka, langsung pakai! 🚀

---

## ✨ Fitur Utama

- 📊 **Dashboard** — Lihat total saldo, pemasukan & pengeluaran bulan ini dalam satu layar
- 💸 **Catat Transaksi** — Input pemasukan & pengeluaran dengan cepat lewat modal form
- 👛 **Multi-Dompet** — Kelola beberapa dompet/sumber dana sekaligus (tunai, rekening, e-wallet, dll)
- 🏷️ **Kategori & Tag** — Organisir transaksi biar rapi dan gampang dicari
- 🎯 **Target Anggaran** — Pasang limit pengeluaran bulanan, ada progress bar biar kelihatan
- 📈 **Laporan & Grafik** — Visualisasi pengeluaran pakai pie chart (Recharts)
- 🔍 **Pencarian & Filter** — Cari transaksi berdasarkan nama, kategori, atau tanggal
- ⚙️ **Pengaturan** — Backup/restore data, preferensi pengguna
- 📱 **PWA Ready** — Bisa di-install ke home screen HP kayak aplikasi native
- 🌿 **Earth Tone UI** — Tema warna earth tone yang menenangkan, font Plus Jakarta Sans

---

## 🛠️ Tech Stack

| Layer | Teknologi | Versi |
|---|---|---|
| **Framework** | Next.js (App Router) | ^15.2.0 |
| **UI Library** | React | ^19.0.0 |
| **Bahasa** | TypeScript | ^5 |
| **Styling** | Tailwind CSS v4 + PostCSS | ^4.0.0 |
| **State Management** | Zustand | ^5.0.3 |
| **Database (Client)** | Dexie.js (IndexedDB wrapper) | ^4.0.11 |
| **Form Handling** | React Hook Form + Zod | ^7.54 / ^3.24 |
| **Chart** | Recharts | ^2.15.1 |
| **Icons** | Lucide React | ^0.475.0 |
| **Notifikasi** | React Toastify | ^11.1.0 |
| **Animasi Spesial** | Canvas Confetti | ^1.9.4 |
| **Utilitas** | clsx, tailwind-merge, date-fns | — |

---

## 📋 Prasyarat

Sebelum mulai, pastikan perangkat kamu udah punya:

- **Node.js** v18 atau lebih baru (direkomendasikan v22.x) — [Download Node.js](https://nodejs.org/)
- **npm** v9+ (biasanya sudah bawaan Node.js)
- **Git** — [Download Git](https://git-scm.com/)
- **Browser modern** (Chrome, Edge, Firefox, Safari terbaru)

Cara cek versi yang sudah terpasang:

```bash
node --version   # contoh output: v22.14.0
npm --version    # contoh output: 10.x.x
git --version    # contoh output: git version 2.x.x
```

---

## 🚀 Instalasi & Menjalankan Project

### 1. Clone Repository

```bash
git clone https://github.com/Riskypr/Nyatet-gan.git
cd Nyatet-gan
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Buka browser dan akses **http://localhost:3000** — selesai, aplikasinya udah jalan! 🎉

### 4. Build untuk Produksi (opsional)

```bash
npm run build
npm run start
```

### 5. Cek Linting (opsional)

```bash
npm run lint
```

---

## 📂 Struktur Folder

```
Nyatet-gan/
├── app/                          # Next.js App Router (halaman-halaman)
│   ├── globals.css               # Styling global & design tokens (earth tone)
│   ├── layout.tsx                # Root layout (font, metadata, AppShell)
│   ├── manifest.ts               # PWA manifest configuration
│   ├── page.tsx                  # 🏠 Dashboard (halaman utama)
│   ├── budget/page.tsx           # 🎯 Halaman target anggaran
│   ├── transactions/page.tsx     # 💸 Halaman daftar transaksi
│   ├── wallets/page.tsx          # 👛 Halaman kelola dompet
│   ├── reports/page.tsx          # 📈 Halaman laporan & grafik
│   └── settings/page.tsx        # ⚙️  Halaman pengaturan
│
├── components/                   # Komponen UI reusable
│   ├── budget/                   # BudgetProgressBar
│   ├── charts/                   # ExpensePieChart (Recharts)
│   ├── layout/                   # AppShell, BottomNav, Header, Sidebar
│   ├── transactions/             # TransactionForm, TransactionItem, SearchBar
│   ├── ui/                       # Badge, Button, Card, Input, BottomSheet, dll
│   └── wallets/                  # WalletCard, WalletModal
│
├── lib/                          # Logic & data layer
│   ├── db/                       # Dexie.js database schema & seed data
│   ├── services/                 # Business logic (wallet, transaction, budget, backup, category)
│   ├── stores/                   # Zustand stores (wallet, transaction, UI state)
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Helper functions (currency, date, cn, confirmToast)
│
├── public/                       # Aset statis (favicon, SVG)
│
├── 01-PRD.md                     # Product Requirements Document
├── 02-Architecture.md            # Arsitektur & alur data
├── 03-Design.md                  # Panduan UI/UX & design system
├── 04-Schema.md                  # Skema database (Dexie/IndexedDB)
├── 05-Rules.md                   # Coding convention & batasan AI
│
├── next.config.ts                # Konfigurasi Next.js
├── tsconfig.json                 # Konfigurasi TypeScript
├── postcss.config.mjs            # Konfigurasi PostCSS (Tailwind)
├── eslint.config.mjs             # Konfigurasi ESLint
├── package.json                  # Dependencies & scripts
└── Readme.md                     # 📖 Kamu lagi baca ini!
```

---

## 📜 Daftar Script NPM

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan development server (hot reload) |
| `npm run build` | Build project untuk produksi |
| `npm run start` | Jalankan hasil build produksi |
| `npm run lint` | Cek kualitas kode pakai ESLint |

---

## 🏗️ Arsitektur Singkat

Aplikasi ini **100% client-side** (offline-first), tanpa backend:

```
Browser
  ├── Next.js App Router (SSR/CSR hybrid)
  ├── React 19 (UI rendering)
  ├── Zustand (global state management)
  ├── Dexie.js → IndexedDB (penyimpanan data di browser)
  └── Service Layer (business logic: CRUD dompet, transaksi, anggaran)
```

- **Nggak butuh server/database eksternal** — semua data tersimpan di IndexedDB browser kamu
- **PWA-ready** — bisa di-install dan dipakai offline
- Detail lengkap ada di `02-Architecture.md`

---

## 🎨 Design System

- **Font**: Plus Jakarta Sans (Google Fonts)
- **Warna**: Earth tone palette — coklat hangat (`#C86446`), hijau kalem (`#4A6B53`), krem lembut (`#FAF7F2`)
- **Komponen**: Card, Button, Badge, Input, BottomSheet, EmptyState, dll
- **Layout**: Mobile-first dengan bottom navigation, responsive ke desktop dengan sidebar
- Detail lengkap ada di `03-Design.md`

---

## 📄 Dokumentasi Tambahan

| Dokumen | Isi |
|---|---|
| `01-PRD.md` | Scope, MVP, goals, technical & business requirements |
| `02-Architecture.md` | Tech stack, struktur folder, alur data antar komponen |
| `03-Design.md` | UI/UX guidelines, design system, komponen |
| `04-Schema.md` | Struktur database (tabel, relasi, indeks) |
| `05-Rules.md` | Coding convention, style guide, batasan AI |

---

## 🤝 Kontribusi

1. Fork repo ini
2. Buat branch fitur baru (`git checkout -b feat/fitur-keren`)
3. Commit perubahan kamu (`git commit -m "feat: tambah fitur keren"`)
4. Push ke branch (`git push origin feat/fitur-keren`)
5. Buka Pull Request — jelaskan perubahannya ya!

Pastiin kode kamu lolos `npm run lint` sebelum submit PR 💪

---

## 📝 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat file `LICENSE` untuk detail lebih lanjut.

---

<p align="center">
  Dibuat dengan ☕ dan semangat oleh <a href="https://github.com/Riskypr">Risky Pr</a>
</p>
