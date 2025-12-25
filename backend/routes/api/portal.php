<?php

use App\Http\Controllers\Api\Portal\AuthController;
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

// TODO: Add more portal routes
// Route::get('/silsilah', [SilsilahController::class, 'index']);
// Route::get('/persons/{id}', [PersonController::class, 'show']);
