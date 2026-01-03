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

// Auth Routes
Route::get('/me', [\App\Http\Controllers\Api\Portal\AuthController::class, 'me']);
Route::post('/logout', [\App\Http\Controllers\Api\Portal\AuthController::class, 'logout']);

// Dashboard
Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\DashboardController::class, 'index']);

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

// Portal Content Management
Route::apiResource('events', \App\Http\Controllers\Api\Admin\EventController::class);
Route::apiResource('news', \App\Http\Controllers\Api\Admin\NewsController::class);
Route::apiResource('media', \App\Http\Controllers\Api\Admin\MediaController::class);
Route::apiResource('events.schedules', \App\Http\Controllers\Api\Admin\EventScheduleController::class)->shallow();

// User Management
Route::apiResource('users', \App\Http\Controllers\Api\Admin\UserController::class)->except(['store']);

// Submission Approval
Route::get('/submissions', [\App\Http\Controllers\Api\Admin\SubmissionController::class, 'index']);
Route::get('/submissions/{id}', [\App\Http\Controllers\Api\Admin\SubmissionController::class, 'show']);
Route::post('/submissions/{id}/approve', [\App\Http\Controllers\Api\Admin\SubmissionController::class, 'approve']);
Route::post('/submissions/{id}/reject', [\App\Http\Controllers\Api\Admin\SubmissionController::class, 'reject']);

