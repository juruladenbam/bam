<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
| Routes for admin users (admin frontend)
| Middleware: auth:sanctum, admin (applied in api.php)
*/

// Dashboard
Route::get('/dashboard', function () {
    return response()->json([
        'success' => true,
        'message' => 'Admin dashboard',
        'data' => [
            'welcome' => 'Selamat datang di Admin Panel BAM',
        ],
    ]);
});

// TODO: Add admin CRUD routes
// Route::apiResource('persons', Admin\PersonController::class);
// Route::apiResource('events', Admin\EventController::class);
