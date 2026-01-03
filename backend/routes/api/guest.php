<?php

use App\Http\Controllers\Api\Guest\AuthController;
use App\Http\Controllers\Api\Guest\EventController;
use App\Http\Controllers\Api\Guest\NewsController;
use App\Http\Controllers\Api\Guest\HomeController;
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

// Public Content
Route::get('/home', [HomeController::class, 'index']);
Route::get('/branches', [HomeController::class, 'branches']);

// Events
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{slug}', [EventController::class, 'show']);

// News
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{slug}', [NewsController::class, 'show']);

