<?php

use App\Http\Controllers\Api\Admin\PersonController;
use App\Http\Controllers\Api\Admin\MarriageController;
use App\Http\Controllers\Api\Admin\BranchController;
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

// Branches
Route::get('/branches', [BranchController::class, 'index']);
Route::get('/branches/{id}', [BranchController::class, 'show']);

// Persons CRUD
Route::get('/persons/search', [PersonController::class, 'search']);
Route::apiResource('persons', PersonController::class);

// Marriages CRUD
Route::get('/marriages/check-internal', [MarriageController::class, 'checkInternal']);
Route::get('/marriages/{id}/children', [MarriageController::class, 'children']);
Route::post('/marriages/{id}/children', [MarriageController::class, 'addChild']);
Route::apiResource('marriages', MarriageController::class);
