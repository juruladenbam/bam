<?php

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SilsilahController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// URL::forceScheme('https');

Route::get('/', [SilsilahController::class,'index'])->name('home');
Route::get('/data', [SilsilahController::class,'getData'])->name('getData');
Route::get('/input', [SilsilahController::class,'create'])->name('inputSilsilah');
Route::get('/input/parent', [SilsilahController::class,'getParent'])->name('getParent');
Route::get('/input/people', [SilsilahController::class,'getPeople'])->name('getPeople');
Route::post('/input/submit', [SilsilahController::class,'store'])->name('simpanSilsilah');
