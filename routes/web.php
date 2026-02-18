<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'active', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('users', App\Http\Controllers\UserController::class);
    Route::resource('roles', App\Http\Controllers\RoleController::class);

    Route::get('preferences', [App\Http\Controllers\PreferenceController::class, 'index'])->name('preferences.index');
    Route::post('preferences', [App\Http\Controllers\PreferenceController::class, 'update'])->name('preferences.update');

    Route::resource('brands', App\Http\Controllers\BrandController::class);
    Route::resource('categories', App\Http\Controllers\CategoryController::class);
    Route::resource('uoms', App\Http\Controllers\UomController::class);
    Route::resource('destinations', App\Http\Controllers\DestinationController::class);
    Route::resource('charges', App\Http\Controllers\ChargeController::class);
    Route::resource('currencies', App\Http\Controllers\CurrencyController::class);

    Route::resource('materials', App\Http\Controllers\MaterialController::class);
    Route::resource('vendors', App\Http\Controllers\VendorController::class);
    Route::resource('customers', App\Http\Controllers\CustomerController::class);

    // Private file access
    Route::get('file', [App\Http\Controllers\FileController::class, 'show'])->name('file.show');
});

require __DIR__.'/settings.php';
