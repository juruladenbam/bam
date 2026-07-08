# 📋 PRD — Juruladen

> **Product**: Juruladen (Event Operational & Financial Management)
> **Version**: 1.0
> **Status**: Draft — Finalized
> **Last Updated**: Juli 2026

---

## 1. Overview

### 1.1 What is Juruladen?

**Juruladen** (dari bahasa Jawa: *juru laden* = pelayan/pengelola acara) adalah aplikasi web manajemen operasional dan keuangan acara untuk panitia keluarga besar Bani Abdul Manan (BAM). Aplikasi ini menjadi **pusat komando** bagi panitia dari mulai perencanaan, pelaksanaan, hingga pelaporan keuangan — menggantikan spreadsheet dan catatan WhatsApp yang terpisah-pisah.

### 1.2 Target Users

| Role | Deskripsi | Hak Akses |
|------|-----------|-----------|
| **Superadmin** | Admin BAM yang mengelola semua event + user Juruladen | Full access ke semua event, **satu-satunya yang bisa menambah user baru**, reset password user |
| **Ketua Panitia** | Memimpin event, mendelegasikan tugas, memonitor progress | Full access ke event yang dikelola + user management (reset password). **Data Ketua privat** — tidak terlihat divisi lain |
| **Anggota Divisi** | Anggota dari divisi Acara / Humas / Pendanaan / Merchandise | **CRUD di divisi sendiri**, 👁️ view-only di divisi lain, 🚫 tidak bisa lihat modul Ketua |

> 📖 **Detail access control**: [Auth & User Management → Access Control Matrix](detail/auth-user-management.md#12-access-control-matrix)

### 1.3 Platform

| Aspek | Detail |
|-------|--------|
| **Domain** | `juruladen.bamseribuputu.my.id` |
| **Frontend** | React 19 + TypeScript + Vite + TailwindCSS |
| **Backend** | Laravel 11 (API prefix `/api/juruladen/*`) |
| **Database** | SQLite (dev) / MySQL (prod) |
| **Auth** | Laravel Sanctum (reuse existing user system) |

---

## 2. Problem & Solution

### 2.1 Current Problems

| # | Problem | Impact |
|---|---------|--------|
| 1 | **Tidak ada single source of truth** — data tugas, keuangan, perlengkapan tersebar di spreadsheet berbeda + chat WA | Info simpang-siur, sulit tracking |
| 2 | **Pencatatan keuangan tidak terstruktur** — pemasukan/pengeluaran dicatat manual, tidak ada saldo real-time | Rawan selisih, laporan lambat |
| 3 | **Tracking perlengkapan sulit** — barang dibeli/dipinjam/dikembalikan tidak tercatat rapi | Barang hilang, double-buying |
| 4 | **Koordinasi merchandise manual** — pesanan dicatat di chat WA, multi-varian susah direkap | Pesanan terlewat, salah hitung |
| 5 | **Laporan keuangan disusun ulang manual** — setiap kali diminta, bendahara harus kompilasi dari awal | Waktu habis untuk admin, bukan analisis |
| 6 | **Progress tugas tiap divisi tidak transparan** — ketua tidak tahu status real-time tanpa tanya satu per satu | Micromanagement, bottleneck |

### 2.2 Proposed Solution

Juruladen menyediakan **satu platform terpadu** yang mencakup seluruh siklus hidup event panitia:

```
PERENCANAAN           PELAKSANAAN           PELAPORAN
───────────          ─────────────          ──────────
• Budget plan        • Task tracking        • Cashflow report
• Divisi + anggota   • Inventory checklist  • Budget vs actual
• Timeline tugas     • RSVP peserta         • Merch P/L report
• Rundown acara      • Broadcast WA         • Export PDF/Sheets
• Merchandise plan   • Pencatatan transaksi • Saldo kas
```

---

## 3. Features

### 3.1 Feature Overview

```
┌─────────────────────────────────────────────────────────┐
│                    JURULADEN FEATURES                    │
├────────────┬────────────┬─────────────┬─────────────────┤
│  OPERASIONAL│   HUMAS    │  PENDANAAN  │   MERCHANDISE   │
├────────────┼────────────┼─────────────┼─────────────────┤
│ • Divisi &  │ • Peserta  │ • Budget    │ • Produk &      │
│   Anggota   │   Pool     │   Plan      │   Varian        │
│ • Tugas &   │ • RSVP &   │ • Income    │ • Vendor        │
│   Timeline  │   Presensi │   Tracking  │ • Pesanan       │
│ • Rundown   │ • Design   │ • Expense   │ • Campaign      │
│ • Juknis/   │   Needs    │   Tracking  │ • Rekap &       │
│   Juklak    │ • Broadcast│ • Cashflow  │   Laporan       │
│ • Inventory │   Log      │ • Real-time │                 │
│ • MC        │ • WA Blast │   Balance   │                 │
│ • Konsumsi  │ • Dokumen- │ • Export    │                 │
│             │   tasi     │   PDF & GS  │                 │
├────────────┴────────────┴─────────────┴─────────────────┤
│  DASHBOARD: Progress Overview + Cash Balance per Event   │
│  NOTIFIKASI: Email (task assigned, deadline, transaksi)  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Feature Details by Division

> 📖 **Dokumen detail per divisi** (fitur + UI/UX):
> - [👑 Ketua](detail/ketua/fitur.md) | [UI/UX](detail/ketua/uiux.md)
> - [🔐 Auth & User Mgmt](detail/auth-user-management/fitur.md) | [UI/UX](detail/auth-user-management/uiux.md)
> - [🎤 Acara](detail/acara/fitur.md) | [UI/UX](detail/acara/uiux.md)
> - [📢 Humas](detail/humas/fitur.md) | [UI/UX](detail/humas/uiux.md)
> - [💰 Pendanaan](detail/pendanaan/fitur.md) | [UI/UX](detail/pendanaan/uiux.md)
> - [🛍️ Merchandise](detail/merchandise/fitur.md) | [UI/UX](detail/merchandise/uiux.md)
> - [🔔 Notifikasi](detail/notifikasi/fitur.md) | [UI/UX](detail/notifikasi/uiux.md)

#### A. Ketua — Overview & Delegasi
| Feature | Deskripsi | Priority |
|---------|-----------|----------|
| **Event Selector** | Pilih event aktif yang dikelola | P0 |
| **Progress Dashboard** | Overview % task selesai per divisi + saldo kas + timeline | P0 |
| **Divisi Management** | Atur divisi (Acara/Humas/Pendanaan/Merchandise) + assign anggota | P0 |
| **Task Delegation** | Buat tugas, assign ke anggota, set deadline + priority | P0 |
| **Timeline View** | Lihat semua tugas dalam timeline/kalender per event — semua user bisa memantau timeline kerja semua divisi. Color-coded per divisi, filterable. Data dari `committee_tasks` | P0 |
| **User Management** | 🆕 Superadmin kelola user Juruladen: tambah user (assign person + role), hapus user, reset password. Login berbasis NIB — user tanpa password masuk flow buat password, user dengan password langsung login | P0 |

#### B. Divisi Acara — Operasional
| Feature | Deskripsi | Priority |
|---------|-----------|----------|
| **Rundown Builder** | Drag-and-drop item rundown (waktu, aktivitas, PIC, lokasi) | P0 |
| **Juknis/Juklak Editor** | Rich text editor untuk petunjuk teknis & pelaksanaan | P1 |
| **Inventory Checklist** | Kategori (dekorasi/venue/dokumen/kebersihan/gerabah/konsumsi), nama barang, jumlah, sumber beli/pinjam, status siap/kembali | P0 |
| **MC Assignment** | Assign MC utama, co-MC, qori, tilawah per segmen acara | P1 |
| **Catering Schedule** | Jadwal saji konsumsi, menu, porsi, sumber (masak sendiri/catering/nasi kotak), biaya | P0 |

#### C. Divisi Humas — Peserta & Publikasi
| Feature | Deskripsi | Priority |
|---------|-----------|----------|
| **Participant Pool** | Pool peserta untuk event yang butuh peserta spesifik (contoh: Merajut Cinta). Menggunakan `pool_label` di tabel existing `event_registrations` — tidak perlu tabel baru | P0 |
| **RSVP Tracking** | Status kehadiran per peserta: `hadir`/`tidak_hadir` (kolom `attendance` di `event_registrations`) | P0 |
| **Presensi Hari-H** | Check-in peserta saat acara — set `presence_at` timestamp di `event_registrations` | P1 |
| **Design Needs Tracker** | List kebutuhan desain (platform, konten, deadline, status, assignee) | P1 |
| **Broadcast Log** | Catat pengiriman publikasi ke WA group, IG Reels/Post/Story, FB Group | P0 |
| **WA Blast** | Kirim broadcast WhatsApp langsung via Wablas API (bulk send + delay) | P0 |
| **Documentation Repo** | Simpan foto/video/livestream/after-movie (URL/file) | P1 |
| **Fund Collection** | Tracking iuran/donasi per peserta (terhubung ke Income modul Pendanaan) | P1 |

#### D. Divisi Pendanaan — Keuangan
| Feature | Deskripsi | Priority |
|---------|-----------|----------|
| **Budget Plan** | Rencana anggaran per kategori (income & expense) dengan planned amount | P0 |
| **Budget vs Actual** | Auto-calculated: perbandingan rencana vs realisasi dari transaksi | P0 |
| **Income Entry** | Catat pemasukan: iuran, donasi, sponsor, merchandise, tiket — metode bayar, tanggal, receipt | P0 |
| **Expense Entry** | Catat pengeluaran per kategori — payee, invoice, bukti bayar (upload) | P0 |
| **Cashflow Report** | Tabel + grafik pemasukan/pengeluaran per periode (mingguan/bulanan) | P0 |
| **Cash Balance** | Saldo kas real-time (total income - total expense) | P0 |
| **Budget Line Payment Tracking** | Tracking status bayar per item budget (unpaid/partial/paid) — melihat item mana yang sudah/belum/sebagian dibayarkan. Karena pendapatan dari iuran/donasi/biaya pendaftaran tidak selalu terkumpul semua di awal, alokasi pembayaran/pengeluaran mengikuti uang tersedia → beberapa item dibayar sebagian atau sesuai prioritas | P0 |
| **Export PDF** | Cetak laporan keuangan ke PDF | P1 |
| **Export Google Sheets** | Export laporan keuangan ke Google Sheets (via API) | P1 |

#### E. Divisi Merchandise
| Feature | Deskripsi | Priority |
|---------|-----------|----------|
| **Product Management** | CRUD produk merchandise (nama, deskripsi, gambar, base price, HPP) | P0 |
| **Variant Management** | Multi-varian multi-dimensi dinamis per produk dengan tabel terpisah (`merch_variant_dimensions`, `merch_variant_dimension_values`). Contoh: kaos punya dimensi Panjang Lengan (Pendek/Panjang), Ukuran (XS-XXXXL), Warna, Usia (Dewasa/Anak). Setiap kombinasi dimensi menghasilkan varian dengan harga & HPP sendiri | P0 |
| **Vendor Management** | CRUD data vendor produksi — nama, kontak, alamat | P1 |
| **Vendor Assignment** | Assign vendor ke produk/varian, production cost, MOQ | P1 |
| **Order Management** | CRUD pesanan — buyer, item + varian + qty + person_id (nama orang/person yang dipesankan, karena satu order bisa berisi item untuk beberapa orang berbeda), total, status bayar | P0 |
| **Order Recap — Vendor** | Rekap pesanan untuk disetorkan ke vendor: tabel pivot multi-dimensi yang menampilkan jumlah per kombinasi varian (contoh: baris = Panjang Lengan, kolom = Ukuran, sel = total qty) | P0 |
| **Order Recap — WA Group** | Rekap pesanan untuk disebar ke WA group: teks/list berisi nama pemesan, produk dengan varian yang dipesan, diklasifikasikan berdasarkan qobilah (terintegrasi data silsilah BAM) | P0 |
| **Merch Financial Report** | Laba kotor per produk, laba bersih, total terkumpul, status sudah/belum bayar | P0 |
| **WA Campaign** | Broadcast campaign merchandise via Wablas — crowding pemesanan di WA group | P1 |
| **Auto Income Entry** | Pesanan yg sudah dibayar otomatis tercatat sebagai income Pendanaan | P1 |

---

## 4. User Stories

Format: **Sebagai `<role>`, saya ingin `<action>`, sehingga `<goal>`.**

> **Catatan Auth**: V1 menggunakan model auth sederhana — semua user dengan role `admin` mendapat full access ke semua divisi dalam event yang dikelola. Role granular (ketua/anggota divisi) tidak di-enforce di middleware; perbedaan peran hanya informatif pada UI.

### 4.1 Ketua Panitia

| # | Role | Action | Goal |
|---|------|--------|------|
| US-001 | Superadmin | mendaftarkan person sebagai user Juruladen (input NIB → assign role) | hanya person yang ditunjuk panitia yang bisa akses sistem — tidak ada self-registration |
| US-002 | Ketua/Semua | login dengan NIB saya dan membuat password (jika pertama kali) atau memasukkan password (jika sudah) | saya bisa akses dashboard tanpa harus ingat email — cukup NIB yang sudah saya tahu |
| US-003 | Ketua/Semua | mereset password saya dengan meminta bantuan Superadmin jika lupa | saya tidak kehilangan akses permanen — Superadmin bisa reset dan saya bikin password baru |
| US-004 | Ketua | melihat timeline kalender semua tugas dari seluruh divisi dalam satu layar | saya bisa memantau beban kerja, deadline minggu ini, dan bottleneck tanpa harus cek per divisi |
| US-005 | Ketua | melihat dashboard progress semua divisi dalam satu layar | saya tahu event mana yang on-track atau perlu intervensi tanpa harus tanya satu per satu |
| US-002 | Ketua | membuat divisi dan menugaskan anggota ke masing-masing divisi | struktur panitia langsung terbentuk tanpa perlu spreadsheet terpisah |
| US-003 | Ketua | melihat timeline kalender semua tugas dari seluruh divisi dalam satu layar | saya bisa memantau beban kerja, deadline minggu ini, dan bottleneck tanpa harus cek per divisi |
| US-004 | Ketua | membuat tugas dengan deadline dan assignee | setiap anggota tahu apa yang harus dikerjakan dan kapan batas waktunya |
| US-005 | Ketua | melihat saldo kas real-time per event | saya tahu posisi keuangan terkini tanpa harus minta rekap dari bendahara |
| US-006 | Ketua | berpindah antar event yang saya kelola | saya bisa memonitor beberapa event sekaligus tanpa login ulang |
| US-007 | Ketua | menerima notifikasi email saat tugas selesai atau mendekati deadline | saya tidak ketinggalan update penting |

### 4.2 Divisi Acara

| # | Role | Action | Goal |
|---|------|--------|------|
| US-010 | Anggota Acara | membuat rundown acara dengan drag-and-drop item | penyusunan jadwal acara cepat dan mudah diubah |
| US-011 | Anggota Acara | mencatat semua kebutuhan perlengkapan dengan kategori, jumlah, dan sumber | tidak ada barang yang terlupa atau double-buying |
| US-012 | Anggota Acara | menandai status barang: siap/belum, dan tracking pengembalian barang pinjaman | barang pinjaman tidak hilang dan bisa dikembalikan tepat waktu |
| US-013 | Anggota Acara | membuat jadwal konsumsi (waktu, menu, porsi, sumber) | divisi konsumsi dan bendahara bisa sinkron soal biaya dan logistik |
| US-014 | Anggota Acara | menugaskan MC untuk tiap segmen acara | pembawa acara jelas perannya tanpa miskomunikasi |

### 4.3 Divisi Humas

| # | Role | Action | Goal |
|---|------|--------|------|
| US-020 | Anggota Humas | menambah peserta ke event dan mengelompokkannya dengan pool_label | saya bisa mengkurasi daftar peserta spesifik (misal: Merajut Cinta) tanpa perlu tabel terpisah |
| US-021 | Anggota Humas | menandai RSVP peserta (hadir/tidak_hadir) dan mencatat presensi check-in hari-H | data kehadiran tercatat di satu tempat yang sama |
| US-022 | Anggota Humas | mencatat kebutuhan desain dengan platform tujuan dan deadline | desainer tahu apa yang harus dibuat dan kapan |
| US-023 | Anggota Humas | mengirim broadcast WhatsApp ke semua nomor tujuan via Wablas langsung dari dashboard | tidak perlu kirim satu per satu manual di HP |
| US-024 | Anggota Humas | mencatat log setiap pengiriman publikasi (WA, IG, FB) beserta statusnya | saya tahu publikasi mana yang sudah dan belum dikirim |
| US-025 | Anggota Humas | menyimpan link dan file dokumentasi acara (foto, video, after-movie) | semua dokumentasi tersimpan di satu tempat |

### 4.4 Divisi Pendanaan

| # | Role | Action | Goal |
|---|------|--------|------|
| US-030 | Bendahara | membuat rencana anggaran per kategori (pemasukan & pengeluaran) | ada baseline yang jelas untuk mengukur realisasi keuangan |
| US-031 | Bendahara | mencatat setiap pemasukan (iuran, donasi, sponsor, merchandise) dengan sumber, jumlah, dan metode bayar | semua uang masuk tercatat dan bisa diaudit |
| US-032 | Bendahara | mencatat setiap pengeluaran dengan kategori, penerima, bukti bayar, dan invoice | semua uang keluar tercatat dan ada buktinya |
| US-033 | Bendahara | melihat laporan cashflow otomatis (grafik + tabel) per periode | saya tidak perlu kompilasi manual lagi |
| US-034 | Bendahara | melihat perbandingan budget vs actual secara real-time | saya tahu penyimpangan anggaran sejak dini |
| US-035 | Bendahara | mengekspor laporan keuangan ke PDF dan Google Sheets | saya bisa share laporan ke ketua atau anggota dengan format profesional |
| US-036 | Bendahara | menerima notifikasi email setiap kali ada transaksi baru dicatat | saya bisa memonitor pergerakan kas meski tidak login |
| US-037 | Bendahara | melihat status bayar per item budget (unpaid/partial/paid) dan berapa yang sudah vs belum dibayar | saya tahu item pengeluaran mana yang masih perlu dicairkan dan bisa memprioritaskan pembayaran sesuai uang yang tersedia |

### 4.5 Divisi Merchandise

| # | Role | Action | Goal |
|---|------|--------|------|
| US-040 | Anggota Merch | membuat produk merchandise dengan multi-varian (ukuran, warna, dll) | varian produk fleksibel sesuai kebutuhan |
| US-041 | Anggota Merch | mencatat HPP dan harga jual per varian | laba bisa dihitung otomatis |
| US-042 | Anggota Merch | mencatat pesanan anggota (siapa, produk apa, varian apa, jumlah, atas nama siapa/person_id) | satu order bisa mencatatkan pesanan untuk beberapa orang berbeda (misal kepala keluarga memesankan untuk seluruh anggota keluarga) |
| US-043 | Anggota Merch | melihat rekap pesanan format vendor: tabel pivot multi-dimensi (baris × kolom = dimensi varian, sel = total qty) | saya bisa langsung memberikan data ke vendor tanpa perlu rekap manual di spreadsheet |
| US-044 | Anggota Merch | melihat rekap pesanan format WA group: list nama pemesan + produk + varian, dikelompokkan per qobilah | saya bisa langsung share ke WA group dengan format yang rapi dan terstruktur |
| US-045 | Anggota Merch | melihat laporan keuangan merchandise (laba kotor, laba bersih, status bayar) | saya bisa mempertanggungjawabkan keuangan divisi ke bendahara |
| US-046 | Anggota Merch | mengirim campaign broadcast WA tentang merchandise yang bisa dipesan | keluarga tahu produk apa yang tersedia dan bisa langsung pesan |

---

## 5. Non-Functional Requirements

| # | Requirement | Detail |
|---|-------------|--------|
| NFR-01 | **Responsive Design** | Harus mobile-friendly (panitia sering akses via HP) |
| NFR-02 | **Real-time Balance** | Saldo kas harus computed real-time dari transaksi (tidak perlu rebuild/rekalkulasi) |
| NFR-03 | **Offline-able?** | Tidak perlu — panitia selalu online saat bekerja |
| NFR-04 | **Data Retention** | Data event disimpan permanen (arsip historis) |
| NFR-05 | **Security** | Hanya user dengan role admin/panitia yang bisa akses Juruladen |
| NFR-06 | **Multi-Event** | Bisa menangani banyak event aktif bersamaan tanpa conflict data |
| NFR-07 | **Email Delivery** | Notifikasi email harus reliable (gunakan queue) |
| NFR-08 | **WA Blast Safety** | Delay configurable antar pesan WA untuk hindari banned |

---

## 6. Out of Scope (V1)

- Aplikasi mobile native (React Native / Flutter) — cukup mobile web responsive
- Integrasi payment gateway (Midtrans/Xendit) — pembayaran dicatat manual
- **E-commerce merchandise** — storefront publik, keranjang belanja, checkout, payment gateway terintegrasi, auth berbasis NIB untuk member keluarga. Fitur ini terlalu besar untuk V1 dan akan dipecah sebagai modul terpisah di V2 (lihat `future/ecommerce-merch.md`)
- Chatbot WhatsApp dua arah — hanya one-way broadcast
- Multi-tenant (beda keluarga) — hanya untuk BAM
- Approval workflow berjenjang — tidak diperlukan

---

## 7. References

| Topik | Referensi | URL |
|-------|-----------|-----|
| Ticketing + Merchandise OSS modern | Hi.Events (Laravel+React) | [github.com/HiEventsDev/Hi.Events](https://github.com/HiEventsDev/Hi.Events) |
| Ticketing OSS mature | Attendize (Laravel) | [github.com/Attendize/Attendize](https://github.com/Attendize/Attendize) |
| Event server role system | Open Event Server (FOSSASIA) | [github.com/fossasia/open-event-server](https://github.com/fossasia/open-event-server) |
| Committee/CFP model | FOSS United (Frappe) | [github.com/fossunited/fossunited](https://github.com/fossunited/fossunited) |
| WhatsApp Gateway Indonesia | Wablas | [wablas.com](https://wablas.com) |
| Wablas API Docs (PHP examples) | API v2 | [wablas.com/documentation/api](https://wablas.com/documentation/api) |
| Meta Cloud API (future migration) | WhatsApp Cloud API | [developers.facebook.com/docs/whatsapp/cloud-api](https://developers.facebook.com/docs/whatsapp/cloud-api) |
| Google Sheets API | Sheets API v4 | [developers.google.com/sheets/api](https://developers.google.com/sheets/api) |

---

*Dokumen PRD — siap masuk ke tahap desain & implementasi.*
