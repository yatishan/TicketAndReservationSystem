<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Event;
use App\Models\Seat;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{

    public function reserveSeats(Request $request): JsonResponse
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'seat_ids' => 'required|array',
            'seat_ids.*' => 'exists:seats,id',
        ]);

        $seatIds = $request->seat_ids;
        $userId = Auth::user()->id;


        return DB::transaction(function () use ($request, $seatIds, $userId) {


            $seats = Seat::whereIn('id', $seatIds)
                ->where('event_id', $request->event_id)
                ->get();

            foreach ($seats as $seat) {

                if ($seat->status === 'booked' || $seat->isLocked()) {
                    return response()->json([
                        'success' => false,
                        'message' => "Seat {$seat->seat_number} is already taken or reserved by someone else."
                    ], 422);
                }
            }


            $lockExpiredAt = Carbon::now()->addMinutes(10);
            Seat::whereIn('id', $seatIds)->update([
                'status' => 'pending',
                'lock_expired_at' => $lockExpiredAt
            ]);

            $totalPrice = $seats->sum(function ($seat) {
                return $seat->tier->price;
            });

            $booking = Booking::create([
                'user_id' => $userId,
                'event_id' => $request->event_id,
                'total_price' => $totalPrice,
                'payment_status' => 'pending'
            ]);

            // Booking Items ထဲ အသေးစိတ် ထည့်မယ်
            foreach ($seats as $seat) {
                BookingItem::create([
                    'booking_id' => $booking->id,
                    'seat_id' => $seat->id,
                    'unit_price' => $seat->tier->price
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Seats reserved for 10 minutes. Please proceed to payment.',
                'booking_id' => $booking->id,
                'total_price' => $totalPrice,
                'expires_at' => $lockExpiredAt
            ]);
        });
    }


    public function confirmBooking(Request $request, $id): JsonResponse
    {
        $request->validate([
            'card_number' => 'required|string|min:16',
            'expiry' => 'required|string',
            'cvv' => 'required|string|min:3',
        ]);

        $booking = Booking::find($id);

        if (!$booking || $booking->payment_status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Invalid or already processed booking.'], 404);
        }


        $bookingItems = $booking->items()->get();

        if ($bookingItems->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'This booking has no seats reserved.'], 422);
        }

        $firstSeat = Seat::find($bookingItems->first()->seat_id);

        if (!$firstSeat || !$firstSeat->isLocked()) {
            $booking->update(['payment_status' => 'cancelled']);
            $seatIds = $bookingItems->pluck('seat_id');
            Seat::whereIn('id', $seatIds)->update(['status' => 'available', 'lock_expired_at' => null]);

            return response()->json(['success' => false, 'message' => 'Reservation expired. Please try again.'], 422);
        }

        DB::transaction(function () use ($booking, $bookingItems) {
            $booking->update(['payment_status' => 'paid']);

            $seatIds = $bookingItems->pluck('seat_id');
            Seat::whereIn('id', $seatIds)->update([
                'status' => 'booked',
                'lock_expired_at' => null
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Payment successful! Your tickets are confirmed.',
            'booking_id' => $booking->id
        ]);
    }

    public function cancelBooking($id): JsonResponse
    {
        $booking = Booking::with('items')->find($id);

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found.'], 404);
        }


        $booking->update(['payment_status' => 'cancelled']);

        $bookingItems = $booking->items()->get();
        $seatIds = $bookingItems->pluck('seat_id');
        Seat::whereIn('id', $seatIds)->update([
            'status' => 'available',
            'lock_expired_at' => null
        ]);

        return response()->json(['success' => true, 'message' => 'Booking cancelled and seats released.']);
    }

    // ... ရှိပြီးသား ကုဒ်များရဲ့ အောက်ခြေတွင် ထည့်ရန် ...

public function getMyBookings(): JsonResponse
{
    $expiredBookings = Booking::where('user_id', Auth::user()->id)
        ->where('payment_status', 'pending')
        ->where('created_at', '<', Carbon::now()->subMinutes(10))
        ->get();


    foreach ($expiredBookings as $expiredBooking) {
        $expiredBooking->update(['payment_status' => 'cancelled']);
    }
    $bookings = Booking::with(['items.seat', 'items.seat.event'])
        ->where('user_id', Auth::user()->id)
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json([
        'success' => true,
        'bookings' => $bookings
    ]);
}

}
