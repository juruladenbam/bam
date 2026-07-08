# 📢 Divisi Humas — Detail Fitur

> **Status**: Draft | **PRD**: [← Kembali ke PRD](../../prd.md)
> **ERD**: [Lihat ERD §2.7-2.8](../../erd.md#27-participants--rsvp-humas)
> **API**: [Lihat API Contract §2.9-2.11](../../api-contract.md#29-participants--rsvp)

---

## 1. Overview

Divisi Humas mengelola peserta, RSVP, publikasi & broadcast WhatsApp, pengumpulan dana, dan dokumentasi acara.

### Role

| Role | Akses |
|------|-------|
| **Anggota Humas** | CRUD penuh: peserta, publikasi, broadcast, dokumentasi |
| **Ketua** | View-only: monitoring |

---

## 2. Fitur

### 2.1 Participant Pool & Registration

> ✅ **Tanpa tabel baru.** Menggunakan tabel existing `event_registrations` dengan tambahan kolom `pool_label` dan `presence_at`.

Pool peserta adalah fitur untuk mengelompokkan peserta dalam event yang membutuhkan peserta spesifik (contoh: Merajut Cinta — panitia mengkurasi siapa saja yang diundang).

**Cara kerja:**
- Panitia menambah peserta ke event via `POST /events/{event}/participants` dengan `pool_label` opsional
- `pool_label = NULL` → registrasi umum
- `pool_label = "Peserta Merajut Cinta 2026"` → anggota pool
- List peserta bisa difilter: `?pool=...`, `?attendance=hadir`

**Kolom `event_registrations` yang digunakan:**
| Kolom | Fungsi |
|-------|--------|
| `person_id` | Link ke data persons BAM |
| `name` / `email` / `whatsapp` | Data kontak (opsional) |
| `status` | pending / approved / rejected |
| `attendance` | RSVP: hadir / tidak_hadir |
| `pool_label` | 🆕 Label pool (nullable) |
| `presence_at` | 🆕 Timestamp check-in |
| `custom_data` | JSON — data tambahan spesifik event |

### 2.2 RSVP Tracking

Tracking status kehadiran peserta.

**Status RSVP:** `attendance` field — `hadir` (confirmed) / `tidak_hadir` (declined) / NULL (pending)

**Fitur:**
- Bulk update attendance
- Filter & search
- Count summary per pool

### 2.3 Presensi Hari-H

Check-in peserta saat acara.

**Cara kerja:**
- `POST /events/{event}/participants/{registration}/presence` → set `presence_at = now()`
- Bisa via scan NIB atau manual input
- Tidak bisa check-in 2x (return 409 Conflict)

### 2.4 Design Needs Tracker

List kebutuhan desain untuk publikasi.

**Field:** `title`, `description`, `target_platform` (ig_feed/ig_story/fb/wa_banner), `content_info`, `assignee_person_id`, `deadline`, `status`

### 2.5 Broadcast Log

Catat setiap pengiriman publikasi:

**Platform:** `wa_group`, `ig_reels`, `ig_post`, `ig_story`, `fb_group`

**Field:** `platform`, `title`, `message`, `sent_at`, `status`, `recipient_count`

### 2.6 WA Blast (via Wablas)

Kirim broadcast WhatsApp langsung dari dashboard.

**Flow:**
1. Setup recipients (`wa_recipients` — nomor + label group)
2. Buat template (`wa_blast_templates` — teks dengan placeholder `{{nama}}`)
3. Pilih template + recipients → kirim blast
4. Webhook Wablas update status pengiriman

**Safety:**
- Rate limit: maks 5 blast per jam
- Delay configurable antar pesan (default 2 detik)
- Log setiap pengiriman di `broadcast_logs`

### 2.7 Documentation Repo

Simpan link/file dokumentasi acara.

**Field:** `title`, `type` (foto/video/livestream/after_movie), `url`, `thumbnail_url`, `description`

### 2.8 Fund Collection

Tracking iuran/donasi per peserta — terhubung ke modul Pendanaan.

- `event_registrations` dapat menyimpan data iuran via `custom_data` JSON atau di-track terpisah di `income_entries` dengan `payer_person_id`
- Data ini menjadi referensi untuk `income_entries` di modul Pendanaan

---

## 3. API Endpoints

### Participants & RSVP
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events/{event}/participants` | List peserta (filter: `?pool=...`, `?attendance=hadir`, `?status=approved`) |
| `POST` | `/events/{event}/participants` | Tambah peserta (bulk person_ids + pool_label opsional) |
| `PATCH` | `/events/{event}/participants/{id}` | Update RSVP / status |
| `POST` | `/events/{event}/participants/{id}/presence` | Record presensi (set presence_at) |
| `PATCH` | `/events/{event}/participants/bulk-pool` | Bulk update pool_label |

### Publication
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events/{event}/design-needs` | List design needs |
| `POST` | `/events/{event}/design-needs` | Create |
| `PUT` | `/design-needs/{id}` | Update |
| `DELETE` | `/design-needs/{id}` | Delete |
| `GET` | `/events/{event}/broadcasts` | List broadcast logs |
| `POST` | `/events/{event}/broadcasts` | Create log |
| `GET` | `/events/{event}/documentations` | List dokumentasi |
| `POST` | `/events/{event}/documentations` | Create |
| `PUT` | `/documentations/{id}` | Update |
| `DELETE` | `/documentations/{id}` | Delete |

### WhatsApp
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events/{event}/wa/recipients` | List recipients |
| `POST` | `/events/{event}/wa/recipients/import` | Import recipients |
| `POST` | `/events/{event}/wa/blast` | Send blast |
| `GET` | `/events/{event}/wa/blast-templates` | List templates |
| `POST` | `/events/{event}/wa/blast-templates` | Create template |
| `GET` | `/wa/message-status/{id}` | Check status |
| `POST` | `/wa/webhook` | Webhook callback |

---

## 4. Service Classes

| Service | Method | Deskripsi |
|---------|--------|-----------|
| `WablasService` | `sendBlast(phones, message, data, delay)` | Kirim WA blast via Wablas |
| `WablasService` | `checkStatus(messageId)` | Cek status pesan |
| `WablasService` | `verifyWebhook(signature, payload)` | Verifikasi webhook |

> `WablasService` implements `WhatsAppServiceInterface` — bisa di-swap ke Meta Cloud API di masa depan tanpa rewrite.

---

## 5. UI Components

| Komponen | Fungsi |
|----------|--------|
| `ParticipantPoolManager` | Kelola pool peserta + bulk add |
| `RSVPTable` | Tabel RSVP dengan status badges |
| `DesignNeedsBoard` | Kanban/board kebutuhan desain |
| `BroadcastLogTable` | Tabel log broadcast |
| `BlastWAModal` | Modal blast WhatsApp |
| `DocumentationGrid` | Grid foto/video dokumentasi |

---

## 6. Halaman

| Halaman | Route |
|---------|-------|
| **Peserta & RSVP** | `/events/{slug}/humas/peserta` |
| **Publikasi & Blast WA** | `/events/{slug}/humas/publikasi` |
| **Dokumentasi** | `/events/{slug}/humas/dokumentasi` |

---

## 7. Acceptance Criteria

- [ ] Peserta bisa ditambah ke event via `event_registrations` (bulk add person_ids dengan `pool_label`)
- [ ] RSVP tracking via `attendance` (hadir/tidak_hadir)
- [ ] Presensi check-in tercatat via `presence_at` timestamp
- [ ] Broadcast log mencatat semua pengiriman per platform
- [ ] WA Blast berhasil kirim ke multiple nomor via Wablas
- [ ] Webhook Wablas update status broadcast (delivered/failed)
- [ ] Dokumentasi tersimpan dengan URL dan thumbnail

---

## 8. Related Docs

- [← PRD (Overview)](../../prd.md)
- [🗄️ ERD §2.7-2.8](../../erd.md)
- [📡 API §2.9-2.11](../../api-contract.md)
- [🔗 Integrasi — Wablas](../../integrasi.md#2-whatsapp-via-wablas)
- [🚀 Implementasi Fase 3](../../implementasi.md#fase-3--humas--peserta)
