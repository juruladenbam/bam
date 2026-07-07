# 🎨 UI/UX Spec — Juruladen

> **Design System**: TailwindCSS (konsisten dengan admin/portal existing)
> **Target**: Desktop utama, Mobile-friendly (responsive)
> **Bahasa**: Indonesia
> 
> 📖 **Dokumen UI/UX per modul** (lebih detail):
> - [👑 Ketua](detail/ketua/uiux.md) — Dashboard, Timeline, Kanban, Event Selector
> - [🎤 Acara](detail/acara/uiux.md) — Rundown, Inventory, MC, Catering
> - [📢 Humas](detail/humas/uiux.md) — Peserta, RSVP, WA Blast, Broadcast Log
> - [💰 Pendanaan](detail/pendanaan/uiux.md) — Cashflow, Budget Tracking, Form Transaksi
> - [🛍️ Merchandise](detail/merchandise/uiux.md) — Rekap Vendor, Rekap WA, Produk & Varian
> - [🔐 Auth](detail/auth-user-management/uiux.md) — Login, User Management
> - [🔔 Notifikasi](detail/notifikasi/uiux.md) — Bell, Preferences

---

## 1. Design Principles

| Principle | Implementasi |
|-----------|-------------|
| **Satu layar, satu tugas** | Setiap halaman punya satu fokus — tidak ada dashboard yang overload |
| **Mobile-friendly** | Panitia sering buka dari HP saat di lapangan. Semua halaman harus responsive. |
| **Cepat input** | Form transaksi keuangan didesain untuk input cepat — autocomplete, default value, currency format |
| **Warna per divisi** | Setiap divisi punya warna khas — memudahkan identifikasi visual |
| **Real-time feedback** | Saldo kas, progress %, dan status tampil real-time (fetch on mount + optimistic update) |

---

## 2. Warna Divisi

| Divisi | Warna | Tailwind |
|--------|-------|----------|
| Ketua | Emas | `amber-500` |
| Acara | Biru | `blue-600` |
| Humas | Hijau | `emerald-500` |
| Pendanaan | Ungu | `violet-600` |
| Merchandise | Oranye | `orange-500` |

---

## 3. Layout Utama

### 3.1 JuruladenLayout

```
┌──────────────────────────────────────────────────────┐
│  HEADER: [Logo BAM] [EventSelector ▼]    [🔔] [🙂]  │
├──────────┬───────────────────────────────────────────┤
│ SIDEBAR  │                                           │
│          │         CONTENT AREA                      │
│ 📊 Dasbor│                                           │
│ 👥 Divisi│                                           │
│ 🎤 Acara │                                           │
│ 📢 Humas │                                           │
│ 💰 Dana  │                                           │
│ 🛍️ Merch │                                           │
│ ⚙️ Seting│                                           │
├──────────┴───────────────────────────────────────────┤
│  FOOTER (opsional): v1.0 | BAM © 2026               │
└──────────────────────────────────────────────────────┘
```

### 3.2 Mobile Layout

```
┌─────────────────────┐
│ [Logo]  [Evt▼] [🔔] │  ← Header compact
├─────────────────────┤
│                     │
│   CONTENT AREA      │  ← Full width
│   (scrollable)      │
│                     │
├─────────────────────┤
│ 📊  👥  🎤  📢  💰  │  ← Bottom Navbar (5 ikon)
└─────────────────────┘
```

### 3.3 Event Selector (Dropdown)

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

## 4. Halaman Detail

### 4.1 Dashboard — Event Overview

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

### 4.1b Timeline View (Semua User)

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

### 4.2 Divisi Detail — Task Board (Kanban)

```
┌─────────────────────────────────────────────────────────┐
│  Divisi Acara ────── [Progress: 33%] [+ Tugas Baru]     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  ┌─ TODO (8) ───┐  ┌─ IN PROGRESS (2) ┐  ┌─ DONE (4) ┐ │
│  │               │  │                  │  │            │ │
│  │ ┌───────────┐ │  │ ┌──────────────┐ │  │ ┌────────┐ │ │
│  │ │ Buat      │ │  │ │ Cek venue    │ │  │ │ Survey │ │ │
│  │ │ rundown   │ │  │ │ ──────────── │ │  │ │ lokasi  │ │ │
│  │ │ ────────  │ │  │ │ 🔴 High      │ │  │ │ ✅ Done │ │ │
│  │ │ 🟡 Medium │ │  │ │ 📅 5 Jun     │ │  │ │         │ │ │
│  │ │ 📅 10 Jun │ │  │ │ 👤 Budi      │ │  │ │         │ │ │
│  │ │ 👤 Amin   │ │  │ └──────────────┘ │  │ └────────┘ │ │
│  │ └───────────┘ │  │                  │  │            │ │
│  │ ┌───────────┐ │  │ ┌──────────────┐ │  │ ┌────────┐ │ │
│  │ │ Pesan     │ │  │ │ Koordinasi   │ │  │ │ Booking │ │ │
│  │ │ tenda     │ │  │ │ MC           │ │  │ │ gedung  │ │ │
│  │ │ 🟢 Low    │ │  │ │ ...          │ │  │ │ ...     │ │ │
│  │ │ 📅 12 Jun │ │  │ └──────────────┘ │  │ └────────┘ │ │
│  │ └───────────┘ │  │                  │  │            │ │
│  └───────────────┘  └──────────────────┘  └────────────┘ │
│                                                         │
│  ┌─ BLOCKED (0) ────────────────────────────────────────┐│
│  │  (area kosong — drag task ke sini jika terhambat)    ││
│  └──────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**Interaksi**:
- Drag & drop task antar kolom status
- Klik task → modal detail / edit
- Tombol "+" di setiap kolom untuk tambah task langsung dengan status tersebut
- Filter: priority, assignee, search

### 4.3 Rundown Builder

```
┌─────────────────────────────────────────────────────────┐
│  Rundown: JADWAL ACARA                    [v3 ▼] [Simpan│
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  ┌──────┬──────────┬────────────────┬────────┬────────┐ │
│  │ Waktu│ Durasi   │ Aktivitas      │ PIC    │ Lokasi │ │
│  ├──────┼──────────┼────────────────┼────────┼────────┤ │
│  │08:00 │ 30 mnt   │ Pembukaan      │ Amin   │ Panggng│ │
│  │08:30 │ 15 mnt   │ Tilawah        │ Budi   │ Panggng│ │
│  │08:45 │ 45 mnt   │ Sambutan Ketua │ Amin   │ Panggng│ │
│  │09:30 │ 60 mnt   │ Ramah Tamah    │ (semua)│ Aula   │ │
│  │      │ [+Tambah]│                │        │        │ │
│  └──────┴──────────┴────────────────┴────────┴────────┘ │
│                                                         │
│  Drag untuk reorder • Klik untuk edit • Swipe delete     │
└─────────────────────────────────────────────────────────┘
```

### 4.4 Inventory Checklist

```
┌─────────────────────────────────────────────────────────┐
│  Perlengkapan ─── [Filter: Semua ▼] [+ Tambah Barang]   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  ┌─ Dekorasi ───────────────────────────────────────────┐│
│  │ ☑ Tenda 6x12 ........ 2 unit | Sewa | Delivered ✅   ││
│  │ ☐ Karpet ................. 4 unit | Sewa | Pending ⏳ ││
│  │ ☑ Bunga meja ........... 10 pcs | Beli | Delivered ✅ ││
│  └──────────────────────────────────────────────────────┘│
│  ┌─ Venue ──────────────────────────────────────────────┐│
│  │ ☑ Sound system ......... 1 set | Sewa | Confirmed 🟡  ││
│  │ ☐ Proyektor .............. 1 unit | Pinjam | Pending ⏳││
│  └──────────────────────────────────────────────────────┘│
│  ┌─ Dokumen ───────────────────────────────────────────┐│
│  │ ☐ Surat izin keramaian ... 1 pcs | - | Pending ⏳     ││
│  └──────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 4.5 Cashflow Page

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

### 4.6 Form Transaksi Cepat

```
┌────────────────────────────────────┐
│  Tambah Pemasukan              [✕] │
│  ──────────────────────────────     │
│                                     │
│  Kategori: [Iuran ▼]               │
│  Jumlah:   Rp [___________]        │
│            (auto-format Rupiah)     │
│  Dari:     [___________]  👤 (pilih person)
│  Metode:   [Transfer ▼]            │
│  Tanggal:  [15/06/2026]  📅        │
│  No. Kuitansi: [_________]         │
│  Budget Line: [Iuran per KK ▼]     │
│  Catatan:  [___________________]   │
│                                     │
│  [Batal]             [💾 Simpan]   │
└────────────────────────────────────┘
```

### 4.6b Budget Line Payment Tracking

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

### 4.7 Merchandise Order Recap — Vendor (Pivot Table)

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

### 4.8 Merchandise Order Recap — WA Group (per Qobilah)

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

### 4.9 WA Blast Modal

```
┌────────────────────────────────────────────┐
│  Kirim Blast WhatsApp                  [✕] │
│  ────────────────────────────────────       │
│                                             │
│  Template: [Pengingat Acara ▼]  [Kelola]   │
│                                             │
│  ┌─ Preview ────────────────────────────┐  │
│  │ Assalamualaikum wr. wb.              │  │
│  │                                      │  │
│  │ Kepada Yth. Bapak/Ibu {{nama}},     │  │
│  │ Kami mengingatkan acara...           │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Penerima:                                 │
│  ☑ Panitia Inti (15 nomor)                 │
│  ☑ Anggota Ngaglik (45 nomor)              │
│  ☐ Anggota Cabang Lain (120 nomor)         │
│  ─────────────────────────────             │
│  Total: 60 nomor                           │
│                                             │
│  Delay antar pesan: [2 detik ▼]            │
│                                             │
│  [Batal]              [🚀 Kirim Blast]     │
└────────────────────────────────────────────┘
```

---

## 5. Komponen Reusable

| Komponen | Fungsi | Props |
|----------|--------|-------|
| `JuruladenLayout` | Layout utama | `event: Event`, `children` |
| `EventSelector` | Dropdown pilih event | `events: Event[]`, `active: Event`, `onChange` |
| `DivisionBadge` | Badge divisi berwarna | `division: string` (slug) |
| `StatusBadge` | Badge status | `status: string`, `type: 'task'\|'payment'\|'rsvp'` |
| `TaskCard` | Card tugas draggable | `task: Task`, `onStatusChange`, `onClick` |
| `KanbanBoard` | Papan kanban 4 kolom | `tasks: Task[]`, `onTaskMove` |
| `ProgressBar` | Progress bar persentase | `value: number`, `color: string`, `size: 'sm'\|'md'\|'lg'` |
| `CurrencyInput` | Input Rupiah terformat | `value: number`, `onChange` |
| `CashflowTable` | Tabel pemasukan/pengeluaran | `entries: Entry[]`, `type: 'income'\|'expense'`, `onDelete` |
| `BudgetVsActualChart` | Chart perbandingan | `data: BudgetLine[]` |
| `ExportButton` | Button export dropdown | `formats: ('pdf'\|'sheets')[]`, `onExport` |
| `BlastWAButton` | Tombol blast WA | `eventId: number`, `onSuccess` |
| `ConfirmationModal` | Modal konfirmasi | `title, message, onConfirm, variant` |
| `PersonPicker` | Autocomplete person | `onSelect`, existing dari portal |
| `DatePicker` | Date picker simple | `value, onChange` |
| `VendorRecapTable` | Tabel pivot multi-dimensi rekap vendor | `product: MerchProduct`, `dimensions: Dimension[]`, `data: PivotData` |
| `WARecapList` | List rekap per qobilah format WA | `qobilahs: QobilahRecap[]`, `onCopyText`, `onShareWA` |
| `BudgetLinePaymentStatus` | Tabel status bayar per budget line | `lines: BudgetLine[]`, `onFilter` |
| `EmptyState` | Ilustrasi data kosong | `title, description, action` |

---

## 6. Navigasi

### 6.1 Sidebar (Desktop)

```
📊 Dasbor
──────────
👥 Divisi
  ├── Acara
  ├── Humas
  ├── Pendanaan
  └── Merchandise
──────────
🎤 Acara
  ├── Rundown
  ├── Juknis/Juklak
  ├── Perlengkapan
  ├── MC
  └── Konsumsi
📢 Humas
  ├── Peserta
  ├── Publikasi & Blast WA
  └── Dokumentasi
💰 Pendanaan
  ├── Budget Plan
  ├── Pemasukan
  ├── Pengeluaran
  ├── Status Bayar
  └── Laporan
🛍️ Merchandise
  ├── Produk & Varian
  ├── Pesanan
  ├── Rekap Vendor
  └── Rekap WA Group
──────────
⚙️ Pengaturan
```

### 6.2 Bottom Nav (Mobile)

```
│ 📊      │ 👥      │ 💰      │ 🛍️      │ ⋯      │
│ Dasbor  │ Divisi  │ Dana    │ Merch   │ Lainnya│
```

- "Lainnya" membuka drawer menu sisanya (Acara, Humas, Pengaturan)

---

## 7. Empty States & Loading

### 7.1 Empty State

```
┌─────────────────────────────────┐
│                                 │
│         🎤  (ikon lucu)         │
│                                 │
│    Belum ada tugas di divisi    │
│            Acara                │
│                                 │
│      [➕ Buat Tugas Pertama]    │
│                                 │
└─────────────────────────────────┘
```

### 7.2 Loading Skeleton

```
┌─────────────────────────────────┐
│ ████████████                    │
│ ██████████████████████          │
│                                 │
│ ┌──────┐ ┌──────┐ ┌──────┐     │
│ │ ████ │ │ ████ │ │ ████ │     │
│ │ ████ │ │ ████ │ │ ████ │     │
│ └──────┘ └──────┘ └──────┘     │
└─────────────────────────────────┘
```

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| Mobile | < 640px | Bottom nav, full-width card, table → list view |
| Tablet | 640px - 1024px | Sidebar collapsed (ikon only), table view |
| Desktop | > 1024px | Full sidebar + content, table + kanban |

---

*UI/UX Spec siap. Implementasi frontend menggunakan TailwindCSS utility-first, komponen dari shadcn/ui atau headless UI untuk aksesibilitas.*
