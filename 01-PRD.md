# PRD — Aplikasi Pencatatan Keuangan Pribadi
**Codename:** Nyatet GaN (working title, base color earth-tone)

## 1. Latar Belakang
Banyak orang kesulitan melacak pengeluaran & pemasukan bulanan secara konsisten karena aplikasi yang ada terlalu rumit atau butuh koneksi internet/server. Dibutuhkan web app ringan, mobile-first, bisa dipasang sebagai PWA, dan bekerja offline-first untuk mencatat transaksi harian dengan cepat.

## 2. Tujuan Produk (Goals)
- Memudahkan pencatatan pengeluaran & pemasukan per bulan.
- Memberikan kontrol anggaran lewat target pengeluaran per kategori/bulan.
- Memvisualisasikan komposisi pengeluaran lewat pie chart.
- Mendukung multi "dompet"/sumber dana (cash, rekening, e-wallet, dll).
- Data aman secara lokal dengan kemampuan backup & restore manual.

## 3. Scope Project

### In Scope (MVP)
1. Manajemen dompet/sumber dana (tambah, edit, hapus, saldo per dompet).
2. Catat transaksi: pengeluaran & pemasukan (tambah, edit, hapus).
3. Kategori transaksi (default + custom).
4. Target/budget pengeluaran per bulan (total dan/atau per kategori).
5. Dashboard ringkasan bulanan: total masuk, keluar, sisa saldo, progress target.
6. Pie chart komposisi pengeluaran per kategori (per bulan, bisa ganti bulan).
7. Fitur pencarian transaksi (by nama/catatan, kategori, dompet, rentang tanggal, nominal).
8. Backup data (export ke file JSON) & restore data (import file JSON).
9. PWA: installable, bisa dipakai offline, ada app icon & splash screen.
10. Mobile-first responsive UI, tetap layak dipakai di desktop.

### Out of Scope (MVP ini)
- Sinkronisasi multi-device / cloud sync otomatis.
- Multi-user / login & autentikasi.
- Integrasi bank/e-wallet otomatis (open banking, scraping mutasi, dsb).
- Laporan pajak, invoice, atau fitur akuntansi lanjutan.
- Notifikasi push reminder (dipertimbangkan di fase berikutnya).

## 4. Business Requirement
- Aplikasi harus dapat digunakan tanpa biaya server (hosting statis/serverless minim biaya).
- Data pengguna adalah milik pengguna sepenuhnya (privacy-first, disimpan di device, bukan di server pihak ketiga) untuk MVP.
- Onboarding harus singkat: user bisa langsung mencatat transaksi pertama dalam <2 menit dari buka aplikasi.

## 5. Technical Requirement
- Dibangun dengan Next.js (App Router) + TailwindCSS.
- Font utama: Google Sans Flex.
- Tema warna: earth tone (base) sebagai identitas visual.
- Penyimpanan data lokal (client-side database, IndexedDB) agar app tetap berfungsi offline — lihat `Architecture.md`.
- Mendukung PWA (manifest.json, service worker, offline caching).
- Kompatibel dengan browser modern (Chrome, Safari, Edge, Firefox) versi 2 tahun terakhir.
- Responsive breakpoint mengikuti pendekatan mobile-first.

## 6. User Persona
- **Individu pekerja/mahasiswa** yang ingin mengontrol pengeluaran bulanan pribadi tanpa ribet setup akun.
- Terbiasa pakai HP sebagai perangkat utama, sesekali buka lewat laptop.
- Ingin data tetap aman di perangkat sendiri dan bisa backup manual sebelum ganti HP.

## 7. Detail Fitur MVP

| Fitur | Deskripsi Singkat | Prioritas |
|---|---|---|
| Dompet/Sumber Dana | CRUD dompet, tiap transaksi terikat ke satu dompet, saldo otomatis terupdate | Must Have |
| Catat Transaksi | Tambah/edit/hapus pengeluaran & pemasukan, pilih kategori, dompet, tanggal, catatan | Must Have |
| Target Pengeluaran | Set target nominal per bulan (total dan/atau per kategori), tampilkan progress bar | Must Have |
| Dashboard Bulanan | Ringkasan total masuk/keluar/saldo, navigasi antar bulan | Must Have |
| Pie Chart Pengeluaran | Visualisasi persentase pengeluaran per kategori bulan berjalan | Must Have |
| Search & Filter | Cari transaksi berdasarkan kata kunci, kategori, dompet, rentang tanggal | Must Have |
| Backup & Restore | Export seluruh data ke file (JSON), import kembali dari file | Must Have |
| PWA | Installable, offline capable, app-like experience | Must Have |
| Kategori Custom | User bisa tambah kategori sendiri di luar default | Should Have |
| Dark mode | Varian gelap dari tema earth tone | Could Have |

## 8. Success Metrics
- User berhasil mencatat transaksi pertama dalam < 2 menit sejak instalasi.
- 0 kehilangan data selama sesi normal (tanpa uninstall) berkat penyimpanan lokal.
- Waktu load awal (First Contentful Paint) < 2 detik di koneksi 4G.
- Lighthouse PWA score ≥ 90.
- User bisa restore backup dan mendapati data identik 100% dengan sebelum backup.

## 9. Risiko & Asumsi
- **Risiko:** Data hanya tersimpan lokal → bila cache browser dibersihkan tanpa backup, data hilang. Mitigasi: reminder berkala untuk backup, backup otomatis ke file terjadwal (fase berikutnya).
- **Asumsi:** Pengguna adalah single-user per perangkat, tidak butuh login untuk MVP.
- **Risiko:** Dukungan IndexedDB/PWA berbeda-beda antar browser, khususnya iOS Safari (batasan storage & instalasi PWA). Perlu uji khusus di Safari iOS.

## 10. Roadmap Non-MVP (Future)
- Cloud sync opsional (akun + backend).
- Notifikasi/reminder pencatatan harian.
- Laporan tahunan & ekspor PDF/Excel.
- Multi-currency.
- Sharing dompet (keluarga/bersama).
