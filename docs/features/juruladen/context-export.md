# 🧠 Context Export — Juruladen Session

> **Generated**: 7 Juli 2026
> **Project**: BAM — Portal Digital Keluarga Bani Abdul Manan
> **Untuk**: Handoff ke agent/claude/GPT lain sebagai context awal

---

## 1. Project Overview

**BAM** adalah monorepo untuk sistem informasi keluarga besar Bani Abdul Manan.

### Struktur Monorepo
```
bam/
├── backend/          # Laravel 11 API (api.bamseribuputu.my.id)
├── public-web/       # Public website (bamseribuputu.my.id)
├── portal/           # Member portal (portal.bamseribuputu.my.id)
├── admin/            # Admin dashboard (admin.bamseribuputu.my.id)
├── juruladen/        # BARU — Event Ops & Finance (juruladen.bamseribuputu.my.id) ← BELUM ADA
└── shared/           # Shared TypeScript types
```

### Stack
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS
- **Backend**: Laravel 11, Sanctum auth, Repository + Service pattern
- **Database**: SQLite (dev) / MySQL (prod)
- **Package Manager**: pnpm (monorepo root)

---

## 2. Juruladen — What We're Building

**Juruladen** (bahasa Jawa: *juru laden* = pelayan/pengelola acara) adalah aplikasi web untuk manajemen operasional dan keuangan acara yang digunakan oleh panitia keluarga BAM.

### Domain: `juruladen.bamseribuputu.my.id` (port dev: 5176)

### Struktur Organisasi Panitia per Event
```
EVENT
 ├── Ketua — delegasi tugas, monitor progress, timeline
 ├── Divisi ACARA — rundown, perlengkapan (inventory), MC, konsumsi
 ├── Divisi HUMAS — peserta + RSVP, publikasi + broadcast WA, dokumentasi, pengumpulan dana
 ├── Divisi PENDANAAN — budget plan, income/expense tracking, budget line payment tracking (unpaid/partial/paid), cashflow, laporan
 └── Divisi MERCHANDISE — produk multi-varian multi-dimensi, vendor, pesanan (dengan person_id per item), rekap vendor (pivot table), rekap WA group (per qobilah), campaign WA, laporan laba/rugi
```

### Tech Decisions (sudah disepakati)

| # | Keputusan |
|---|-----------|
| 1 | Hanya event dengan flag `is_juruladen_active=true` yang muncul |
| 2 | Bisa mengelola multiple event — ada EventSelector dropdown |
| 3 | Laporan: cetak PDF + export ke Google Sheets |
| 4 | WhatsApp: **Wablas API** (Rp 20-22rb/bln, unofficial, pakai nomor existing, tanpa template approval). Dibuat dengan **WhatsAppServiceInterface** agar bisa swap ke Meta Cloud API nanti |
| 5 | **Tidak perlu** approval workflow |
| 6 | Notifikasi **email** ke semua panitia: task assigned, deadline reminder, transaksi baru, daily summary |

---

## 3. Dokumen yang Sudah Dibuat

Semua dokumen ada di `docs/features/juruladen/`:

| File | Isi |
|------|-----|
| **prd.md** | Product Requirements — overview, problem & solution, 37 fitur, 32 user stories, NFR |
| **erd.md** | Entity Relationship Diagram — Mermaid diagram + 33+ tabel dengan kolom & tipe |
| **api-contract.md** | API Contract — ~75 endpoint dengan request/response schema |
| **uiux-spec.md** | UI/UX Spec — layout, 8 halaman wireframe, 15 reusable components |
| **integrasi.md** | Integrasi — WablasService (dengan kode contoh), Google Sheets, email notifikasi |
| **implementasi.md** | Implementasi Breakdown — 6 fase, ~130 jam, struktur file, acceptance criteria |
| **vendor-estimate.md** | Vendor pricing estimate — 4 skenario, komposisi tim, vibe coding impact, tips negosiasi |
| **future/ecommerce-merch.md** | 🆕 E-Commerce Merchandise — deferred V2 (storefront, cart, checkout, payment gateway, auth NIB) |

### Dokumen Detail per Divisi (`detail/`)

Setiap modul memiliki direktori sendiri berisi `fitur.md` + `uiux.md`:

| Direktori | Divisi |
|----------|--------|
| **detail/ketua/** | 👑 Ketua — dashboard, divisi management, task delegation, timeline |
| **detail/auth-user-management/** | 🔐 Auth & User Management — NIB-based login, Superadmin user management, access control |
| **detail/acara/** | 🎤 Acara — rundown, inventory, MC, catering |
| **detail/humas/** | 📢 Humas — peserta, RSVP, publikasi, WA blast, dokumentasi |
| **detail/pendanaan/** | 💰 Pendanaan — budget, income/expense, payment tracking, cashflow |
| **detail/merchandise/** | 🛍️ Merchandise — produk multi-dimensi, varian, pesanan, rekap vendor & WA group |
| **detail/notifikasi/** | 🔔 Notifikasi — email, preferences, scheduler |

---

## 4. Key Models (Database)

### Extend existing `events` table:
- `budget_total` (decimal)
- `budget_status` (draft/approved/active/closed)
- `is_juruladen_active` (boolean)

### New Tables (30+):

**Committee & Tasks**: `committee_divisions`, `committee_members`, `committee_tasks`, `task_templates`
**Rundown**: `rundowns`, `rundown_items`, `event_guidelines`
**Inventory**: `inventory_categories`, `inventory_items`
**MC**: `mc_assignments`
**Catering**: `catering_schedules`
**Participants**: Menggunakan tabel existing `event_registrations` (dengan tambahan `pool_label` + `presence_at`)
**Publication**: `design_needs`, `broadcast_logs`, `documentations`
**WhatsApp**: `wa_blast_templates`, `wa_recipients`
**Finance**: `budget_plans`, `budget_lines` (dengan `paid_amount` + `payment_status`), `expense_categories`, `income_entries`, `expense_entries`
**Merchandise**: `merch_products`, `merch_variant_dimensions`, `merch_variant_dimension_values`, `merch_variants`, `merch_variant_combination_values`, `merch_vendors`, `merch_vendor_assignments`, `merch_orders`, `merch_order_items` (dengan `person_id`), `merch_campaigns`
**Notifications**: `notification_logs`, `notification_preferences`
**Export**: `sheets_export_configs`

---

## 5. API Structure

Prefix: `/api/juruladen` — Middleware: `auth:sanctum` + `admin`

Main route file: `routes/api/juruladen.php` (belum dibuat)

Key service classes (belum dibuat):
- `App/Services/Juruladen/Contracts/WhatsAppServiceInterface.php`
- `App/Services/Juruladen/WablasService.php`
- `App/Services/Juruladen/SheetsExportService.php`
- `App/Services/Juruladen/CashflowReportService.php`
- `App/Services/Juruladen/MerchFinancialService.php`
- `App/Services/Juruladen/NotificationService.php`

---

## 6. Implementation Plan (6 Fase, ~130 jam)

| Fase | Nama | Jam | Status |
|------|------|-----|--------|
| 1 | Fondasi (Core) — auth NIB, user mgmt, scaffolding, divisi, tasks, timeline | 27.5 | ❌ Belum mulai |
| 2 | Operasional Acara — rundown, inventory, MC, catering | 17 | ❌ |
| 3 | Humas & Peserta — RSVP, publikasi, Wablas blast WA | 22.5 | ❌ |
| 4 | Pendanaan — budget, income, expense, cashflow | 20 | ❌ |
| 5 | Merchandise — produk, varian, pesanan, rekap | 20 | ❌ |
| 6 | Dashboard, Laporan, Notifikasi & Integrasi Final | 31 | ❌ |

---

## 7. Next Steps (Fase 1)

Yang harus dikerjakan pertama:

1. **Setup project `juruladen/`** — clone struktur dari `admin/`, sesuaikan config
2. **Tambahkan di root `package.json`** — `"dev:juruladen"` dan `"build:juruladen"` scripts
3. **Backend**: buat `routes/api/juruladen.php`, tambahkan prefix di `routes/api.php`
4. **Backend**: tambahkan kolom baru ke tabel `events` (migration)
5. **Backend**: model + migration + CRUD API untuk `committee_divisions`, `committee_members`, `committee_tasks`
6. **Frontend**: halaman Login (reuse auth admin), Dashboard kosong, Event List, Event Detail, Divisi List + Kanban Board

---

## 8. External Services (Perlu Setup)

| Service | Status | Detail |
|---------|--------|--------|
| Wablas | 🔲 Belum setup | Register di wablas.com, pilih plan, simpan API token |
| Google Sheets API | 🔲 Belum setup | Service Account + enable Sheets API di GCP |
| Email SMTP | 🔲 Belum setup | Untuk notifikasi email |

---

## 9. Konvensi Codebase

- **ApiResponse trait**: semua response pakai `$this->success()`, `$this->error()`, `$this->paginated()`
- **Repository pattern**: Controller → Service → Repository → Model
- **Frontend**: fitur-based folder structure (`features/nama/api/`, `features/nama/hooks/`, `features/nama/components/`)
- **Shared types**: definisi TypeScript di `shared/src/types/index.ts`
- **Naming**: snake_case untuk DB/PHP, camelCase untuk JS/TS

---

*Gunakan file ini sebagai context awal. Semua detail ada di dokumen `docs/features/juruladen/`.*
