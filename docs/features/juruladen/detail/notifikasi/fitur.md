# 🔔 Notifikasi — Detail Fitur

> **Status**: Draft | **PRD**: [← Kembali ke PRD](../../prd.md)
> **ERD**: [Lihat ERD §2.11](../../erd.md#211-notifications)
> **API**: [Lihat API Contract §2.16](../../api-contract.md#216-notifications)

---

## 1. Overview

Sistem notifikasi email otomatis untuk anggota panitia. Menggunakan Laravel Mail + Queue (database driver) + Scheduler.

### Role

| Role | Akses |
|------|-------|
| **Semua panitia** | Menerima notifikasi sesuai preferensi |
| **Ketua** | Konfigurasi preferensi notifikasi |

---

## 2. Jenis Notifikasi

| # | Tipe | Trigger | Penerima |
|---|------|---------|----------|
| 1 | `task_assigned` | Task created/updated dengan assignee baru | User yang di-assign |
| 2 | `task_deadline` | Scheduler: deadline = besok (H-1) | User yang di-assign |
| 3 | `task_done` | Task status diubah ke `done` | Ketua divisi |
| 4 | `transaction_new` | Income/Expense entry created | Bendahara + Ketua |
| 5 | `daily_summary` | Scheduler: kirim jam 07:00 | User yang enable (default OFF) |
| 6 | `welcome` | 🆕 User pertama kali lengkapi akun (set email + password) | User yang baru aktif |

---

## 3. Teknologi

| Komponen | Teknologi |
|----------|-----------|
| **Mail** | Laravel Mail → `Mail::to($user)->send(new Mailable)` |
| **Queue** | Database driver (jobs table) |
| **Scheduler** | `php artisan schedule:run` via cron setiap menit |
| **Template** | Blade mailable classes |

---

## 4. Mailable Classes

| Mailable | Trigger | Data |
|----------|---------|------|
| `TaskAssignedMail` | Task created/updated | `$task`, `$event`, `$division` |
| `TaskDeadlineMail` | Scheduler H-1 | `$task`, `$event` |
| `TaskDoneMail` | Task → done | `$task` (notify ketua divisi) |
| `TransactionNewMail` | Income/Expense created | `$entry`, `$event` |
| `DailySummaryMail` | Scheduler 07:00 | `$event`, progress array |
| `WelcomeMail` | 🆕 User lengkapi akun pertama kali | `$user`, `$event` |

---

## 5. Scheduler

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    // Cek deadline task — kirim notifikasi H-1
    $schedule->command('juruladen:notify-deadlines')->dailyAt('07:00');

    // Kirim daily summary
    $schedule->command('juruladen:daily-summary')->dailyAt('07:00');

    // Proses queued emails
    $schedule->command('queue:work --stop-when-empty')->everyMinute();
}
```

---

## 6. Notification Preferences

Setiap user bisa mengatur preferensi per event (atau global default).

**Default:** Semua ON kecuali `daily_summary`.

```json
{
  "event_id": null,
  "task_assigned": true,
  "task_deadline": true,
  "task_done": true,
  "transaction_new": true,
  "daily_summary": false
}
```

**Tabel:** `notification_preferences` — unique (user_id, event_id). `event_id=null` = global default.

---

## 7. Notification Log

Semua notifikasi yang dikirim dicatat di `notification_logs`:

| Field | Deskripsi |
|-------|-----------|
| `event_id` | Event terkait |
| `recipient_user_id` | Penerima |
| `channel` | `email` (default) |
| `type` | task_assigned / task_deadline / task_done / transaction_new / daily_summary |
| `title` | Judul email |
| `body` | Isi email |
| `status` | queued / sent / failed |

---

## 8. API Endpoints

| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events/{event}/notifications` | List notification logs |
| `GET` | `/notifications/preferences` | Get preferences |
| `PUT` | `/notifications/preferences` | Update preferences |

---

## 9. UI Components

| Komponen | Fungsi |
|----------|--------|
| `NotificationBell` | Ikon lonceng + badge unread |
| `NotificationList` | Dropdown list notifikasi |
| `PreferencesForm` | Form toggle preferensi notifikasi |

---

## 10. Halaman

| Halaman | Route |
|---------|-------|
| **Notifikasi** | `/events/{slug}/pengaturan/notifikasi` |

---

## 11. Acceptance Criteria

- [ ] Notifikasi email terkirim untuk task_deadline (H-1)
- [ ] Notifikasi email terkirim untuk transaction_new
- [ ] User bisa menonaktifkan jenis notifikasi tertentu
- [ ] Notification log mencatat status queued/sent/failed
- [ ] Queue worker berjalan via scheduler

---

## 12. Related Docs

- [← PRD (Overview)](../../prd.md)
- [🗄️ ERD §2.11](../../erd.md#211-notifications)
- [📡 API §2.16](../../api-contract.md#216-notifications)
- [🔗 Integrasi §4 — Email](../../integrasi.md#4-email-notification)
- [🚀 Implementasi Fase 6](../../implementasi.md#fase-6--dashboard-laporan-notifikasi--integrasi)
