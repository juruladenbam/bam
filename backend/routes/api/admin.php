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
    $totalPersons = \App\Models\Person::count();
    $totalAlive = \App\Models\Person::where('is_alive', true)->count();
    $totalMarriages = \App\Models\Marriage::count();
    $totalBranches = \App\Models\Branch::count();
    
    // Recent persons (last 5 added)
    $recentPersons = \App\Models\Person::orderBy('created_at', 'desc')
        ->take(5)
        ->get(['id', 'full_name', 'gender', 'created_at']);
    
    return response()->json([
        'success' => true,
        'message' => 'Admin dashboard stats',
        'data' => [
            'stats' => [
                'total_persons' => $totalPersons,
                'total_alive' => $totalAlive,
                'total_marriages' => $totalMarriages,
                'total_branches' => $totalBranches,
            ],
            'recent_persons' => $recentPersons,
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
