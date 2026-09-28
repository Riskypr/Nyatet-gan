# Product Requirement Document (PRD)
## UI Redesign: Dompet & Sumber Dana Component

---

## 1. Document Overview

* **Project Name:** Redesign UI Dompet & Sumber Dana
* **Document Version:** v1.0
* **Target Interface:** Mobile & Web Responsiveness
* **Objective:** Meningkatkan keterbacaan (*readability*), kenyamanan visual (*hierarki visual*), dan pengalaman pengguna (*user experience*) pada komponen manajemen dompet dan sumber dana.

---

## 2. Background & Problem Statement

Tampilan UI Sumber Dana saat ini memerlukan pembaruan visual agar informasi utama (seperti total saldo dan jenis dompet) dapat diproses pengguna dengan lebih cepat. Ukuran *wallet card* yang lama terlalu kecil dan kurang menonjolkan saldo sebagai informasi utama. Selain itu, belum ada petunjuk visual mengenai total jumlah sumber dana yang dimiliki oleh pengguna.

---

## 3. Scope of Changes & Detailed Requirements

### 3.1 Header & Section Information
* **Teks Utama:** Header section berlabel **"Dompet dan sumber dana"**.
* **Informasi Tambahan (Sub-caption):** 
  * Menambahkan keterangan jumlah total sumber dana yang terdaftar persis di bawah judul utama.
  * *Contoh Teks:* `"3 Sumber dana terdaftar"` atau `"Terhubung dengan 4 dompet"`.
  * *Styling:* Menggunakan warna teks sekunder (*muted/gray*) dengan ukuran *font* yang lebih kecil dari judul utama.

### 3.2 Redesign Wallet Card Component
Setiap kartu (*wallet card*) direkonstruksi dengan tata letak dan hierarki visual sebagai berikut:

1. **Ukuran Card (Dimension):**
   * Ukuran fisik card dibuat **lebih besar dan lebih tinggi** dibanding versi sebelumnya untuk memberikan kesan premium dan *spacious*.
2. **Kiri Atas (Top-Left):**
   * Menampilkan **Icon Kategori/Jenis Dompet** (misal: Icon Bank, e-Wallet, atau Kartu Kredit).
3. **Kiri Bawah (Bottom-Left Layout Stack):**
   * **Elemen Atas:** Menampilkan **Nama Dompet & Sumber Dana** (misal: *BCA Main Account*, *Gopay*, atau *Tabungan Utama*).
   * **Elemen Bawah (Di Bawah Nama Dompet):** Menampilkan **Total Saldo** dengan ukuran *font* yang **signifikan lebih besar** (bold/prominent) dibandingkan nama dompet untuk menegaskan hierarki informasi.
4. **Kanan Atas (Top-Right):**
   * Menampilkan **Icon Dekorasional / Watermark Brand** yang menyatu secara harmonis dengan warna *background card* (menggunakan *opacity/blend mode* yang lembut agar tidak mengganggu keterbacaan).

### 3.3 Mobile Responsiveness & Carousel Behavior
* **Mobile Viewport Layout:**
  * Komponen menggunakan mekanisme *Horizontal Scroll/Carousel*.
  * Lebar (*width*) dari masing-masing card diatur sedemikian rupa sehingga pada layar perangkat seluler hanya memperlihatkan **2 card** (1 card penuh dan sebagian/intipan dari card kedua, sekitar 1.5 - 2 card pada *screen*).
  * Desain ini bertujuan untuk memberikan *visual affordance* kepada pengguna bahwa area tersebut dapat digeser secara horizontal (*swipeable*).

---

## 4. Visual Hierarchy & Component Wireframe (Logical)

```
+-------------------------------------------------------------------+
|  Dompet dan sumber dana                                           |
|  3 Sumber dana terdaftar                                          |
|                                                                   |
|  +--------------------------------+  +-------------------------+  |
|  | [Icon]             (BG Icon)   |  | [Icon]             (BG) |  |
|  |                                |  |                         |  |
|  |                                |  |                         |  |
|  | Nama Dompet & Sumber Dana      |  | Nama Dompet & SB        |  |
|  | Rp 15.500.000                  |  | Rp 2.350.000            |  |
|  +--------------------------------+  +-------------------------+  |
|  |<-------- Card 1 (Full) -------->|  |<-- Card 2 (Peek/Geser)->|  |
+-------------------------------------------------------------------+
```

---

## 5. Non-Functional & UI Guidelines

* **Accessibility:** Pastikan rasio kontras warna (*color contrast ratio*) antara teks saldo/nama dompet dengan warna *background card* memenuhi standar WCAG AA.
* **Micro-interactions:** Tambahkan animasi *smooth snap scroll* saat pengguna menggeser (*swipe*) kartu di perangkat mobile.
* **Fallback State:** Sediakan tampilan *skeleton loader* saat data saldo/sumber dana sedang di-load dari API.