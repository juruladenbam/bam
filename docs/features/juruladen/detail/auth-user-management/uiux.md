# 🎨 UI/UX — Auth & User Management

> **Modul**: [Fitur Auth & User Management](fitur.md) | **UI/UX Utama**: [← Kembali ke UI/UX Spec](../../uiux-spec.md)

---

## 1. Login — Input NIB

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

**State:**
- NIB valid tapi tidak terdaftar → "Akses ditolak. NIB Anda belum terdaftar."
- NIB tidak valid (Luhn checksum) → "NIB tidak valid."
- NIB valid + terdaftar → lanjut ke step berikutnya

---

## 2. First-Time — Lengkapi Data Akun

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

---

## 3. Returning — Masukkan Password

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

---

## 4. Lupa Password

```
┌──────────────────────────────────────┐
│                                      │
│    Lupa Password                     │
│                                      │
│    Masukkan NIB Anda:                │
│    ┌────────────────────────────┐    │
│    │ 0803050102000              │    │
│    └────────────────────────────┘    │
│                                      │
│    [Kirim Permintaan Reset]          │
│                                      │
│  ┌──────────────────────────────────┐│
│  │ 📧 Permintaan reset akan        ││
│  │    dikirim ke Superadmin/Ketua.  ││
│  │    Anda akan dihubungi jika      ││
│  │    password sudah direset.       ││
│  └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

---

## 5. User Management (Superadmin/Ketua)

```
┌─────────────────────────────────────────────────────────┐
│  User Juruladen ─── [+ Tambah User]                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  🔍 Cari: [___________]                                 │
│                                                         │
│  ┌────────────┬──────────┬──────────┬────────┬──────────┐│
│  │ Nama       │ NIB      │ Role     │Status  │ Aksi     ││
│  ├────────────┼──────────┼──────────┼────────┼──────────┤│
│  │ Humam      │ 0803050… │ admin    │ ✅ Aktif│🔑 Reset ││
│  │ Siti R.    │ 0804010… │ admin    │ 🟡 BlmPW│ 🗑 Hapus ││
│  │ Budi S.    │ 0802020… │ superadm│ ✅ Aktif│🔑 Reset ││
│  └────────────┴──────────┴──────────┴────────┴──────────┘│
└─────────────────────────────────────────────────────────┘
```

### Modal Tambah User

```
┌────────────────────────────────────┐
│  Tambah User Juruladen         [✕] │
│  ──────────────────────────────     │
│                                     │
│  Cari Person:                       │
│  ┌────────────────────────────┐    │
│  │ 080305...                  │    │
│  └────────────────────────────┘    │
│  ┌────────────────────────────┐    │
│  │ Humam — 0803050102000      │    │
│  │ Ahmad Fulan — 0803050102001│    │
│  └────────────────────────────┘    │
│                                     │
│  Role: [admin ▼]                   │
│    • superadmin (full + user mgmt) │
│    • admin (panitia)               │
│                                     │
│  [Batal]             [💾 Simpan]   │
└────────────────────────────────────┘
```

---

## 6. Komponen Spesifik

| Komponen | Fungsi |
|----------|--------|
| `NibLoginForm` | Step 1: input NIB + validasi |
| `SetPasswordForm` | First-time: email + password + konfirmasi |
| `PasswordLoginForm` | Returning: input password |
| `ForgotPasswordModal` | Lupa password → request reset |
| `UserManagementTable` | List user + tambah/reset/hapus |
| `PersonSearchAutocomplete` | Cari person by NIB/nama |

---

## 7. Halaman

| Halaman | Route | Akses |
|---------|-------|-------|
| Login | `/login` | Publik |
| User Management | `/admin/users` | Superadmin, Ketua |

---

## 8. Related Docs

- [← Fitur Auth & User Management](fitur.md)
- [🎨 UI/UX Spec (Overview)](../../uiux-spec.md)
