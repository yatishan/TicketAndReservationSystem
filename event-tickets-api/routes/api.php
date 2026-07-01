<?php

use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\EventController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/events',[EventController::class,"index"]);
Route::get('/event/{id}',[EventController::class,"show"]);

Route::post('/bookings/reserve', [BookingController::class, 'reserveSeats']);
Route::post('/bookings/{id}/confirm', [BookingController::class, 'confirmBooking']);
Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancelBooking']);
