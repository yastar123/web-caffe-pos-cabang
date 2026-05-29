# KopiFlow POS

Sistem Point-of-Sale multi-cabang berbasis web untuk kafe modern. Dibangun dengan React, Express, dan PostgreSQL.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Halaman & Menu](#halaman--menu)
- [Peran & Hak Akses](#peran--hak-akses)
- [Modul Sistem](#modul-sistem)
- [Teknologi](#teknologi)
- [Instalasi & Menjalankan](#instalasi--menjalankan)
- [Kredensial Demo](#kredensial-demo)
- [Struktur Proyek](#struktur-proyek)
- [API Endpoints](#api-endpoints)
- [Skema Database](#skema-database)

---

## Fitur Utama

### Point of Sale (POS)
- Antarmuka split-panel: grid menu di kiri, keranjang di kanan (desktop)
- Di mobile: floating cart button + bottom sheet 92vh
- Pencarian menu real-time dan filter per kategori
- Tambah/kurang/hapus item dari keranjang
- Catatan pesanan per item maupun per order
- Diskon manual (nominal, bukan persentase)
- Kalkulasi pajak otomatis dari tarif pajak cabang
- Pilihan metode pembayaran: Tunai, Kartu, QRIS, E-Wallet
- Pre-select meja dari query param `?table=X` (dari halaman Meja)
- Redirect otomatis ke halaman Meja setelah order sukses
- Guard: pesan jelas jika akun belum ditugaskan ke cabang

### Manajemen Meja
- Denah lantai visual dengan status real-time
- Status meja: Tersedia, Terisi, Dipesan, Bersih-bersih
- Klik meja untuk langsung membuka POS dengan meja terpilih
- Filter tampilan per status
- CRUD meja (tambah, edit kapasitas, hapus)

### Tampilan Dapur (Kitchen Display System)
- Kanban board 3-kolom: Pesanan Baru → Memasak → Siap Disajikan
- Auto-refresh setiap 20 detik
- Timer per pesanan dengan indikator urgensi warna (hijau/kuning/merah)
- Animasi pulse untuk pesanan yang sudah lebih dari 20 menit
- Progress status item: `new` → `processing` → `ready` → `served`
- Tombol "Sajikan Semua Siap" untuk bulk action
- Catatan khusus item ditampilkan dengan highlight merah
- Urutan berdasarkan pesanan paling lama menunggu

### Manajemen Reservasi
- Navigasi tanggal dengan tombol ← → dan date picker
- Label cerdas: "Hari Ini", "Besok", "Kemarin"
- Filter status: Semua, Menunggu, Dikonfirmasi, Duduk, Dibatalkan
- Alur status: Menunggu → Konfirmasi → Dudukkan Tamu
- Data reservasi: nama tamu, telepon, email, tanggal, waktu, jumlah tamu, meja, deposit, catatan khusus
- Edit reservasi yang sudah ada (status selain Dibatalkan/Duduk)
- Summary bar: total reservasi, menunggu, dikonfirmasi, duduk, total tamu

### Manajemen Menu
- Manajemen kategori menu (CRUD): nama, deskripsi, urutan tampilan
- Manajemen item menu (CRUD): nama, kategori, harga, deskripsi, URL gambar, waktu persiapan, toggle ketersediaan
- Filter item per kategori
- Toggle ketersediaan item langsung dari kartu
- Upload/link gambar item menu

### Stok & Inventaris
- Manajemen bahan baku (CRUD): nama, satuan, stok minimum, stok saat ini, biaya per unit, gambar
- Indikator status stok: Baik, Hampir Habis, Stok Rendah, Kehabisan Stok
- Progress bar visual level stok relatif terhadap minimum
- Pencatatan pergerakan stok: Masuk, Keluar, Penyesuaian, dengan catatan
- Pesanan Pembelian (Purchase Order) ke pemasok:
  - Pilih pemasok, perkiraan pengiriman, catatan
  - Tambah item dengan pilih bahan, jumlah, biaya satuan
  - Total PO dihitung otomatis
  - Status PO: Menunggu, Diterima, Dibatalkan

### Laporan & Analitik
- Ringkasan penjualan: total pendapatan, jumlah order, rata-rata order
- Filter periode: Hari Ini, 7 Hari, 30 Hari, custom date range
- Grafik pendapatan harian (BarChart)
- Top item terlaris dengan persentase kontribusi (HorizontalBar)
- Distribusi metode pembayaran (PieChart)
- Perbandingan antar cabang (owner only): revenue, order, rata-rata per cabang
- Export laporan ke Excel (.xlsx) dengan multi-sheet
- Loading state pada tombol Export (disabled selama data masih dimuat)

### Manajemen Pelanggan (CRM)
- Database pelanggan dengan search real-time (debounced 300ms)
- Data pelanggan: nama, telepon, email, tanggal lahir, catatan
- Program loyalitas: poin, tier, total pembelanjaan, jumlah kunjungan
- Tier keanggotaan: Standard, Bronze, Silver, Gold, Platinum
- Badge tier dengan warna dan ikon berbeda per level
- Edit detail pelanggan dari dialog

### Manajemen Cabang
- Kartu visual per cabang dengan informasi lengkap
- Data cabang: nama, alamat, telepon, email, tarif pajak (%)
- Status cabang: Aktif / Tidak Aktif
- Tarif pajak per cabang (digunakan oleh POS)
- CRUD cabang lengkap (hanya owner)
- Konfirmasi dialog sebelum hapus cabang

### Manajemen Staf
- Direktori staf dengan avatar inisial nama
- Data staf: nama, email, peran, cabang, status aktif
- Filter berdasarkan peran
- Pencarian berdasarkan nama atau email (client-side)
- Summary: total staf, aktif, tidak aktif
- Buat akun staf baru dengan password sementara
- Edit staf (nama, email, peran, cabang, status aktif)
- Password tidak dapat diubah via edit (keamanan)

### Pengaturan
- Profil akun: ubah nama tampilan (email dikunci, read-only)
- Konfigurasi cabang: nama, alamat, telepon, email, tarif pajak
- Branch config hanya muncul jika user ditugaskan ke cabang

### Dasbor
- Salam waktu (Selamat pagi/siang/malam)
- Tanggal & waktu live (update setiap 1 menit)
- Quick actions: POS, Meja, Dapur, Laporan
- KPI Cards: Pendapatan Hari Ini (+ perbandingan kemarin), Pesanan Aktif, Okupansi Meja, Peringatan Stok Rendah
- Grafik area jam sibuk (pesanan per jam hari ini)
- Panel low-stock: item di bawah minimum dengan progress bar
- Tombol Segarkan untuk invalidate semua query dashboard

---

## Halaman & Menu

| Path | Halaman | Deskripsi |
|------|---------|-----------|
| `/` atau `/login` | **Login** | Halaman masuk dengan hero panel & quick-login demo role |
| `/dashboard` | **Dasbor** | Overview KPI, grafik, quick actions |
| `/pos` | **POS** | Antarmuka kasir order & pembayaran |
| `/tables` | **Meja** | Denah lantai visual dengan status real-time |
| `/kitchen` | **Dapur** | Kanban board kitchen display |
| `/reservations` | **Reservasi** | Manajemen booking meja |
| `/menu` | **Menu** | CRUD kategori dan item menu |
| `/stock` | **Stok** | Inventaris bahan dan purchase order |
| `/reports` | **Laporan** | Analitik penjualan dan ekspor Excel |
| `/customers` | **Pelanggan** | CRM dan program loyalitas |
| `/branches` | **Cabang** | Manajemen lokasi toko (owner only) |
| `/users` | **Staf** | Direktori dan manajemen akun staf |
| `/settings` | **Pengaturan** | Profil dan konfigurasi cabang |

---

## Peran & Hak Akses

### Ringkasan Peran

| Peran | Bahasa Indonesia | Deskripsi |
|-------|-----------------|-----------|
| `owner` | Pemilik | Akses penuh ke semua fitur dan semua cabang |
| `manager` | Manajer | Akses operasional dan manajemen, kecuali Cabang |
| `cashier` | Kasir | POS, Meja, Reservasi, Pelanggan |
| `waiter` | Pelayan | POS, Meja, Dapur, Reservasi |
| `chef` | Koki | Dapur saja |
| `warehouse` | Gudang | Stok & Inventaris |

### Matriks Akses Per Halaman

| Halaman | Owner | Manajer | Kasir | Pelayan | Koki | Gudang |
|---------|-------|---------|-------|---------|------|--------|
| Dasbor | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| POS | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Meja | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Dapur | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Reservasi | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Menu | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Stok | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Laporan | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Pelanggan | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Cabang | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Staf | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Pengaturan | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

> Navigasi sidebar dan bottom nav mobile menyesuaikan otomatis berdasarkan peran yang login.

---

## Modul Sistem

### Sistem Multi-Cabang
- Setiap staf (selain owner) ditugaskan ke satu cabang
- Data difilter otomatis berdasarkan `branchId` pengguna yang login
- Owner dapat melihat data lintas cabang (Reports, Branches)
- Tarif pajak POS diambil dari konfigurasi masing-masing cabang

### Sistem Autentikasi
- JWT disimpan di `localStorage`
- Token dikirim via header `Authorization: Bearer <token>` pada setiap request API
- `useAuth()` hook menyediakan: `user`, `login`, `logout`, `refreshUser`
- Route guard: halaman non-login redirect ke `/login` jika belum auth
- Redirect ke `/dashboard` setelah login berhasil

### Program Loyalitas Pelanggan
- Poin diberikan otomatis saat transaksi POS (berdasarkan nominal)
- Tier keanggotaan: Standard → Bronze → Silver → Gold → Platinum
- Riwayat kunjungan dan total pembelanjaan terakumulasi otomatis
- Manajemen data pelanggan via halaman Pelanggan

### Alur Order POS Lengkap
```
Pilih Meja → Pilih Item Menu → Atur Kuantitas & Catatan → 
Input Diskon → Pilih Metode Pembayaran → Proses Pesanan → 
Order terbuat di DB → Payment diproses → Redirect ke Meja
```

### Alur Kitchen Display
```
Order dibuat (POS) → Item masuk Kitchen Queue (status: new) →
Chef klik "Mulai" → status: processing →
Chef klik "Siap" → status: ready →
Waiter klik "Disajikan" → status: served
```

---

## Teknologi

### Frontend
| Teknologi | Keterangan |
|-----------|-----------|
| React 19 | UI library |
| Vite | Build tool & dev server |
| TypeScript 5.9 | Type safety |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui | Komponen UI (Dialog, Table, Badge, dll) |
| Wouter | Client-side routing |
| TanStack Query v5 | Server state management & caching |
| Recharts | Grafik & chart |
| date-fns | Manipulasi tanggal |
| xlsx | Export Excel |
| Lucide React | Icon set |

### Backend
| Teknologi | Keterangan |
|-----------|-----------|
| Node.js 24 | Runtime |
| Express 5 | HTTP framework |
| TypeScript | Type safety |
| Drizzle ORM | Database ORM |
| PostgreSQL | Database (Supabase) |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth |
| Zod (v4) | Input validation |
| Pino | Structured logging |

### Tooling
| Teknologi | Keterangan |
|-----------|-----------|
| pnpm workspaces | Monorepo package manager |
| Orval | OpenAPI → React Query hooks codegen |
| esbuild | API server bundler |
| drizzle-kit | DB schema migrations |

---

## Instalasi & Menjalankan

### Prasyarat
- Node.js 24+
- pnpm 9+
- PostgreSQL database (Supabase atau lokal)

### Environment Variables

Buat file `.env` di root dan isi:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
SESSION_SECRET=your-super-secret-key-min-32-chars
```

### Setup Awal

```bash
# Install dependencies
pnpm install

# Push schema ke database
pnpm --filter @workspace/db run push

# Seed data demo (WAJIB setelah fresh install)
pnpm --filter @workspace/scripts run seed
```

### Menjalankan Development

```bash
# Terminal 1: API Server (port 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2: Frontend (port 5000)
pnpm --filter @workspace/pos-kafe run dev
```

### Perintah Lainnya

```bash
# Typecheck semua package
pnpm run typecheck

# Build semua package
pnpm run build

# Regenerasi API hooks dari OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push perubahan schema DB
pnpm --filter @workspace/db run push
```

---

## Kredensial Demo

Setelah menjalankan seed, gunakan akun berikut untuk login:

| Peran | Email | Password |
|-------|-------|----------|
| Pemilik (Owner) | owner@kopiflow.id | password123 |
| Manajer | manager@kopiflow.id | password123 |
| Kasir | cashier@kopiflow.id | password123 |
| Pelayan | waiter@kopiflow.id | password123 |
| Koki | chef@kopiflow.id | password123 |
| Gudang | warehouse@kopiflow.id | password123 |

> Halaman login memiliki tombol quick-access untuk setiap peran yang mengisi form otomatis.

---

## Struktur Proyek

```
kopiflow-pos/
├── artifacts/
│   ├── api-server/               # Express API server
│   │   └── src/
│   │       └── routes/           # 14 route files
│   │           ├── auth.ts
│   │           ├── branches.ts
│   │           ├── customers.ts
│   │           ├── dashboard.ts
│   │           ├── ingredients.ts
│   │           ├── kitchen.ts
│   │           ├── menu-categories.ts
│   │           ├── menu-items.ts
│   │           ├── orders.ts
│   │           ├── payments.ts
│   │           ├── purchase-orders.ts
│   │           ├── reports.ts
│   │           ├── reservations.ts
│   │           ├── stock-movements.ts
│   │           ├── tables.ts
│   │           └── users.ts
│   └── pos-kafe/                 # React frontend
│       └── src/
│           ├── pages/            # 13 halaman
│           │   ├── login.tsx
│           │   ├── dashboard.tsx
│           │   ├── pos.tsx
│           │   ├── tables.tsx
│           │   ├── kitchen.tsx
│           │   ├── reservations.tsx
│           │   ├── menu.tsx
│           │   ├── stock.tsx
│           │   ├── reports.tsx
│           │   ├── customers.tsx
│           │   ├── branches.tsx
│           │   ├── users.tsx
│           │   └── settings.tsx
│           ├── components/
│           │   ├── Layout.tsx    # Sidebar + mobile nav
│           │   └── ui/           # shadcn/ui components
│           ├── lib/
│           │   └── auth.tsx      # useAuth() hook & AuthProvider
│           └── index.css         # Design system & animations
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml          # OpenAPI 3.0 contract (source of truth)
│   ├── api-client-react/
│   │   └── src/generated/api.ts  # React Query hooks (auto-generated)
│   ├── api-zod/
│   │   └── src/generated/api.ts  # Zod schemas (auto-generated)
│   └── db/
│       └── src/schema/           # Drizzle schema (9 file)
│           ├── branches.ts
│           ├── users.ts
│           ├── menu.ts
│           ├── tables.ts
│           ├── reservations.ts
│           ├── orders.ts
│           ├── payments.ts
│           ├── stock.ts
│           └── customers.ts
└── scripts/
    └── src/seed.ts               # Database seed script
```

---

## API Endpoints

### Autentikasi
| Method | Path | Keterangan |
|--------|------|-----------|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Info user yang sedang login |

### Cabang
| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/api/branches` | Daftar semua cabang |
| POST | `/api/branches` | Buat cabang baru |
| GET | `/api/branches/:id` | Detail cabang |
| PUT | `/api/branches/:id` | Update cabang |
| DELETE | `/api/branches/:id` | Hapus cabang |

### Pengguna / Staf
| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/api/users` | Daftar staf (filter: branchId, role) |
| POST | `/api/users` | Buat akun staf |
| PUT | `/api/users/:id` | Update akun staf |

### Menu
| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/api/menu-categories` | Daftar kategori |
| POST | `/api/menu-categories` | Buat kategori |
| PUT | `/api/menu-categories/:id` | Update kategori |
| DELETE | `/api/menu-categories/:id` | Hapus kategori |
| GET | `/api/menu-items` | Daftar item menu (filter: branchId, categoryId) |
| POST | `/api/menu-items` | Buat item menu |
| PUT | `/api/menu-items/:id` | Update item menu |
| DELETE | `/api/menu-items/:id` | Hapus item menu |

### Meja
| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/api/tables` | Daftar meja |
| POST | `/api/tables` | Buat meja |
| PUT | `/api/tables/:id` | Update meja |
| DELETE | `/api/tables/:id` | Hapus meja |

### Reservasi
| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/api/reservations` | Daftar reservasi (filter: branchId, date, status) |
| POST | `/api/reservations` | Buat reservasi |
| PUT | `/api/reservations/:id` | Update / ubah status |

### Order & Pembayaran
| Method | Path | Keterangan |
|--------|------|-----------|
| POST | `/api/orders` | Buat order baru |
| POST | `/api/payments` | Proses pembayaran |

### Dapur
| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/api/kitchen/queue` | Antrian dapur aktif |
| PUT | `/api/kitchen/items/:itemId/status` | Update status item dapur |

### Stok
| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/api/ingredients` | Daftar bahan baku |
| POST | `/api/ingredients` | Tambah bahan |
| POST | `/api/stock-movements` | Catat pergerakan stok |
| GET | `/api/purchase-orders` | Daftar purchase order |
| POST | `/api/purchase-orders` | Buat purchase order |

### Pelanggan
| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/api/customers` | Daftar pelanggan (search) |
| POST | `/api/customers` | Tambah pelanggan |
| PUT | `/api/customers/:id` | Update pelanggan |

### Laporan
| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/api/reports/sales-summary` | Ringkasan penjualan |
| GET | `/api/reports/top-items` | Item terlaris |
| GET | `/api/reports/payment-methods` | Distribusi metode bayar |
| GET | `/api/reports/branch-comparison` | Perbandingan cabang |

### Dasbor
| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/api/dashboard/overview` | KPI cards data |
| GET | `/api/dashboard/peak-hours` | Volume pesanan per jam |
| GET | `/api/dashboard/low-stock` | Item stok rendah |

---

## Skema Database

### Tabel Utama

| Tabel | Kolom Kunci | Keterangan |
|-------|-------------|-----------|
| `branches` | id, name, address, phone, email, taxRate, isActive | Data cabang |
| `users` | id, name, email, password, role, branchId, isActive | Akun staf |
| `menu_categories` | id, branchId, name, description, sortOrder | Kategori menu |
| `menu_items` | id, branchId, categoryId, name, price, imageUrl, prepTime, isAvailable | Item menu |
| `tables` | id, branchId, number, capacity, status | Meja |
| `reservations` | id, branchId, tableId, customerName, customerPhone, date, time, guestCount, status, depositAmount | Reservasi |
| `orders` | id, branchId, tableId, orderNumber, status, subtotal, discountAmount, taxAmount, totalAmount, notes | Pesanan |
| `order_items` | id, orderId, menuItemId, menuItemName, quantity, unitPrice, kitchenStatus, notes | Item dalam pesanan |
| `payments` | id, orderId, branchId, amount, method, status | Pembayaran |
| `ingredients` | id, branchId, name, unit, currentStock, minStock, costPerUnit | Bahan baku |
| `stock_movements` | id, ingredientId, branchId, type, quantity, notes | Pergerakan stok |
| `purchase_orders` | id, branchId, supplierName, status, expectedDelivery, notes, totalAmount | PO ke pemasok |
| `purchase_order_items` | id, purchaseOrderId, ingredientId, ingredientName, quantity, unit, unitCost, totalCost | Item PO |
| `customers` | id, name, phone, email, birthdate, loyaltyPoints, membershipTier, visitCount, totalSpend, notes | Pelanggan |

### Enum & Status

**Order Status:** `pending`, `preparing`, `ready`, `completed`, `cancelled`

**Kitchen Item Status:** `new`, `processing`, `ready`, `served`

**Table Status:** `available`, `occupied`, `reserved`, `cleaning`

**Reservation Status:** `pending`, `confirmed`, `seated`, `cancelled`

**Payment Method:** `cash`, `card`, `qris`, `ewallet`

**Purchase Order Status:** `pending`, `received`, `cancelled`

**Membership Tier:** `standard`, `bronze`, `silver`, `gold`, `platinum`

**User Role:** `owner`, `manager`, `cashier`, `waiter`, `chef`, `warehouse`

---

## Desain & UI

### Tema Warna
- **Primary:** Teal gelap (#1a5c5c) — warna utama brand
- **Secondary:** Amber/cokelat (#c87533) — aksen hangat
- **Background:** Krem lembut (#f9f6f1) — nuansa kafe
- **Dark mode:** Didukung penuh dengan toggle di sidebar

### Komponen UI Kustom
- `stagger-children` — animasi grid item berurutan dengan delay
- `card-hover` — lift effect pada hover kartu
- `glass` — efek kaca (backdrop blur) untuk surface transparan
- `gradient-text` — teks dengan gradient primary→secondary
- `page-enter` — animasi masuk halaman
- `urgency-pulse` — pulse animation untuk order kritis di dapur
- `shimmer` — loading skeleton dengan animasi shimmer

### Responsivitas
- **Mobile** (< 768px): Bottom navigation bar 4 item + "Lainnya"
- **Tablet** (768px–1024px): Kolom tabel disembunyikan secara progresif
- **Desktop** (> 1024px): Sidebar kiri tetap, layout penuh
- Semua tap target minimum 44×44px
- Typography fluid dengan `clamp()`: 13px–15px body, 1.5rem–2.25rem heading

---

*KopiFlow POS — Instrumen presisi untuk operasional kafe modern.*
