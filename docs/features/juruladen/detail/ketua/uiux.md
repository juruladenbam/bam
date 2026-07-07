# 🎨 UI/UX — Ketua

> **Modul**: [Fitur Ketua](fitur.md) | **UI/UX Utama**: [← Kembali ke UI/UX Spec](../../uiux-spec.md)

---

## 1. Dashboard — Event Overview

```
┌─────────────────────────────────────────────────────────┐
│  Halal Bihalal 1447 H                   15-16 Juni 2026 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │ Progress   │  │ Saldo Kas  │  │ Budget vs Actual   │ │
│  │   45%      │  │ Rp 5.5 JT  │  │ Income:  95% ████  │ │
│  │ ████░░░░░  │  │            │  │ Expense: 72% ███░  │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Divisi           │ Progress │ Tasks │ Deadline Next ││
│  ├──────────────────┼──────────┼───────┼───────────────┤│
│  │ 🔵 Acara         │   33%    │ 4/12  │ 3 hari lagi   ││
│  │ 🟢 Humas         │   75%    │ 6/8   │ 1 hari lagi   ││
│  │ 🟣 Pendanaan     │   60%    │ 3/5   │ -             ││
│  │ 🟠 Merchandise   │   20%    │ 1/5   │ 5 hari lagi   ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─ Quick Actions ─────────────────────────────────────┐│
│  │ [+ Transaksi] [Blast WA] [+ Tugas Baru] [+ Peserta] ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 2. Timeline View

> 🆕 Semua user bisa mengakses. Color-coded per divisi.

```
┌─────────────────────────────────────────────────────────┐
│  Timeline ─── [Filter: Semua Div ▼] [Status: Semua ▼]   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  ◀ Juni 2026                                  🔽 Minggu │
│                                                         │
│  ┌─ Sen, 8 Jun ────────────────────────────────────────┐│
│  │  🟣 Finalisasi budget                         12:00 ││
│  │     Assignee: Siti R. | Priority: 🔴 Urgent         ││
│  │  🔵 Cek venue                                   ⏳  ││
│  │     Assignee: Ahmad F. | Priority: 🟡 Medium        ││
│  ├─────────────────────────────────────────────────────┤│
│  │  ─── Sel, 9 Jun ───                                ││
│  │  🟢 Kirim broadcast WA grup                    09:00││
│  │     Assignee: Budi S. | Priority: 🟠 High          ││
│  ├─────────────────────────────────────────────────────┤│
│  │  ─── Rab, 10 Jun ───                               ││
│  │  🔵 Finalisasi rundown                         18:00││
│  │     Assignee: Ahmad F. | Priority: 🟠 High         ││
│  │  🟠 Konfirmasi vendor kaos                      ⏳  ││
│  │     Assignee: Dewi A. | Priority: 🟡 Medium        ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  📊 Ringkasan: 25 tugas | 8 todo | 10 in-progress       │
│  🔴 3 urgent minggu ini                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Divisi Detail — Task Board (Kanban)

```
┌─────────────────────────────────────────────────────────┐
│  Divisi Acara ────── [Progress: 33%] [+ Tugas Baru]     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  ┌─ TODO ───────┐ ┌─ IN PROGRESS ┐ ┌─ DONE ───┐ ┌ BLOCKED┐
│  │┌────────────┐│ │┌────────────┐│ │┌────────┐│ │┌──────┐│
│  ││ Buat       ││ ││ Cek venue  ││ ││Susun   ││ ││Tenda ││
│  ││ rundown    ││ ││ 🔵 Acara   ││ ││juknis  ││ ││blm   ││
│  ││ 🔵 Acara   ││ ││ 🟡 Medium  ││ ││        ││ ││konfirm│
│  ││ 🟠 High    ││ ││ 👤 Ahmad   ││ ││✅      ││ ││      ││
│  ││ 👤 Ahmad   ││ ││ 📅 10 Jun ││ ││        ││ ││🚫    ││
│  ││ 📅 5 Jun  ││ ││            ││ ││        ││ ││      ││
│  │└────────────┘│ │└────────────┘│ │└────────┘│ │└──────┘│
│  │┌────────────┐│ │┌────────────┐│ │┌────────┐│ │        │
│  ││ Pesan      ││ ││Hubungi MC ││ ││Daftar  ││ │        │
│  ││ konsumsi   ││ ││            ││ ││invent  ││ │        │
│  ││ 🟡 Medium  ││ ││            ││ ││        ││ │        │
│  │└────────────┘│ │└────────────┘│ │└────────┘│ │        │
│  └──────────────┘ └──────────────┘ └──────────┘ └────────┘
└─────────────────────────────────────────────────────────┘
```

---

## 4. Event Selector (Dropdown)

```
┌─────────────────────────┐
│ 📋 Halal Bihalal 2026  ▼│
├─────────────────────────┤
│ ● Halal Bihalal 2026    │  ← Active
│ ○ Merajut Cinta 2026    │
│ ○ Ziarah Makam 2025     │
│ ○ + Kelola Event        │
└─────────────────────────┘
```

---

## 5. Divisi Management

```
┌─────────────────────────────────────────────────────────┐
│  Kelola Divisi ─── [+ Tambah Divisi]                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  ┌─ 🔵 Divisi Acara ───────────────────────────────────┐│
│  │  Ketua: Ahmad Fulan                                 ││
│  │  Anggota: Siti, Budi, Dewi                [Kelola]  ││
│  │  Progress: 4/12 tasks (33%)                         ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─ 🟢 Divisi Humas ──────────────────────────────────┐│
│  │  Ketua: Budi Santoso                                ││
│  │  Anggota: Rina, Anton                     [Kelola]  ││
│  │  Progress: 6/8 tasks (75%)                          ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 6. Komponen Spesifik

| Komponen | Fungsi |
|----------|--------|
| `ProgressDashboard` | Widget progress + saldo + budget |
| `Timeline` | Kalender tugas semua divisi, color-coded |
| `EventSelector` | Dropdown pilih event |
| `DivisionBadge` | Badge divisi berwarna |
| `DivisionManager` | Kelola divisi + anggota |
| `KanbanBoard` | Papan kanban 4 kolom |
| `TaskCard` | Card tugas draggable |
| `ProgressBar` | Progress bar persentase |

---

## 7. Related Docs

- [← Fitur Ketua](fitur.md)
- [🎨 UI/UX Spec (Overview)](../../uiux-spec.md)
- [📡 API Contract §2.1-2.3](../../api-contract.md)
