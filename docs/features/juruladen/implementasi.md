# 🚀 Implementasi Breakdown — Juruladen

> **Rencana implementasi teknis** — fase, estimasi, struktur file, dan acceptance criteria.

---

## 1. Stack & Tools

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS, shadcn/ui (opsional), @tanstack/react-query |
| **Backend** | Laravel 11, PHP 8.2+, Sanctum, Repository pattern |
| **Database** | SQLite (dev), MySQL (prod) |
| **Queue** | Database driver (jobs table) |
| **Scheduler** | Laravel Scheduler + cron |
| **External APIs** | Wablas API v2, Google Sheets API v4 |
| **PDF** | DomPDF / Laravel PDF |
| **Email** | Laravel Mail + SMTP |

---

## 2. Struktur File

### 2.1 Backend (`backend/`)

```
backend/
├── app/
│   ├── Console/Commands/
│   │   ├── JuruladenNotifyDeadlines.php
│   │   └── JuruladenDailySummary.php
│   ├── Http/
│   │   ├── Controllers/Api/Juruladen/
│   │   │   ├── AuthController.php
│   │   │   ├── UserController.php
│   │   │   ├── EventController.php
│   │   │   ├── DivisionController.php
│   │   │   ├── TaskController.php
│   │   │   ├── RundownController.php
│   │   │   ├── GuidelineController.php
│   │   │   ├── InventoryController.php
│   │   │   ├── McController.php
│   │   │   ├── CateringController.php
│   │   │   ├── ParticipantController.php
│   │   │   ├── DesignNeedController.php
│   │   │   ├── BroadcastController.php
│   │   │   ├── DocumentationController.php
│   │   │   ├── BudgetController.php
│   │   │   ├── IncomeController.php
│   │   │   ├── ExpenseController.php
│   │   │   ├── ReportController.php
│   │   │   ├── MerchProductController.php
│   │   │   ├── MerchVariantController.php
│   │   │   ├── MerchVendorController.php
│   │   │   ├── MerchOrderController.php
│   │   │   ├── MerchCampaignController.php
│   │   │   ├── WhatsAppController.php
│   │   │   ├── ExportController.php
│   │   │   └── NotificationController.php
│   │   └── Middleware/
│   │       └── EnsureIsJuruladen.php  (atau reuse EnsureIsAdmin)
│   ├── Mail/Juruladen/
│   │   ├── TaskAssignedMail.php
│   │   ├── TaskDeadlineMail.php
│   │   ├── TaskDoneMail.php
│   │   ├── TransactionNewMail.php
│   │   └── DailySummaryMail.php
│   ├── Models/
│   │   ├── CommitteeDivision.php
│   │   ├── CommitteeMember.php
│   │   ├── CommitteeTask.php
│   │   ├── TaskTemplate.php
│   │   ├── Rundown.php
│   │   ├── RundownItem.php
│   │   ├── EventGuideline.php
│   │   ├── InventoryCategory.php
│   │   ├── InventoryItem.php
│   │   ├── McAssignment.php
│   │   ├── CateringSchedule.php
│   │   ├── CateringMenuItem.php
│   │   ├── ParticipantPool.php
│   │   ├── ParticipantPoolMember.php
│   │   ├── ParticipantPresence.php
│   │   ├── DesignNeed.php
│   │   ├── BroadcastLog.php
│   │   ├── Documentation.php
│   │   ├── WaBlastTemplate.php
│   │   ├── WaRecipient.php
│   │   ├── BudgetPlan.php
│   │   ├── BudgetLine.php
│   │   ├── ExpenseCategory.php
│   │   ├── IncomeEntry.php
│   │   ├── ExpenseEntry.php
│   │   ├── MerchProduct.php
│   │   ├── MerchVariant.php
│   │   ├── MerchVendor.php
│   │   ├── MerchVendorAssignment.php
│   │   ├── MerchOrder.php
│   │   ├── MerchOrderItem.php
│   │   ├── MerchCampaign.php
│   │   ├── NotificationLog.php
│   │   ├── NotificationPreference.php
│   │   └── SheetsExportConfig.php
│   ├── Repositories/
│   │   └── Juruladen/  (opsional, jika pakai repository pattern)
│   └── Services/Juruladen/
│       ├── Contracts/
│       │   └── WhatsAppServiceInterface.php
│       ├── WablasService.php
│       ├── SheetsExportService.php
│       ├── CashflowReportService.php
│       ├── MerchFinancialService.php
│       └── NotificationService.php
├── database/migrations/
│   ├── 2026_07_01_000001_extend_events_for_juruladen.php
│   ├── 2026_07_01_000002_create_committee_divisions_table.php
│   ├── 2026_07_01_000003_create_committee_members_table.php
│   ├── 2026_07_01_000004_create_committee_tasks_table.php
│   ├── 2026_07_01_000005_create_rundowns_table.php
│   ├── 2026_07_01_000006_create_rundown_items_table.php
│   ├── ... (1 migration per tabel, ~30+ files)
│   └── 2026_07_01_000030_create_sheets_export_configs_table.php
├── routes/api/
│   └── juruladen.php
└── config/
    └── services.php  (tambah wablas, google_sheets config)
```

### 2.2 Frontend (`juruladen/`)

```
juruladen/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
├── public/
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── lib/
    │   └── api.ts                    # Axios instance + interceptors
    ├── types/
    │   └── index.ts                  # Tipe khusus juruladen + import dari shared/
    ├── hooks/
    │   ├── useEvent.ts
    │   ├── useDivisions.ts
    │   ├── useTasks.ts
    │   ├── useRundown.ts
    │   ├── useInventory.ts
    │   ├── useParticipants.ts
    │   ├── useBroadcast.ts
    │   ├── useBudget.ts
    │   ├── useCashflow.ts
    │   ├── useMerchProducts.ts
    │   ├── useMerchOrders.ts
    │   ├── useWhatsApp.ts
    │   ├── useNotifications.ts
    │   └── useSheetsExport.ts
    ├── features/
    │   ├── auth/
    │   │   ├── api/authApi.ts
    │   │   └── hooks/useAuth.ts
    │   ├── events/
    │   │   ├── api/eventApi.ts
    │   │   ├── hooks/useEvent.ts
    │   │   └── components/EventSelector.tsx
    │   ├── divisions/
    │   │   ├── api/divisionApi.ts
    │   │   ├── hooks/useDivisions.ts
    │   │   └── components/
    │   │       ├── DivisionList.tsx
    │   │       ├── DivisionCard.tsx
    │   │       └── MemberList.tsx
    │   ├── tasks/
    │   │   ├── api/taskApi.ts
    │   │   ├── hooks/useTasks.ts
    │   │   └── components/
    │   │       ├── KanbanBoard.tsx
    │   │       ├── TaskCard.tsx
    │   │       └── TaskForm.tsx
    │   ├── acara/
    │   │   ├── rundown/
    │   │   ├── guidelines/
    │   │   ├── inventory/
    │   │   ├── mc/
    │   │   └── catering/
    │   ├── humas/
    │   │   ├── participants/
    │   │   ├── publications/
    │   │   └── whatsapp/
    │   ├── pendanaan/
    │   │   ├── budget/
    │   │   ├── cashflow/
    │   │   └── reports/
    │   └── merchandise/
    │       ├── products/
    │       ├── orders/
    │       └── recap/
    ├── components/
    │   ├── layout/
    │   │   ├── JuruladenLayout.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── BottomNavbar.tsx
    │   │   └── Header.tsx
    │   └── ui/
    │       ├── Badge.tsx
    │       ├── StatusBadge.tsx
    │       ├── DivisionBadge.tsx
    │       ├── ProgressBar.tsx
    │       ├── CurrencyInput.tsx
    │       ├── CashflowTable.tsx
    │       ├── BudgetVsActualChart.tsx
    │       ├── ExportButton.tsx
    │       ├── BlastWAButton.tsx
    │       ├── NotificationBell.tsx
    │       ├── ConfirmationModal.tsx
    │       ├── EmptyState.tsx
    │       └── LoadingSkeleton.tsx
    └── pages/
        ├── LoginPage.tsx
        ├── DashboardPage.tsx
        ├── events/
        │   ├── EventListPage.tsx
        │   └── EventDetailPage.tsx
        ├── divisions/
        │   ├── DivisionsPage.tsx
        │   └── DivisionDetailPage.tsx
        ├── acara/
        │   ├── RundownPage.tsx
        │   ├── GuidelinesPage.tsx
        │   ├── InventoryPage.tsx
        │   ├── McPage.tsx
        │   └── CateringPage.tsx
        ├── humas/
        │   ├── ParticipantsPage.tsx
        │   ├── PublicationsPage.tsx
        │   └── DocumentationsPage.tsx
        ├── pendanaan/
        │   ├── BudgetPage.tsx
        │   ├── CashflowPage.tsx
        │   └── ReportsPage.tsx
        └── merchandise/
            ├── ProductsPage.tsx
            ├── OrdersPage.tsx
            └── RecapPage.tsx
```

---

## 3. Fase Implementasi

### Fase 1 — Fondasi (Core)
**Target**: Backend core + frontend scaffolding siap, user bisa login (NIB-based), superadmin bisa kelola user, kelola divisi & tugas, timeline view

| # | Task | Est. | Deliverable |
|---|------|------|-------------|
| 1.1 | Migration: alter `users` table — `email` NULL, `password` NULL | 30m | 1 migration |
| 1.2 | Setup project `juruladen/` (React + Vite + Tailwind + shared types) | 2h | `pnpm dev` jalan di port 5176 |
| 1.3 | Tambahkan prefix route `/api/juruladen` di `routes/api.php` | 30m | Route group + middleware |
| 1.4 | Extend `events` table + migration + model update | 1h | Kolom `is_juruladen_active`, `budget_total`, `budget_status` |
| 1.5 | Model + migrasi: `committee_divisions`, `committee_members`, `committee_tasks`, `task_templates` | 2h | 4 migrasi + 4 model Eloquent |
| 1.6 | **Service: JuruladenAuthService** (check-nib, set-password, login, forgot-password) + Auth endpoints | 3h | Auth flow NIB-based |
| 1.7 | **Service: JuruladenUserService** + User Management endpoints (CRUD user, reset password) | 1.5h | Superadmin user management |
| 1.8 | CRUD API: divisi, anggota, tugas (DivisionController, TaskController) | 4h | Endpoint list, create, update, delete, reorder |
| 1.9 | Halaman: Login (NIB-based flow: check-nib → set-password / login) | 3h | Halaman login dengan 3 state |
| 1.10 | Halaman: Dashboard kosong, Event List, Event Detail, Divisi List | 4h | Shell aplikasi + navigasi |
| 1.11 | Halaman: Division Detail + Kanban Board (drag-drop task) | 4h | Kanban 4 kolom interaktif |
| 1.12 | Halaman: Timeline View (kalender tugas semua divisi, color-coded, filterable) | 3h | Kalender timeline interaktif |
| 1.13 | Halaman: User Management (Superadmin — tambah/hapus/reset user) | 2h | Tabel + modal |

**Total Fase 1**: ~27.5 jam

---

### Fase 2 — Operasional Acara
**Target**: Divisi Acara bisa kelola rundown, perlengkapan, MC, konsumsi

| # | Task | Est. | Deliverable |
|---|------|------|-------------|
| 2.1 | Model + migrasi: `rundowns`, `rundown_items`, `event_guidelines` | 1h | 3 migrasi + model |
| 2.2 | CRUD API + drag-reorder endpoint untuk rundown & items | 2h | Full CRUD endpoint |
| 2.3 | Model + migrasi: `inventory_categories`, `inventory_items` | 1h | 2 migrasi + model |
| 2.4 | CRUD API inventory + status update endpoint | 2h | Endpoint dengan filter + return tracking |
| 2.5 | Model + migrasi: `mc_assignments`, `catering_schedules` | 1h | 2 migrasi + model |
| 2.6 | CRUD API MC + catering | 2h | Endpoint CRUD |
| 2.7 | Halaman: Rundown Builder (drag-reorder), Guidelines, Inventory, MC, Catering | 8h | 5 halaman interaktif |
| 2.8 | **Improvement:** Restruktur catering: multi-menu per jadwal (`catering_menu_items`) | 3h | 2 migrasi + relasi baru |
| 2.9 | **Improvement:** Catering link ke rundown section (`rundown_item_id`) | 30m | FK + dropdown <optgroup> |
| 2.10 | **Improvement:** Subsidi source (qobilah/person/other) di menu item | 1h | 3 kolom + search person + dropdown qobilah |
| 2.11 | **Improvement:** PIC per jadwal konsumsi (search person + text bebas) | 30m | Kolom `pic_type`, `pic_name` |
| 2.12 | **Improvement:** Equipment needs → auto-sync ke inventory (tambah/edit delta) | 2h | `syncEquipmentToInventory` + `syncEquipmentDelta` |
| 2.13 | **Improvement:** Usage type perlengkapan (sekali pakai / pakai ulang) | 30m | Akumulasi vs max() di sync |
| 2.14 | **Improvement:** Kategori inventory dari nama modul ("Konsumsi") | 15m | Simplifikasi mapping |
| 2.15 | **Improvement:** UX — autocomplete menu name + auto-fill, responsive modal, samarkan nominal, expand all/collapse all | 2h | QoL features |

**Total Fase 2**: ~26 jam (17 jam + 9 jam improvement)

**Tambahan dari Fase 1:**
| # | Task | Est. |
|---|------|------|
| T1 | Frappe-gantt timeline (ganti custom bar) | 2h |
| T2 | Semua ikon keyboard → Lucide React | 1h |
| T3 | Default event redirect (auto-select event aktif) | 1h |
| T4 | Realtime invalidation fix + member management UI | 1.5h |
| T5 | Search person: auto-strip checksum + qobilah display | 30m |

---

### Fase 3 — Humas & Peserta
**Target**: Divisi Humas bisa kelola peserta, RSVP, publikasi, blast WA

| # | Task | Est. | Deliverable |
|---|------|------|-------------|
| 3.1 | Migration: alter `event_registrations` — tambah `pool_label` + `presence_at` | 30m | 1 migration |
| 3.2 | CRUD API peserta (filter by pool, attendance, status) + RSVP update + presence check-in | 3h | Endpoint di `event_registrations` |
| 3.3 | Model + migrasi: `design_needs`, `broadcast_logs`, `documentations` | 1h | 3 migrasi + model |
| 3.4 | Model + migrasi: `wa_blast_templates`, `wa_recipients` | 30m | 2 migrasi + model |
| 3.5 | CRUD API publikasi + broadcast logs + dokumentasi | 2h | Endpoint CRUD |
| 3.6 | **Service: WablasService** + config + interface | 3h | WablasService + test dengan sandbox |
| 3.7 | WA Blast endpoint + Webhook handler | 2h | Endpoint blast + webhook verified |
| 3.8 | Halaman: Peserta + RSVP + Presensi | 4h | Tabel interaktif + modal |
| 3.9 | Halaman: Publikasi + Broadcast Log + Blast WA | 5h | Broadcast log + modal blast WA |
| 3.10 | Halaman: Dokumentasi | 2h | Simple CRUD grid |

**Total Fase 3**: ~21.5 jam

---

### Fase 4 — Pendanaan
**Target**: Bendahara bisa kelola budget, catat transaksi, lihat laporan

| # | Task | Est. | Deliverable |
|---|------|------|-------------|
| 4.1 | Model + migrasi: `budget_plans`, `budget_lines` (dengan `paid_amount` + `payment_status`) | 1.5h | 2 migrasi + model |
| 4.2 | Model + migrasi: `expense_categories`, `income_entries`, `expense_entries` | 1h | 3 migrasi + model |
| 4.3 | CRUD API budget + bulk update lines | 2h | Endpoint budget + lines |
| 4.4 | CRUD API income + expense entries (termasuk link ke budget_line_id) | 2h | Endpoint CRUD |
| 4.5 | **Service: CashflowReportService** (cashflow, cash balance, budget vs actual, budget line payment tracking) | 3.5h | Aggregation queries + response format |
| 4.6 | Halaman: Budget Plan + Budget vs Actual Chart + Budget Line Payment Status | 5h | Form lines + chart + tabel status bayar |
| 4.7 | Halaman: Cashflow (pemasukan + pengeluaran + saldo) | 5h | Tabel + chart + form transaksi cepat |
| 4.8 | Halaman: Laporan (tabel summary) | 2h | Print-friendly view |

**Total Fase 4**: ~22 jam

---

### Fase 5 — Merchandise
**Target**: Divisi Merch bisa kelola produk dengan multi-dimensi varian, pesanan (dengan person_id), dua jenis rekap (vendor pivot + WA group), laporan

| # | Task | Est. | Deliverable |
|---|------|------|-------------|
| 5.1 | Model + migrasi: `merch_products`, `merch_variant_dimensions`, `merch_variant_dimension_values`, `merch_variants`, `merch_variant_combination_values` | 2h | 5 migrasi + model |
| 5.2 | Model + migrasi: `merch_vendors`, `merch_vendor_assignments`, `merch_orders`, `merch_order_items` (dengan `person_id`), `merch_campaigns` | 1.5h | 5 migrasi + model |
| 5.3 | CRUD API produk + dimensi varian + dimension values + varian (kombinasi) | 3h | Endpoint CRUD nested |
| 5.4 | CRUD API vendor + assignment | 1h | Endpoint CRUD vendor |
| 5.5 | CRUD API orders + items (dengan `person_id` per item) | 2.5h | Endpoint CRUD pesanan |
| 5.6 | **Service: MerchFinancialService** (laba kotor, laba bersih, status bayar) + **MerchRecapService** (pivot vendor rekap, WA group rekap per qobilah) | 4h | Aggregation queries |
| 5.7 | Endpoint rekap vendor (pivot table) + rekap WA group (per qobilah) + financial report | 2h | 3 endpoint recap |
| 5.8 | Halaman: Produk + Dimensi Varian + Varian (CRUD) | 4h | Grid + form nested |
| 5.9 | Halaman: Orders (CRUD + filter, dengan person_id) | 3h | Tabel pesanan + modal |
| 5.10 | Halaman: Rekap Vendor (pivot table) + Rekap WA Group (per qobilah) | 3h | 2 halaman rekap interaktif |
| 5.11 | Halaman: Laporan Keuangan Merch | 2h | Tabel + chart |

**Total Fase 5**: ~28 jam

---

### Fase 6 — Dashboard, Laporan, Notifikasi & Integrasi
**Target**: Sistem lengkap — dashboard, export, notifikasi, final polish

| # | Task | Est. | Deliverable |
|---|------|------|-------------|
| 6.1 | Model + migrasi: `notification_logs`, `notification_preferences`, `sheets_export_configs` | 1h | 3 migrasi + model |
| 6.2 | **Service: NotificationService** + Mailable classes (6 email templates termasuk welcome) | 3h | Notification service + mailable |
| 6.3 | **Scheduler**: deadline checker + daily summary commands | 2h | 2 artisan commands + kernel schedule |
| 6.4 | Notification preferences API + UI | 2h | Endpoint + settings page |
| 6.5 | **Service: SheetsExportService** + config | 3h | Google Sheets export berfungsi |
| 6.6 | Export PDF (Laravel PDF / browser print) | 2h | Print-friendly layout + PDF button |
| 6.7 | Integrasi `merch_orders.paid` → `income_entries` auto-create (Observer) | 2h | Eloquent observer/event |
| 6.8 | Dashboard overview per event | 4h | Ringkasan halaman event detail |
| 6.9 | Event Selector + multi-event navigation | 2h | Dropdown + state management |
| 6.10 | Uji end-to-end, bug fixing | 8h | Test case + perbaikan |
| 6.11 | Setup `.cpanel.yml` + deploy juruladen domain | 2h | Domain `juruladen.bamseribuputu.my.id` live |

**Total Fase 6**: ~31 jam

---

## 4. Estimasi Keseluruhan

| Fase | Nama | Jam |
|------|------|-----|
| 1 | Fondasi (Core) | 27.5 |
| 2 | Operasional Acara | 26 |
| 3 | Humas & Peserta | 21.5 |
| 4 | Pendanaan | 22 |
| 5 | Merchandise | 28 |
| 6 | Dashboard, Laporan, Notifikasi & Integrasi | 31 |
| **Total** | | **~156 jam** |

> **Catatan**: Estimasi untuk 1 developer full-stack. Bisa paralel jika ada 2+ developer (backend & frontend terpisah).

---

## 5. Dependencies & Prerequisites

| Dependency | Status | Catatan |
|------------|--------|---------|
| Laravel 11 running | ✅ Sudah ada | Tambah route & migrasi |
| Sanctum auth | ✅ Sudah ada | Reuse middleware |
| React + Vite stack | ✅ Sudah ada | Clone dari admin/ + modifikasi |
| Wablas account | 🔲 Perlu setup | Register + top-up sebelum Fase 3 |
| Google Cloud Console | 🔲 Perlu setup | Service Account + Sheets API enable sebelum Fase 6 |
| SMTP email | 🔲 Perlu setup | Sebelum Fase 6 notifikasi |

---

## 6. Acceptance Criteria per Fase

### Fase 1 ✅
- [x] User bisa login dengan NIB — first-time: buat password; returning: masukkan password
- [x] Superadmin bisa tambah/hapus/reset password user Juruladen
- [x] Hanya user yang terdaftar yang bisa akses; NIB tidak terdaftar → ditolak
- [x] Hanya event dengan `is_juruladen_active=true` yang muncul
- [x] Bisa pindah antar event via EventSelector
- [x] User bisa buat divisi + assign anggota
- [x] User bisa buat task + drag-drop antar status (kanban)
- [x] Task bisa di-assign ke person, deadline, priority
- [x] **Timeline View**: kalender tugas semua divisi, color-coded, filterable per divisi/status

### Fase 2 ✅
- [x] Rundown bisa di-drag-reorder
- [x] Inventory checklist bisa difilter per kategori
- [x] Item pinjaman punya return tracking (strikethrough + badge)
- [x] MC assignment tersimpan per segmen (grouped by role)
- [x] Jadwal konsumsi dengan kalkulasi biaya (multi-menu per jadwal)
- [x] Menu konsumsi bisa subsidi (qobilah/person/other)
- [x] PIC penanggung jawab per jadwal konsumsi
- [x] Equipment needs auto-sync ke inventory (delta on edit)
- [x] Autocomplete menu name + auto-fill field
- [x] Toggle samarkan nominal + expand/collapse all
- [x] Frappe-gantt timeline + Lucide icons

### Fase 3 ✅
- [ ] Peserta bisa ditambah ke event via `event_registrations` (bulk add person_ids)
- [ ] Pool peserta menggunakan `pool_label` (filterable)
- [ ] RSVP tracking via `attendance` (hadir/tidak_hadir)
- [ ] Presensi check-in: set `presence_at` timestamp
- [ ] Broadcast log mencatat semua pengiriman
- [ ] WA Blast berhasil kirim ke multiple nomor via Wablas
- [ ] Webhook Wablas update status broadcast

### Fase 4 ✅
- [ ] Budget plan bisa dibuat dengan multiple lines
- [ ] Budget vs actual computed otomatis
- [ ] **Budget line payment tracking**: setiap item budget memiliki status bayar (unpaid/partial/paid) beserta paid_amount
- [ ] Cashflow menampilkan saldo real-time
- [ ] Income & expense bisa dicatat dengan form cepat

### Fase 5 ✅
- [ ] Produk dengan multi-dimensi varian bisa dibuat (tabel terpisah: dimensions, dimension_values, combination_values)
- [ ] Setiap varian adalah kombinasi dari nilai-nilai dimensi dengan harga & HPP sendiri
- [ ] Pesanan bisa dicatat dengan item + varian + **person_id** (atas nama siapa)
- [ ] Rekap Vendor: tabel pivot multi-dimensi menampilkan jumlah per kombinasi varian
- [ ] Rekap WA Group: list nama pemesan + produk + varian, dikelompokkan per qobilah
- [ ] Laporan merch menampilkan laba kotor & bersih

### Fase 6 ✅
- [ ] Dashboard overview progress semua divisi
- [ ] Export PDF berfungsi
- [ ] Export Google Sheets berfungsi
- [ ] Notifikasi email terkirim untuk task_deadline & transaction_new
- [ ] Pesanan merch paid → auto income entry
- [ ] Bisa pindah antar event via EventSelector
- [ ] Domain juruladen.bamseribuputu.my.id live

---

## 7. Risiko Implementasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Wablas service disruption | WA blast gagal | Broadcast log tetap tercatat; fallback ke pengiriman manual |
| Google Sheets API quota exceeded | Export gagal | Rate limit di backend; cache hasil export |
| Performance dengan banyak event | Query lambat | Index strategy (§3 ERD); eager loading; pagination |
| WhatsApp number banned | Tidak bisa blast WA | Interface swap ke Meta Cloud API; siapkan nomor cadangan |
| **Kompleksitas varian multi-dimensi** | Over-engineering untuk V1, query rekap pivot lambat | Batasi maks 3 dimensi per produk; pre-compute rekap di background job jika perlu |

---

*Implementasi breakdown siap. Bisa langsung mulai Fase 1 — setup project scaffolding.*
