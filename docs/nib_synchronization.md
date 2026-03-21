---
description: Alur Sinkronisasi Urutan Kelahiran dengan NIB (Fase 4 - Opsional)
---

# Alur Sinkronisasi Urutan Kelahiran dengan NIB (Fase 4 - Opsional)

Dokumen ini menjelaskan alur sinkronisasi bagi data historis (data lama) yang urutan kelahirannya sudah berubah sebelum sistem **SWAP** diterapkan, sehingga nomor NIB saat ini tidak sinkron dengan urutan database.

## 1. Latar Belakang Masalah
*   Di masa lalu, Admin mengubah nomor urut (`birth_order`) langsung di database atau form edit biasa.
*   Perubahan manual tersebut tidak memicu penghitungan ulang NIB.
*   Hasilnya: Seorang anak ke-2 memiliki NIB yang mengandung digit nomor urut anak ke-4, yang mana ini tidak konsisten secara struktural.

## 2. Alur Kerja (Workflow) Kode Baru
Setelah implementasi Fase 1-3, alurnya adalah sebagai berikut:

1. **Sinkronisasi Kolom**: Memastikan `birth_order` di tabel `persons` sama dengan data di tabel `parent_child`.
2. **Rekonstruksi Root**: NIB Root (Abdul Manan Ali) dibaca sebagai base (08 + 000).
3. **Iterasi Rekursif**: Sistem turun ke anak, cucu, cicit, dst.
4. **Hitung NIB Baru**: NIB = ParentBase + ChildBirthOrder + 000.
5. **Sync Spouse**: NIB Pasangan diupdate agar suffixnya (001, 002, ...) sinkron dengan NIB baru pasangannya.

## 3. Cara Menjalankan Sinkronisasi (Historical Data)

Gunakan perintah Artisan yang baru saja ditambahkan di backend:

### A. Uji Coba Terlebih Dahulu (Dry Run)
Jalankan perintah ini untuk melihat berapa banyak data urutan yang tidak sinkron tanpa mengubah database:
```bash
php artisan bam:rebuild-nibs --dry-run
```

### B. Jalankan Sinkronisasi Penuh
Jalankan ini untuk membangun ulang seluruh pohon NIB berdasarkan urutan kelahiran yang benar saat ini:
```bash
php artisan bam:rebuild-nibs
```

### C. Melalui Dashboard Admin (Alternatif Shared Hosting)
Jika Anda tidak memiliki akses SSH (Shared Hosting), gunakan alat di Dashboard Admin:
1. Masuk ke **Pengaturan** > **Portal**.
2. Gulir ke bawah ke bagian **Pemeliharaan Data (Database Maintenance)**.
3. Klik tombol **Mulai Rebuild**. SIlakan konfirmasi dialog yang muncul.

> [!IMPORTANT]
> Baik melalui terminal maupun UI, perintah ini akan:
> 1. Memastikan kolom `birth_order` di tabel `persons` sama dengan data di tabel relasi `parent_child`.
> 2. Menghapus (mengosongkan) NIB lama yang berantakan.
> 3. Membangun ulang NIB dari tingkat 1 (Root) hingga ke cicit-cicit secara rekursif.

## 4. Mekanisme Proteksi Data Baru
Mulai sekarang, sinkronisasi tidak perlu dijalankan manual lagi setiap ada perubahan, karena:
1. **Approval Laporan**: Sistem akan mendeteksi tabrakan urutan dan melakukan **SWAP** otomatis jika ada konflik.
2. **Edit Manual**: Panel Admin sekarang memiliki alat **Up/Down** untuk menukar urutan yang secara real-time memicu penghitungan ulang NIB untuk orang tersebut dan keturunannya.
