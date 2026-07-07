# 💰 Vendor Pricing Estimate — Juruladen

> **Estimasi biaya jika proyek Juruladen dikerjakan oleh vendor/agency profesional di Indonesia (2026).**
> **Referensi**: Riset pasar software house Indonesia + tren "vibe coding" (AI-assisted development).

---

## 1. Ringkasan Cepat

| Skenario | Estimasi Biaya | Timeline | Tim |
|----------|---------------|----------|-----|
| **Hemat** — Agency kecil Bandung/Jogja + vibe coding | **Rp 55 – 75 jt** | 2 – 2.5 bulan | 3 orang |
| **Menengah** — Agency menengah Jakarta | **Rp 85 – 120 jt** | 2.5 – 3.5 bulan | 4 orang |
| **Premium** — Agency established / software house besar | **Rp 150 – 200 jt** | 3 – 4.5 bulan | 5–6 orang |
| **Dedicated Team** — 2 dev + 0.5 PM, bulanan | **Rp 28 – 45 jt/bln** × ~3 bulan | ~3 bulan | 2.5 FTE |

---

## 2. Dasar Perhitungan

### 2.1 Estimasi Internal (Raw Coding)

Berdasarkan implementasi breakdown Fase 1–6: **~130 jam** untuk 1 developer full-stack.

### 2.2 "Vibe Coding" Adjustment

Dengan AI-assisted development (Cursor, Copilot, Claude, GPT-4) di 2026:

| Aktivitas | Tanpa AI | Dengan AI | Penghematan |
|-----------|----------|-----------|-------------|
| Boilerplate (model, migration, basic CRUD) | 30 jam | **8 jam** | -73% |
| API endpoint standar | 25 jam | **12 jam** | -52% |
| UI component + page basic | 35 jam | **15 jam** | -57% |
| Business logic (service layer) | 20 jam | **15 jam** | -25% |
| Integrasi eksternal (Wablas, Sheets) | 10 jam | **8 jam** | -20% |
| Testing, debugging, polish | 10 jam | **8 jam** | -20% |
| **Total** | **130 jam** | **~66 jam** | **-49%** |

> ⚠️ "Vibe coding" hanya menghemat coding — **tidak menghemat**: meeting, requirement clarification, UAT, deployment, dokumentasi.

### 2.3 Vendor Multiplier

Agency menambahkan overhead:

| Item | Tambahan |
|------|----------|
| Discovery & requirement alignment | +10–15% |
| Sprint planning, daily standup, retrospective | +10–15% |
| UI/UX design iteration (2–3 round) | +15–20% |
| QA & testing (manual + basic automation) | +10–15% |
| Client revision buffer (2 round per feature) | +15–25% |
| Deployment, UAT, go-live support | +10% |
| **Total multiplier** | **+70–100%** |

### 2.4 Estimasi Billed Hours

```
Raw coding (dengan AI):     ~66 jam
× Vendor multiplier 1.7×:  ~112 jam  (hemat)
× Vendor multiplier 2.0×:  ~132 jam  (menengah)
× Vendor multiplier 2.5×:  ~165 jam  (premium)
```

---

## 3. Rate Card (Indonesia, 2026)

| Role | Junior | Mid | Senior |
|------|--------|-----|--------|
| Full-Stack Developer | Rp 150 – 200K/jam | Rp 250 – 350K/jam | Rp 400 – 600K/jam |
| UI/UX Designer | — | Rp 200 – 350K/jam | Rp 400 – 500K/jam |
| Project Manager | — | Rp 250 – 400K/jam | — |
| QA Tester | Rp 120 – 180K/jam | Rp 200 – 300K/jam | — |

> Jakarta +20–40% premium dibanding Bandung/Jogja.
> Agency yang jual "vibe coding" kadang kasih diskon 15–20% untuk fitur standar, tapi charge premium untuk arsitektur/integrasi kompleks.

---

## 4. Detail Per Skenario

### 4.1 Skenario Hemat (Agency Kecil, Bandung/Jogja)

**Cocok jika**: Budget terbatas, spec sudah jelas (dokumen PRD/ERD/API sudah lengkap), kamu bisa jadi product owner aktif.

| Role | Alokasi | Rate | Total |
|------|---------|------|-------|
| 1 Senior Full-Stack (tech lead) | 100 jam | Rp 350K | Rp 35.000.000 |
| 1 Mid Full-Stack | 80 jam | Rp 200K | Rp 16.000.000 |
| UI/UX Designer (freelance) | 25 jam | Rp 250K | Rp 6.250.000 |
| PM (part-time, remote) | Sudah include di rate senior | — | — |
| QA (manual, oleh mid dev) | Sudah include | — | — |
| **Total** | ~112 jam billed | | **Rp 57.250.000** |
| **Fixed price (dengan buffer 15%)** | | | **~Rp 55 – 75 jt** |

**Timeline**: 2 – 2.5 bulan (2 dev paralel)
**Tim**: 3 orang (1 senior FS, 1 mid FS, 1 freelance designer)
**Risiko**: QA manual oleh developer sendiri; mungkin ada bug lolos.

---

### 4.2 Skenario Menengah (Agency Jakarta Menengah)

**Cocok jika**: Ingin kualitas solid, punya QA sendiri, spec clear, timeline moderat.

| Role | Alokasi | Rate | Total |
|------|---------|------|-------|
| 1 Senior Full-Stack (tech lead) | 110 jam | Rp 500K | Rp 55.000.000 |
| 1 Mid Full-Stack | 90 jam | Rp 300K | Rp 27.000.000 |
| UI/UX Designer | 30 jam | Rp 350K | Rp 10.500.000 |
| PM (25% alokasi) | 20 jam | Rp 400K | Rp 8.000.000 |
| QA (part-time) | 20 jam | Rp 250K | Rp 5.000.000 |
| **Total** | ~132 jam billed | | **Rp 105.500.000** |
| **Fixed price (dengan buffer 15%)** | | | **~Rp 85 – 120 jt** |

**Timeline**: 2.5 – 3.5 bulan
**Tim**: 4–5 orang
**Risiko**: Rendah — QA terpisah, PM handle komunikasi.

---

### 4.3 Skenario Premium (Software House Besar / Enterprise)

**Cocok jika**: Butuh SLA, dedicated support, DevOps, security audit, dokumentasi formal.

| Role | Alokasi | Rate | Total |
|------|---------|------|-------|
| 1 Senior Full-Stack / Architect | 120 jam | Rp 600K | Rp 72.000.000 |
| 2 Mid Full-Stack | 100 jam × 2 | Rp 350K | Rp 70.000.000 |
| UI/UX Designer | 40 jam | Rp 500K | Rp 20.000.000 |
| PM (50% alokasi) | 30 jam | Rp 450K | Rp 13.500.000 |
| QA dedicated | 40 jam | Rp 300K | Rp 12.000.000 |
| DevOps (setup CI/CD, deploy) | 15 jam | Rp 500K | Rp 7.500.000 |
| **Total** | ~165 jam billed | | **Rp 195.000.000** |
| **Fixed price (dengan buffer 20%)** | | | **~Rp 150 – 200 jt** |

**Timeline**: 3.5 – 4.5 bulan
**Tim**: 5–6 orang
**Risiko**: Sangat rendah — enterprise-grade process.

---

### 4.4 Dedicated Team (Retainer Bulanan)

**Cocok jika**: Scope bisa berubah, kamu ingin kontrol penuh atas prioritas sprint.

| Role | FTE | Rate/bulan |
|------|-----|-----------|
| 1 Senior Full-Stack | 1.0 | Rp 40 – 55 jt |
| 1 Mid Full-Stack | 1.0 | Rp 25 – 35 jt |
| PM (shared) | 0.5 | Rp 12 – 18 jt |
| **Total per bulan** | **2.5 FTE** | **Rp 28 – 45 jt/bln** |

**Timeline**: ~3 bulan × Rp 35 jt (mid) = **Rp 84 – 135 jt total**
**Tim**: 2 dev + PM part-time
**Kelebihan**: Fleksibel — kamu yang atur sprint backlog. Spec kurang lengkap pun bisa jalan.
**Kekurangan**: Tidak ada jaminan fixed price; biaya bisa membesar jika scope creep.

---

## 5. Vibe Coding Impact — Visual Comparison

```
┌────────────────────────────────────────────────────────────┐
│  TANPA AI (2024)              DENGAN AI / VIBE CODING (2026)│
│  ─────────────                ─────────────────────────────│
│                                                             │
│  Raw coding: 130 jam          Raw coding: 66 jam (AI)       │
│  Vendor billed: 260 jam       Vendor billed: 112–132 jam    │
│  Team: 4-5 orang              Team: 3-4 orang               │
│  Timeline: 4-6 bulan          Timeline: 2-3.5 bulan         │
│  Biaya: Rp 120-180 jt         Biaya: Rp 55-120 jt           │
│                                                             │
│  ▼ Penghematan ~30-50% ▼                                   │
└────────────────────────────────────────────────────────────┘
```

---

## 6. Rekomendasi untuk BAM

| Faktor | Rekomendasi |
|--------|-------------|
| **Dokumen spec** | Kamu **sudah punya PRD, ERD, API Contract, UI/UX Spec, Integrasi, Implementasi** — ini aset besar. Vendor akan kasih diskon karena requirement sudah matang. |
| **Budget** | Skenario **Hemat (Rp 55-75 jt)** paling cocok — spec lengkap → minim meeting → vendor kecil bisa eksekusi cepat. |
| **Alternatif** | **Dedicated Team (Rp 28-45 jt/bln × 2-3 bulan)** jika ingin fleksibilitas dan iterasi selama development. |
| **Yang TIDAK perlu** | Skenario Premium — overkill untuk internal tool keluarga. Tidak perlu SLA enterprise. |

---

## 7. Tips Negosiasi dengan Vendor

1. **Tunjukkan dokumen spec yang sudah ada** — PRD, ERD, API Contract kamu adalah senjata nego. Vendor tahu scope jelas → estimasi lebih akurat → harga lebih rendah.

2. **Minta harga blended, bukan per-role** — "Rp 350K/jam all-in untuk tim" lebih mudah dikelola daripada rate berbeda per orang.

3. **Bagi jadi 2 phase kontrak** — Fase 1–3 dulu (Core + Acara + Humas), baru lanjut Fase 4–6. Mengurangi risiko kedua pihak.

4. **Tanyakan "vibe coding stack" mereka** — vendor yang pakai Cursor/Copilot/Claude secara serius bisa kasih diskon 15–25% untuk pekerjaan boilerplate.

5. **Hindari fixed price kalau spec belum 100% yakin** — lebih baik dedicated team 2 bulan pertama, lalu evaluasi.

6. **Minta source code + deployment doc sebagai deliverable wajib** — pastikan kamu bisa maintenance sendiri setelah vendor selesai.

---

*Estimasi ini berdasarkan riset pasar Indonesia 2025–2026. Harga aktual tergantung negosiasi, reputasi vendor, dan kompleksitas yang ditemukan saat development.*
