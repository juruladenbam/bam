# 🎨 UI/UX — Pendanaan

> **Modul**: [Fitur Pendanaan](fitur.md) | **UI/UX Utama**: [← Kembali ke UI/UX Spec](../../uiux-spec.md)

---

## 1. Cashflow Page

```
┌─────────────────────────────────────────────────────────┐
│  Pendanaan ─── [💲 Saldo: Rp 5.500.000]                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  ┌─ Chart: Cashflow ───────────────────────────────────┐│
│  │  ██░░░░  ░░██░░  ██░░░░  ░░██░░                     ││
│  │  Mg 1    Mg 2    Mg 3    Mg 4                       ││
│  │  ■ Income  ■ Expense                                ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─ Tab: Pemasukan ──┐  ┌─ Tab: Pengeluaran ──┐        │
│  │ [+ Tambah]        │  │ [+ Tambah]          │        │
│  │ ┌────────────────┐│  │ ┌──────────────────┐│        │
│  │ │10 Jun | Iuran  ││  │ │12 Jun | Catering ││        │
│  │ │Bpk.Ahmad       ││  │ │Bu Sri            ││        │
│  │ │Rp 500.000 ✅   ││  │ │Rp 6.250.000 ✅   ││        │
│  │ └────────────────┘│  │ └──────────────────┘│        │
│  │ ┌────────────────┐│  │ ┌──────────────────┐│        │
│  │ │11 Jun | Donasi ││  │ │13 Jun | Dekorasi ││        │
│  │ │Anonim          ││  │ │Tenda Jaya        ││        │
│  │ │Rp 2.000.000 ✅ ││  │ │Rp 2.500.000 ✅   ││        │
│  │ └────────────────┘│  │ └──────────────────┘│        │
│  └───────────────────┘  └────────────────────┘         │
│                                                         │
│  [Export PDF] [Export Google Sheets]                    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Form Transaksi Cepat

```
┌────────────────────────────────────┐
│  Tambah Pemasukan              [✕] │
│  ──────────────────────────────     │
│                                     │
│  Kategori: [Iuran ▼]               │
│  Jumlah:   Rp [___________]        │
│            (auto-format Rupiah)     │
│  Dari:     [___________]  👤       │
│  Metode:   [Transfer ▼]            │
│  Tanggal:  [15/06/2026]  📅        │
│  No. Kuitansi: [_________]         │
│  Budget Line: [Iuran per KK ▼]     │
│  Catatan:  [___________________]   │
│                                     │
│  [Batal]             [💾 Simpan]   │
└────────────────────────────────────┘
```

---

## 3. Budget Line Payment Tracking

```
┌─────────────────────────────────────────────────────────┐
│  Budget Plan: Anggaran HB 2026 ─── [📊 Budget vs Actual]│
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Pengeluaran                                         ││
│  │ ├──────────────┬──────────┬──────────┬──────────────┤│
│  │ │ Item         │ Rencana  │ Dibayar  │ Status       ││
│  │ ├──────────────┼──────────┼──────────┼──────────────┤│
│  │ │ Konsumsi     │ 6.250K   │ 6.250K   │ ✅ Lunas     ││
│  │ │ Dekorasi     │ 2.500K   │ 1.500K   │ 🟡 Sebagian  ││
│  │ │ Dokumentasi  │ 1.500K   │ 0        │ 🔴 Belum     ││
│  │ │ ATK          │   500K   │   500K   │ ✅ Lunas     ││
│  │ ├──────────────┼──────────┼──────────┼──────────────┤│
│  │ │ TOTAL        │10.750K   │ 8.250K   │              ││
│  │ └──────────────┴──────────┴──────────┴──────────────┘│
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  💡 Tips: Pendapatan belum terkumpul semua? Bayar sesuai │
│     prioritas — item dengan status 🔴 perlu perhatian.   │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Budget Plan Form

```
┌─────────────────────────────────────────────────────────┐
│  Budget Plan: Anggaran HB 2026 ─── [✏️ Edit]            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  ┌─ Pemasukan ─────────────────────────────────────────┐│
│  │ [+ Tambah Baris]                                    ││
│  │ ├──────────────┬──────────┬─────────────────────────┤│
│  │ │ Kategori     │ Rencana  │ Deskripsi               ││
│  │ ├──────────────┼──────────┼─────────────────────────┤│
│  │ │ Iuran        │ 10.000K  │ Iuran per KK            ││
│  │ │ Donasi       │  5.000K  │ Donasi sukarela         ││
│  │ ├──────────────┼──────────┼─────────────────────────┤│
│  │ │ Total Income │ 15.000K  │                         ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─ Pengeluaran ───────────────────────────────────────┐│
│  │ [+ Tambah Baris]                                    ││
│  │ ├──────────────┬──────────┬─────────────────────────┤│
│  │ │ Kategori     │ Rencana  │ Deskripsi               ││
│  │ ├──────────────┼──────────┼─────────────────────────┤│
│  │ │ Konsumsi     │  6.250K  │ 250 porsi               ││
│  │ │ Dekorasi     │  2.500K  │ Panggung + tenda        ││
│  │ │ Dokumentasi  │  1.500K  │ Foto + video            ││
│  │ │ ATK          │    500K  │ Alat tulis              ││
│  │ ├──────────────┼──────────┼─────────────────────────┤│
│  │ │ Total Exp    │ 10.750K  │                         ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  Surplus/Defisit: +4.250K                               │
│  [💾 Simpan]                                            │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Komponen Spesifik

| Komponen | Fungsi |
|----------|--------|
| `CashflowTable` | Tabel pemasukan/pengeluaran |
| `TransactionForm` | Modal form transaksi cepat |
| `BudgetPlanForm` | Form budget plan + lines editor |
| `BudgetVsActualChart` | Chart perbandingan rencana vs realisasi |
| `BudgetLinePaymentStatus` | Tabel status bayar per budget line |
| `CurrencyInput` | Input Rupiah terformat |
| `ExportButton` | Dropdown export (PDF/Sheets) |

---

## 6. Halaman

| Halaman | Route |
|---------|-------|
| Budget Plan | `/events/{slug}/pendanaan/budget` |
| Pemasukan | `/events/{slug}/pendanaan/incomes` |
| Pengeluaran | `/events/{slug}/pendanaan/expenses` |
| Status Bayar | `/events/{slug}/pendanaan/status-bayar` |
| Laporan | `/events/{slug}/pendanaan/laporan` |

---

## 7. Related Docs

- [← Fitur Pendanaan](fitur.md)
- [🎨 UI/UX Spec (Overview)](../../uiux-spec.md)
