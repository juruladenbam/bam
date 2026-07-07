# 💰 Divisi Pendanaan — Detail Fitur

> **Status**: Draft | **PRD**: [← Kembali ke PRD](../../prd.md)
> **ERD**: [Lihat ERD §2.9 Finance](../../erd.md#29-finance--pendanaan)
> **API**: [Lihat API Contract §2.12 Finance](../../api-contract.md#212-finance--pendanaan)

---

## 1. Overview

Divisi Pendanaan mengelola seluruh siklus keuangan event: perencanaan anggaran, pencatatan transaksi masuk/keluar, tracking status bayar per item budget, pelaporan cashflow, dan export. Semua data keuangan terikat ke satu event.

### Role

| Role | Akses |
|------|-------|
| **Bendahara** | CRUD penuh: budget, income, expense, laporan |
| **Ketua** | View-only: dashboard saldo, budget vs actual, laporan |

---

## 2. Fitur

### 2.1 Budget Plan

Rencana anggaran per event — terdiri dari header `budget_plans` dan detail `budget_lines`.

**Flow:**
1. Bendahara membuat budget plan baru (atau edit existing)
2. Menambahkan budget lines: kategori income/expense, subkategori, deskripsi, planned amount
3. Budget lines di-save sebagai bulk (full replace)
4. `actual_amount` dan `paid_amount` di-compute otomatis dari transaksi terkait

**Tabel terkait:**
- `budget_plans` — header (nama, versi, status: draft/approved/active/closed)
- `budget_lines` — detail per item (kategori, deskripsi, planned_amount, actual_amount, paid_amount, payment_status)

**Status budget plan:**
| Status | Deskripsi |
|--------|-----------|
| `draft` | Masih disusun, belum final |
| `approved` | Sudah disetujui ketua |
| `active` | Sedang berjalan (ada transaksi) |
| `closed` | Event selesai, budget ditutup |

### 2.2 Budget Line Payment Tracking

Setiap budget line memiliki **status bayar** yang di-compute otomatis:

| payment_status | Kondisi |
|----------------|---------|
| `unpaid` | `paid_amount = 0` |
| `partial` | `0 < paid_amount < planned_amount` |
| `paid` | `paid_amount >= planned_amount` |

**Cara kerja:**
- Untuk line kategori `expense`: `paid_amount = SUM(expense_entries.amount WHERE budget_line_id = X)`
- Untuk line kategori `income`: `paid_amount = SUM(income_entries.amount WHERE budget_line_id = X)`
- Di-compute ulang setiap kali transaksi terkait di-create/update/delete

**Kenapa ini penting:**
Pendapatan dari iuran/donasi/biaya pendaftaran tidak selalu terkumpul semua di awal. Alokasi pembayaran mengikuti uang yang tersedia → beberapa item dibayar sebagian atau sesuai prioritas. Bendahara perlu tahu item mana yang sudah/belum/sebagian dibayarkan.

**UI:** Tabel dengan kolom Item, Rencana, Dibayar, Sisa, Status (✅ Lunas / 🟡 Sebagian / 🔴 Belum).

### 2.3 Income Entry

Pencatatan pemasukan: iuran, donasi, sponsor, merchandise, tiket, lainnya.

**Field:**
| Field | Tipe | Required | Note |
|-------|------|----------|------|
| `category` | enum | ✅ | iuran/donasi/sponsor/merchandise/tiket/lainnya |
| `amount` | decimal | ✅ | Jumlah pemasukan |
| `payer_name` | string | ❌ | Nama penyetor (free text) |
| `payer_person_id` | FK | ❌ | Link ke data person BAM |
| `payment_method` | enum | ✅ | cash/transfer/qris |
| `payment_date` | date | ✅ | Tanggal diterima |
| `receipt_number` | string | ❌ | Nomor kuitansi |
| `budget_line_id` | FK | ❌ | Link ke budget line (untuk tracking) |
| `notes` | text | ❌ | Catatan tambahan |

**Auto-entry:** Pesanan merchandise yang statusnya `paid` akan otomatis membuat income entry via Observer (Fase 6).

### 2.4 Expense Entry

Pencatatan pengeluaran per kategori.

**Field:**
| Field | Tipe | Required | Note |
|-------|------|----------|------|
| `category_id` | FK | ✅ | Kategori pengeluaran |
| `amount` | decimal | ✅ | Jumlah pengeluaran |
| `payee_name` | string | ❌ | Nama penerima |
| `payment_method` | enum | ✅ | cash/transfer/qris |
| `payment_date` | date | ✅ | Tanggal bayar |
| `invoice_number` | string | ❌ | Nomor invoice |
| `receipt_image_url` | string | ❌ | Upload bukti bayar |
| `budget_line_id` | FK | ❌ | Link ke budget line |
| `notes` | text | ❌ | Catatan |

**Expense Categories (default):**
`venue`, `konsumsi`, `dekorasi`, `dokumentasi`, `transport`, `honorarium`, `atk`, `lainnya`

### 2.5 Cashflow Report

Laporan arus kas per periode (harian/mingguan/bulanan).

**Response mencakup:**
- `opening_balance` — saldo awal periode
- `total_income` / `total_expense` — total periode
- `closing_balance` — saldo akhir
- `periods[]` — breakdown per hari/minggu (date, income, expense, balance)

### 2.6 Cash Balance

Saldo kas real-time: `SUM(income) - SUM(expense)`.

**Tambahan info:**
- `pending_receivables` — piutang (income yang dijanjikan tapi belum diterima)
- `pending_payables` — hutang (expense yang direncanakan tapi belum dibayar)

### 2.7 Budget vs Actual

Perbandingan rencana vs realisasi per budget line.

**Response per line:**
- `planned_amount` vs `actual_amount`
- `paid_amount` — yang sudah dibayar
- `payment_status` — unpaid/partial/paid
- `variance` — selisih (Rp)
- `variance_percent` — selisih (%)

### 2.8 Export

| Format | Detail |
|--------|--------|
| **PDF** | Print-friendly HTML → browser print / Laravel PDF |
| **Google Sheets** | Overwrite sheet dengan data terbaru via Sheets API |

---

## 3. API Endpoints

| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events/{event}/budgets` | List budget plans |
| `POST` | `/events/{event}/budgets` | Create budget plan |
| `PUT` | `/budgets/{id}` | Update budget plan |
| `DELETE` | `/budgets/{id}` | Delete budget plan |
| `GET` | `/budgets/{budget}/lines` | Get budget lines |
| `PUT` | `/budgets/{budget}/lines` | Bulk update lines |
| `GET` | `/events/{event}/budget-vs-actual` | Budget vs actual report |
| `GET` | `/events/{event}/incomes` | List income entries |
| `POST` | `/events/{event}/incomes` | Create income |
| `PUT` | `/incomes/{id}` | Update income |
| `DELETE` | `/incomes/{id}` | Delete income |
| `GET` | `/events/{event}/expenses` | List expense entries |
| `POST` | `/events/{event}/expenses` | Create expense |
| `PUT` | `/expenses/{id}` | Update expense |
| `DELETE` | `/expenses/{id}` | Delete expense |
| `GET` | `/expense-categories` | List expense categories |
| `GET` | `/events/{event}/cashflow` | Cashflow report |
| `GET` | `/events/{event}/cash-balance` | Real-time cash balance |
| `POST` | `/events/{event}/export/sheets` | Export ke Google Sheets |
| `GET` | `/events/{event}/export/sheets/config` | Get export config |
| `PUT` | `/events/{event}/export/sheets/config` | Update export config |

---

## 4. Service Classes

| Service | Method | Deskripsi |
|---------|--------|-----------|
| `CashflowReportService` | `cashflow(event, period, from, to)` | Aggregasi cashflow |
| `CashflowReportService` | `cashBalance(event)` | Saldo kas real-time |
| `CashflowReportService` | `budgetVsActual(event)` | Budget vs actual per line |
| `CashflowReportService` | `linePaymentStatus(budgetLine)` | Compute paid_amount + payment_status |

---

## 5. UI Components

| Komponen | Fungsi |
|----------|--------|
| `BudgetPlanForm` | Form budget plan + bulk lines editor |
| `BudgetVsActualChart` | Chart perbandingan rencana vs realisasi |
| `BudgetLinePaymentStatus` | Tabel status bayar per budget line |
| `CashflowTable` | Tabel pemasukan/pengeluaran |
| `TransactionForm` | Modal form transaksi cepat (income/expense) |
| `ExportButton` | Dropdown export (PDF/Sheets) |

---

## 6. Halaman

| Halaman | Route | Komponen Utama |
|---------|-------|----------------|
| **Budget Plan** | `/events/{slug}/pendanaan/budget` | `BudgetPlanForm`, `BudgetVsActualChart`, `BudgetLinePaymentStatus` |
| **Pemasukan** | `/events/{slug}/pendanaan/incomes` | `CashflowTable` (type=income), `TransactionForm` |
| **Pengeluaran** | `/events/{slug}/pendanaan/expenses` | `CashflowTable` (type=expense), `TransactionForm` |
| **Status Bayar** | `/events/{slug}/pendanaan/status-bayar` | `BudgetLinePaymentStatus` |
| **Laporan** | `/events/{slug}/pendanaan/laporan` | `CashflowTable`, `ExportButton` |

---

## 7. Acceptance Criteria

- [ ] Budget plan bisa dibuat dengan multiple lines (income & expense)
- [ ] Budget vs actual computed otomatis dari transaksi
- [ ] Setiap budget line memiliki `paid_amount` dan `payment_status` (unpaid/partial/paid)
- [ ] Cashflow menampilkan saldo real-time per periode
- [ ] Income & expense bisa dicatat dengan form cepat + link ke budget line
- [ ] Export PDF & Google Sheets berfungsi

---

## 8. Related Docs

- [← PRD (Overview)](../../prd.md)
- [🗄️ ERD §2.9 — Finance](../../erd.md#29-finance--pendanaan)
- [📡 API §2.12 — Finance](../../api-contract.md#212-finance--pendanaan)
- [🎨 UI/UX §4.5-4.6b — Cashflow & Budget Tracking](../../uiux-spec.md#45-cashflow-page)
- [🚀 Implementasi Fase 4](../../implementasi.md#fase-4--pendanaan)
