# 🛍️ Divisi Merchandise — Detail Fitur

> **Status**: Draft | **PRD**: [← Kembali ke PRD](../../prd.md)
> **ERD**: [Lihat ERD §2.10 Merchandise](../../erd.md#210-merchandise)
> **API**: [Lihat API Contract §2.14 Merchandise](../../api-contract.md#214-merchandise)

---

## 1. Overview

Divisi Merchandise mengelola produk merchandise event: dari pembuatan produk dengan varian multi-dimensi, pencatatan pesanan (termasuk atas nama siapa/person_id), rekap untuk vendor dan WA group, hingga laporan laba/rugi.

### Role

| Role | Akses |
|------|-------|
| **Anggota Merch** | CRUD penuh: produk, varian, pesanan, campaign |
| **Ketua** | View-only: rekap, laporan keuangan |
| **Bendahara** | View laporan keuangan merch untuk konsolidasi |

---

## 2. Model Data Varian Multi-Dimensi

Varian merchandise didesain dengan **tabel terpisah** untuk mendukung kombinasi dimensi yang fleksibel.

### Struktur Tabel

```
merch_products (1)
  └── merch_variant_dimensions (N)     ← "Ukuran", "Panjang Lengan", "Warna", "Usia"
        └── merch_variant_dimension_values (N)  ← "XL", "Pendek", "Hitam", "Dewasa"

merch_variants (SKU / Kombinasi)       ← Kombinasi value dari setiap dimensi
  └── merch_variant_combination_values (N)     ← Pivot: variant ↔ dimension_value
```

### Contoh: Kaos Halal Bihalal 2026

**Dimensi & Values:**
| Dimensi | Values |
|---------|--------|
| Panjang Lengan | Pendek, Panjang |
| Ukuran | XS, S, M, L, XL, XXL, XXXL, XXXXL |
| Warna | Hitam, Putih, Navy, Maroon |
| Usia | Dewasa, Anak |

**Contoh Varian (Kombinasi):**
| SKU | Kombinasi | Harga | HPP |
|-----|-----------|-------|-----|
| KS-PDXLHT-DW | Pendek + XL + Hitam + Dewasa | Rp 85.000 | Rp 65.000 |
| KS-PJMPT-DW | Panjang + M + Putih + Dewasa | Rp 85.000 | Rp 65.000 |
| KS-PDSHT-AN | Pendek + S + Hitam + Anak | Rp 75.000 | Rp 55.000 |

---

## 3. Fitur

### 3.1 Product Management

CRUD produk merchandise.

**Field:** `name`, `description`, `base_price` (nullable, fallback jika tidak pakai varian), `hpp`, `is_paid_event_product`, `image_url`, `is_active`.

**Flow:**
1. Buat produk → tambah dimensi → tambah values per dimensi → buat varian (kombinasi)
2. Produk bisa di-nonaktifkan (`is_active=false`) tanpa menghapus data pesanan

### 3.2 Variant Dimensions & Values

**Dimensions:** `POST /merch-products/{product}/dimensions`
- Field: `name`, `sort_order`

**Dimension Values:** `POST /merch-dimensions/{dimension}/values`
- Field: `value`, `sort_order`
- Unique constraint per (dimension_id, value)

### 3.3 Variants (SKU / Kombinasi)

**Create:** `POST /merch-products/{product}/variants`
- Field: `sku` (opsional), `price`, `hpp`, `dimension_value_ids[]`
- Validasi: `dimension_value_ids` harus berisi tepat satu value dari setiap dimensi produk
- Backend cek: tidak ada duplikasi kombinasi

**Response:** variant + breakdown dimensi.

### 3.4 Vendor Management

CRUD data vendor produksi: `name`, `contact_person`, `phone`, `address`, `notes`.

**Vendor Assignment:** assign vendor ke produk/varian dengan `production_cost` dan `min_order_qty`.

### 3.5 Order Management

CRUD pesanan — **satu order bisa berisi item untuk beberapa orang berbeda**.

**Order (header):**
| Field | Deskripsi |
|-------|-----------|
| `buyer_person_id` | Orang yang memesan (FK persons) |
| `status` | pending / confirmed / paid / cancelled |
| `payment_status` | unpaid / partial / paid |
| `payment_method` | cash / transfer / qris |
| `total_amount` | Auto-computed dari item |

**Order Items:**
| Field | Deskripsi |
|-------|-----------|
| `product_id` | Produk yang dipesan |
| `variant_id` | Varian yang dipilih |
| `person_id` | 🆕 **Orang yang dipesankan** (misal: kepala keluarga memesankan untuk anaknya) |
| `quantity` | Jumlah |
| `unit_price` | Harga satuan |
| `subtotal` | qty × unit_price |

**Contoh:** Bpk. Ahmad memesan untuk dirinya dan istrinya:
```
Order #1 — buyer: Bpk. Ahmad
  ├── Item 1: Kaos HB, varian=Pendek/XL/Hitam, person=Ahmad, qty=2
  └── Item 2: Kaos HB, varian=Pendek/M/Putih, person=Siti, qty=1
```

### 3.6 Order Recap — Vendor (Pivot Table)

Rekap untuk **disetorkan ke vendor produksi**.

**Format:** Tabel pivot multi-dimensi — baris = dimensi ke-1, kolom = dimensi ke-2, sel = total qty.

**Contoh output:**
| Panjang Lengan | XS | S | M | L | XL | XXL | XXXL | XXXXL | Total |
|---|---|----|---|---|----|----|------|-------|-------|
| Pendek | 1 | 0 | 4 | 15 | 9 | 8 | 1 | 1 | **39** |
| Panjang | 0 | 4 | 6 | 7 | 2 | 1 | 0 | 0 | **20** |
| **Total** | **1** | **4** | **10** | **22** | **11** | **9** | **1** | **1** | **59** |

**Jika >2 dimensi:** Dimensi ke-3+ ditampilkan sebagai filter dropdown di atas tabel.

**Endpoint:** `GET /events/{event}/merch-recap/vendor?product_id=1`

### 3.7 Order Recap — WA Group (per Qobilah)

Rekap untuk **disebarkan ke WA group**.

**Format:** List nama pemesan + produk + varian, diklasifikasikan berdasarkan **qobilah** (cabang keluarga — terintegrasi data silsilah BAM).

**Endpoint:** `GET /events/{event}/merch-recap/wa-group`

**Response dikelompokkan per qobilah**, lalu per order, lalu per item dengan person_name.

### 3.8 Merch Financial Report

Laporan keuangan merchandise:

| Metrik | Formula |
|--------|---------|
| **Laba Kotor** | SUM(order_items.subtotal) - SUM(order_items.qty × variant.hpp) |
| **Laba Bersih** | Laba Kotor - biaya operasional merch |
| **Total Terkumpul** | SUM(order_items.subtotal WHERE payment_status = 'paid') |
| **Total Outstanding** | SUM(order_items.subtotal WHERE payment_status != 'paid') |

### 3.9 WA Campaign

Broadcast campaign merchandise via Wablas:
- Pilih produk yang mau di-campaign
- Tulis template pesan (dengan placeholder)
- Kirim ke recipients (WA group member)
- Catat log campaign (`merch_campaigns` + `broadcast_logs`)

### 3.10 Auto Income Entry (Fase 6)

Saat pesanan status berubah ke `paid`, Eloquent Observer otomatis membuat `income_entries` dengan kategori `merchandise` dan link ke `budget_line_id` terkait.

---

## 4. API Endpoints

### Products & Variants
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events/{event}/merch-products` | List produk |
| `POST` | `/events/{event}/merch-products` | Create produk |
| `PUT` | `/merch-products/{id}` | Update produk |
| `DELETE` | `/merch-products/{id}` | Delete produk |
| `GET` | `/merch-products/{product}/dimensions` | List dimensi varian |
| `POST` | `/merch-products/{product}/dimensions` | Create dimensi |
| `PUT` | `/merch-dimensions/{id}` | Update dimensi |
| `DELETE` | `/merch-dimensions/{id}` | Delete dimensi |
| `POST` | `/merch-dimensions/{dimension}/values` | Create dimension value |
| `PUT` | `/merch-dimension-values/{id}` | Update value |
| `DELETE` | `/merch-dimension-values/{id}` | Delete value |
| `GET` | `/merch-products/{product}/variants` | List varian |
| `POST` | `/merch-products/{product}/variants` | Create varian (kombinasi) |
| `PUT` | `/merch-variants/{id}` | Update varian |
| `DELETE` | `/merch-variants/{id}` | Delete varian |

### Vendors
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/merch-vendors` | List vendor |
| `POST` | `/merch-vendors` | Create vendor |
| `PUT` | `/merch-vendors/{id}` | Update vendor |
| `DELETE` | `/merch-vendors/{id}` | Delete vendor |

### Orders
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events/{event}/merch-orders` | List pesanan |
| `POST` | `/events/{event}/merch-orders` | Create pesanan + items |
| `PUT` | `/merch-orders/{id}` | Update pesanan |
| `DELETE` | `/merch-orders/{id}` | Delete pesanan |

### Recaps & Reports
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events/{event}/merch-recap/vendor` | Rekap vendor (pivot table) |
| `GET` | `/events/{event}/merch-recap/wa-group` | Rekap WA group (per qobilah) |
| `GET` | `/events/{event}/merch-financial` | Laporan keuangan merch |

### Campaigns
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events/{event}/merch-campaigns` | List campaign |
| `POST` | `/events/{event}/merch-campaigns` | Create campaign |
| `PUT` | `/merch-campaigns/{id}` | Update campaign |
| `DELETE` | `/merch-campaigns/{id}` | Delete campaign |

---

## 5. Service Classes

| Service | Method | Deskripsi |
|---------|--------|-----------|
| `MerchFinancialService` | `grossProfit(product)` | Laba kotor per produk |
| `MerchFinancialService` | `netProfit(event)` | Laba bersih keseluruhan |
| `MerchFinancialService` | `totalCollected(event)` | Total uang terkumpul |
| `MerchRecapService` | `vendorPivot(product)` | Query pivot multi-dimensi |
| `MerchRecapService` | `waGroupRecap(event)` | Query rekap per qobilah |

---

## 6. UI Components

| Komponen | Fungsi |
|----------|--------|
| `ProductForm` | Form CRUD produk + dimensi + varian |
| `VariantDimensionEditor` | Tambah/hapus dimensi & values |
| `VariantCombinationGrid` | Grid daftar varian (kombinasi) |
| `OrderForm` | Form pesanan dengan item per person |
| `PersonPicker` | Autocomplete person (dari data BAM) |
| `VendorRecapTable` | Tabel pivot rekap vendor |
| `WARecapList` | List rekap per qobilah |
| `CampaignModal` | Modal campaign broadcast WA |

---

## 7. Halaman

| Halaman | Route | Komponen Utama |
|---------|-------|----------------|
| **Produk & Varian** | `/events/{slug}/merch/produk` | `ProductForm`, `VariantDimensionEditor`, `VariantCombinationGrid` |
| **Pesanan** | `/events/{slug}/merch/pesanan` | `OrderForm`, `PersonPicker` |
| **Rekap Vendor** | `/events/{slug}/merch/rekap-vendor` | `VendorRecapTable` |
| **Rekap WA Group** | `/events/{slug}/merch/rekap-wa` | `WARecapList` |
| **Laporan Keuangan** | `/events/{slug}/merch/laporan` | Chart + tabel |

---

## 8. Acceptance Criteria

- [ ] Produk dengan multi-dimensi varian bisa dibuat (tabel terpisah: dimensions, dimension_values, combination_values)
- [ ] Setiap varian adalah kombinasi dari nilai-nilai dimensi dengan harga & HPP sendiri
- [ ] Pesanan bisa dicatat dengan item + varian + `person_id` (atas nama siapa)
- [ ] Rekap Vendor: tabel pivot multi-dimensi menampilkan jumlah per kombinasi varian
- [ ] Rekap WA Group: list nama pemesan + produk + varian, dikelompokkan per qobilah
- [ ] Laporan merch menampilkan laba kotor & bersih

---

## 9. Related Docs

- [← PRD (Overview)](../../prd.md)
- [🗄️ ERD §2.10 — Merchandise](../../erd.md#210-merchandise)
- [📡 API §2.14 — Merchandise](../../api-contract.md#214-merchandise)
- [🎨 UI/UX §4.7-4.8 — Merch Recap](../../uiux-spec.md#47-merchandise-order-recap--vendor-pivot-table)
- [🚀 Implementasi Fase 5](../../implementasi.md#fase-5--merchandise)
- [🛒 E-Commerce (V2)](../../future/ecommerce-merch.md)
