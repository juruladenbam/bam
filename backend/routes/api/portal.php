<?php

use App\Http\Controllers\Api\Portal\AuthController;
use App\Http\Controllers\Api\Portal\SilsilahController;
use App\Http\Controllers\Api\Portal\PersonController;
use App\Http\Controllers\Api\Portal\RelationshipController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Portal API Routes
|--------------------------------------------------------------------------
| Routes for authenticated members (portal frontend)
| Middleware: auth:sanctum (applied in api.php)
*/

// Auth
Route::get('/me', [AuthController::class, 'me']);
Route::post('/logout', [AuthController::class, 'logout']);

// Silsilah
Route::get('/silsilah', [SilsilahController::class, 'index']);
Route::get('/silsilah/branch/{id}', [SilsilahController::class, 'branch']);
Route::get('/silsilah/tree', [SilsilahController::class, 'tree']);
Route::get('/silsilah/search', [SilsilahController::class, 'search']);

// Persons
Route::get('/persons/{id}', [PersonController::class, 'show']);

// Relationship
Route::get('/relationship/{personId}', [RelationshipController::class, 'calculate']);
