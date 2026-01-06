<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Multi-frontend API structure:
| - /api/guest/*  → Public (no auth)
| - /api/portal/* → Members (auth required)
| - /api/admin/*  → Admins (auth + admin role)
*/

// Guest routes (no auth) - for public-web
Route::prefix('guest')->group(base_path('routes/api/guest.php'));

// Portal routes - for portal (middleware applied per route inside)
Route::prefix('portal')->group(base_path('routes/api/portal.php'));

// Admin routes (auth + admin role) - for admin
// TODO: Re-enable auth middleware before production
Route::prefix('admin')
    ->middleware(['auth:sanctum', 'admin'])
    ->group(base_path('routes/api/admin.php'));
