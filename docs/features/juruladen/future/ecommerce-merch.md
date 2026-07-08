# 🛒 E-Commerce Merchandise (V2)

> **Status**: Deferred — tidak masuk dalam scope V1 Juruladen
> **Priority**: P2 (setelah core Juruladen selesai)

---

## Overview

Modul e-commerce merchandise memungkinkan **member keluarga BAM** untuk memesan merchandise secara mandiri melalui storefront publik, berbeda dengan V1 yang hanya menyediakan tools input pesanan untuk panitia.

---

## Key Features (Planned)

### 1. Auth berbasis NIB

- Member menautkan/melepas NIB (Nomor Induk BAM) sebagai identitas
- Validasi NIB menggunakan `NibService` yang sudah ada (Luhn checksum)
- Setelah tertaut, member bisa mengakses storefront dan melihat history pesanannya

### 2. Storefront

- Halaman katalog produk per event
- Filter/kategori produk
- Detail produk dengan galeri gambar dan daftar varian

### 3. Keranjang Belanja

- Memasukkan banyak produk ke dalam keranjang
- Mengelola isi keranjang (update qty, hapus item)
- Pilih varian dengan harga berbeda sesuai kombinasi dimensi
- **Pilih nama orang/person dari data silsilah BAM** untuk setiap item sebelum checkout
  - Satu order bisa berisi item untuk beberapa orang berbeda

### 4. Checkout & Pembayaran

- Detail pesanan sebelum checkout
- Pilih metode pembayaran
- Integrasi payment gateway (Midtrans/Xendit)
- Callback/notifikasi status pembayaran

### 5. History & Tracking

- List rekap pesanan pribadi (seperti format WA group)
- Detail setiap order + status pembayaran
- History pesanan per event

---

## Tech Considerations

| Area | Detail |
|------|--------|
| **Frontend** | Public storefront — bisa satu subdomain dengan Juruladen atau terpisah |
| **Auth** | Kombinasi Sanctum token + NIB validation |
| **Payment Gateway** | Midtrans (rekomendasi: dukungan bank lokal Indonesia lengkap) |
| **Data Source** | Reuse `merch_products`, `merch_variants`, `merch_orders` dari Juruladen V1 |
| **New Tables** | `merch_carts`, `merch_cart_items`, `merch_payment_transactions` |

---

## Integration Points dengan Juruladen V1

- Merchandise yang dibuat panitia di Juruladen V1 langsung muncul di storefront V2
- Pesanan dari storefront V2 bisa dilihat panitia di dashboard Juruladen V1
- Pembayaran otomatis tercatat sebagai **income entry** di modul Pendanaan

---

## Estimasi (Rough)

| Fase | Jam |
|------|-----|
| Setup storefront + auth NIB | 15 |
| Keranjang + checkout flow | 20 |
| Payment gateway integration | 15 |
| History + tracking | 10 |
| Testing + deployment | 10 |
| **Total** | **~70 jam** |

---

*Dokumen ini akan diperdetail saat V2 dimulai. Untuk sekarang, fokus pada core Juruladen V1.*
