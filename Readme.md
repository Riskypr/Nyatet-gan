# 🌿 Nyatet Gan (MoneyEarth) — Offline-First Personal Finance Sanctuary

<p align="center">
  <img src="public/icons/icon-192x192.png" alt="Nyatet Gan Logo" width="96" height="96" style="border-radius: 24px;" />
</p>

<p align="center">
  <strong>Aplikasi Pencatatan & Perencanaan Keuangan Pribadi Berbasis Offline-First PWA</strong><br>
  <em>100% Client-Side • Privasi Terjamin Tanpa Cloud Server • Cepat, Ringan & Estetik</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.2-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/IndexedDB-Dexie.js-green?style=flat-square" alt="Dexie.js" />
  <img src="https://img.shields.io/badge/PWA-Service%20Worker%20v2.0-orange?style=flat-square" alt="PWA Ready" />
  <img src="https://img.shields.io/badge/License-MIT-amber?style=flat-square" alt="License MIT" />
</p>

---

## 📖 Tentang Nyatet Gan

**Nyatet Gan** (bertema antarmuka **MoneyEarth**) adalah aplikasi pencatatan dan pengelolaan keuangan pribadi modern yang dirancang dengan filosofi **Offline-First**, **Mobile-First**, dan **Zero-Knowledge Privacy**.

Semua data keuangan Anda—mulai dari saldo, mutasi dompet, target anggaran, hingga laporan historis—disimpan secara lokal di browser/perangkat Anda menggunakan **IndexedDB (via Dexie.js)**. Tidak ada server backend, tidak ada pelacakan, dan data Anda tidak pernah dikirim ke pihak ketiga. Aplikasi dapat diinstal langsung ke layar utama (*Add to Home Screen*) dan bekerja 100% normal tanpa koneksi internet.

---

## ✨ Fitur-Fitur Utama

### 1. 🏠 Dashboard Cerdas & Terpadu (Beranda)
- **Hero Kekayaan Bersih**: Tampilan total saldo likuid seluruh dompet, dilengkapi fitur sembunyikan/intip saldo (*privacy mode*) dan ringkasan arus kas bulan berjalan.
- **Kartu Plafon Anggaran Bulanan**:
  - Real-time tracker pengeluaran vs pagu maksimal bulanan.
  - **Saran Kuota Harian (Daily Allowance)**: Menghitung sisa kuota belanja harian yang aman untuk sisa hari di bulan ini agar anggaran tidak boncos.
  - **Posisi Anggaran per Kategori**: Progress bar per pos pengeluaran lengkap dengan persentase realisasi, status waspada/aman, dan kalkulasi jatah belanja harian per kategori (`~Rp XX.XXX/hari`).
- **Carousel Dompet Horizontal**: Kartu dompet geser dengan aksen warna/ikon unik, saldo real-time, status aktif/arsip, serta tombol cepat tambah transaksi dan pindah saldo.
- **Kalender Transaksi Interaktif**: Kalender bulanan yang menampilkan indikator visual pengeluaran harian dan memudahkan memilih tanggal untuk melihat mutasi spesifik.

### 2. 🔍 Pencarian Cerdas Global (Quick Search Modal)
- Akses instan lewat tombol pencarian di header aplikasi.
- **Real-Time Offline Search**: Mencari transaksi seketika berdasarkan nama, catatan, nominal, kategori, maupun dompet.
- **Pintasan Cerdas (Smart Query Operators)**:
  - Ketik `>100k` untuk menyaring transaksi pengeluaran di atas Rp 100.000.
  - Ketik nama dompet seperti `BCA` atau `GoPay` untuk menyaring mutasi rekening tersebut secara otomatis.
- **Pencarian Terakhir (Recent Searches)**: Menyimpan kata kunci pencarian terakhir secara lokal dengan opsi hapus satuan atau bersihkan semua.
- **Cari Cepat Kategori**: Tombol grid kategori terpopuler lengkap dengan penghitung total frekuensi transaksi.

### 3. 💸 Riwayat Transaksi Komprehensif
- **Pengelompokan Tanggal Modern**: Riwayat transaksi dikelompokkan rapi per waktu (*Hari Ini*, *Kemarin*, atau tanggal spesifik).
- **Filter Cepat (Horizontal Pills)**:
  - Filter kategori instan (Semua, Makanan, Transport, Belanja, Tagihan, dll).
  - Filter sumber dana dompet (BCA, Tunai, GoPay, dll).
  - Filter tipe mutasi (Semua, Pengeluaran, Pemasukan).
- **Ringkasan Terfilter**: Menampilkan total pengeluaran dan pemasukan bersih sesuai filter yang sedang aktif secara dinamis.
- **Input Nominal Heroik**: Form pencatatan transaksi dengan input nominal besar (*hero variant*), pemilihan kategori cerdas, catatan, tanggal fleksibel, dan toggle transfer dompet.

### 4. 👛 Manajemen Multi-Dompet & Pindah Saldo
- **Multi Sumber Dana**: Kelola rekening bank, uang tunai, e-wallet, kartu kredit, hingga tabungan darurat dalam satu tempat.
- **Pindah Saldo Antar-Dompet (Transfer)**:
  - Tombol *Swap* satu klik untuk membalikkan posisi dompet asal dan dompet tujuan.
  - Tombol preset nominal cepat (`+50rb`, `+100rb`, `+500rb`, dan `Maksimal Saldo`).
  - Dukungan biaya admin transfer dengan preset kilat (`Gratis`, `Rp 1.000`, `Rp 2.500`, `Rp 6.500`).
- **Arsip & Personalisasi**: Kustomisasi nama, tipe dompet, warna aksen, ikon, serta sembunyikan dompet yang sudah tidak aktif tanpa menghapus riwayat transaksinya.

### 5. 🎯 Target Anggaran & Disiplin Finansial
- **Pagu Keseluruhan & Kategori**: Tentukan batas pengeluaran bulanan umum dan batas khusus untuk tiap pos kategori penting.
- **Salin Anggaran Bulan Lalu**: Duplikasi konfigurasi target anggaran dari bulan sebelumnya hanya dengan satu klik.
- **Indikator Risiko Anggaran**:
  - 🟢 **Aman**: Realisasi di bawah 70% pagu.
  - 🟠 **Waspada**: Realisasi 70% – 99% mendekati limit.
  - 🔴 **Kritis / Overbudget**: Realisasi melebihi batas anggaran yang ditentukan.

### 6. 📊 Laporan & Evaluasi Finansial
- **Evaluasi Otomatis**: Analisis kesehatan finansial berbasis rasio tabungan (*Saving Rate*) dan kepatuhan anggaran dengan rekomendasi aksi konkret.
- **Ringkasan Arus Kas**: Total pemasukan, pengeluaran, sisa tabungan bersih (*Net Savings*), dan persentase rasio tabungan.
- **Tren Pengeluaran Mingguan (M1 – M5)**: Distribusi dan grafik batang pengeluaran per minggu untuk memantau siklus pengeluaran terbesar.
- **Distribusi Kategori (Donut Chart)**: Visualisasi proporsi pengeluaran dengan Recharts yang interaktif dan responsif.
- **Detail Mutasi per Kategori**: Daftar pengeluaran yang dapat di-*expand* per kategori untuk melihat rincian transaksi pembentuknya.

### 7. ⚙️ Pengaturan, Personalisasi & Backup Data
- **Tema Tampilan**:
  - ☀️ **Terang (Krem Hangat)**: Nuansa hangat estetik khas earth-tone.
  - 🌙 **Gelap (Obsidian)**: Tampilan kontras gelap hemat baterai dan ramah di mata malam hari.
  - 💻 **Sistem (Otomatis)**: Menyesuaikan tema bawaan sistem operasi pengguna.
- **Earth-Tone Kontras Tinggi**: Toggle mempertajam diferensiasi warna angka dan kategori.
- **Cadangkan Data (Export JSON)**: Unduh seluruh database (transaksi, dompet, kategori, anggaran) dalam format JSON terstruktur untuk dipindahkan ke perangkat lain.
- **Pulihkan Data (Import JSON)**: Pulihkan data cadangan dengan verifikasi skema otomatis.
- **Ekspor CSV**: Unduh pembukuan kas dalam format spreadsheet (CSV) untuk keperluan audit personal di Excel atau Google Sheets.
- **Manajemen Kategori Kustom**: Tambah, ubah nama, pilih ikon, dan sesuaikan klasifikasi pengeluaran maupun pemasukan.
- **Hapus Data Lokal**: Opsi penghapusan data aman dengan konfirmasi ganda.

---

## 📱 Offline-First & Dukungan PWA (Progressive Web App)

Aplikasi ini dilengkapi dengan **Custom Service Worker (v2.0.0)** yang mengoptimalkan pengalaman pengguna di jaringan buruk atau tanpa internet:
- **Strategi Cache-First**: Aset statis, font Google (*Plus Jakarta Sans*), dan file bundel Next.js di-cache untuk pemuatan instan (< 1 detik).
- **Strategi Stale-While-Revalidate**: Halaman navigasi dan chunk dinamis diperbarui secara mulus di latar belakang saat online.
- **IndexedDB Persistence**: Seluruh perubahan data langsung ditulis ke penyimpanan lokal browser tanpa membutuhkan koneksi internet.
- **Indikator Status Jaringan**: Header aplikasi menampilkan badge **`OFFLINE READY`** atau **`ONLINE`** secara dinamis.

---

## 🛠️ Tech Stack & Spesifikasi Teknis

| Bagian | Teknologi | Keterangan |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | React Server & Client Components hybrid |
| **UI Library** | React 19 | Komponen interaktif modern |
| **Language** | TypeScript 5 | Type-safety menyeluruh pada model data & service |
| **Styling** | Tailwind CSS v4 + PostCSS | Utility-first CSS, modern CSS variable tokens |
| **State Management** | Zustand 5 | Store terpusat untuk wallet, filter, dan modal global |
| **Client Database** | Dexie.js (IndexedDB) | Storage offline tanpa batas kuota localStorage |
| **Form & Validasi** | React Hook Form + Zod | Validasi skema input transaksi & dompet |
| **Data Visualization** | Recharts 2 | Responsive Donut Chart & Bar Chart pengeluaran |
| **Icons & Font** | Lucide React & Plus Jakarta Sans | Set ikon clean & tipografi modern |
| **Notifikasi** | React Toastify | Feedback interaktif konfirmasi tindakan & aksi undo |
| **Service Worker** | Custom PWA SW v2.0.0 | Offline navigation, resource caching, zero downtime |

---

## 📂 Struktur Repositori

```text
Nyatet-gan/
├── app/                              # Next.js App Router (Rute & Halaman)
│   ├── globals.css                   # Theme variables, earth-tone tokens, utility classes
│   ├── layout.tsx                    # Root layout (Metadata, Google Font, ServiceWorkerRegister)
│   ├── manifest.ts                   # Konfigurasi Web App Manifest (PWA)
│   ├── page.tsx                      # 🏠 Dashboard / Beranda (Hero, Anggaran, Carousel, Kalender)
│   ├── budget/page.tsx               # 🎯 Target Anggaran Bulanan & per Kategori
│   ├── transactions/page.tsx         # 💸 Riwayat Transaksi (Grouped date, Filter Pills)
│   ├── wallets/page.tsx              # 👛 Halaman Dompet, Total Saldo Likuid & Mutasi
│   ├── reports/page.tsx              # 📈 Laporan Arus Kas, Tren M1-M5, Donut Chart
│   └── settings/page.tsx             # ⚙️ Pengaturan Tema, Backup JSON/CSV, Kategori
│
├── components/                       # Komponen Antarmuka Reusable
│   ├── budget/                       # Komponen progres pagu anggaran
│   ├── charts/                       # ExpensePieChart (Recharts Donut)
│   ├── layout/                       # AppShell, BottomNav, Header, MonthSelector
│   ├── pwa/                          # ServiceWorkerRegister, InstallBanner
│   ├── transactions/                 # QuickSearchModal, TransactionForm, TransactionItem
│   ├── ui/                           # Button, Card, Badge, Modal, BottomSheet, NumberInput
│   └── wallets/                      # WalletCard, TransferModal, WalletModal
│
├── lib/                              # Data Access & Logika Bisnis
│   ├── db/                           # Dexie.js schema, versi database, dan seed data default
│   ├── services/                     # Service layer: transaction, wallet, budget, backup, category
│   ├── stores/                       # Zustand stores (useWalletStore, useTransactionStore, dll)
│   ├── types/                        # Definisi interface TypeScript
│   └── utils/                        # Formatting rupiah, date utils, classnames merger
│
├── public/                           # Aset Statis
│   ├── icons/                        # PWA Icons (192x192, 512x512)
│   └── sw.js                         # Custom Service Worker v2.0.0 (Offline-First Engine)
│
├── 01-PRD.md                         # Product Requirements Document
├── 02-Architecture.md                # Dokumentasi Arsitektur Sistem
├── 03-Design.md                      # Panduan Design System & UI/UX
├── 04-Schema.md                      # Skema Tabel & Relasi IndexedDB
├── 05-Rules.md                       # Standar Koding & Konvensi
│
├── next.config.ts                    # Konfigurasi Next.js
├── tailwind.config.ts / postcss      # Konfigurasi Tailwind CSS v4
├── tsconfig.json                     # Konfigurasi TypeScript compiler
└── Readme.md                         # 📖 Dokumentasi Lengkap Proyek
```

---

## 🚀 Panduan Memulai (Getting Started)

### 1. Prasyarat Sistem
Pastikan telah menginstal:
- **Node.js**: v18.18.0 atau lebih baru (direkomendasikan Node.js v20 LTS / v22)
- **npm**: v9+ (bawaan Node.js)
- **Git**

Cek versi di terminal:
```bash
node -v
npm -v
git -v
```

### 2. Kloning Repositori
```bash
git clone https://github.com/Riskypr/Nyatet-gan.git
cd Nyatet-gan
```

### 3. Instal Dependensi
```bash
npm install
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser dan buka alamat: **`http://localhost:3000`**

### 5. Membangun untuk Produksi (Build Production)
```bash
npm run build
npm run start
```

### 6. Menjalankan Pengecekan Kode (Linting)
```bash
npm run lint
```

---

## 🔒 Privasi & Keamanan Data

1. **Local-Only Storage**: Seluruh rekaman keuangan Anda berada di bawah kontrol penuh Anda dalam browser lokal (`IndexedDB`).
2. **Tanpa Akun & Password**: Langsung dapat digunakan seketika tanpa proses pendaftaran yang rumit dan tanpa risiko kebocoran kredensial di server luar.
3. **Penyimpanan Terenkapsulasi**: Data tersimpan aman per origin domain sesuai standar keamanan browser sandbox modern.
4. **Kemandirian Cadangan (Self-Sovereign Backup)**: Anda dapat mencadangkan dan memulihkan seluruh data Anda kapan saja melalui berkas file JSON.

---

## 🤝 Panduan Berkontribusi

Kontribusi dan saran perbaikan selalu terbuka lebar!
1. Fork repositori ini.
2. Buat branch fitur baru:
   ```bash
   git checkout -b feat/nama-fitur-keren
   ```
3. Commit perubahan dengan pesan yang deskriptif:
   ```bash
   git commit -m "feat: tambahkan fitur kalkulator split bill"
   ```
4. Push ke branch Anda di GitHub:
   ```bash
   git push origin feat/nama-fitur-keren
   ```
5. Buat **Pull Request** baru ke branch `main`. Pastikan telah menjalankan `npm run lint` dan `npm run build` sebelum membuat PR.

---

## 📝 Lisensi

Proyek ini dirilis di bawah lisensi open source [MIT License](LICENSE).

---

<p align="center">
  Dibuat dengan ❤️ dan dedikasi oleh <a href="https://github.com/Riskypr"><strong>Risky Pr</strong></a>
</p>
