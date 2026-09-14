# Rules.md — Coding Convention, Style Guide & Batasan AI

## 1. Coding Convention

### 1.1 Bahasa & Struktur
- TypeScript wajib (`strict: true` di `tsconfig.json`), hindari `any` kecuali benar-benar tidak terhindarkan (beri komentar alasan).
- Gunakan **App Router** Next.js — server component sebagai default, tambahkan `"use client"` hanya pada komponen yang butuh interaktivitas/state/browser API.
- Satu komponen = satu file. Nama file komponen `PascalCase.tsx`, nama file util/service `camelCase.ts`.
- Folder mengikuti struktur di `Architecture.md` — jangan buat folder baru di root tanpa didiskusikan (perbarui `Architecture.md` bila ada perubahan struktur).

### 1.2 Penamaan
- Variabel & fungsi: `camelCase`.
- Komponen React & Tipe/Interface: `PascalCase`.
- Konstanta global: `UPPER_SNAKE_CASE`.
- Boolean diawali `is/has/should` (mis. `isArchived`, `hasBudget`).
- Nama file service diakhiri `Service` (`transactionService.ts`), store diakhiri `Store` (`walletStore.ts`).

### 1.3 Komponen & Styling
- Gunakan **Tailwind utility classes**, hindari inline style kecuali untuk nilai dinamis (mis. warna kategori dari data).
- Urutan class Tailwind: layout → spacing → sizing → typography → warna → efek (gunakan Prettier plugin `prettier-plugin-tailwindcss` agar otomatis).
- Semua warna **wajib** mengambil dari CSS variable/token di `Design.md`, jangan hardcode hex baru di komponen.
- Komponen dasar (Button, Input, Card, dll.) hanya boleh didefinisikan di `components/ui/` — dilarang membuat varian button baru di luar folder ini.

### 1.4 State & Data
- State lokal UI (form input sementara, toggle modal) → `useState`/`useReducer`.
- State lintas-komponen/global (data dompet, transaksi, filter aktif) → Zustand store di `lib/stores/`.
- Akses database **hanya** lewat `lib/services/*`, komponen dan store dilarang memanggil Dexie langsung.
- Semua angka nominal disimpan sebagai `number` (bukan string), format tampilan (Rp, pemisah ribuan) dilakukan di layer presentasi (`lib/utils/currency.ts`), bukan di database.

### 1.5 Commit & Git
- Format commit: `type(scope): deskripsi singkat` — contoh: `feat(transactions): tambah fitur edit transaksi`, `fix(budget): perbaiki kalkulasi progress bar`.
- Tipe yang dipakai: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`.
- Tidak commit file `node_modules`, `.env*`, hasil build (`.next/`).

### 1.6 Testing
- Setiap `service` (business logic) wajib punya unit test minimal untuk: create, update, delete, dan kasus edge (mis. hapus dompet yang masih punya transaksi).
- Komponen UI kompleks (form, chart) diberi test interaksi dasar (render, submit, error state).

## 2. Style Guide Tambahan
- Bahasa UI: **Bahasa Indonesia** (label tombol, pesan error, toast) — konsisten di seluruh aplikasi.
- Format tanggal tampilan: `d MMM yyyy` (mis. `14 Sep 2026`), gunakan `date-fns` locale `id`.
- Format mata uang: `Rp` + pemisah ribuan titik, tanpa desimal (mis. `Rp 150.000`).
- Semua teks error harus actionable — jangan hanya "Terjadi kesalahan", jelaskan langkah selanjutnya (mis. "Nominal tidak boleh kosong").

## 3. Batasan AI (AI Boundaries)
Ketentuan berikut berlaku untuk AI assistant (mis. Claude/Copilot) yang membantu development project ini:

1. **Dilarang mengubah struktur skema database** (`Schema.md`) tanpa menyertakan alasan & dampak migrasi secara eksplisit di ringkasan perubahan.
2. **Dilarang menambah dependency/library baru** di luar yang tercantum di `Architecture.md` tanpa menyebutkan alasan pemilihan dan trade-off-nya.
3. **Dilarang mengubah nilai/token warna & font** di `Design.md` secara sepihak — perubahan visual harus konsisten dengan design system yang sudah ditetapkan (earth tone, Google Sans Flex).
4. **Dilarang menambahkan pemanggilan API eksternal/server** apa pun (termasuk analytics, tracking, atau AI API) tanpa persetujuan eksplisit — MVP bersifat privacy-first, data tidak boleh terkirim ke luar device pengguna.
5. **Wajib menjaga backward-compatibility** data pengguna: perubahan kode tidak boleh membuat data lama (hasil export lama) gagal di-restore.
6. **Wajib memperbarui dokumen terkait** (`Architecture.md`, `Schema.md`, `Design.md`) bila perubahan kode berdampak pada struktur folder, skema data, atau design system — dokumentasi dan kode harus tetap sinkron.
7. **Dilarang menghasilkan kode yang menyimpan data sensitif secara plaintext tidak perlu** (tidak relevan untuk finansial pribadi lokal, tapi tetap berlaku bila fitur akun/login ditambahkan di masa depan).
8. **Setiap perubahan besar** (menyentuh >1 modul/service) harus disertai ringkasan singkat: apa yang berubah, kenapa, dan dampaknya ke fitur lain.
9. AI boleh mengusulkan refactor atau optimasi, namun **tidak boleh mengeksekusi perubahan besar tanpa konfirmasi** dari pemilik project terlebih dahulu.
