# 🔗 Integrasi — Juruladen

> **Dokumen**: Integrasi eksternal & internal Juruladen
> **Tujuan**: Menjelaskan bagaimana Juruladen terhubung dengan layanan eksternal dan sistem eksisting BAM

---

## 1. Arsitektur Integrasi

```
┌─────────────────────────────────────────────────────────┐
│                     JURULADEN                            │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐          │
│  │Wablas    │  │ Google   │  │ Laravel      │          │
│  │Service   │  │ Sheets   │  │ Mail/Queue   │          │
│  │          │  │ Service  │  │              │          │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘          │
│       │              │               │                   │
└───────┼──────────────┼───────────────┼───────────────────┘
        │              │               │
        ▼              ▼               ▼
   ┌─────────┐   ┌──────────┐   ┌──────────┐
   │ Wablas  │   │  Google  │   │SMTP/API │
   │ API v2  │   │ Sheets   │   │  Email   │
   │ (REST)  │   │ API v4   │   │          │
   └─────────┘   └──────────┘   └──────────┘
```

---

## 2. WhatsApp via Wablas

### 2.1 Overview

Wablas adalah penyedia WhatsApp Gateway Indonesia yang menggunakan **unofficial WhatsApp Multi-Device protocol**. Wablas dipilih karena murah (Rp 20-22rb/bln), setup cepat, dan mendukung bulk blast langsung via REST API.

### 2.2 Setup

```
1. Register akun di wablas.com
2. Pilih plan (Nano/Lite) — bayar via transfer bank / e-wallet
3. Dapatkan API Token dari dashboard Wablas
4. Scan QR code untuk hubungkan nomor WhatsApp keluarga (seperti WhatsApp Web)
5. Simpan WABLAS_API_TOKEN dan WABLAS_API_URL di .env
```

### 2.3 Konfigurasi .env

```env
WABLAS_API_URL=https://wablas.com/api/v2
WABLAS_API_TOKEN=your-api-token-here
WABLAS_WEBHOOK_SECRET=random-secret-for-webhook-verification
WABLAS_DEFAULT_DELAY_MS=2000
```

### 2.4 Service Class: `WablasService`

```php
namespace App\Services\Juruladen;

use App\Services\Juruladen\Contracts\WhatsAppServiceInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WablasService implements WhatsAppServiceInterface
{
    private string $baseUrl;
    private string $token;

    public function __construct()
    {
        $this->baseUrl = config('services.wablas.url');
        $this->token = config('services.wablas.token');
    }

    /**
     * Kirim blast ke multiple nomor.
     * Wablas API v2 mendukung multiple recipient dalam 1 request.
     *
     * @param array $phones   ['6281234567890', '6289876543210']
     * @param string $message Teks pesan (bisa pakai placeholder {{nama}})
     * @param array $data     Data untuk replace placeholder [['nama' => 'Budi'], ['nama' => 'Ani']]
     * @param int $delayMs    Delay antar pesan dalam milidetik
     * @return array          ['message_id' => '...', 'total_sent' => 3, 'total_failed' => 0]
     */
    public function sendBlast(array $phones, string $message, array $data = [], int $delayMs = 2000): array
    {
        $payload = [
            'data' => array_map(function ($index) use ($phones, $message, $data, $delayMs) {
                $msg = $message;

                // Replace placeholder {{key}} dengan data
                if (isset($data[$index])) {
                    foreach ($data[$index] as $key => $value) {
                        $msg = str_replace('{{' . $key . '}}', $value, $msg);
                    }
                }

                return [
                    'phone' => $phones[$index],
                    'message' => $msg,
                    'delay' => $delayMs,
                ];
            }, array_keys($phones)),
        ];

        $response = Http::withToken($this->token)
            ->timeout(60)
            ->post("{$this->baseUrl}/send-message", $payload);

        if ($response->failed()) {
            Log::error('Wablas blast failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \RuntimeException('Wablas API error: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Cek status pesan via Wablas.
     */
    public function checkStatus(string $wablasMessageId): array
    {
        $response = Http::withToken($this->token)
            ->get("{$this->baseUrl}/check-status", [
                'id' => $wablasMessageId,
            ]);

        return $response->json();
    }

    /**
     * Verifikasi webhook signature dari Wablas.
     */
    public function verifyWebhook(string $signature, string $payload): bool
    {
        $expected = hash_hmac('sha256', $payload, config('services.wablas.webhook_secret'));
        return hash_equals($expected, $signature);
    }
}
```

### 2.5 Interface (untuk migrasi masa depan)

```php
namespace App\Services\Juruladen\Contracts;

interface WhatsAppServiceInterface
{
    public function sendBlast(array $phones, string $message, array $data = [], int $delayMs = 2000): array;
    public function checkStatus(string $messageId): array;
    public function verifyWebhook(string $signature, string $payload): bool;
}
```

> Jika di masa depan ingin migrasi ke Meta Cloud API, cukup buat `MetaCloudService implements WhatsAppServiceInterface` lalu bind di service container. Controller tidak perlu diubah.

### 2.6 Webhook Handler

```php
// POST /api/juruladen/wa/webhook
public function webhook(Request $request): JsonResponse
{
    // 1. Verifikasi signature
    $signature = $request->header('X-Wablas-Signature');
    if (!$this->wablasService->verifyWebhook($signature, $request->getContent())) {
        return response()->json(['success' => false], 403);
    }

    // 2. Update broadcast_log
    $payload = $request->all();
    $log = BroadcastLog::where('wablas_message_id', $payload['id'])->first();

    if ($log) {
        $log->update([
            'status' => match ($payload['status']) {
                'delivered' => 'sent',
                'read' => 'sent',
                'failed' => 'failed',
                default => 'scheduled',
            },
        ]);
    }

    return response()->json(['success' => true]);
}
```

### 2.7 Flow: Kirim WA Blast

```
1. User pilih template + recipients di dashboard
2. Frontend POST /events/{event}/wa/blast
3. Controller validasi, ambil nomor dari wa_recipients
4. Controller panggil WablasService::sendBlast()
5. Wablas kirim pesan ke nomor tujuan via WA Multi-Device
6. Controller buat broadcast_log entry dengan wablas_message_id
7. Wablas (async) kirim webhook callback saat status berubah
8. Webhook handler update broadcast_log.status
```

### 2.8 Batasan & Risiko

| Item | Detail |
|------|--------|
| **Rate limit** | Tidak ada hard limit dari Wablas, tapi delay 2-5 detik antar pesan direkomendasikan |
| **File size** | Maks 2 MB per attachment (Wablas limit) |
| **Ban risk** | Jika nomor dilaporkan spam oleh penerima, WhatsApp bisa memblokir nomor |
| **Protocol fragility** | Wablas bergantung pada reverse-engineered WhatsApp Web protocol — bisa break saat WhatsApp update |
| **Mitigasi** | WhatsAppServiceInterface memungkinkan swap ke Meta Cloud API tanpa rewrite |

---

## 3. Google Sheets Export

### 3.1 Overview

Laporan keuangan bisa di-export langsung ke Google Sheets menggunakan Google Sheets API v4. Ini memungkinkan bendahara share laporan real-time tanpa file attachment.

### 3.2 Setup

```
1. Buat project di Google Cloud Console
2. Enable Google Sheets API
3. Buat Service Account → download JSON key
4. Share Google Sheet ke email Service Account (sebagai Editor)
5. Simpan GOOGLE_SERVICE_ACCOUNT_JSON di .env
```

### 3.3 Konfigurasi .env

```env
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...",...}
GOOGLE_SHEETS_APPLICATION_NAME=Juruladen BAM
```

### 3.4 Service: `SheetsExportService`

```php
namespace App\Services\Juruladen;

use Google\Client;
use Google\Service\Sheets;

class SheetsExportService
{
    private Sheets $sheets;

    public function __construct()
    {
        $client = new Client();
        $client->setApplicationName(config('services.google.sheets.app_name'));
        $client->setAuthConfig(json_decode(config('services.google.service_account_json'), true));
        $client->setScopes([Sheets::SPREADSHEETS]);

        $this->sheets = new Sheets($client);
    }

    /**
     * Export data array ke Google Sheet.
     *
     * @param string $spreadsheetId ID dari URL sheet
     * @param string $sheetName     Nama tab sheet
     * @param array  $headers       ['Tanggal', 'Kategori', 'Jumlah']
     * @param array  $rows          [['2026-06-01', 'Iuran', 500000], ...]
     */
    public function export(string $spreadsheetId, string $sheetName, array $headers, array $rows): void
    {
        // Build data: header + rows
        $data = [$headers];
        foreach ($rows as $row) {
            $data[] = $row;
        }

        // Clear existing content
        $this->sheets->spreadsheets_values->clear(
            $spreadsheetId,
            "{$sheetName}!A:Z",
            new \Google\Service\Sheets\ClearValuesRequest()
        );

        // Write new data
        $body = new \Google\Service\Sheets\ValueRange([
            'values' => $data,
        ]);

        $this->sheets->spreadsheets_values->update(
            $spreadsheetId,
            "{$sheetName}!A1",
            $body,
            ['valueInputOption' => 'RAW']
        );
    }
}
```

### 3.5 Flow

```
1. Admin setup sheet config (spreadsheet ID + sheet name) di dashboard
2. Klik "Export to Google Sheets" di halaman Laporan
3. Backend ambil data laporan dari DB (cashflow/budget vs actual/merch recap)
4. SheetsExportService::export() → overwrite sheet dengan data terbaru
5. Response sukses → user bisa buka link spreadsheet langsung
```

---

## 4. Email Notification

### 4.1 Overview

Sistem mengirim notifikasi email otomatis ke anggota panitia untuk 6 event:
1. **task_assigned** — ketika tugas baru di-assign ke user
2. **task_deadline** — H-1 deadline tugas
3. **task_done** — ketika tugas ditandai selesai
4. **transaction_new** — ketika transaksi keuangan baru dicatat
5. **daily_summary** — ringkasan progress harian (opsional, pagi hari)
6. **welcome** — 🆕 ketika user pertama kali melengkapi akun (set email + password)

### 4.2 Teknologi

- **Laravel Mail** — `Mail::to($user)->send(new TaskAssignedMail($task))`
- **Laravel Queue** — database driver (jobs table di DB)
- **Laravel Scheduler** — `php artisan schedule:run` setiap menit via cron

### 4.3 Konfigurasi .env

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=juruladen@bamseribuputu.my.id
MAIL_PASSWORD=app-password
MAIL_FROM_ADDRESS="juruladen@bamseribuputu.my.id"
MAIL_FROM_NAME="Juruladen BAM"
```

### 4.4 Mailable Classes

| Mailable | Trigger | Data |
|----------|---------|------|
| `TaskAssignedMail` | Task created/updated dengan assignee baru | `$task`, `$event`, `$division` |
| `TaskDeadlineMail` | Scheduler check: deadline = besok | `$task`, `$event` |
| `TaskDoneMail` | Task status diubah ke `done` | `$task` (notify ketua divisi) |
| `TransactionNewMail` | Income/Expense entry created | `$entry`, `$event` |
| `DailySummaryMail` | Scheduler: kirim jam 07:00 | `$event`, progress array |
| `WelcomeMail` | 🆕 User lengkapi akun pertama kali | `$user`, `$event` |

### 4.5 Scheduler

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    // Cek deadline task — kirim notifikasi H-1
    $schedule->command('juruladen:notify-deadlines')->dailyAt('07:00');

    // Kirim daily summary (hanya ke user yang enable)
    $schedule->command('juruladen:daily-summary')->dailyAt('07:00');

    // Proses queued emails
    $schedule->command('queue:work --stop-when-empty')->everyMinute();
}
```

### 4.6 Notification Preferences

Setiap user bisa mengatur preferensi per event (atau global). Default: semua ON kecuali `daily_summary`.

```json
{
  "event_id": null,
  "task_assigned": true,
  "task_deadline": true,
  "task_done": true,
  "transaction_new": true,
  "daily_summary": false,
  "welcome": true
}
```

---

## 5. Integrasi dengan Sistem Eksisting BAM

### 5.1 Yang Digunakan Ulang

| Komponen Eksisting | Digunakan Untuk |
|-------------------|-----------------|
| Tabel `events` | Event data + flag `is_juruladen_active` |
| Tabel `persons` | Assignee tugas, anggota divisi, peserta, buyer merchandise, **user Juruladen (via person_id)** |
| Tabel `users` | Auth Juruladen (NIB-based login) + role (superadmin/admin). Di-extend: `email` NULL, `password` NULL |
| `NibService` | 🆕 Validasi NIB (Luhn checksum) untuk login & user lookup |
| Tabel `event_registrations` | Peserta, RSVP (`attendance`), pool peserta (`pool_label`), presensi (`presence_at`) |
| Middleware `auth:sanctum` | Authentication |
| Middleware `admin` | Authorization (role check) |
| Trait `ApiResponse` | Standard response envelope |

### 5.2 Migration yang Diperlukan

```php
// 1. Tambahkan kolom ke events table
Schema::table('events', function (Blueprint $table) {
    $table->decimal('budget_total', 15, 2)->nullable()->after('location_maps_url');
    $table->string('budget_status', 20)->default('draft')->after('budget_total');
    $table->boolean('is_juruladen_active')->default(false)->after('budget_status');
});

// 2. Alter users table untuk NIB-based auth
Schema::table('users', function (Blueprint $table) {
    $table->string('email')->nullable()->change();
    $table->string('password')->nullable()->change();
});

// 3. Alter event_registrations untuk pool & presensi
Schema::table('event_registrations', function (Blueprint $table) {
    $table->string('pool_label', 100)->nullable()->index()->after('attendance');
    $table->datetime('presence_at')->nullable()->after('pool_label');
});
```

### 5.3 Route Registration

```php
// routes/api.php — tambahkan prefix juruladen
Route::prefix('juruladen')
    ->middleware(['auth:sanctum'])
    ->group(base_path('routes/api/juruladen.php'));
```

> Access control (superadmin vs admin vs division-specific) di-enforce di controller level menggunakan policy/gate, bukan middleware blanket `admin`. Lihat [Access Control Matrix](detail/auth-user-management/fitur.md#12-access-control-matrix).

### 5.4 Shared Types

```typescript
// shared/src/types/index.ts — tambahkan
export interface JuruladenEvent extends Event {
  is_juruladen_active: boolean;
  budget_total?: number;
  budget_status: 'draft' | 'approved' | 'active' | 'closed';
}

export interface CommitteeTask {
  id: number;
  division_id: number;
  title: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: string;
  assignee?: Person;
}
// ... (tambahan tipe lainnya sesuai ERD)
```

---

## 6. Keamanan

| Area | Proteksi |
|------|----------|
| **WA blast** | Rate limit per event: maks 5 blast per jam |
| **Google Sheets** | Service account hanya bisa akses sheet yang di-share |
| **Email** | Queue database — tidak blocking request |
| **Auth** | NIB-based login (Luhn checksum via NibService) + Sanctum token. Access control berbasis role (superadmin/admin) + divisi |
| **Webhook** | Signature verification (HMAC-SHA256) |
| **CORS** | Hanya allow origin `juruladen.bamseribuputu.my.id` |

---

*Dokumen integrasi siap. Semua service dibuat dengan interface sehingga mudah ditukar implementasinya di masa depan.*
