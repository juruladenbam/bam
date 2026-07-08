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

Jadwal saji konsumsi.

**Field:**
| Field | Deskripsi |
|-------|-----------|
| `time_serve` | Waktu penyajian |
| `meal_type` | ringan / berat / snack / minuman |
| `menu_name` | Nama menu |
| `portion_count` | Jumlah porsi |
| `source` | masak_sendiri / catering / nasi_kotak |
| `vendor_name` | Nama vendor (jika catering) |
| `cost_per_portion` | Biaya per porsi |
| `dietary_notes` | Catatan diet khusus |

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
| `GET` | `/events/{event}/catering` | List catering |
| `POST` | `/events/{event}/catering` | Create schedule |
| `PUT` | `/catering/{id}` | Update |
| `DELETE` | `/catering/{id}` | Delete |

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
