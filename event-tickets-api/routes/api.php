<?php

use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/events',[EventController::class,"index"]);
Route::get('/event/{id}',[EventController::class,"show"]);


Route::post('/bookings/{id}/confirm', [BookingController::class, 'confirmBooking']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/bookings/reserve', [BookingController::class, 'reserveSeats']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancelBooking']);
    Route::get('/my-bookings', [BookingController::class, 'getMyBookings']);

});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
 Route::get('/ticket/{token}/qrcode', [BookingController::class, 'generateQrCode']);
 Route::post('/admin/verify-ticket/{token}', [BookingController::class, 'verifyTicket']);

//admin
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/admin/events', function () {
        return response()->json(['message' => 'မင်္ဂလာပါ Admin၊ သင်သည် ပွဲအသစ်များ ဖန်တီးနိုင်ပါပြီ။']);
    });
    Route::post('/admin/events', [EventController::class, 'createEvent']);

    Route::post('/admin/tiers', [EventController::class, 'createTier']);
    Route::delete('/admin/events/{id}', [EventController::class, 'deleteEvent']);
    Route::put('/admin/events/{id}', [EventController::class, 'updateEvent']);

    Route::get('/admin/tiers', [EventController::class, 'getTiers']);
    Route::put('/admin/tiers/{id}', [EventController::class, 'updateTier']);
    Route::delete('/admin/tiers/{id}', [EventController::class, 'deleteTier']);
    Route::get('/admin/sales', [EventController::class, 'getSalesDashboard']);

    Route::get('/admin/users', [EventController::class, 'getUsers']);
    Route::put('/admin/users/{id}/toggle-status', [EventController::class, 'toggleUserStatus']);

    Route::put('/admin/bookings/{id}/status', [BookingController::class, 'updatePaymentStatus']);
});
