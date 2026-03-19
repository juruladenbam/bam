<?php


use App\Http\Controllers\ShareController;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/share/member/{id}', [ShareController::class, 'member'])->name('share.member');

Route::get('/sync-spouses', function () {
    Artisan::call('silsilah:sync-spouse-generation');
    return "Sinkronisasi selesai! <br><pre>" . Artisan::output() . "</pre>";
});