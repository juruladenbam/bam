<?php


use App\Http\Controllers\ShareController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/share/member/{id}', [ShareController::class, 'member'])->name('share.member');
