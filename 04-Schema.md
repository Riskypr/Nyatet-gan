# Schema.md — Struktur Database (IndexedDB via Dexie.js)

## 1. Ringkasan
Database berjalan sepenuhnya di client (browser) menggunakan IndexedDB, diakses lewat Dexie.js. Tidak ada server database di MVP. Skema diberi nomor versi untuk mendukung migrasi (`db.version(n).stores({...})`).

```ts
// lib/db/dexie.ts
import Dexie, { Table } from 'dexie';

export class AppDatabase extends Dexie {
  wallets!: Table<Wallet, string>;
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  budgets!: Table<Budget, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super('moneyEarthDB');
    this.version(1).stores({
      wallets: 'id, name, createdAt',
      transactions: 'id, walletId, categoryId, type, date, [date+type], createdAt',
      categories: 'id, name, type',
      budgets: 'id, month, categoryId, [month+categoryId]',
      settings: 'key',
    });
  }
}
```

## 2. Tabel & Field

### 2.1 `wallets` (Dompet/Sumber Dana)
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (uuid) | Primary key |
| name | string | Nama dompet, mis. "Cash", "BCA", "GoPay" |
| icon | string | Nama/kode icon |
| color | string | Hex warna tag dompet |
| initialBalance | number | Saldo awal saat dompet dibuat |
| currentBalance | number | Saldo berjalan (di-update tiap ada transaksi) |
| isArchived | boolean | Soft-delete/arsip dompet |
| createdAt | ISOString | Tanggal dibuat |
| updatedAt | ISOString | Tanggal terakhir diubah |

### 2.2 `categories` (Kategori Transaksi)
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (uuid) | Primary key |
| name | string | Nama kategori, mis. "Makan", "Transport", "Gaji" |
| type | 'expense' \| 'income' | Jenis kategori |
| icon | string | Icon kategori |
| color | string | Hex warna (dipakai juga di pie chart) |
| isDefault | boolean | Apakah kategori bawaan sistem |
| createdAt | ISOString | — |

**Kategori default (seed):**
- Expense: Makan & Minum, Transportasi, Belanja, Tagihan, Hiburan, Kesehatan, Pendidikan, Lainnya.
- Income: Gaji, Bonus, Hadiah, Investasi, Lainnya.

### 2.3 `transactions` (Transaksi Pengeluaran/Pemasukan)
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (uuid) | Primary key |
| walletId | string | FK → `wallets.id` |
| categoryId | string | FK → `categories.id` |
| type | 'expense' \| 'income' | Jenis transaksi |
| amount | number | Nominal (selalu positif, tanda ditentukan oleh `type`) |
| date | ISOString (date only) | Tanggal transaksi |
| note | string? | Catatan opsional |
| createdAt | ISOString | Timestamp dibuat |
| updatedAt | ISOString | Timestamp diubah terakhir |

**Index tambahan:** `[date+type]` untuk mempercepat query dashboard & pie chart per bulan.

### 2.4 `budgets` (Target Pengeluaran)
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (uuid) | Primary key |
| month | string | Format `YYYY-MM` |
| categoryId | string \| null | Null = target total bulanan (bukan per kategori) |
| targetAmount | number | Nominal target |
| createdAt | ISOString | — |
| updatedAt | ISOString | — |

**Index tambahan:** `[month+categoryId]` agar unik per kombinasi bulan+kategori.

### 2.5 `settings` (Pengaturan Aplikasi)
| Field | Tipe | Keterangan |
|---|---|---|
| key | string | Primary key, mis. `"theme"`, `"lastBackupAt"`, `"currency"` |
| value | any (JSON) | Nilai pengaturan |

## 3. Relasi Antar Tabel
```
wallets (1) ──────< (N) transactions
categories (1) ────< (N) transactions
categories (1) ────< (N) budgets   (nullable — budget bisa juga "total", tanpa kategori)
```

## 4. Format File Backup (Export JSON)
```json
{
  "meta": {
    "app": "moneyEarth",
    "schemaVersion": 1,
    "exportedAt": "2026-09-14T10:00:00.000Z"
  },
  "data": {
    "wallets": [ /* array of Wallet */ ],
    "categories": [ /* array of Category */ ],
    "transactions": [ /* array of Transaction */ ],
    "budgets": [ /* array of Budget */ ],
    "settings": [ /* array of Setting */ ]
  }
}
```
- `schemaVersion` dipakai `backupService` untuk menjalankan migrasi ringan bila format berubah di versi app mendatang, sebelum data ditulis ke Dexie.
- Proses restore wajib divalidasi dengan Zod schema sebelum ditulis ke database, untuk mencegah data korup.

## 5. Aturan Konsistensi Data
- Setiap kali `transactions` ditambah/edit/hapus → `wallets.currentBalance` dompet terkait wajib direkalkulasi (bukan dihitung manual, agar tidak drift).
- Menghapus `wallets` yang masih punya transaksi: harus diarsipkan (`isArchived = true`), tidak benar-benar dihapus — demi integritas riwayat.
- Menghapus `categories` bawaan (`isDefault = true`) tidak diperbolehkan, hanya bisa disembunyikan.
