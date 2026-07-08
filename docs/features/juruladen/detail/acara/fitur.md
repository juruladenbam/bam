# 🎤 Divisi Acara — Detail Fitur

> **Status**: Draft | **PRD**: [← Kembali ke PRD](../../prd.md)
> **ERD**: [Lihat ERD §2.3-2.6](../../erd.md#23-rundown--guidelines)
> **API**: [Lihat API Contract §2.4-2.8](../../api-contract.md#24-rundown)

---

## 1. Overview

Divisi Acara mengelola seluruh operasional acara: penyusunan rundown, checklist perlengkapan, penugasan MC, dan jadwal konsumsi.

### Role

| Role | Akses |
|------|-------|
| **Anggota Acara** | CRUD penuh: rundown, inventory, MC, catering |
| **Ketua** | View-only: monitor progress |

---

## 2. Fitur

### 2.1 Rundown Builder

Penyusunan jadwal acara dengan drag-and-drop.

**Struktur:**
- `rundowns` — section header (contoh: "Pembukaan", "Acara Inti", "Penutupan")
- `rundown_items` — item per section dengan: `time_start`, `time_end`, `activity_title`, `description`, `pic_person_id`, `location_venue`, `sort_order`

**Fitur:**
- Drag-and-drop reorder item
- Auto-sort berdasarkan waktu
- PIC assignment (link ke person BAM)
- Export rundown ke PDF

### 2.2 Juknis/Juklak Editor

Rich text editor untuk petunjuk teknis & pelaksanaan.

- `event_guidelines` tabel — satu row per type (`juknis` / `juklak`)
- Content disimpan sebagai HTML (rich text)
- Bisa di-print langsung

### 2.3 Inventory Checklist

Checklist perlengkapan acara.

**Kategori default:** dekorasi, venue, dokumen, kebersihan, gerabah, konsumsi

**Field per item:**
| Field | Deskripsi |
|-------|-----------|
| `category_id` | Kategori perlengkapan |
| `name` | Nama barang |
| `quantity_needed` | Jumlah dibutuhkan |
| `unit` | Satuan (unit/pcs/set/box) |
| `source_type` | beli / sewa / pinjam / punya sendiri |
| `source_detail` | Toko/vendor/pemilik |
| `cost_per_unit` | Biaya per unit |
| `assigned_to_person_id` | PIC barang |
| `acquisition_status` | pending / delivered / returned |
| `return_status` | Untuk barang pinjaman: pending / returned |

### 2.4 MC Assignment

Penugasan pembawa acara per segmen.

**Role MC:** `mc_utama`, `co_mc`, `qori`, `tilawah`

**Field:** `person_id`, `role`, `segment_description`, `notes`

### 2.5 Catering Schedule

Jadwal saji konsumsi. Satu jadwal bisa memiliki banyak menu (makanan + minuman).

**`catering_schedules`:**
| Field | Deskripsi |
|-------|-----------|
| `time_serve` | Waktu penyajian |
| `rundown_item_id` | Link ke item rundown (nullable) |
| `pic_type` | person / other — tipe penanggung jawab |
| `pic_name` | Nama penanggung jawab stand |

**`catering_menu_items`:**
| Field | Deskripsi |
|-------|-----------|
| `menu_category` | makanan_berat / makanan_ringan / minuman_es / minuman_hangat / snack |
| `menu_name` | Nama menu |
| `portion_count` | Jumlah |
| `unit` | Satuan (default: porsi) |
| `cost_per_portion` | Biaya per porsi (null jika subsidi) |
| `is_subsidi` | Ditanggung pihak lain? |
| `subsidi_source_type` | person / qobilah / other |
| `subsidi_source_name` | Nama penyubsidi |
| `serving_style` | sendiri2 / bareng2 |
| `equipment_needs` | JSON: [{name, quantity, unit, usage}] — auto-sync ke inventory |

**Fitur:**
- Multi-menu per jadwal (makanan + minuman + snack)
- Subsidi tracking (qobilah/person/other)
- PIC per jadwal (search person atau text bebas)
- Equipment needs → auto-create di inventory "Konsumsi"
- Usage type: sekali pakai (akumulasi qty) / pakai ulang (max qty)
- Autocomplete menu name + auto-fill dari data existing
- Tampilan: expand/collapse, samarkan nominal

---

## 3. API Endpoints

### Rundown
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events/{event}/rundowns` | List rundowns |
| `POST` | `/events/{event}/rundowns` | Create rundown |
| `POST` | `/rundowns/{rundown}/items` | Add item |
| `PUT` | `/rundowns/{rundown}/items/{item}` | Update item |
| `DELETE` | `/rundowns/{rundown}/items/{item}` | Delete item |

### Guidelines
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events/{event}/guidelines` | Get guidelines |
| `PUT` | `/events/{event}/guidelines/{type}` | Update guideline |

### Inventory
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events/{event}/inventory` | List inventory |
| `POST` | `/events/{event}/inventory` | Create item |
| `PUT` | `/inventory/{item}` | Update item |
| `DELETE` | `/inventory/{item}` | Delete item |
| `PATCH` | `/inventory/{item}/status` | Update status |

### MC
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events/{event}/mc-assignments` | List MC |
| `POST` | `/events/{event}/mc-assignments` | Assign MC |
| `PUT` | `/mc-assignments/{id}` | Update |
| `DELETE` | `/mc-assignments/{id}` | Delete |

### Catering
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/events/{event}/catering` | List jadwal + menu items |
| `POST` | `/events/{event}/catering` | Create jadwal (+ menu_items array) |
| `PUT` | `/catering/{id}` | Update jadwal |
| `DELETE` | `/catering/{id}` | Delete jadwal |
| `POST` | `/catering/{id}/menu-items` | Tambah menu item |
| `PUT` | `/catering-menu-items/{id}` | Update menu item |
| `DELETE` | `/catering-menu-items/{id}` | Delete menu item |

---

## 4. UI Components

| Komponen | Fungsi |
|----------|--------|
| `RundownBuilder` | Drag-drop editor rundown |
| `RichtextEditor` | Editor juknis/juklak |
| `InventoryTable` | Tabel checklist dengan status |
| `MCAssignmentCard` | Card penugasan MC |
| `CateringScheduleTable` | Tabel jadwal konsumsi |

---

## 5. Halaman

| Halaman | Route |
|---------|-------|
| **Rundown** | `/events/{slug}/acara/rundown` |
| **Juknis/Juklak** | `/events/{slug}/acara/juknis` |
| **Perlengkapan** | `/events/{slug}/acara/perlengkapan` |
| **MC** | `/events/{slug}/acara/mc` |
| **Konsumsi** | `/events/{slug}/acara/konsumsi` |

---

## 6. Acceptance Criteria

- [ ] Rundown bisa di-drag-reorder item
- [ ] Inventory checklist bisa difilter per kategori
- [ ] Item pinjaman punya return tracking
- [ ] MC assignment tersimpan per segmen acara
- [ ] Jadwal konsumsi dengan kalkulasi biaya (qty × cost_per_portion)

---

## 7. Related Docs

- [← PRD (Overview)](../../prd.md)
- [🗄️ ERD §2.3-2.6](../../erd.md)
- [📡 API §2.4-2.8](../../api-contract.md)
- [🚀 Implementasi Fase 2](../../implementasi.md#fase-2--operasional-acara)
