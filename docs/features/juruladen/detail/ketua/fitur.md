# 👑 Ketua — Detail Fitur

> **Status**: Draft | **PRD**: [← Kembali ke PRD](../../prd.md)
> **ERD**: [Lihat ERD §2.2](../../erd.md#22-committee--task-management)
> **API**: [Lihat API Contract §2.1-2.3](../../api-contract.md#21-event-management)

---

## 1. Overview

Modul Ketua adalah dashboard overview dan tools delegasi untuk ketua panitia. Semua fitur bersifat **view/monitoring** terhadap divisi lain atau **management** (divisi, anggota, tugas).

### Role

| Role | Akses |
|------|-------|
| **Ketua** | Full access ke event yang dikelola — delegasi tugas, monitor progress |
| **Superadmin** | Full access ke semua event |

> **Catatan Auth V1**: Role granular (ketua/anggota divisi) tidak di-enforce di middleware; semua user dengan role `admin` mendapat full access. Perbedaan peran hanya informatif pada UI.

---

## 2. Fitur

### 2.1 Event Selector

Dropdown untuk berpindah antar event yang dikelola.

- Hanya event dengan `is_juruladen_active=true` yang muncul
- Indicator event aktif
- Bisa mengelola multiple event

### 2.2 Progress Dashboard

Overview semua divisi dalam satu layar.

**Widget:**
| Widget | Data |
|--------|------|
| Progress Overall | % task selesai dari semua divisi |
| Saldo Kas | Real-time dari modul Pendanaan |
| Budget vs Actual | Ringkasan dari modul Pendanaan |
| Per Divisi | % progress + task done/total per divisi |
| **Timeline** | 🆕 Semua tugas dalam kalender/timeline — lihat §2.6 |

### 2.3 Division Management

Atur divisi dan anggota panitia.

**Divisi default:**
- Acara (`acara`)
- Humas (`humas`)
- Pendanaan (`pendanaan`)
- Merchandise (`merchandise`)

**Fitur:**
- Tambah/hapus divisi (jika butuh divisi tambahan)
- Assign anggota ke divisi (link person_id)
- Set role per anggota: `ketua` / `anggota`
- Set responsibilities (deskripsi tugas)

### 2.4 Task Delegation

Buat dan delegasikan tugas ke anggota divisi.

**Field tugas:**
| Field | Deskripsi |
|-------|-----------|
| `division_id` | Divisi tujuan |
| `parent_task_id` | Sub-task (opsional) |
| `title` | Judul tugas |
| `description` | Deskripsi detail |
| `status` | todo / in_progress / done / blocked |
| `priority` | low / medium / high / urgent |
| `deadline` | Deadline (datetime) |
| `assignee_id` | Person yang ditugaskan |
| `sort_order` | Urutan di kanban |

**Kanban Board:** 4 kolom — Todo, In Progress, Done, Blocked — dengan drag-and-drop.

### 2.5 Task Templates

Template tugas yang bisa di-reuse antar event.

- `task_templates` — title, description, default_priority, division_slug
- Bisa di-import ke event → auto-create task

### 2.6 Timeline View

> 🆕 **Semua user Juruladen** dapat memantau timeline kerja seluruh divisi dalam satu tampilan kalender.

Timeline menampilkan semua tugas dari `committee_tasks` dalam urutan kronologis berdasarkan `deadline`.

**Fitur:**
- **Tampilan kalender** (bulan/minggu) — tugas tampil di tanggal deadlinenya
- **Color-coded per divisi** — memudahkan identifikasi visual (sesuai warna divisi)
- **Filter**: per divisi, status (todo/in_progress/done/blocked), assignee
- **Klik task** → buka detail task (modal atau navigate ke kanban divisi)
- **Milestone marker** — task dengan priority `urgent` ditandai khusus

**Data source:** `committee_tasks` (tidak perlu tabel baru). Query: filter by `event_id`, sort by `deadline`.

**Kenapa timeline penting:** Ketua dan anggota panitia bisa melihat sekilas beban kerja per minggu, task mana yang approaching deadline, dan bottleneck di divisi mana — semua dari satu layar.

---

## 3. API Endpoints

### Events
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events` | List events (filtered by is_juruladen_active) |
| `GET` | `/events/{slug}` | Event detail |
| `PATCH` | `/events/{id}/juruladen-active` | Toggle juruladen active |

### Divisions
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events/{event}/divisions` | List divisi + members + progress |
| `POST` | `/events/{event}/divisions` | Create divisi |
| `PUT` | `/divisions/{id}` | Update divisi |
| `DELETE` | `/divisions/{id}` | Delete divisi |
| `POST` | `/divisions/{division}/members` | Add member |
| `DELETE` | `/divisions/{division}/members/{person}` | Remove member |

### Tasks
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/divisions/{division}/tasks` | List tasks |
| `POST` | `/divisions/{division}/tasks` | Create task |
| `PUT` | `/divisions/{division}/tasks/{task}` | Update task |
| `PATCH` | `/tasks/{task}/status` | Update status only |
| `POST` | `/tasks/reorder` | Reorder tasks (drag-drop) |

### Dashboard
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events/{event}/progress` | Progress overview |
| `GET` | `/events/{event}/cash-balance` | Saldo kas (from Pendanaan) |
| `GET` | `/events/{event}/timeline` | 🆕 Timeline tugas kalender — query: `?division=acara&status=todo&month=2026-06` |

---

## 4. UI Components

| Komponen | Fungsi |
|----------|--------|
| `EventSelector` | Dropdown pilih event |
| `ProgressDashboard` | Widget progress + saldo + budget |
| `Timeline` | 🆕 Kalender/timeline tugas semua divisi |
| `DivisionBadge` | Badge divisi berwarna |
| `DivisionManager` | Kelola divisi + anggota |
| `KanbanBoard` | Papan kanban 4 kolom |
| `TaskCard` | Card tugas draggable |
| `ProgressBar` | Progress bar persentase |

---

## 5. Halaman

| Halaman | Route |
|---------|-------|
| **Dashboard** | `/events/{slug}` — mencakup Timeline View, progress widget, quick actions |
| **Divisi** | `/events/{slug}/divisi` |
| **Divisi Detail** | `/events/{slug}/divisi/{division}` |

---

## 6. Acceptance Criteria

- [ ] User bisa login ke juruladen.bamseribuputu.my.id
- [ ] Hanya event dengan `is_juruladen_active=true` yang muncul
- [ ] Bisa pindah antar event via EventSelector
- [ ] User bisa buat divisi + assign anggota
- [ ] User bisa buat task + drag-drop antar status (kanban)
- [ ] Task bisa di-assign ke person, deadline, priority
- [ ] Dashboard menampilkan progress + saldo kas real-time
- [ ] **Timeline View**: semua tugas tampil dalam kalender, bisa difilter per divisi/status/assignee

---

## 7. Related Docs

- [← PRD (Overview)](../../prd.md)
- [🔐 Auth & User Management](../auth-user-management/fitur.md)
- [🗄️ ERD §2.2](../../erd.md#22-committee--task-management)
- [📡 API §2.1-2.3](../../api-contract.md)
- [🎨 UI/UX §4.1-4.2](../../uiux-spec.md#41-dashboard--event-overview)
- [🚀 Implementasi Fase 1](../../implementasi.md#fase-1--fondasi-core)
