# 🎨 UI/UX — Acara

> **Modul**: [Fitur Acara](fitur.md) | **UI/UX Utama**: [← Kembali ke UI/UX Spec](../../uiux-spec.md)

---

## 1. Rundown Builder

```
┌─────────────────────────────────────────────────────────┐
│  Rundown: Halal Bihalal ─── [+ Section] [📥 Export PDF] │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  ┌─ Pembukaan ─────────────────────── [✏️] [🗑] [＋Item]│
│  │  ┌──────┬──────────┬──────────────────┬────────────┐ │
│  │  │Waktu │ Aktivitas│ PIC              │ Lokasi     │ │
│  │  ├──────┼──────────┼──────────────────┼────────────┤ │
│  │  │08:00 │ Pembukaan │ Ahmad F. 👤      │Panggung    │ │
│  │  │08:05 │ Tilawah   │ Budi S. 👤       │Panggung    │ │
│  │  │08:15 │ Sambutan  │ Ketua 👤         │Panggung    │ │
│  │  └──────┴──────────┴──────────────────┴────────────┘ │
│  └──────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─ Acara Inti ────────────────────── [✏️] [🗑] [＋Item]│
│  │  ┌──────┬──────────┬──────────────────┬────────────┐ │
│  │  │09:00 │ Tausiyah  │ Ust. Rahman 👤   │Panggung    │ │
│  │  │10:00 │ Ramah Tmh │ Semua            │Area Utama  │ │
│  │  └──────┴──────────┴──────────────────┴────────────┘ │
│  └──────────────────────────────────────────────────────┘│
│                                                         │
│  Total durasi: 2 jam 30 menit                           │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Inventory Checklist

```
┌─────────────────────────────────────────────────────────┐
│  Perlengkapan ─── [Filter: Semua Kategori ▼] [+ Barang] │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  ┌─ Dekorasi ──────────────────────────────────────────┐│
│  │ ├──────────┬──────┬──────┬──────────┬──────┬────────┤│
│  │ │ Nama     │ Jml  │Sumber│ Biaya    │Status│ PIC    ││
│  │ ├──────────┼──────┼──────┼──────────┼──────┼────────┤│
│  │ │Tenda 6x12│  2   │ Sewa │Rp 500K   │✅ Siap│ Ahmad  ││
│  │ │Karpet    │  4   │Sewa  │Rp 200K   │✅ Siap│ Budi   ││
│  │ │Bunga     │ 10   │Beli  │Rp 300K   │⏳ Blm │ Siti   ││
│  │ └──────────┴──────┴──────┴──────────┴──────┴────────┘│
│  └──────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─ Dokumen ───────────────────────────────────────────┐│
│  │ ├──────────┬──────┬──────┬──────────┬──────┬────────┤│
│  │ │Surat izin│  1   │Urus  │Rp 0      │⏳ Blm │ Ketua  ││
│  │ └──────────┴──────┴──────┴──────────┴──────┴────────┘│
│  └──────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 3. MC Assignments

```
┌─────────────────────────────────────────────────────────┐
│  MC & Petugas ─── [+ Tambah]                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  ┌──────────┬──────────────┬────────────────────────────┐│
│  │ Role     │ Nama         │ Segmen / Catatan           ││
│  ├──────────┼──────────────┼────────────────────────────┤│
│  │ MC Utama │ Ahmad F. 👤  │ Seluruh acara              ││
│  │ Co-MC    │ Budi S. 👤   │ Sesi pembukaan & sambutan  ││
│  │ Qori     │ Rahman 👤    │ Tilawah pembukaan           ││
│  │ Tilawah  │ Ust.Imam 👤  │ Surah Al-Fatihah           ││
│  └──────────┴──────────────┴────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 4. Catering Schedule

```
┌─────────────────────────────────────────────────────────┐
│  Jadwal Konsumsi ─── [+ Tambah]                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  ┌────────┬──────┬──────────────────┬──────┬────────────┐│
│  │ Waktu  │ Jenis│ Menu             │Porsi │ Biaya/Porsi││
│  ├────────┼──────┼──────────────────┼──────┼────────────┤│
│  │ 09:00  │Snack │ Kue basah + teh  │ 250  │ Rp 10.000  ││
│  │ 12:00  │Berat │ Nasi Liwet +Ayam│ 250  │ Rp 25.000  ││
│  │ 15:00  │Snack │ Gorengan + kopi  │ 250  │ Rp  8.000  ││
│  ├────────┼──────┼──────────────────┼──────┼────────────┤│
│  │ TOTAL  │      │                  │      │ Rp 10.750K ││
│  └────────┴──────┴──────────────────┴──────┴────────────┘│
│                                                         │
│  Sumber: Catering Bu Sri                                │
│  Catatan: Sediakan 10 porsi vegetarian                  │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Komponen Spesifik

| Komponen | Fungsi |
|----------|--------|
| `RundownBuilder` | Drag-drop editor rundown |
| `RichtextEditor` | Editor juknis/juklak |
| `InventoryTable` | Tabel checklist dengan status |
| `MCAssignmentCard` | Card penugasan MC |
| `CateringScheduleTable` | Tabel jadwal konsumsi |

---

## 6. Halaman

| Halaman | Route |
|---------|-------|
| Rundown | `/events/{slug}/acara/rundown` |
| Juknis/Juklak | `/events/{slug}/acara/juknis` |
| Perlengkapan | `/events/{slug}/acara/perlengkapan` |
| MC | `/events/{slug}/acara/mc` |
| Konsumsi | `/events/{slug}/acara/konsumsi` |

---

## 7. Related Docs

- [← Fitur Acara](fitur.md)
- [🎨 UI/UX Spec (Overview)](../../uiux-spec.md)
