# 📡 API Contract — Juruladen

> **Base URL**: `https://api.bamseribuputu.my.id/api/juruladen`
> **Auth**: Bearer token (Laravel Sanctum)
> **Content-Type**: `application/json`
> **Middleware**: `auth:sanctum` + role check (admin / panitia)

---

## 1. Konvensi

### 1.1 Response Envelope

Semua response menggunakan trait `ApiResponse` yang sudah ada:

```json
// Success (200/201)
{
  "success": true,
  "message": "Success",
  "data": { ... }
}

// Paginated (200)
{
  "success": true,
  "message": "Success",
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 95
  }
}

// Error (4xx/5xx)
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["The name field is required."]
  }
}
```

### 1.2 Pagination

```http
GET /api/juruladen/endpoint?page=2&per_page=20
```

- Default `per_page` = 20
- Max `per_page` = 100

### 1.3 Filtering & Sorting

```http
GET /api/juruladen/endpoint?status=todo&sort=-deadline&search=kata_kunci
```

- `sort`: prefix `-` untuk DESC
- `search`: full-text search di field title/name/description

---

## 2. Endpoints

### 2.1 Auth

> Full detail: [Auth & User Management](detail/auth-user-management.md)

#### Check NIB

```http
POST /api/juruladen/auth/check-nib
```

**Body**: `{ "nib": "0803050102000" }`

**Response** (first-time user):
```json
{
  "success": true,
  "data": {
    "nib_valid": true,
    "person_name": "Humam",
    "user_registered": true,
    "has_password": false,
    "next_step": "set_password"
  }
}
```

#### Set Password (First-time)

```http
POST /api/juruladen/auth/set-password
```

**Body**: `{ "nib": "0803050102000", "email": "humam@email.com", "password": "min8char", "password_confirmation": "min8char" }`
→ Simpan email & hash password, auto-login, return Sanctum token.

#### Login

```http
POST /api/juruladen/auth/login
```

**Body**: `{ "nib": "0803050102000", "password": "myPassword123" }`
→ Return Sanctum token + user data.

#### Forgot Password

```http
POST /api/juruladen/auth/forgot-password
```

**Body**: `{ "nib": "0803050102000" }`
→ Notifikasi ke Superadmin & Ketua. Superadmin reset via User Management.

#### Logout

```http
POST /api/juruladen/auth/logout
```

---

### 2.2 Event Management

#### Get Events (for Juruladen)

```http
GET /events
```

**Query**: `?status=active` | `?search=halal`

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "slug": "halal-bihalal-2026",
      "name": "Halal Bihalal 1447 H",
      "type": "halal_bihalal",
      "year": 2026,
      "start_date": "2026-06-15",
      "end_date": "2026-06-15",
      "is_juruladen_active": true,
      "budget_total": 15000000,
      "budget_status": "active",
      "progress_percent": 45,
      "cash_balance": 8500000
    }
  ]
}
```

#### Get Event Detail

```http
GET /events/{slug}
```

#### Toggle Juruladen Active

```http
PATCH /events/{id}/juruladen-active
```

**Body**: `{ "is_juruladen_active": true }`

#### Get Timeline

```http
GET /events/{event}/timeline?month=2026-06&division=acara&status=todo
```

**Query params**: `month` (YYYY-MM), `division` (slug), `status` (todo/in_progress/done/blocked), `assignee_id`

**Response**:
```json
{
  "data": {
    "month": "2026-06",
    "tasks": [
      {
        "id": 1,
        "title": "Buat rundown acara",
        "division_slug": "acara",
        "division_color": "blue-600",
        "status": "in_progress",
        "priority": "high",
        "deadline": "2026-06-10T18:00:00+07:00",
        "assignee": { "id": 42, "full_name": "Ahmad Fulan" }
      },
      {
        "id": 5,
        "title": "Finalisasi budget",
        "division_slug": "pendanaan",
        "division_color": "violet-600",
        "status": "todo",
        "priority": "urgent",
        "deadline": "2026-06-08T12:00:00+07:00",
        "assignee": { "id": 55, "full_name": "Siti Rahayu" }
      }
    ],
    "summary": {
      "total": 25,
      "todo": 8,
      "in_progress": 10,
      "done": 5,
      "blocked": 2,
      "urgent_this_week": 3
    }
  }
}
```

> Timeline adalah **view/computed** dari `committee_tasks` — tidak ada tabel baru. Semua user Juruladen bisa mengakses endpoint ini untuk memantau timeline kerja semua divisi.

---

### 2.2 Committee Divisions & Members

#### List Divisions

```http
GET /events/{event}/divisions
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Divisi Acara",
      "slug": "acara",
      "description": "...",
      "sort_order": 1,
      "members_count": 5,
      "tasks_total": 12,
      "tasks_done": 4,
      "progress_percent": 33,
      "members": [
        {
          "id": 1,
          "person_id": 42,
          "full_name": "Ahmad Fulan",
          "role": "ketua",
          "responsibilities": "Koordinator acara"
        }
      ]
    }
  ]
}
```

#### Add Member

```http
POST /divisions/{division}/members
```

**Body**: `{ "person_id": 42, "role": "anggota", "responsibilities": "Dokumentasi" }`

#### Remove Member

```http
DELETE /divisions/{division}/members/{person}
```

---

### 2.3 Tasks

#### List Tasks by Division

```http
GET /divisions/{division}/tasks?status=todo&sort=-deadline
```

#### Create Task

```http
POST /divisions/{division}/tasks
```

**Body**:
```json
{
  "parent_task_id": null,
  "title": "Buat rundown acara",
  "description": "...",
  "priority": "high",
  "deadline": "2026-06-10T18:00:00+07:00",
  "assignee_id": 42,
  "sort_order": 0
}
```

#### Update Task

```http
PUT /divisions/{division}/tasks/{task}
```

#### Update Task Status Only

```http
PATCH /tasks/{task}/status
```

**Body**: `{ "status": "done" }`

#### Reorder Tasks

```http
POST /tasks/reorder
```

**Body**: `{ "division_id": 1, "task_ids": [3, 1, 2, 5, 4] }`

---

### 2.4 Rundown

#### List Rundowns

```http
GET /events/{event}/rundowns
```

#### Create Rundown

```http
POST /events/{event}/rundowns
```

**Body**: `{ "section_type": "jadwal_acara" }`

#### Add Rundown Item

```http
POST /rundowns/{rundown}/items
```

**Body**:
```json
{
  "time_start": "08:00",
  "time_end": "08:30",
  "activity_title": "Pembukaan & Tilawah",
  "description": "Al-Quran Surah Al-Fatihah",
  "pic_person_id": 42,
  "location_venue": "Panggung Utama",
  "sort_order": 1
}
```

#### Update / Delete Rundown Item

```http
PUT /rundowns/{rundown}/items/{item}
DELETE /rundowns/{rundown}/items/{item}
```

---

### 2.5 Guidelines (Juknis/Juklak)

```http
GET /events/{event}/guidelines
PUT /events/{event}/guidelines/{type}
```

**Body**: `{ "content": "<h2>Petunjuk Teknis</h2><p>...</p>" }`

---

### 2.6 Inventory / Perlengkapan

```http
GET    /events/{event}/inventory?category_id=1&status=pending
POST   /events/{event}/inventory
GET    /inventory/{item}
PUT    /inventory/{item}
DELETE /inventory/{item}
PATCH  /inventory/{item}/status
```

**Create Body**:
```json
{
  "category_id": 1,
  "name": "Tenda 6x12",
  "quantity_needed": 2,
  "unit": "unit",
  "source_type": "sewa",
  "source_detail": "CV Tenda Jaya",
  "cost_per_unit": 250000,
  "assigned_to_person_id": 42,
  "notes": "Ambil H-2, kembali H+1"
}
```

**Update Status Body**: `{ "acquisition_status": "delivered", "return_status": "pending" }`

---

### 2.7 MC Assignments

```http
GET    /events/{event}/mc-assignments
POST   /events/{event}/mc-assignments
PUT    /mc-assignments/{id}
DELETE /mc-assignments/{id}
```

**Create Body**:
```json
{
  "person_id": 42,
  "role": "mc_utama",
  "segment_description": "Sesi pembukaan & sambutan",
  "notes": "Pakai bahasa Jawa krama inggil"
}
```

---

### 2.8 Catering / Konsumsi

```http
GET    /events/{event}/catering
POST   /events/{event}/catering
PUT    /catering/{id}
DELETE /catering/{id}
```

**Create Body**:
```json
{
  "rundown_item_id": null,
  "time_serve": "12:00",
  "meal_type": "berat",
  "menu_name": "Nasi Liwet + Ayam Goreng + Lalapan",
  "portion_count": 250,
  "source": "catering",
  "vendor_name": "Catering Bu Sri",
  "cost_per_portion": 25000,
  "dietary_notes": "Sediakan 10 porsi vegetarian"
}
```

---

### 2.9 Participants & RSVP

> ✅ **Tidak ada tabel baru.** Seluruh data peserta, RSVP, pool, dan presensi menggunakan tabel existing `event_registrations`. Kolom `pool_label` dan `presence_at` ditambahkan via migration.

#### List Participants

```http
GET /events/{event}/participants?pool=Peserta%20Merajut%20Cinta&attendance=hadir
```

**Query params**: `pool` (filter by pool_label), `attendance` (hadir/tidak_hadir), `status` (pending/approved/rejected), `search`

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "person_id": 42,
      "name": "Ahmad Fulan",
      "email": "ahmad@example.com",
      "whatsapp": "6281234567890",
      "attendance": "hadir",
      "status": "approved",
      "pool_label": "Peserta Merajut Cinta 2026",
      "presence_at": null,
      "custom_data": null
    }
  ],
  "pools": ["Peserta Merajut Cinta 2026", "Panitia Inti"]
}
```

#### Add Participant to Event (via Pool)

```http
POST /events/{event}/participants
```

**Body**:
```json
{
  "person_ids": [1, 2, 3],
  "pool_label": "Peserta Merajut Cinta 2026"
}
```

> Jika `pool_label` tidak diisi, peserta ditambah sebagai registrasi umum (NULL).

#### Update RSVP / Attendance

```http
PATCH /events/{event}/participants/{registration}
```

**Body**: `{ "attendance": "hadir" }` atau `{ "status": "approved" }`

#### Record Presence (Check-in Hari-H)

```http
POST /events/{event}/participants/{registration}/presence
```

**Body**: `{ "person_id": 42 }`

> Backend set `presence_at = now()`. Jika sudah ada, return 409 Conflict.

#### Bulk Update Pool Label

```http
PATCH /events/{event}/participants/bulk-pool
```

**Body**: `{ "registration_ids": [1, 2, 3], "pool_label": "Panitia Inti" }`

---

### 2.10 Publication (Humas)

#### Design Needs

```http
GET    /events/{event}/design-needs
POST   /events/{event}/design-needs
PUT    /design-needs/{id}
DELETE /design-needs/{id}
```

**Create Body**:
```json
{
  "title": "Poster Halal Bihalal",
  "description": "Poster format 1:1 untuk Instagram",
  "target_platform": "ig_feed",
  "content_info": "Logo BAM, Tema: Merajut Silaturahmi, Tanggal 15 Juni 2026, Lokasi Gedung Serbaguna",
  "assignee_person_id": 42,
  "deadline": "2026-06-01"
}
```

#### Broadcast Logs

```http
GET    /events/{event}/broadcasts?platform=wa_group
POST   /events/{event}/broadcasts
PUT    /broadcasts/{id}
DELETE /broadcasts/{id}
```

#### Documentations

```http
GET    /events/{event}/documentations
POST   /events/{event}/documentations
PUT    /documentations/{id}
DELETE /documentations/{id}
```

---

### 2.11 WhatsApp Integration (via Wablas)

#### Get WA Recipients

```http
GET /events/{event}/wa/recipients?group_label=panitia
```

#### Import WA Recipients

```http
POST /events/{event}/wa/recipients/import
```

**Body**:
```json
{
  "group_label": "Panitia Inti",
  "recipients": [
    { "phone_number": "6281234567890", "person_id": 42 },
    { "phone_number": "6289876543210", "person_id": null }
  ]
}
```

#### Send WA Blast

```http
POST /events/{event}/wa/blast
```

**Body**:
```json
{
  "template_id": 1,
  "recipient_ids": [1, 2, 3],
  "delay_ms": 2000
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "broadcast_log_id": 15,
    "total_recipients": 3,
    "sent_count": 3,
    "failed_count": 0,
    "wablas_message_ids": ["msg_abc", "msg_def", "msg_ghi"]
  }
}
```

#### Blast Templates

```http
GET /events/{event}/wa/blast-templates
POST /events/{event}/wa/blast-templates
```

**Create Body**:
```json
{
  "title": "Pengingat Halal Bihalal",
  "body_text": "Assalamualaikum wr. wb.\n\nKepada Yth. Bapak/Ibu {{nama}},\n\nKami mengingatkan acara Halal Bihalal besok...",
  "category": "pengingat"
}
```

#### Check Message Status

```http
GET /wa/message-status/{wablasMessageId}
```

#### Webhook (Wablas Callback)

```http
POST /wa/webhook
```

**Body** (dikirim oleh Wablas):
```json
{
  "id": "msg_abc",
  "status": "delivered",
  "timestamp": "2026-06-15T10:00:00Z"
}
```

> Webhook ini dipanggil oleh server Wablas. Tidak memerlukan auth sanctum — diverifikasi dengan secret token.

---

### 2.12 Finance / Pendanaan

#### Budget Plans

```http
GET    /events/{event}/budgets
POST   /events/{event}/budgets
PUT    /budgets/{id}
DELETE /budgets/{id}
```

**Create Body**: `{ "name": "Anggaran Halal Bihalal 2026" }`

#### Budget Lines

```http
GET /budgets/{budget}/lines
PUT /budgets/{budget}/lines
```

**Update Body** (full replace semua lines):
```json
{
  "lines": [
    { "category": "income", "subcategory": "iuran", "description": "Iuran per KK", "planned_amount": 10000000 },
    { "category": "expense", "subcategory": "konsumsi", "description": "Konsumsi 250 porsi", "planned_amount": 6250000 },
    { "category": "expense", "subcategory": "dekorasi", "description": "Dekorasi panggung", "planned_amount": 2500000 }
  ]
}
```

#### Budget vs Actual

```http
GET /events/{event}/budget-vs-actual
```

**Response**:
```json
{
  "data": {
    "total_planned_income": 15000000,
    "total_actual_income": 14200000,
    "total_planned_expense": 12000000,
    "total_actual_expense": 8700000,
    "lines": [
      {
        "id": 1,
        "category": "income",
        "description": "Iuran per KK",
        "planned_amount": 10000000,
        "actual_amount": 9600000,
        "paid_amount": 6200000,
        "payment_status": "partial",
        "variance": -400000,
        "variance_percent": -4.0
      }
    ]
  }
}
```

#### Income Entries

```http
GET    /events/{event}/incomes?category=iuran&sort=-payment_date
POST   /events/{event}/incomes
PUT    /incomes/{id}
DELETE /incomes/{id}
```

**Create Body**:
```json
{
  "budget_line_id": 1,
  "category": "iuran",
  "amount": 500000,
  "payer_name": "Bapak Ahmad",
  "payer_person_id": 42,
  "payment_method": "transfer",
  "payment_date": "2026-06-01",
  "receipt_number": "TRX-001",
  "notes": "Iuran KK Ngaglik"
}
```

#### Expense Entries

```http
GET    /events/{event}/expenses?category_id=1&sort=-payment_date
POST   /events/{event}/expenses
PUT    /expenses/{id}
DELETE /expenses/{id}
```

**Create Body**:
```json
{
  "budget_line_id": 2,
  "category_id": 1,
  "amount": 6250000,
  "payee_name": "Catering Bu Sri",
  "payment_method": "transfer",
  "payment_date": "2026-06-14",
  "invoice_number": "INV-006",
  "notes": "Pelunasan konsumsi 250 porsi"
}
```

#### Expense Categories

```http
GET /expense-categories
```

---

### 2.13 Reports

#### Cashflow

```http
GET /events/{event}/cashflow?period=daily&from=2026-06-01&to=2026-06-15
```

**Response**:
```json
{
  "data": {
    "opening_balance": 5000000,
    "total_income": 14200000,
    "total_expense": 8700000,
    "closing_balance": 10500000,
    "periods": [
      { "date": "2026-06-01", "income": 5000000, "expense": 2000000, "balance": 8000000 },
      { "date": "2026-06-02", "income": 3000000, "expense": 0, "balance": 11000000 }
    ]
  }
}
```

#### Cash Balance

```http
GET /events/{event}/cash-balance
```

**Response**:
```json
{
  "data": {
    "total_income_received": 14200000,
    "total_expenses_paid": 8700000,
    "current_balance": 5500000,
    "pending_receivables": 2000000,
    "pending_payables": 1500000
  }
}
```

#### Progress Dashboard

```http
GET /events/{event}/progress
```

**Response**:
```json
{
  "data": {
    "overall_progress": 45,
    "divisions": [
      { "name": "Acara", "slug": "acara", "total_tasks": 12, "done_tasks": 4, "progress": 33 },
      { "name": "Humas", "slug": "humas", "total_tasks": 8, "done_tasks": 6, "progress": 75 }
    ]
  }
}
```

---

### 2.14 Merchandise

#### Products

```http
GET    /events/{event}/merch-products
POST   /events/{event}/merch-products
PUT    /merch-products/{id}
DELETE /merch-products/{id}
```

**Create Body**:
```json
{
  "name": "Kaos Halal Bihalal 2026",
  "description": "Kaos katun combed 30s",
  "base_price": null,
  "hpp": null,
  "is_paid_event_product": false,
  "image_url": "https://..."
}
```

#### Variant Dimensions

```http
GET    /merch-products/{product}/dimensions
POST   /merch-products/{product}/dimensions
PUT    /merch-dimensions/{dimension}
DELETE /merch-dimensions/{dimension}
```

**Create Body**:
```json
{ "name": "Ukuran", "sort_order": 1 }
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "name": "Ukuran",
      "sort_order": 1,
      "values": [
        { "id": 1, "value": "XS", "sort_order": 1 },
        { "id": 2, "value": "S", "sort_order": 2 }
      ]
    },
    {
      "id": 2,
      "name": "Panjang Lengan",
      "sort_order": 2,
      "values": [
        { "id": 5, "value": "Pendek", "sort_order": 1 },
        { "id": 6, "value": "Panjang", "sort_order": 2 }
      ]
    }
  ]
}
```

#### Dimension Values

```http
POST   /merch-dimensions/{dimension}/values
PUT    /merch-dimension-values/{value}
DELETE /merch-dimension-values/{value}
```

**Create Body**: `{ "value": "XL", "sort_order": 3 }`

#### Variants (SKU / Kombinasi Dimensi)

```http
GET    /merch-products/{product}/variants
POST   /merch-products/{product}/variants
PUT    /merch-variants/{variant}
DELETE /merch-variants/{variant}
```

**Create Body**:
```json
{
  "sku": "KS-PDXLHT-DW",
  "price": 85000,
  "hpp": 65000,
  "dimension_value_ids": [5, 2, 9, 12],
  "sort_order": 1
}
```

> `dimension_value_ids` harus berisi tepat satu value dari setiap dimensi produk. Backend akan memvalidasi bahwa semua dimensi tercover dan tidak ada duplikasi.

**Response**:
```json
{
  "data": {
    "id": 15,
    "product_id": 1,
    "sku": "KS-PDXLHT-DW",
    "price": 85000,
    "hpp": 65000,
    "sort_order": 1,
    "is_active": true,
    "dimensions": [
      { "dimension_name": "Ukuran", "value": "XL" },
      { "dimension_name": "Panjang Lengan", "value": "Pendek" },
      { "dimension_name": "Warna", "value": "Hitam" },
      { "dimension_name": "Usia", "value": "Dewasa" }
    ]
  }
}
```

#### Vendors

```http
GET    /merch-vendors
POST   /merch-vendors
PUT    /merch-vendors/{id}
DELETE /merch-vendors/{id}
```

#### Merch Orders

```http
GET    /events/{event}/merch-orders?status=paid
POST   /events/{event}/merch-orders
PUT    /merch-orders/{id}
DELETE /merch-orders/{id}
```

**Create Body**:
```json
{
  "buyer_person_id": 42,
  "notes": "Pesanan via WA",
  "items": [
    { "product_id": 1, "variant_id": 2, "person_id": 42, "quantity": 2, "unit_price": 85000 },
    { "product_id": 1, "variant_id": 1, "person_id": 43, "quantity": 1, "unit_price": 80000 }
  ]
}
```

> `person_id` di item: orang yang dipesankan (jika satu order berisi item untuk beberapa orang berbeda, misal kepala keluarga memesankan untuk seluruh anggota keluarga).

#### Merch Order Recap — Vendor (Pivot Table)

```http
GET /events/{event}/merch-recap/vendor?product_id=1
```

> Rekap untuk disetorkan ke vendor produksi. Format: **tabel pivot multi-dimensi** — baris = salah satu dimensi varian, kolom = dimensi lainnya, sel = total qty.

**Response**:
```json
{
  "data": {
    "product_name": "Kaos Halal Bihalal 2026",
    "dimensions": [
      { "name": "Panjang Lengan", "values": ["Pendek", "Panjang"] },
      { "name": "Ukuran", "values": ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"] }
    ],
    "pivot": {
      "row_dimension": "Panjang Lengan",
      "col_dimension": "Ukuran",
      "rows": [
        { "row_label": "Pendek", "columns": [1, 0, 4, 15, 9, 8, 1, 1], "row_total": 39 },
        { "row_label": "Panjang", "columns": [0, 4, 6, 7, 2, 1, 0, 0], "row_total": 20 }
      ],
      "col_totals": [1, 4, 10, 22, 11, 9, 1, 1],
      "grand_total": 59
    }
  }
}
```

> Jika produk memiliki lebih dari 2 dimensi (misal: Ukuran, Warna, Usia), akan ada dimensi tambahan di luar pivot (ditampilkan sebagai filter/grouping di atas tabel).

#### Merch Order Recap — WA Group (per Qobilah)

```http
GET /events/{event}/merch-recap/wa-group
```

> Rekap untuk disebar ke WA group. Format: **list nama pemesan + produk + varian**, diklasifikasikan berdasarkan qobilah (terintegrasi data silsilah BAM).

**Response**:
```json
{
  "data": {
    "qobilahs": [
      {
        "qobilah_name": "Qobilah Ngaglik",
        "orders": [
          {
            "buyer_name": "Bapak Ahmad",
            "order_date": "2026-06-01",
            "items": [
              {
                "person_name": "Ahmad",
                "product_name": "Kaos Halal Bihalal",
                "variant_label": "Pendek, XL, Hitam",
                "quantity": 2,
                "unit_price": 85000,
                "subtotal": 170000
              },
              {
                "person_name": "Siti",
                "product_name": "Kaos Halal Bihalal",
                "variant_label": "Pendek, M, Putih",
                "quantity": 1,
                "unit_price": 85000,
                "subtotal": 85000
              }
            ],
            "total": 255000,
            "payment_status": "paid"
          }
        ]
      },
      {
        "qobilah_name": "Qobilah Sewon",
        "orders": [...]
      }
    ]
  }
}
```

#### Merch Financial Report

```http
GET /events/{event}/merch-financial
```

**Response**:
```json
{
  "data": {
    "total_revenue": 5000000,
    "total_hpp": 3500000,
    "total_gross_profit": 1500000,
    "total_expenses": 200000,
    "total_net_profit": 1300000,
    "products": [
      {
        "name": "Kaos",
        "revenue": 2125000,
        "hpp": 1625000,
        "gross_profit": 500000,
        "net_profit": 500000
      }
    ]
  }
}
```

#### Merch Campaigns

```http
GET    /events/{event}/merch-campaigns
POST   /events/{event}/merch-campaigns
PUT    /merch-campaigns/{id}
DELETE /merch-campaigns/{id}
```

---

### 2.15 Google Sheets Export

```http
POST /events/{event}/export/sheets
```

**Body**:
```json
{
  "report_type": "cashflow",
  "date_from": "2026-06-01",
  "date_to": "2026-06-15"
}
```

```http
GET /events/{event}/export/sheets/config
PUT /events/{event}/export/sheets/config
```

**Update Body**:
```json
{
  "cashflow": { "spreadsheet_id": "1abc...", "sheet_name": "Cashflow" },
  "budget_vs_actual": { "spreadsheet_id": "1abc...", "sheet_name": "Budget" },
  "merch_recap": { "spreadsheet_id": "1def...", "sheet_name": "Merch Recap" }
}
```

---

### 2.16 Notifications

```http
GET /events/{event}/notifications?type=task_deadline
GET /notifications/preferences
PUT /notifications/preferences
```

**Update Preferences Body**:
```json
{
  "event_id": 1,
  "task_assigned": true,
  "task_deadline": true,
  "task_done": false,
  "transaction_new": true,
  "daily_summary": false
}
```

---

### 2.17 User Management (Superadmin only)

> Full detail: [Auth & User Management](detail/auth-user-management.md)

#### List Users

```http
GET /api/juruladen/users?role=admin
```

#### Add User

```http
POST /api/juruladen/users
```

**Body**: `{ "person_id": 42, "role": "admin" }`

→ Membuat record `users` dengan `password=NULL` (first-time state).

#### Delete User

```http
DELETE /api/juruladen/users/{user}
```

#### Reset Password

```http
POST /api/juruladen/users/{user}/reset-password
```

→ Set `password = NULL`. User kembali ke flow first-time (buat password baru).

#### Search Person (untuk form tambah user)

```http
GET /api/juruladen/users/search-person?q=080305
```

→ Autocomplete cari person by NIB atau nama.

---

## 3. Error Codes

| HTTP | Code | Meaning |
|------|------|---------|
| 200 | `success` | Operasi berhasil |
| 201 | `created` | Resource berhasil dibuat |
| 204 | `no_content` | Resource berhasil dihapus |
| 400 | `validation_error` | Input tidak valid |
| 401 | `unauthenticated` | Token invalid/expired |
| 403 | `forbidden` | User tidak punya akses (bukan panitia) |
| 404 | `not_found` | Resource tidak ditemukan |
| 409 | `conflict` | Konflik data (misal: produk masih punya pesanan) |
| 422 | `validation_error` | Validasi Laravel gagal |
| 429 | `too_many_requests` | Rate limit exceeded |
| 500 | `server_error` | Error internal |

---

*API Contract siap. Semua endpoint mengikuti konvensi Laravel existing di codebase.*
