<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SliderController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin Routes
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/products/sort-positions', [ProductController::class, 'getSortPositions']);
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
    Route::apiResource('products', ProductController::class)->except(['index', 'show']);
    Route::delete('/products/{product}/images/{media}', [ProductController::class, 'deleteImage']);

    // Slider Admin
    Route::get('/admin/sliders', [SliderController::class, 'indexAdmin']);
    Route::post('/sliders', [SliderController::class, 'store']);
    Route::match(['put', 'post'], '/sliders/{slider}', [SliderController::class, 'update']); // POST for file upload (with _method=PUT)
    Route::delete('/sliders/{slider}', [SliderController::class, 'destroy']);
});

// Public Routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/sliders', [SliderController::class, 'index']);
