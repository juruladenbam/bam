<?php

use App\Http\Controllers\Api\Guest\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Guest API Routes
|--------------------------------------------------------------------------
| Routes accessible without authentication (public-web frontend)
*/

// Authentication
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
