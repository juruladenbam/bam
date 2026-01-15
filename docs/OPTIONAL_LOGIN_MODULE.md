# Optional Login Module - Implementation Plan

## 📋 Overview

Dokumen ini menjelaskan implementasi fitur **Optional Login Module** untuk BAM Portal. Fitur ini memungkinkan admin untuk menonaktifkan sistem login tradisional dan menggantinya dengan sistem **NIB-based access** yang lebih sederhana.

### Latar Belakang
- **Feedback User**: Sebagian besar user tidak menyukai requirement login untuk akses penuh fitur portal
- **Solusi**: Menjadikan login sebagai modul yang bisa di-toggle dari admin panel
- **Alternatif Akses**: Menggunakan NIB (Nomor Induk BAM) untuk identifikasi diri

### Tanggal Dokumen
- Created: 2026-01-14
- Last Updated: 2026-01-14

---

## 🎯 Goals & Non-Goals

### Goals
1. ✅ Login menjadi modul yang bisa diaktifkan/nonaktifkan dari admin
2. ✅ User bisa mengakses fitur dengan menautkan NIB saja (tanpa login)
3. ✅ Fitur sensitif yang memerlukan identitas otomatis menyesuaikan
4. ✅ Halaman NIB linking dengan panduan per-digit pattern
5. ✅ NIB memiliki format terstandarisasi untuk identifikasi diri (Anak, Cucu, dll)

### Non-Goals
1. ❌ Menghapus total sistem login (tetap tersedia jika dibutuhkan)
2. ❌ Mengubah struktur database NIB yang sudah ada
3. ❌ Implementasi MFA atau enhanced security (future scope)

---

## 📊 Feature Comparison Table

| Fitur | Login ON (Current) | Login OFF + Guest | Login OFF + NIB Linked |
|-------|-------------------|-------------------|------------------------|
| **Akses Portal** | Perlu login | Bebas akses | Bebas akses |
| **Blur Overlay** | Ya (jika belum link) | ❌ Tidak | ❌ Tidak |
| **Lihat Pohon Keluarga** | ✅ | ✅ | ✅ |
| **Lihat Kalender/Event** | ✅ | ✅ | ✅ |
| **Lihat Berita** | ✅ | ✅ | ✅ |
| **Relationship Display** | Relatif ke user | ROOT (anak, cucu) | Relatif ke NIB |
| **Panggilan Keluarga** | ✅ Pakde, Bulik, dll | ❌ Tidak ada | ✅ Pakde, Bulik, dll |
| **Jalur Hubungan** | ✅ | ❌ Tidak ada | ✅ |
| **Lapor Data** | ✅ (identitas user) | ❌ Dialog NIB | ✅ (identitas NIB) |
| **Edit Profile** | ✅ | ❌ | ❌ Simplified |
| **Menu Login/Logout** | ✅ | ❌ | ❌ |
| **Menu Tautkan NIB** | Via profile | ✅ Halaman | ✅ Halaman (bisa reset) |

---

## 🏗 Architecture

### Access Modes

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PORTAL ACCESS MODES                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ MODE A: LOGIN ENABLED (Current Behavior)                    │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                             │   │
│  │  1. UNAUTHENTICATED                                         │   │
│  │     └─ Redirect ke login page                               │   │
│  │                                                             │   │
│  │  2. AUTHENTICATED + UNLINKED                                │   │
│  │     └─ Blur overlay + Alert tautkan akun                    │   │
│  │     └─ Fitur terbatas                                       │   │
│  │                                                             │   │
│  │  3. AUTHENTICATED + LINKED                                  │   │
│  │     └─ Full access semua fitur                              │   │
│  │     └─ Relationship dari perspektif user                    │   │
│  │     └─ Panggilan keluarga (Pakde, Bulik, dll)               │   │
│  │     └─ Lapor data dengan identitas reporter                 │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ MODE B: LOGIN DISABLED (New Feature)                        │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                             │   │
│  │  1. GUEST (Tanpa NIB)                                       │   │
│  │     └─ Akses read-only ke semua data publik                 │   │
│  │     └─ Lihat pohon keluarga, kalender, berita               │   │
│  │     └─ TIDAK ada blur overlay                               │   │
│  │     └─ Relationship: perspektif ROOT (anak, cucu, cicit)    │   │
│  │     └─ Lapor data: tampil disabled + dialog tautkan NIB     │   │
│  │                                                             │   │
│  │  2. NIB-LINKED (Setelah tautkan NIB)                        │   │
│  │     └─ Semua fitur Guest +                                  │   │
│  │     └─ Lihat data diri yang ter-link                        │   │
│  │     └─ Share story Instagram personal                       │   │
│  │     └─ Relationship: PERSPEKTIF NIB yang diinputkan         │   │
│  │     └─ Panggilan keluarga relatif (Pakde, Bulik, dll)       │   │
│  │     └─ Jalur hubungan keluarga relatif                      │   │
│  │     └─ Lapor data (dengan identitas dari NIB)               │   │
│  │                                                             │   │
│  │  DISABLED FEATURES saat Login OFF:                          │   │
│  │     ✗ Blur overlay & alert tautkan akun (SELALU OFF)        │   │
│  │     ✗ Edit profile (simplified view only)                   │   │
│  │     ✗ Login/Register/Logout menu                            │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Flow

```
┌──────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   Admin Panel    │────▶│   Site Settings     │────▶│   Portal App     │
│                  │     │   (Database)        │     │                  │
│ Toggle Settings: │     │                     │     │ usePortalMode()  │
│ - login_enabled  │     │ portal.login_enabled│     │ hook checks mode │
│ - nib_only_mode  │     │ portal.features.*   │     │ and adjusts UI   │
└──────────────────┘     └─────────────────────┘     └──────────────────┘
                                                              │
                                                              ▼
                         ┌────────────────────────────────────────────┐
                         │           Feature Visibility               │
                         ├────────────────────────────────────────────┤
                         │ if (loginEnabled) {                        │
                         │   // Current behavior                      │
                         │   showRelativeRelationship()               │
                         │   showFamilyCalling()                      │
                         │   showSubmissionWithReporter()             │
                         │   if (!linked) showBlurOverlay()           │
                         │ } else {                                   │
                         │   // NIB-only mode                         │
                         │   hideBlurOverlay() // Always off          │
                         │   hideLoginLogoutMenu()                    │
                         │                                            │
                         │   if (nibLinked) {                         │
                         │     showRelativeRelationship(fromNib)      │
                         │     showFamilyCalling(fromNib)             │
                         │     showSubmissionWithNibIdentity()        │
                         │   } else {                                 │
                         │     showRootPerspectiveRelationship()      │
                         │     showSubmissionDisabled(nibDialog)      │
                         │   }                                        │
                         │ }                                          │
                         └────────────────────────────────────────────┘
```

---

## 🔢 NIB Validation Algorithm

### Current NIB Format
Format NIB saat ini memiliki panjang yang flexible:
- `08` - Root (Abdul Manan)
- `0801000` - Anak pertama (garis darah)
- `0801001` - Pasangan anak pertama
- `080101000` - Cucu pertama dari anak pertama
- dst...

### NIB Pattern Breakdown (untuk User Guide)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NIB PATTERN GUIDE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│               └───────────────── Kode Root (08 = Abdul Manan)       │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ STRUKTUR UMUM:                                                      │
│                                                                     │
│   [08] + [XX][XX][XX]... + [SSS]                                    │
│    │      │               │                                         │
│    │      │               └── Status: 000=darah, 001+=pasangan      │
│    │      │                                                         │
│    │      └── Urutan anak (2 digit per generasi)                    │
│    │          Generasi 2: urutan anak Abdul Manan (01-11)           │
│    │          Generasi 3: urutan cucu                               │
│    │          Generasi 4: urutan cicit, dst...                      │
│    │                                                                │
│    └── Root identifier (selalu 08)                                  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ CONTOH LENGKAP:                                                     │
│                                                                     │
│  NIB          │ Arti                                                │
│  ─────────────┼───────────────────────────────────────────────────  │
│  08           │ Abdul Manan (Root)                                  │
│  0801000      │ Anak ke-1 Abdul Manan                               │
│  0801001      │ Pasangan anak ke-1 (istri/suami pertama)            │
│  0801002      │ Pasangan anak ke-1 (istri/suami kedua, jika ada)    │
│  0802000      │ Anak ke-2 Abdul Manan                               │
│  0811000      │ Anak ke-11 Abdul Manan                              │
│  080101000    │ Cucu dari anak ke-1, anak ke-1                      │
│  080102000    │ Cucu dari anak ke-1, anak ke-2                      │
│  080201000    │ Cucu dari anak ke-2, anak ke-1                      │
│  08010101000  │ Cicit dari anak ke-1 → cucu ke-1 → anak ke-1        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Cara Menentukan NIB Sendiri (User Guide Content)

```
┌─────────────────────────────────────────────────────────────────────┐
│                  CARA MENENTUKAN NIB ANDA                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  LANGKAH 1: Identifikasi cabang Anda                                │
│  ─────────────────────────────────────                              │
│  Siapa anak Abdul Manan yang menjadi leluhur Anda?                  │
│  Contoh: Jika leluhur Anda adalah anak ke-3 → awalan NIB: 0803      │
│                                                                     │
│  LANGKAH 2: Telusuri jalur keturunan                                │
│  ─────────────────────────────────────                              │
│  Dari anak Abdul Manan tersebut, ikuti jalur:                       │
│  - Anak ke berapa di generasi 3?                                    │
│  - Anak ke berapa di generasi 4?                                    │
│  - dst...                                                           │
│                                                                     │
│  LANGKAH 3: Tentukan status Anda                                    │
│  ─────────────────────────────────────                              │
│  - Jika Anda keturunan langsung (garis darah): akhiri dengan 000    │
│  - Jika Anda menikah ke dalam keluarga: akhiri dengan 001, 002...   │
│                                                                     │
│  CONTOH:                                                            │
│  ─────────────────────────────────────                              │
│  "Saya cucu dari anak ke-5 Abdul Manan, anak ke-2, dan saya         │
│   keturunan langsung"                                               │
│                                                                     │
│  → 08 (root) + 05 (anak ke-5) + 02 (cucu ke-2) + 000 (garis darah)  │
│  → NIB: 080502000                                                   │
│                                                                     │
│  "Saya istri dari cucu anak ke-3, cucu ke-1"                        │
│                                                                     │
│  → 08 (root) + 03 (anak ke-3) + 01 (cucu ke-1) + 001 (pasangan)     │
│  → NIB: 080301001                                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔢 NIB Validation Algorithm (Simplified)

NIB divalidasi berdasarkan keberadaannya di database. Tidak ada lagi digit checksum tambahan untuk memudahkan input user. Sistem mengandalkan pencarian langsung di tabel `persons`.

#### Implementation
NIB divalidasi langsung ke database menggunakan `NibService::findPersonByNib($nib)`. Penggunaan Luhn Checksum telah dihapus untuk menyederhanakan pengalaman pengguna.

### Deployment Status
Sistem telah diimplementasikan tanpa checksum untuk memudahkan input pengguna. Hubungan keluarga divalidasi langsung melalui pencarian database.

---

## 📝 Implementation Tasks

### Phase 1: Backend Foundation ✅ COMPLETED

#### Task 1.1: Add Site Settings
**File**: `database/seeders/SiteSettingSeeder.php`

```php
// Tambahkan settings baru
[
    'key' => 'portal.login_enabled',
    'value' => 'true',  // default: login aktif
    'type' => 'boolean',
],
[
    'key' => 'portal.nib_claiming_enabled',
    'value' => 'true',
    'type' => 'boolean',
],
```

#### Task 1.2: Create NibService
**File**: `app/Services/NibService.php`
- Implementasi pencarian NIB di database
- Implementasi parsing segmen NIB (Root, Generasi, Status)
- Helper untuk label hubungan dari perspektif person/NIB

#### Task 1.3: API Endpoint for NIB Linking (Semi-Public)
**File**: `app/Http/Controllers/Api/Portal/NibController.php`

```php
// Endpoints semi-public (no auth, with rate limiting)
Route::middleware(['throttle:nib'])->group(function () {
    Route::post('/portal/nib/link', [NibController::class, 'link']);
    Route::post('/portal/nib/validate', [NibController::class, 'validate']);
    Route::get('/portal/nib/guide', [NibController::class, 'guide']);
});

// Rate limiter config (in RouteServiceProvider or bootstrap)
RateLimiter::for('nib', function (Request $request) {
    return Limit::perMinute(5)->by($request->ip());
});
```

#### Task 1.4: Modify Portal Settings API
**File**: `app/Http/Controllers/Api/Portal/SettingsController.php`

```php
// Return portal mode settings
public function getPortalMode()
{
    return [
        'login_enabled' => (bool) SiteSetting::getValue('portal.login_enabled', true),
        'nib_claiming_enabled' => (bool) SiteSetting::getValue('portal.nib_claiming_enabled', true),
    ];
}
```

**Note**: `relationship_mode` tidak lagi diperlukan karena:
- Jika user ter-link (via auth atau NIB) → relationship ditampilkan relatif ke person tersebut
- Jika user guest → relationship ditampilkan dari perspektif root

#### Task 1.5: Modify Relationship Calculation
**File**: `app/Services/RelationshipService.php`

```php
// Add method for root-perspective relationship
public function getRelationshipFromRoot(Person $person): array
{
    // Calculate relationship from root Abdul Manan
    // Returns: 'anak', 'cucu', 'cicit', 'canggah', etc.
}
```

### Phase 2: Admin Panel ✅ COMPLETED

#### Task 2.1: Add Portal Settings Tab to Existing Settings Page
**Location**: Tab baru di halaman Settings yang sudah ada
**Section**: "Portal Authentication"

UI Components:
- [ ] Section Header: "Pengaturan Autentikasi Portal"
- [ ] Toggle: Login Required (Aktif/Nonaktif)
  - Label: "Sistem Login"
  - Description: "Aktifkan untuk memerlukan login akun. Nonaktifkan untuk mode NIB-only."
- [ ] Toggle: NIB Claiming Enabled 
  - Label: "Tautkan NIB"
  - Description: "Izinkan user menautkan identitas dengan NIB."
- [ ] Info Alert saat Login dinonaktifkan:
  - "Mode NIB-Only aktif. User dapat mengakses portal tanpa login."
  - "Fitur relationship tetap tersedia berdasarkan NIB yang ditautkan."

#### Task 2.2: Settings API Integration
**File**: `admin/src/features/settings/api/settingsApi.ts`

### Phase 3: Portal Frontend

#### Task 3.1: Create Portal Mode Hook ✅ COMPLETED
**File**: `portal/src/hooks/usePortalMode.ts`

```typescript
interface NibSession {
  nib: string;
  personId: number;
  personName: string;
  branchName: string;
  generation: number;
  linkedAt: string;
}

interface PortalMode {
  // Settings from backend
  loginEnabled: boolean;
  nibClaimingEnabled: boolean;
  
  // NIB Session (from localStorage)
  nibSession: NibSession | null;
  isNibLinked: boolean;
  
  // Derived states
  isNibOnlyMode: boolean;           // true when login disabled
  shouldShowBlurOverlay: boolean;    // only when login enabled + not linked
  shouldShowRelativeRelationship: boolean; // when linked via auth OR NIB
  shouldShowLoginMenu: boolean;      // only when login enabled
  
  // Current perspective person ID (for relationship calculation)
  perspectivePersonId: number | null; // user.person_id OR nibSession.personId
  
  // Actions
  openNibLinkDrawer: () => void;
  clearNibSession: () => void;
}

export function usePortalMode(): PortalMode;
```

#### Task 3.2: Refactor AuthGuard ✅ COMPLETED
**File**: `portal/src/components/AuthGuard.tsx`

```typescript
// Before: Always requires authentication
// After: Check portal mode first

export function AuthGuard({ children }: AuthGuardProps) {
  const { loginEnabled } = usePortalMode();
  
  if (!loginEnabled) {
    // Skip auth check, allow guest access
    return <>{children}</>;
  }
  
  // Current behavior for login-enabled mode
  // ...
}
```

#### Task 3.3: Create NIB Linking Page ✅ COMPLETED
**File**: `portal/src/pages/auth/LinkNibPage.tsx`

Halaman dedicated untuk menautkan NIB (bukan drawer).

Features:
- [ ] NIB input field dengan format helper
- [ ] Real-time Luhn validation dengan visual feedback
- [ ] "Bantuan" button → buka NIB Guide drawer/modal
- [ ] Preview data sebelum confirm (nama, cabang, generasi)
- [ ] Success state dengan data yang ter-link
- [ ] "Hapus Tautan" button untuk clear NIB session (jika sudah linked)
- [ ] Redirect ke home setelah berhasil link

#### Task 3.4: Create NIB Guide Drawer/Modal Component ✅ COMPLETED
**File**: `portal/src/components/NibGuideDrawer.tsx`

Drawer/modal untuk panduan NIB (dibuka dari link page)

```typescript
// Visual explanation of NIB pattern
const NIB_SEGMENTS = [
  {
    position: [0, 2],
    label: 'Root',
    description: 'Angka tetap "08" untuk Abdul Manan',
    example: '08',
    color: '#ec1325',
  },
  {
    position: [2, 4],
    label: 'Cabang',
    description: 'Urutan anak dari Abdul Manan (01-11)',
    example: '01',
    color: '#2563eb',
  },
  {
    position: [4, 6],
    label: 'Sub-Cabang',
    description: 'Urutan anak di generasi berikutnya',
    example: '01',
    color: '#16a34a',
  },
  // ... dynamic based on NIB length
  {
    position: [-3, null], // last 3 digits
    label: 'Status',
    description: '000 = Garis Darah, 001+ = Pasangan',
    example: '000',
    color: '#9333ea',
  },
];

// Interactive: highlight segment saat user mengetik
// Show contoh untuk setiap generasi
```

#### Task 3.5: Conditional UI in Profile Page ✅ COMPLETED
**File**: `portal/src/pages/profile/ProfilePage.tsx`

```typescript
const { loginEnabled, isNibLinked, nibPersonId } = usePortalMode();

// Relationship display logic:
// 1. Login Enabled + Linked: Show relative from user's person
// 2. Login Disabled + NIB Linked: Show relative from NIB person
// 3. Login Disabled + Guest: Show root perspective (anak, cucu, etc)

const showRelativeRelationship = 
  (loginEnabled && user?.person_id) || 
  (!loginEnabled && isNibLinked);

{showRelativeRelationship && relationship && (
  // Show "Pakde", "Bulik", etc. based on linked person/NIB
  <RelationshipBadge relationship={relationship} />
)}

{!showRelativeRelationship && (
  // Guest mode: Show "Cucu", "Cicit", etc. from root
  <RootRelationshipBadge generation={person.generation} />
)}
```

#### Task 3.6: Strict Auth in Submissions Page ✅ COMPLETED
**File**: `portal/src/pages/submissions/SubmissionsPage.tsx`

```typescript
const { loginEnabled, isNibLinked, nibPerson } = usePortalMode();

// Logic:
// 1. Login Enabled: Current behavior (need auth + linked person)
// 2. Login Disabled + NIB Linked: Allow submission with NIB as reporter
// 3. Login Disabled + Guest: Show dialog to link NIB first

if (!loginEnabled && !isNibLinked) {
  return (
    <DisabledFeatureDialog
      title="Fitur Lapor Data"
      message="Untuk melaporkan data, Anda perlu menautkan NIB terlebih dahulu."
      action={
        <Button onClick={openNibLinkDrawer}>
          Tautkan NIB Sekarang
        </Button>
      }
    />
  );
}

// If NIB linked (login disabled) or authenticated + linked (login enabled)
// Show full submission form with appropriate reporter identity
const reporterName = loginEnabled ? user?.name : nibPerson?.full_name;
const reporterPersonId = loginEnabled ? user?.person_id : nibPerson?.id;
```

#### Task 3.7: Modify Profile Page ✅ COMPLETED
**File**: `portal/src/pages/profile/ProfilePage.tsx`

```typescript
const { loginEnabled, linkedPerson } = usePortalMode();

if (!loginEnabled) {
  // Simplified profile: only show linked person data
  return (
    <SimplifiedProfileView person={linkedPerson} />
    // No edit options, no logout button
  );
}

// Current full profile for logged-in users
```

#### Task 3.8: Remove Blur Overlay in NIB-Only Mode ✅ COMPLETED
**Files to modify**:
- `portal/src/pages/silsilah/SilsilahPage.tsx`
- `portal/src/pages/silsilah/BranchPage.tsx`
- `portal/src/pages/calendar/CalendarPage.tsx`
- `portal/src/pages/submissions/SubmissionsPage.tsx`

```typescript
const { shouldShowBlurOverlay } = usePortalMode();

// Only show blur if login is enabled AND user is not linked
{shouldShowBlurOverlay && <UnlinkedOverlay />}
```

### Phase 4: Public-Web Adjustments

Ketika modul login dinonaktifkan, public-web perlu menyesuaikan CTA dan label.

#### Task 4.1: Fetch Portal Mode Settings ✅ COMPLETED
**File**: `public-web/src/hooks/usePortalMode.ts`

```typescript
// Fetch settings from backend
export function usePortalMode() {
  const { data } = useQuery({
    queryKey: ['portal-mode'],
    queryFn: () => api.get('/portal/settings/mode'),
    staleTime: 5 * 60 * 1000, // 5 menit
  });
  
  return {
    loginEnabled: data?.login_enabled ?? true,
  };
}
```

#### Task 4.2: Update CTA Labels ✅ COMPLETED
**Files to modify**:
- `public-web/src/pages/HomePage.tsx`
- `public-web/src/pages/AboutPage.tsx`
- `public-web/src/pages/EventsPage.tsx`
- `public-web/src/pages/NewsPage.tsx`
- `public-web/src/components/Layout.tsx`

**Changes**:
```typescript
const { loginEnabled } = usePortalMode();

// Hero CTA button
href={loginEnabled ? `${PORTAL_URL}/login` : PORTAL_URL}
label={loginEnabled ? 'Login ke Portal' : 'Masuk ke Portal'}

// Register link
{loginEnabled && (
  <a href={`${PORTAL_URL}/register`}>Daftar Akun</a>
)}

// Navbar
label={loginEnabled ? 'Login' : 'Portal'}

// Footer Portal section
{loginEnabled ? (
  <>
    <a href={`${PORTAL_URL}/login`}>Login</a>
    <a href={`${PORTAL_URL}/register`}>Daftar</a>
  </>
) : (
  <a href={PORTAL_URL}>Masuk ke Portal</a>
)}
```

#### Task 4.3: Update CTA Section Text (HomePage) ✅ COMPLETED
```typescript
// Before (login enabled):
title: 'Bergabung dengan Portal Keluarga'
subtitle: 'Akses silsilah lengkap, daftar acara, dan tetap terhubung dengan keluarga besar.'

// After (login disabled):
title: 'Jelajahi Portal Keluarga'
subtitle: 'Akses silsilah lengkap, daftar acara, dan tetap terhubung dengan keluarga besar. Tautkan NIB Anda untuk pengalaman personal.'
```

### Phase 5: NIB Session Management

#### Task 5.1: NIB Session Storage ✅ COMPLETED
**File**: `portal/src/services/nibSession.ts`

```typescript
// Store NIB link in localStorage (no auth session)
interface NibSession {
  nib: string;
  personId: number;
  personName: string;
  linkedAt: string;
}

export function saveNibSession(session: NibSession): void;
export function getNibSession(): NibSession | null;
export function clearNibSession(): void;
```

#### Task 5.2: Update API Client ✅ COMPLETED
**File**: `portal/src/features/silsilah/api/silsilahApi.ts`

```typescript
// Add NIB-based endpoints
async linkNib(nib: string): Promise<NibLinkResponse>;
async validateNib(nib: string): Promise<NibValidationResponse>;
async getMeByNib(): Promise<MeResponse>; // Uses NIB from session
```

---

## 📁 File Changes Summary

### New Files
```
backend/
├── app/Services/NibService.php
├── app/Http/Controllers/Api/Portal/NibController.php

portal/
├── src/hooks/usePortalMode.ts
├── src/pages/nib/LinkNibPage.tsx              # Halaman link NIB
├── src/components/NibGuideDrawer.tsx          # Drawer panduan NIB
├── src/components/RootRelationshipBadge.tsx   # Badge untuk guest mode
├── src/components/DisabledFeatureDialog.tsx   # Dialog fitur disabled
├── src/components/SimplifiedProfileView.tsx   # Profile tanpa edit
├── src/services/nibSession.ts                 # LocalStorage session
├── src/utils/nib.ts                           # NIB formatting

public-web/
├── src/hooks/usePortalMode.ts                 # Fetch portal mode settings

admin/
├── src/components/settings/PortalAuthSection.tsx  # Section untuk Portal Auth settings
```

### Modified Files
```
backend/
├── database/seeders/SiteSettingSeeder.php
├── app/Services/RelationshipService.php
├── app/Providers/RouteServiceProvider.php     # Rate limiter config
├── routes/api.php

portal/
├── src/components/AuthGuard.tsx
├── src/pages/silsilah/PersonDetailPage.tsx
├── src/pages/silsilah/SilsilahPage.tsx
├── src/pages/silsilah/BranchPage.tsx
├── src/pages/submissions/SubmissionsPage.tsx
├── src/pages/calendar/CalendarPage.tsx
├── src/pages/profile/ProfilePage.tsx
├── src/pages/home/HomePage.tsx
├── src/features/silsilah/api/silsilahApi.ts
├── src/App.tsx                               # Add /nib/link route

public-web/
├── src/pages/HomePage.tsx                     # CTA labels
├── src/pages/AboutPage.tsx                    # CTA labels
├── src/pages/EventsPage.tsx                   # CTA labels
├── src/pages/NewsPage.tsx                     # CTA labels
├── src/components/Layout.tsx                  # Navbar & footer labels

admin/
├── src/pages/settings/SettingsLayout.tsx      # Add Portal tab
```

---

## 🧪 Testing Checklist

### Mode A: Login Enabled (Current Behavior)
- [ ] User tanpa login di-redirect ke login page
- [ ] User login tapi belum link → blur overlay muncul
- [ ] User login dan sudah link → full access
- [ ] Relationship menampilkan panggilan relatif (Pakde, Bulik)
- [ ] Lapor data berfungsi dengan identitas reporter

### Mode B: Login Disabled (NIB-Only)

#### Guest (Tanpa NIB)
- [ ] User bisa akses portal tanpa login
- [ ] Blur overlay TIDAK muncul
- [ ] Menu login/logout TIDAK muncul
- [ ] Relationship menampilkan perspektif ROOT (anak, cucu, cicit)
- [ ] Lapor data menampilkan dialog "Tautkan NIB dulu"
- [ ] Tombol "Tautkan NIB" tersedia dan membuka drawer

#### NIB-Linked
- [ ] NIB validation bekerja dengan benar
- [ ] NIB guide drawer menampilkan penjelasan per-segment
- [ ] Setelah tautkan NIB:
  - [ ] Relationship menampilkan perspektif NIB (Pakde, Bulik, dll)
  - [ ] Panggilan keluarga sesuai NIB yang diinputkan
  - [ ] Jalur hubungan keluarga relatif tersedia
  - [ ] Lapor data berfungsi dengan identitas dari NIB
- [ ] Profile page simplified (tanpa edit, tanpa logout)
- [ ] NIB session persists di localStorage
- [ ] "Hapus Tautan NIB" berfungsi untuk reset

### Admin Panel
- [ ] Toggle login enabled/disabled works
- [ ] Toggle reflects immediately di portal
- [ ] Settings tersimpan di database

### Public-Web (Mode B: Login Disabled)
- [ ] CTA button berubah dari "Login ke Portal" menjadi "Masuk ke Portal"
- [ ] Link "Daftar" di-hide
- [ ] Navbar button berubah dari "Login" menjadi "Portal"
- [ ] Footer section Portal menampilkan "Masuk ke Portal" saja (tanpa Login/Daftar)
- [ ] CTA section text berubah sesuai mode

---

## 🔐 Security Considerations

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| NIB bisa ditebak | Seseorang bisa claim identitas orang lain | Pembatasan klaim NIB (hanya jika diizinkan admin) |
| Session theft | NIB session dicuri dari browser | Short expiry (7 hari), device fingerprint (future) |
| No audit trail | Tidak tahu siapa akses apa | Log NIB session creation dengan timestamp |
| Bulk enumeration | Bot mencoba semua NIB | Rate limiting pada endpoint link |

### Recommended: Rate Limiting

```php
// app/Http/Controllers/Api/Portal/NibController.php
public function link(Request $request)
{
    // Rate limit: 5 attempts per IP per minute
    $key = 'nib_link:' . $request->ip();
    
    if (RateLimiter::tooManyAttempts($key, 5)) {
        return response()->json([
            'error' => 'Terlalu banyak percobaan. Coba lagi dalam 1 menit.'
        ], 429);
    }
    
    RateLimiter::hit($key, 60);
    
    // ... validation logic
}
```

---

## 📅 Implementation Timeline

| Phase | Tasks | Estimated Duration |
|-------|-------|-------------------|
| Phase 1 | Backend Foundation | 2-3 hours |
| Phase 2 | Admin Panel | 1-2 hours |
| Phase 3 | Portal Frontend | 4-6 hours |
| Phase 4 | Public-Web Adjustments | 1-2 hours |
| Phase 5 | NIB Session Management | 1-2 hours |
| Testing | All modes & edge cases | 2-3 hours |
| **Total** | | **11-18 hours** |

---

## 🚀 Deployment Notes

1. **Database Migration**: Jalankan seeder untuk menambah site settings baru
2. **Feature Flag**: Default `portal.login_enabled = true` untuk backward compatibility
3. **Gradual Rollout**: Test di staging dulu sebelum production
4. **User Communication**: Informasikan user tentang perubahan via berita/announcement

---

## 📚 References

- [FamilySearch Privacy Practices](https://www.familysearch.org/privacy)
- [Ancestry Tree Privacy Settings](https://support.ancestry.com/s/article/Privacy-Settings)
