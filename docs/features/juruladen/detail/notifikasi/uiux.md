# 🎨 UI/UX — Notifikasi

> **Modul**: [Fitur Notifikasi](fitur.md) | **UI/UX Utama**: [← Kembali ke UI/UX Spec](../../uiux-spec.md)

---

## 1. Notification Bell (Header)

```
┌────────────────────────────┐
│            [🔔²] [🙂 Humam]│  ← Header
└────────────────────────────┘
         │
         ▼ Click
┌────────────────────────────┐
│ 🔔 Notifikasi              │
│ ────────────────────        │
│                             │
│ 📋 Tugas: "Finalisasi      │
│    budget" deadline besok  │
│    5 menit yang lalu       │
│                             │
│ 💰 Transaksi baru: Iuran   │
│    Rp 500.000 dari Ahmad   │
│    1 jam yang lalu         │
│                             │
│ ✅ Tugas: "Susun juknis"   │
│    selesai oleh Budi       │
│    3 jam yang lalu         │
│                             │
│ ────────────────────        │
│ [Lihat Semua]  [⚙️ Pref]  │
└────────────────────────────┘
```

---

## 2. Preferences Form

```
┌─────────────────────────────────────────────────────────┐
│  Preferensi Notifikasi                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  Event: Halal Bihalal 2026                              │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  ☑ Tugas di-assign ke saya                         ││
│  │  ☑ Deadline tugas besok (H-1)                      ││
│  │  ☑ Tugas selesai (jika saya ketua divisi)          ││
│  │  ☑ Transaksi keuangan baru                         ││
│  │  ☐ Ringkasan harian (pagi hari)                    ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  [💾 Simpan Preferensi]                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Komponen Spesifik

| Komponen | Fungsi |
|----------|--------|
| `NotificationBell` | Ikon lonceng + badge unread count |
| `NotificationDropdown` | Dropdown list notifikasi terbaru |
| `NotificationList` | Halaman full list dengan pagination |
| `PreferencesForm` | Toggle preferensi per jenis notifikasi |

---

## 4. Halaman

| Halaman | Route |
|---------|-------|
| Notifikasi | `/events/{slug}/pengaturan/notifikasi` |

---

## 5. Related Docs

- [← Fitur Notifikasi](fitur.md)
- [🎨 UI/UX Spec (Overview)](../../uiux-spec.md)
