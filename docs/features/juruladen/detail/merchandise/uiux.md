# 🎨 UI/UX — Merchandise

> **Modul**: [Fitur Merchandise](fitur.md) | **UI/UX Utama**: [← Kembali ke UI/UX Spec](../../uiux-spec.md)

---

## 1. Rekap Vendor — Pivot Table

```
┌─────────────────────────────────────────────────────────┐
│  Rekap Vendor: Kaos Halal Bihalal ─── [📥 Download CSV] │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  Dimensi lain: Warna=[Semua ▼] Usia=[Semua ▼]           │
│                                                         │
│  ┌──────────────┬─────┬────┬────┬────┬────┬────┬────┬────┬───────┐│
│  │ Panjang Lgn  │ XS  │ S  │ M  │ L  │ XL │XXL │3XL │4XL │ Total ││
│  ├──────────────┼─────┼────┼────┼────┼────┼────┼────┼────┼───────┤│
│  │ Pendek       │  1  │  0 │  4 │ 15 │  9 │  8 │  1 │  1 │  39   ││
│  │ Panjang      │  0  │  4 │  6 │  7 │  2 │  1 │  0 │  0 │  20   ││
│  ├──────────────┼─────┼────┼────┼────┼────┼────┼────┼────┼───────┤│
│  │ TOTAL        │  1  │  4 │ 10 │ 22 │ 11 │  9 │  1 │  1 │  59   ││
│  └──────────────┴─────┴────┴────┴────┴────┴────┴────┴────┴───────┘│
│                                                         │
│  📋 Total pesanan: 59 pcs | 🏷️ Produk: Kaos HB 2026    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Rekap WA Group — per Qobilah

```
┌─────────────────────────────────────────────────────────┐
│  Rekap WA Group ─── [📋 Copy Teks] [📢 Share WA]        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  ┌─ Qobilah Ngaglik ───────────────────────────────────┐│
│  │  👤 Bpk. Ahmad (15 Jun)                             ││
│  │    ├── Ahmad → Kaos HB (Pendek, XL, Hitam) ×2       ││
│  │    └── Siti  → Kaos HB (Pendek, M, Putih)  ×1       ││
│  │    Total: Rp 255.000 | ✅ Lunas                     ││
│  │  ─────────────────────────────────────              ││
│  │  👤 Ibu Fatimah (16 Jun)                            ││
│  │    └── Fatimah → Kaos HB (Panjang, L, Navy) ×1      ││
│  │    Total: Rp 85.000  | 🟡 Sebagian                  ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─ Qobilah Sewon ────────────────────────────────────┐│
│  │  👤 Bpk. Rahman (14 Jun)                           ││
│  │    ├── Rahman → Totebag (A4, Navy)     ×1           ││
│  │    └── Aisyah → Totebag (A4, Maroon)   ×1           ││
│  │    Total: Rp 90.000  | 🔴 Belum                     ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 3. Produk & Varian Management

```
┌─────────────────────────────────────────────────────────┐
│  Produk: Kaos Halal Bihalal ─── [✏️ Edit] [🗑 Hapus]    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  Deskripsi: Kaos katun combed 30s                       │
│  Gambar: [🖼️ kaos-hb.jpg]                               │
│                                                         │
│  ┌─ Dimensi Varian ────────────────────────────────────┐│
│  │ [+ Tambah Dimensi]                                  ││
│  │                                                     ││
│  │ 📐 Ukuran: XS | S | M | L | XL | XXL | XXXL | XXXXL ││
│  │    [✏️] [🗑] [＋ Tambah Value]                       ││
│  │                                                     ││
│  │ 📐 Panjang Lengan: Pendek | Panjang                  ││
│  │    [✏️] [🗑] [＋ Tambah Value]                       ││
│  │                                                     ││
│  │ 📐 Warna: Hitam | Putih | Navy | Maroon             ││
│  │    [✏️] [🗑] [＋ Tambah Value]                       ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─ Daftar Varian (Kombinasi) ─────────────────────────┐│
│  │ [+ Tambah Varian]                                   ││
│  │ ├──────────────┬──────────┬──────────┬──────────────┤│
│  │ │ SKU          │ Kombinasi│ Harga    │ HPP          ││
│  │ ├──────────────┼──────────┼──────────┼──────────────┤│
│  │ │ KS-PDXLHT-DW │Pdk,XL,Htm│ Rp 85.000│ Rp 65.000    ││
│  │ │ KS-PJMPT-DW  │Pjg,M,Pth │ Rp 85.000│ Rp 65.000    ││
│  │ │ KS-PDSHT-AN  │Pdk,S,Htm │ Rp 75.000│ Rp 55.000    ││
│  │ └──────────────┴──────────┴──────────┴──────────────┘│
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 4. Form Pesanan

```
┌─────────────────────────────────────────────────────────┐
│  Pesanan Baru ────────────────────────────────────── [✕]│
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  Pemesan: [Bpk. Ahmad ▼]  👤 (pilih person)             │
│                                                         │
│  ┌─ Item Pesanan ──────────────────────────────────────┐│
│  │ [+ Tambah Item]                                     ││
│  │ ├──────────┬──────────┬──────┬──────┬───────────────┤│
│  │ │ Produk   │ Varian   │ Qty  │Untuk │ Subtotal      ││
│  │ ├──────────┼──────────┼──────┼──────┼───────────────┤│
│  │ │Kaos HB ▼ │Pdk,XL,Ht▼│  2   │👤Ahmad│ Rp 170.000  ││
│  │ │Kaos HB ▼ │Pdk,M,Pth▼│  1   │👤Siti │ Rp  85.000  ││
│  │ └──────────┴──────────┴──────┴──────┴───────────────┘│
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  Total: Rp 255.000                                      │
│  Status Bayar: [Lunas ▼]  Metode: [Transfer ▼]         │
│  Catatan: ___________________________                   │
│                                                         │
│  [Batal]                                 [💾 Simpan]    │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Komponen Spesifik

| Komponen | Fungsi |
|----------|--------|
| `VendorRecapTable` | Tabel pivot rekap vendor |
| `WARecapList` | List rekap per qobilah |
| `ProductForm` | CRUD produk + dimensi + varian |
| `VariantDimensionEditor` | Tambah/hapus dimensi & values |
| `VariantCombinationGrid` | Grid varian (SKU/kombinasi) |
| `OrderForm` | Form pesanan dengan item + person_id |
| `PersonPicker` | Autocomplete person dari data BAM |

---

## 6. Halaman

| Halaman | Route |
|---------|-------|
| Produk & Varian | `/events/{slug}/merch/produk` |
| Pesanan | `/events/{slug}/merch/pesanan` |
| Rekap Vendor | `/events/{slug}/merch/rekap-vendor` |
| Rekap WA Group | `/events/{slug}/merch/rekap-wa` |
| Laporan Keuangan | `/events/{slug}/merch/laporan` |

---

## 7. Related Docs

- [← Fitur Merchandise](fitur.md)
- [🎨 UI/UX Spec (Overview)](../../uiux-spec.md)
