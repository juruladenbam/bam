<?php

use App\Http\Controllers\Api\Portal\AuthController;
use App\Http\Controllers\Api\Portal\SilsilahController;
use App\Http\Controllers\Api\Portal\PersonController;
use App\Http\Controllers\Api\Portal\RelationshipController;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Portal API Routes
|--------------------------------------------------------------------------
| Routes for authenticated members (portal frontend)
*/

// Public portal routes (no auth required)
// Public portal routes (no auth required)
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

// Protected routes (auth required)
Route::middleware('auth:sanctum')->group(function () {
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

    // Content
    Route::get('/home', [\App\Http\Controllers\Api\Portal\HomeController::class, 'index']);
    Route::get('/events', [\App\Http\Controllers\Api\Portal\EventController::class, 'index']);
    Route::get('/events/{id}', [\App\Http\Controllers\Api\Portal\EventController::class, 'show']);
    Route::get('/news/{id}', [\App\Http\Controllers\Api\Portal\NewsController::class, 'show']);
    Route::post('/news/{id}/clap', [\App\Http\Controllers\Api\Portal\NewsController::class, 'clap']);
    Route::get('/archives', [\App\Http\Controllers\Api\Portal\ArchiveController::class, 'index']);

    // Submissions (Member Data Approval)
    Route::get('/submissions', [\App\Http\Controllers\Api\Portal\SubmissionController::class, 'index']);
    Route::post('/submissions', [\App\Http\Controllers\Api\Portal\SubmissionController::class, 'store']);
    Route::get('/submissions/{id}', [\App\Http\Controllers\Api\Portal\SubmissionController::class, 'show']);
});
