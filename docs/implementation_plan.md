# Portal Digital Keluarga Bani Abdul Manan (BAM)

System Architecture & Detailed Master Plan

---

## 1. Arsitektur Domain & Platform

Sistem ini menggunakan **3 Frontend terpisah** yang berbagi **1 Backend API**.

| Domain | Platform | Target User | Fungsi Utama |
|--------|----------|-------------|--------------|
| `bamseribuputu.my.id` | **Public Web** | 🌐 Guest / Umum | Informasi umum, Landing page, Login gate |
| `portal.bamseribuputu.my.id` | **Member Portal** | 👨‍👩‍👧‍👦 Keluarga | Silsilah lengkap, interaksi, pendaftaran acara |
| `admin.bamseribuputu.my.id` | **Admin Panel** | 🔧 Pengurus | Manajemen data, verifikasi, konten CMS |
| `api.bamseribuputu.my.id` | **Backend API** | (System) | Pusat data & logika bisnis (Laravel) |
| `majmu.bamseribuputu.my.id` | **Kitab Digital** | Jamaah | E-book doa & wirid (Linked Project) |

---

## 2. Tech Stack (Monorepo)

- **Backend**: Laravel 10+ (MySQL)
- **Frontend**: React 18 + TypeScript + Vite (Public, Portal, Admin)
- **Shared Lib**: UI Components & Types

---

## 2.1 Frontend Architecture (Feature-Based)

Menggunakan arsitektur **feature-based** yang memisahkan `features/` (logic & components) dan `pages/` (route entry points).

### Struktur Folder per Frontend

```
public-web/               # atau portal/, admin/
├── src/
│   ├── features/         # Domain logic per fitur
│   │   ├── auth/
│   │   │   ├── api/               # API calls (login, register)
│   │   │   │   └── authApi.ts
│   │   │   ├── components/        # UI components khusus auth
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── hooks/             # Custom hooks
│   │   │   │   └── useAuth.ts
│   │   │   ├── types/             # TypeScript types
│   │   │   │   └── index.ts
│   │   │   └── index.ts           # Public exports
│   │   │
│   │   ├── silsilah/              # (Portal only)
│   │   │   ├── api/
│   │   │   │   ├── personApi.ts
│   │   │   │   ├── marriageApi.ts
│   │   │   │   └── relationshipApi.ts
│   │   │   ├── components/
│   │   │   │   ├── FamilyTree.tsx
│   │   │   │   ├── PersonCard.tsx
│   │   │   │   ├── GhostNodeBadge.tsx
│   │   │   │   └── RelationshipBadge.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── usePersons.ts
│   │   │   │   └── useRelationship.ts
│   │   │   └── types/
│   │   │
│   │   ├── events/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   │
│   │   └── gallery/
│   │
│   ├── pages/            # Route entry points (minimal logic)
│   │   ├── HomePage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── silsilah/
│   │   │   ├── SilsilahPage.tsx
│   │   │   └── PersonDetailPage.tsx
│   │   └── events/
│   │       ├── EventListPage.tsx
│   │       └── EventDetailPage.tsx
│   │
│   ├── components/       # Shared/global components
│   │   ├── ui/           # Basic UI (Button, Input, Modal)
│   │   └── layout/       # Layout components
│   │       ├── Layout.tsx
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/              # Utilities & configs
│   │   ├── api.ts        # Axios instance
│   │   └── utils.ts
│   │
│   ├── hooks/            # Global hooks
│   │   └── useAuth.ts
│   │
│   ├── App.tsx           # Router setup
│   ├── main.tsx          # Entry point
│   └── index.css         # Tailwind imports
│
├── public/
├── vite.config.ts
├── tsconfig.app.json     # Path alias: @/* → src/*
└── package.json
```

### Prinsip Feature-Based Architecture

| Prinsip | Penjelasan |
|---------|------------|
| **Colocation** | Semua file terkait 1 fitur ada di 1 folder (`features/silsilah/`) |
| **Pages = Entry Only** | File di `pages/` hanya import dari `features/` dan render layout |
| **Feature Isolation** | Fitur tidak saling import langsung, gunakan `shared/` jika perlu |
| **Barrel Exports** | Setiap feature punya `index.ts` untuk public exports |

### Contoh Page vs Feature

```tsx
// pages/silsilah/SilsilahPage.tsx (MINIMAL)
import { FamilyTree, usePersons } from '@/features/silsilah'

export default function SilsilahPage() {
  const { data: persons } = usePersons()
  return <FamilyTree data={persons} />
}
```

```tsx
// features/silsilah/index.ts (BARREL EXPORT)
export { FamilyTree } from './components/FamilyTree'
export { PersonCard } from './components/PersonCard'
export { usePersons } from './hooks/usePersons'
export { useRelationship } from './hooks/useRelationship'
```

---


## 3. Rangkuman Detail Fitur (Master Feature List)

### A. Modul Silsilah (Genealogy) 🌳
*Core feature dengan logika Graph untuk menangani pernikahan antar keluarga (Endogamy).*

| Fitur | Deskripsi Detail |
|-------|------------------|
| **Graph Database** | Struktur data `persons` dan `marriages` terpisah. Mendukung *cyclic graph* (anak ke-2 menikah dengan anak ke-6) tanpa error loop. |
| **Ghost Node** | Visualisasi pernikahan sepupu dengan duplikasi visual + badge 🔗. Klik badge akan *jump* ke cabang pasangan asli. Mencegah garis silang yang ruwet. |
| **Hierarchical View** | 3 Level Zoom: Global (11 Cabang) → Branch (Data 1 Cabang) → Person (Detail Individu). |
| **Dynamic Relationship** | Algoritma **LCA (Lowest Common Ancestor)** menghitung otomatis hubungan user login vs profil yang dilihat. |
| **Javanese Titles** | Logika pintar menentukan sebutan: **Pakde/Bude** (jika target > ortu) vs **Om/Tante** (jika target < ortu) berdasarkan tanggal lahir dan silsilah. |
| **Jalur Hubungan** | Penjelasan teks otomatis: *"Ahmad adalah anak H. Budi, sedangkan Anda cucu H. Siti"*. |
| **Dual Status** | Menangani status ganda: misal "Sepupu (Juga Ipar)". |
| **Internal Search** | Form input pasangan dengan fitur **"Cari Kerabat"** (Autocomplete) untuk menautkan ID yang sudah ada, bukan buat baru. |

### B. Modul Acara (Events) 📅
*Manajemen rangkaian acara tahunan keluarga.*

| Acara | Fitur Spesifik |
|-------|----------------|
| **Festival BAM** | • **Timeline Jadwal**: Visualisasi rundown 3 hari.<br>• **Peta Ziarah**: Lokasi 4 makam leluhur (Google Maps).<br>• **BAM Cilik**: Galeri & materi khusus anak. |
| **Halal Bihalal** | • **Giliran Tuan Rumah**: Tracking otomatis urutan cabang/cucu tiap tahun.<br>• **Host Profile**: Detail lokasi & kontak tuan rumah tahun ini.<br>• **Arsip Notulensi**: Download PDF hasil rapat tahunan. |
| **Merajut Cinta** | • **Pendaftaran**: Form registrasi camp (pilih kamar/kaos).<br>• **Galeri Kenangan**: Foto seru outbound tahun lalu.<br>• **Ide Games**: Dinding interaktif untuk usul games. |

### C. Modul General & Arsip 🏛️

| Fitur | Deskripsi |
|-------|-----------|
| **Tentang BAM** | Biografi Kakek Buyut, Sejarah Musholla, Profil 11 Pilar Keluarga. |
| **Galeri Media** | Filter foto/video berdasarkan Tahun & Event. Integrasi lightbox. |
| **Kabar Keluarga** | Berita lelayu, kelahiran, pernikahan, prestasi. Kategori publik vs privat. |

### D. Admin Dashboard (`admin.`) 🔧

| Fitur | Deskripsi |
|-------|-----------|
| **Approval Data** | Verifikasi laporan data baru (kelahiran/pernikahan) dari member. |
| **CRUD Silsilah** | Editor silsilah visual & form data kompleks. |
| **Manajemen Acara** | Set jadwal, lokasi, upload materi, export data pendaftar. |
| **User Roles** | Manage status admin/koordinator cabang. |

---

## 4. Complete Database Schema (Laravel Migration Ready)

### A. Auth & System Users

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'admin', 'member') DEFAULT 'member',
    person_id BIGINT UNSIGNED NULL, -- Link ke data silsilah
    email_verified_at TIMESTAMP NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

### B. Silsilah Core (Graph Structure)

```sql
-- branches (11 Anak)
CREATE TABLE branches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    `order` INT NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- persons (Nodes)
CREATE TABLE persons (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) NULL,
    gender ENUM('male', 'female') NOT NULL,
    birth_date DATE NULL,
    birth_place VARCHAR(255) NULL,
    death_date DATE NULL,
    is_alive BOOLEAN DEFAULT TRUE,
    photo_url VARCHAR(500) NULL,
    phone VARCHAR(20) NULL,
    address TEXT NULL,
    occupation VARCHAR(255) NULL,
    bio TEXT NULL,
    generation INT NOT NULL,
    branch_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- marriages (Graph / Endogamy Handler)
CREATE TABLE marriages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    husband_id BIGINT UNSIGNED NOT NULL,
    wife_id BIGINT UNSIGNED NOT NULL,
    marriage_date DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    divorce_date DATE NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (husband_id) REFERENCES persons(id),
    FOREIGN KEY (wife_id) REFERENCES persons(id)
);

-- parent_child (Vertical Edges)
CREATE TABLE parent_child (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    marriage_id BIGINT UNSIGNED NOT NULL,
    child_id BIGINT UNSIGNED NOT NULL,
    birth_order INT DEFAULT 1,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (marriage_id) REFERENCES marriages(id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES persons(id) ON DELETE CASCADE
);

-- relationship_cache
CREATE TABLE relationship_cache (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    person_a_id BIGINT UNSIGNED NOT NULL,
    person_b_id BIGINT UNSIGNED NOT NULL,
    relationship_label VARCHAR(100) NOT NULL,
    lca_id BIGINT UNSIGNED NULL,
    path_text TEXT NULL,
    created_at TIMESTAMP NULL,
    FOREIGN KEY (person_a_id) REFERENCES persons(id),
    FOREIGN KEY (person_b_id) REFERENCES persons(id)
);
```

### C. Event Management

```sql
CREATE TABLE events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('festival', 'halal_bihalal', 'youth_camp', 'other') NOT NULL,
    year INT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    description TEXT NULL,
    location_name VARCHAR(255) NULL,
    location_maps_url VARCHAR(500) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE TABLE event_schedules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT UNSIGNED NOT NULL,
    day_sequence INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NULL,
    description TEXT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE host_rotations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT UNSIGNED NOT NULL,
    host_person_id BIGINT UNSIGNED NOT NULL,
    year INT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (host_person_id) REFERENCES persons(id)
);

CREATE TABLE event_registrations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    custom_data JSON NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### D. Content & Media

```sql
CREATE TABLE media_galleries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT UNSIGNED NULL,
    uploader_id BIGINT UNSIGNED NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    type ENUM('image', 'video') NOT NULL,
    caption TEXT NULL,
    year INT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (uploader_id) REFERENCES users(id)
);

CREATE TABLE news_posts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    author_id BIGINT UNSIGNED NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    category ENUM('kelahiran', 'lelayu', 'prestasi', 'umum') NOT NULL,
    is_public BOOLEAN DEFAULT True,
    published_at DATETIME NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (author_id) REFERENCES users(id)
);
```

### E. Crowdsourcing

```sql
CREATE TABLE data_submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type ENUM('new_person', 'update_person', 'death_report', 'marriage_report') NOT NULL,
    payload JSON NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_note TEXT NULL,
    reviewed_at TIMESTAMP NULL,
    reviewed_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
```

---

## 5. Timeline

| Fase | Durasi | Fokus |
|------|--------|-------|
| **1** | 3 Minggu | Setup Backend + 3 Frontend, Auth, Domain Config |
| **2** | 5 Minggu | Silsilah Logic (Graph Migration), React Flow, LCA Algo |
| **3** | 3 Minggu | Event Features (Timeline, Maps, Regis) |
| **4** | 2 Minggu | Media & Polish |
| **5** | 3 Minggu | Admin Dashboard & Deploy |
