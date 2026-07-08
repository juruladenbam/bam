# 🔐 Auth & User Management — Detail Fitur

> **Status**: Draft | **PRD**: [← Kembali ke PRD](../../prd.md)
> **Terkait**: [👑 Ketua](../ketua/fitur.md) | [🧠 NibService](../../../backend/app/Services/NibService.php)

---

## 1. Overview

Seluruh autentikasi Juruladen menggunakan **NIB (Nomor Induk BAM)** sebagai identifier utama — bukan email. Person yang sudah terdata di silsilah BAM bisa dibuatkan akun oleh **Superadmin Juruladen**, lalu login dengan NIB mereka.

> 📄 **Referensi**: Struktur organisasi dan pedoman pelaksanaan kegiatan mengacu pada [Pedoman Pelaksanaan Kegiatan BAM](../src/Pedoman%20Pelaksanaan%20Kegiatan%20BAM%20-%20Draft.pdf).

### Filosofi

| Prinsip | Implementasi |
|---------|-------------|
| **No self-registration** | Akun hanya dibuat oleh Superadmin — tidak ada form daftar publik |
| **NIB as identity** | NIB = username. Validasi checksum via `NibService` |
| **First-time password** | User baru diarahkan membuat password saat login pertama |
| **Superadmin-mediated reset** | Lupa password → notif ke Superadmin → Superadmin reset → user bikin password baru |
| **Single session auto-login** | Setelah set password, langsung login (tidak perlu login ulang) |

---

## 2. Database Changes

### 2.1 Alter `users` Table

> Tabel `users` existing sudah memiliki `person_id`, `role`, `password`. Hanya perlu minor alter.

```sql
-- Migration: alter users untuk Juruladen
ALTER TABLE users
  MODIFY email VARCHAR(255) NULL UNIQUE,     -- Juruladen user tidak wajib punya email
  MODIFY password VARCHAR(255) NULL;         -- NULL = first-time, belum set password
```

| Kolom | Sebelum | Sesudah | Alasan |
|-------|---------|---------|--------|
| `email` | NOT NULL UNIQUE | NULL UNIQUE | Juruladen user login dengan NIB, bukan email |
| `password` | NOT NULL | NULL | NULL = first-time user; IS NOT NULL = sudah set password |

> **Catatan**: `person_id` sudah ada di `users` table (unsignedBigInteger, nullable). Tidak perlu kolom baru.

### 2.2 Existing Columns yang Digunakan

| Kolom | Tipe | Fungsi di Juruladen |
|-------|------|---------------------|
| `person_id` | FK → persons.id | Link ke data silsilah. **Wajib** untuk semua Juruladen user |
| `role` | enum (superadmin/admin/member) | `superadmin` = kelola user; `admin` = panitia biasa |
| `password` | varchar NULL | NULL = belum set password; IS NOT NULL = sudah |
| `email` | varchar NULL | Opsional untuk Juruladen user |

---

## 3. User Management (Superadmin)

### 3.1 Halaman Kelola User

Superadmin **(dan Ketua)** mengakses halaman **Pengaturan → User Juruladen** untuk:

**Daftar User:**
```
┌─────────────────────────────────────────────────────────┐
│  User Juruladen ─── [+ Tambah User]                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ┌────────────┬──────────┬──────────┬────────┬──────────┐│
│  │ Nama       │ NIB      │ Role     │Status  │ Aksi     ││
│  ├────────────┼──────────┼──────────┼────────┼──────────┤│
│  │ Humam      │ 0803050… │ ketua    │ ✅ Aktif│🔑 Reset ││
│  │ Siti R.    │ 0804010… │ anggota  │ 🟡 BlmPW│ 🗑 Hapus ││
│  └────────────┴──────────┴──────────┴────────┴──────────┘│
└─────────────────────────────────────────────────────────┘
```

**Status user:**
| Status | password | Artinya |
|--------|----------|---------|
| 🟡 Belum Set Password | NULL | User belum login pertama kali |
| ✅ Aktif | IS NOT NULL | User sudah set password, bisa login |

### 3.2 Tambah User

1. Superadmin klik **[+ Tambah User]**
2. Cari person via NIB atau nama (autocomplete dari `persons`)
3. Pilih role: `superadmin` / `admin`
4. Pilih event assignment (opsional — bisa di-set nanti via Divisi Management)
5. Simpan → buat record `users` dengan `person_id`, `role`, `password=NULL`
6. Superadmin memberitahu user: "Silakan akses juruladen.bamseribuputu.my.id, login dengan NIB kamu"

### 3.3 Reset Password

1. User lupa password → klik "Lupa Password" di halaman login → input NIB
2. Sistem verifikasi NIB terdaftar → kirim **notifikasi email ke Superadmin dan Ketua**
3. Notifikasi berisi: "User [Nama Person] (NIB: xxx) meminta reset password. [Klik untuk reset]"
4. Superadmin/Ketua membuka halaman User Management → klik **[🔑 Reset]** pada user terkait
5. Konfirmasi: "Reset password untuk Humam? Password saat ini akan dihapus dan user harus membuat password baru."
6. Setelah konfirmasi → `password = NULL`
7. User login kembali dengan NIB → diarahkan ke form "Buat Password Baru" (seperti first-time)

### 3.4 Hapus User

Superadmin bisa menghapus user → record `users` dihapus. Person tetap ada di silsilah, hanya akses Juruladen yang dicabut. Data transaksi/tugas yang sudah dibuat user tetap ada (`recorded_by` jadi NULL via `nullOnDelete`).

---

## 4. Login Flow

### 4.1 Halaman Login

```
┌──────────────────────────────────────┐
│                                      │
│         [Logo BAM / Juruladen]       │
│                                      │
│    Masukkan NIB Anda                 │
│    ┌────────────────────────────┐    │
│    │ 0803050102000              │    │
│    └────────────────────────────┘    │
│                                      │
│    [Lanjutkan]                       │
│                                      │
└──────────────────────────────────────┘
```

### 4.2 Decision Tree

```
User input NIB
        │
        ▼
  Validasi NIB (Luhn checksum via NibService)
        │
   ┌────┴────┐
   │ Invalid │ → "NIB tidak valid. Periksa kembali."
   └────┬────┘
        │ Valid
        ▼
  Cari Person by NIB (NibService::findPersonByNibWithChecksum)
        │
   ┌────┴────┐
   │ Tidak   │ → "NIB tidak terdaftar di silsilah BAM."
   │ ditemukan│
   └────┬────┘
        │ Ditemukan
        ▼
  Cari User by person_id
        │
   ┌────┴────────────┐
   │ Tidak terdaftar │ → "Akses ditolak. NIB Anda belum terdaftar sebagai pengguna Juruladen.
   │ sebagai user    │    Hubungi Superadmin untuk didaftarkan."
   └────┬────────────┘
        │ Terdaftar
        ▼
  Cek user.password
        │
   ┌────┴────────────┐
   │ NULL            │ → Tampilkan Form: "Lengkapi Data Akun"
   │ (first-time)    │    • Email
   └────┬────────────┘    • Password (min 8 char)
        │                 • Konfirmasi Password
        │                 → Submit → simpan email & hash password
        │                 → Auto-login → Dashboard JMS
        │                 → 📧 Kirim email greeting: "Selamat datang di Juruladen BAM!"
        │
   ┌────┴────────────┐
   │ IS NOT NULL     │ → Tampilkan Form: "Masukkan Password"
   │ (returning)     │    • Password
   └────┬────────────┘    • [Lupa Password?]
        │                 → Submit → verifikasi password
        │                    ├── Valid → Login → Dashboard JMS
        │                    └── Invalid → "Password salah"
```

### 4.3 Form "Lengkapi Data Akun" (First-time)

```
┌──────────────────────────────────────┐
│                                      │
│    Selamat datang, Humam!            │
│    Lengkapi data akun Anda           │
│                                      │
│    Email                             │
│    ┌────────────────────────────┐    │
│    │ humam@email.com            │    │
│    └────────────────────────────┘    │
│    (untuk notifikasi & greeting)     │
│                                      │
│    Password                          │
│    ┌────────────────────────────┐    │
│    │ ●●●●●●●●                   │    │
│    └────────────────────────────┘    │
│    Minimal 8 karakter                │
│                                      │
│    Konfirmasi Password               │
│    ┌────────────────────────────┐    │
│    │ ●●●●●●●●                   │    │
│    └────────────────────────────┘    │
│                                      │
│    [Lengkapi & Masuk]                │
│                                      │
│  ┌──────────────────────────────────┐│
│  │ ✉️ Email greeting akan dikirim  ││
│  │    setelah akun Anda aktif       ││
│  └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

**Flow setelah submit:**
1. Email + password disimpan
2. User auto-login ke Dashboard JMS
3. 📧 **Welcome email** dikirim via queue: "Selamat datang di Juruladen BAM! Akun Anda sudah aktif. Gunakan NIB Anda untuk login."
4. Tidak ada link aktivasi — akun langsung aktif

### 4.4 Form "Masukkan Password" (Returning)

```
┌──────────────────────────────────────┐
│                                      │
│    Selamat datang kembali, Humam!    │
│                                      │
│    Password                          │
│    ┌────────────────────────────┐    │
│    │ ●●●●●●●●                   │    │
│    └────────────────────────────┘    │
│                                      │
│    [Lupa Password?]                  │
│                                      │
│    [Masuk]                           │
│                                      │
└──────────────────────────────────────┘
```

### 4.5 Lupa Password Flow

```
User klik "Lupa Password" (dari form returning user)
        │
        ▼
  User input NIB (pre-filled atau input ulang)
        │
        ▼
  Validasi NIB → cari User
        │
   ┌────┴────────────┐
   │ Tidak terdaftar │ → "NIB tidak terdaftar."
   └────┬────────────┘
        │ Terdaftar
        ▼
  Kirim notifikasi ke Superadmin & Ketua:
  "User [Nama] (NIB: xxx) meminta reset password."
        │
        ▼
  Tampilkan ke user:
  "Permintaan reset password telah dikirim ke Superadmin.
   Anda akan dihubungi jika password sudah direset."
        │
        ▼
  Superadmin/Ketua reset password user (set password = NULL)
        │
        ▼
  User login lagi → masuk ke Form "Buat Password Baru"
```

---

## 5. API Endpoints

### Auth
| Method | Path | Deskripsi | Auth |
|--------|------|-----------|------|
| `POST` | `/api/juruladen/auth/check-nib` | Cek NIB: valid? terdaftar? status password? | ❌ Public |
| `POST` | `/api/juruladen/auth/set-password` | First-time: buat password baru + auto-login | ❌ Public (NIB-verified) |
| `POST` | `/api/juruladen/auth/login` | Login (NIB + password) → return Sanctum token | ❌ Public |
| `POST` | `/api/juruladen/auth/forgot-password` | Request reset password → notifikasi ke Superadmin | ❌ Public |
| `POST` | `/api/juruladen/auth/logout` | Logout | ✅ Sanctum |

### User Management (Superadmin only)
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/api/juruladen/users` | List semua user Juruladen |
| `POST` | `/api/juruladen/users` | Tambah user (person_id, role) |
| `DELETE` | `/api/juruladen/users/{user}` | Hapus user |
| `POST` | `/api/juruladen/users/{user}/reset-password` | Reset password user (set NULL) |
| `GET` | `/api/juruladen/users/search-person` | Cari person by NIB/nama untuk form tambah user |

### Request/Response Detail

#### `POST /auth/check-nib`
```json
// Request
{ "nib": "0803050102000" }

// Response (first-time)
{
  "success": true,
  "data": {
    "nib_valid": true,
    "person_found": true,
    "person_name": "Humam",
    "user_registered": true,
    "has_password": false,
    "next_step": "set_password"
  }
}

// Response (returning)
{
  "data": {
    "nib_valid": true,
    "has_password": true,
    "next_step": "login",
    "person_name": "Humam"
  }
}

// Response (not registered)
{
  "success": false,
  "message": "Akses ditolak. NIB Anda belum terdaftar sebagai pengguna Juruladen.",
  "data": { "nib_valid": true, "user_registered": false }
}
```

#### `POST /auth/set-password`
```json
// Request
{
  "nib": "0803050102000",
  "email": "humam@email.com",
  "password": "min8char",
  "password_confirmation": "min8char"
}

// Response
{
  "success": true,
  "message": "Akun berhasil dibuat. Selamat datang, Humam!",
  "data": {
    "token": "1|abc123...",
    "user": { "id": 5, "name": "Humam", "email": "humam@email.com", "role": "admin", "person_id": 42 }
  }
}
```

#### `POST /auth/login`
```json
// Request
{ "nib": "0803050102000", "password": "myPassword123" }

// Response
{
  "success": true,
  "data": {
    "token": "1|abc123...",
    "user": { "id": 5, "name": "Humam", "role": "admin" }
  }
}
```

---

## 6. Service Classes

| Service | Method | Deskripsi |
|---------|--------|-----------|
| `JuruladenAuthService` | `checkNib(nib)` | Validasi NIB + cek status user |
| `JuruladenAuthService` | `setPassword(nib, email, password)` | Simpan email & hash password, login, return token |
| `JuruladenAuthService` | `login(nib, password)` | Verifikasi password, return token |
| `JuruladenAuthService` | `requestReset(nib)` | Kirim notifikasi ke Superadmin/Ketua |
| `JuruladenUserService` | `createUser(personId, role)` | Buat user record |
| `JuruladenUserService` | `resetPassword(userId)` | Set password = NULL |

---

## 7. UI Components

| Komponen | Fungsi |
|----------|--------|
| `NibLoginForm` | Step 1: input NIB + validasi real-time |
| `SetPasswordForm` | First-time: buat password + konfirmasi |
| `PasswordLoginForm` | Returning: input password |
| `ForgotPasswordModal` | Lupa password → request reset |
| `UserManagementTable` | Superadmin: list, tambah, reset, hapus user |
| `PersonSearchAutocomplete` | Cari person by NIB/nama |

---

## 8. Halaman

| Halaman | Route | Akses |
|---------|-------|-------|
| **Login** | `/login` | Publik |
| **User Management** | `/admin/users` | Superadmin |

---

## 9. Security Considerations

| Area | Proteksi |
|------|----------|
| **NIB validation** | Luhn checksum via `NibService::validate()` — mencegah NIB invalid/typo |
| **Password policy** | Minimal 8 karakter. Bisa ditambah complexity rules nanti |
| **Rate limiting** | Maks 5 percobaan login per NIB per 15 menit |
| **Token lifetime** | Sanctum token: 7 hari (configurable) |
| **Reset audit** | Setiap reset password dicatat: siapa yang reset, kapan |
| **No email dependency** | Email opsional — tidak perlu email untuk reset password (superadmin-mediated) |

---

## 10. Acceptance Criteria

- [ ] Superadmin bisa menambah user Juruladen (cari person by NIB → assign role `superadmin`/`admin`)
- [ ] User dengan password=NULL melihat form "Lengkapi Data Akun" (email + password + konfirmasi) saat login pertama
- [ ] User dengan password ter-set melihat form "Masukkan Password" saja saat login
- [ ] Setelah lengkapi data, user auto-login ke dashboard JMS
- [ ] NIB tidak terdaftar → akses ditolak dengan pesan jelas
- [ ] Lupa password → notifikasi ke Superadmin/Ketua → reset → user isi ulang email + password baru
- [ ] Superadmin bisa menghapus user (akses dicabut, data tasks/transaksi tetap ada)
- [ ] **Access control**: Anggota divisi hanya CRUD modul sendiri, view-only modul lain, tidak bisa lihat modul Ketua
- [ ] **Access control**: Ketua bisa semua modul + user management (reset password)
- [ ] **Access control**: Superadmin bisa semua modul + tambah user + user management

---

## 12. Access Control Matrix

> ⚠️ **PENTING**: Ini adalah aturan akses yang harus di-enforce di **middleware/controller**, bukan hanya informatif di UI.

### 12.1 Role Definition

| Level | Sumber | Nilai |
|-------|--------|-------|
| **User Role** | `users.role` | `superadmin` / `admin` |
| **Committee Role** | `committee_members.role` | `ketua` / `anggota` |
| **Division** | `committee_members.division_id` | `acara` / `humas` / `pendanaan` / `merchandise` |

### 12.2 Access Matrix

| User Role | Committee Role | Modul Sendiri | Modul Lain | Modul Ketua | User Mgmt |
|-----------|---------------|---------------|------------|-------------|-----------|
| `superadmin` | — | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ Ya |
| `admin` | `ketua` | ✅ CRUD (semua) | ✅ CRUD (semua) | ✅ CRUD | ✅ Ya |
| `admin` | `anggota` (Acara) | ✅ CRUD (Acara) | 👁️ View-only | 🚫 Tidak bisa lihat | ❌ Tidak |
| `admin` | `anggota` (Humas) | ✅ CRUD (Humas) | 👁️ View-only | 🚫 Tidak bisa lihat | ❌ Tidak |
| `admin` | `anggota` (Pendanaan) | ✅ CRUD (Pendanaan) | 👁️ View-only | 🚫 Tidak bisa lihat | ❌ Tidak |
| `admin` | `anggota` (Merch) | ✅ CRUD (Merch) | 👁️ View-only | 🚫 Tidak bisa lihat | ❌ Tidak |

### 12.3 Rules Detail

**Superadmin:**
- Full access ke semua modul, semua event
- Satu-satunya yang bisa **menambah** user baru
- Bisa mereset password user manapun

**Ketua (admin + committee_members.role = ketua):**
- Bisa melihat dan mengelola **semua modul** (seperti superadmin)
- Bisa mereset password user (tapi tidak bisa menambah user baru)
- **Data Ketua bersifat privat** — divisi lain tidak bisa melihat halaman/tugas Ketua

**Anggota Divisi (admin + committee_members.role = anggota):**
- **Modul sendiri**: CRUD penuh (sesuai divisi)
- **Modul lain**: 👁️ View-only — bisa melihat data tapi tidak bisa create/update/delete
- **Modul Ketua**: 🚫 Tidak bisa diakses sama sekali
- **User Management**: ❌ Tidak bisa diakses

### 12.4 Contoh Skenario

```
HUMAS (anggota divisi Humas) login:
  ✅ Lihat & kelola: Peserta, Publikasi, Broadcast WA, Dokumentasi (modul Humas)
  👁️ Lihat saja: Rundown, Inventory, Budget, Merch (modul lain)
  🚫 Tidak bisa lihat: Dashboard Ketua, Timeline Ketua, Divisi Management
  ❌ Tidak bisa: User Management

KETUA login:
  ✅ Lihat & kelola: SEMUA modul (Acara, Humas, Pendanaan, Merch, Ketua)
  ✅ User Management: Reset password user
  🚫 Data Ketua: tidak terlihat oleh divisi manapun
```

---

## 13. Related Docs

- [← PRD (Overview)](../../prd.md)
- [👑 Ketua — Detail](../ketua/fitur.md)
- [🗄️ ERD §2.1-2.1b](../../erd.md) — Events & Users extensions
- [📡 API Contract §2.1](../../api-contract.md#21-event-management)
- [🚀 Implementasi Fase 1](../../implementasi.md#fase-1--fondasi-core)
- [🧠 NibService](../../../backend/app/Services/NibService.php) — kode existing
