<?php

use App\Http\Controllers\Api\Juruladen\AuthController;
use App\Http\Controllers\Api\Juruladen\CateringController;
use App\Http\Controllers\Api\Juruladen\DivisionController;
use App\Http\Controllers\Api\Juruladen\EventController;
use App\Http\Controllers\Api\Juruladen\GuidelineController;
use App\Http\Controllers\Api\Juruladen\InventoryController;
use App\Http\Controllers\Api\Juruladen\McController;
use App\Http\Controllers\Api\Juruladen\RundownController;
use App\Http\Controllers\Api\Juruladen\TaskController;
use App\Http\Controllers\Api\Juruladen\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Juruladen API Routes
|--------------------------------------------------------------------------
| Base prefix: /api/juruladen
|
| Public routes (no auth):
| - Auth: check-nib, set-password, login, forgot-password
|
| Protected routes (auth:sanctum):
| - Events, Divisions, Tasks, Users, Timeline
*/

// ─── Public Auth Routes ──────────────────────────────────
Route::prefix("auth")->group(function () {
    Route::post("/check-nib", [AuthController::class, "checkNib"]);
    Route::post("/set-password", [AuthController::class, "setPassword"]);
    Route::post("/login", [AuthController::class, "login"]);
    Route::post("/forgot-password", [AuthController::class, "forgotPassword"]);
});

// ─── Protected Routes ────────────────────────────────────
Route::middleware("auth:sanctum")->group(function () {
    // Auth
    Route::post("/auth/logout", [AuthController::class, "logout"]);

    // Events
    Route::get("/events", [EventController::class, "index"]);
    Route::get("/events/{event}", [EventController::class, "show"]);
    Route::patch("/events/{event}/toggle-active", [
        EventController::class,
        "toggleActive",
    ]);

    // Progress & Timeline
    Route::get("/events/{event}/progress", [
        EventController::class,
        "progress",
    ]);
    Route::get("/events/{event}/timeline", [
        EventController::class,
        "timeline",
    ]);

    // Divisions (scoped to event)
    Route::get("/events/{event}/divisions", [
        DivisionController::class,
        "index",
    ]);
    Route::post("/events/{event}/divisions", [
        DivisionController::class,
        "store",
    ]);
    Route::put("/divisions/{division}", [DivisionController::class, "update"]);
    Route::delete("/divisions/{division}", [
        DivisionController::class,
        "destroy",
    ]);

    // Division Members
    Route::post("/divisions/{division}/members", [
        DivisionController::class,
        "addMember",
    ]);
    Route::delete("/divisions/{division}/members/{person}", [
        DivisionController::class,
        "removeMember",
    ]);

    // Tasks (scoped to division)
    Route::get("/divisions/{division}/tasks", [TaskController::class, "index"]);
    Route::post("/divisions/{division}/tasks", [
        TaskController::class,
        "store",
    ]);
    Route::put("/divisions/{division}/tasks/{task}", [
        TaskController::class,
        "update",
    ]);
    Route::delete("/divisions/{division}/tasks/{task}", [
        TaskController::class,
        "destroy",
    ]);
    Route::patch("/tasks/{task}/status", [
        TaskController::class,
        "updateStatus",
    ]);
    Route::post("/tasks/reorder", [TaskController::class, "reorder"]);

    // Rundowns
    Route::get("/events/{event}/rundowns", [RundownController::class, "index"]);
    Route::post("/events/{event}/rundowns", [
        RundownController::class,
        "store",
    ]);
    Route::put("/rundowns/{rundown}", [RundownController::class, "update"]);
    Route::delete("/rundowns/{rundown}", [RundownController::class, "destroy"]);
    Route::post("/rundowns/{rundown}/items", [
        RundownController::class,
        "addItem",
    ]);
    Route::put("/rundowns/{rundown}/items/{item}", [
        RundownController::class,
        "updateItem",
    ]);
    Route::delete("/rundowns/{rundown}/items/{item}", [
        RundownController::class,
        "deleteItem",
    ]);
    Route::post("/rundowns/{rundown}/reorder", [
        RundownController::class,
        "reorderItems",
    ]);

    // Guidelines
    Route::get("/events/{event}/guidelines", [
        GuidelineController::class,
        "index",
    ]);
    Route::put("/events/{event}/guidelines/{type}", [
        GuidelineController::class,
        "update",
    ]);

    // Inventory
    Route::get("/events/{event}/inventory", [
        InventoryController::class,
        "index",
    ]);
    Route::post("/events/{event}/inventory/categories", [
        InventoryController::class,
        "createCategory",
    ]);
    Route::post("/inventory-categories/{category}/items", [
        InventoryController::class,
        "storeItem",
    ]);
    Route::put("/inventory-items/{item}", [
        InventoryController::class,
        "updateItem",
    ]);
    Route::delete("/inventory-items/{item}", [
        InventoryController::class,
        "destroyItem",
    ]);
    Route::patch("/inventory-items/{item}/status", [
        InventoryController::class,
        "updateStatus",
    ]);

    // MC
    Route::get("/events/{event}/mc-assignments", [
        McController::class,
        "index",
    ]);
    Route::post("/events/{event}/mc-assignments", [
        McController::class,
        "store",
    ]);
    Route::put("/mc-assignments/{assignment}", [McController::class, "update"]);
    Route::delete("/mc-assignments/{assignment}", [
        McController::class,
        "destroy",
    ]);

    // Catering
    Route::get("/events/{event}/catering", [
        CateringController::class,
        "index",
    ]);
    Route::post("/events/{event}/catering", [
        CateringController::class,
        "store",
    ]);
    Route::put("/catering/{schedule}", [CateringController::class, "update"]);
    Route::delete("/catering/{schedule}", [
        CateringController::class,
        "destroy",
    ]);

    // Catering Menu Items
    Route::post("/catering/{schedule}/menu-items", [
        CateringController::class,
        "addMenuItem",
    ]);
    Route::put("/catering-menu-items/{item}", [
        CateringController::class,
        "updateMenuItem",
    ]);
    Route::delete("/catering-menu-items/{item}", [
        CateringController::class,
        "deleteMenuItem",
    ]);

    // User Management
    Route::get("/users", [UserController::class, "index"]);
    Route::post("/users", [UserController::class, "store"]);
    Route::post("/users/{user}/reset-password", [
        UserController::class,
        "resetPassword",
    ]);
    Route::delete("/users/{user}", [UserController::class, "destroy"]);
    Route::get("/users/search-person", [UserController::class, "searchPerson"]);
});
