<?php

use App\Http\Controllers\Api\Guest\AuthController;
use App\Http\Controllers\Api\Guest\EventController;
use App\Http\Controllers\Api\Guest\NewsController;
use App\Http\Controllers\Api\Guest\HomeController;
use App\Http\Controllers\Api\Guest\AboutController;
use App\Http\Controllers\Api\Guest\HomeContentController;
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
Route::get('/check', [AuthController::class, 'check']);

// Public Content
Route::get('/home', [HomeController::class, 'index']);
Route::get('/branches', [HomeController::class, 'branches']);
Route::get('/about', [AboutController::class, 'index']);
Route::get('/home-content', [HomeContentController::class, 'index']);

// Events
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{slug}', [EventController::class, 'show']);

// News
Route::get('/news/headlines', [NewsController::class, 'headlines']);
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{slug}', [NewsController::class, 'show']);
Route::post('/news/{id}/clap', [NewsController::class, 'clap']);


