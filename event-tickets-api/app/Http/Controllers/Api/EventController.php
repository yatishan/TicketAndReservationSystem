<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Seat;
use App\Models\SeatTier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(): JsonResponse
    {

        $events = Event::select('id', 'title', 'description', 'location', 'start_time', 'end_time')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    public function show($id): JsonResponse
    {
        $event = Event::with(['seatTiers', 'seats'])->find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'event' => [
                    'id' => $event->id,
                    'title' => $event->title,
                    'description' => $event->description,
                    'location' => $event->location,
                    'start_time' => $event->start_time,
                ],
                'tiers' => $event->seatTiers,
                'seats' => $event->seats->map(function ($seat) {
                    return [
                        'id' => $seat->id,
                        'tier_id' => $seat->tier_id,
                        'seat_number' => $seat->seat_number,

                        'status' => $seat->isLocked() ? 'pending' : ($seat->status === 'pending' ? 'available' : $seat->status),
                    ];
                }),
            ]
        ]);
    }

    // (က) ပွဲအသစ် သီးသန့်ဆောက်မည့် Function
public function createEvent(Request $request): JsonResponse
{
    $request->validate([
        'title'      => 'required|string|max:255',
        'location'   => 'required|string|max:255',
        'start_time' => 'required|date',
        'end_time'   => 'required|date|after:start_time',
        'description'=> 'required|string'
    ]);

    $event = Event::create([
        'title'      => $request->title,
        'location'   => $request->location,
        'start_time' => $request->start_time,
        'end_time'   => $request->end_time,
        'description' => $request->description
    ]);

    return response()->json([
        'success' => true,
        'message' => '📅 ပွဲအသစ်ကို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ။ ခုံအမျိုးအစားများ ဆက်လက်ဖန်တီးနိုင်ပါပြီ။',
        'event_id'=> $event->id
    ], 201);
}

// (ခ) ⭐ သင်အလိုရှိသော Tier နှင့် Seats သီးသန့်ဆောက်မည့် Function
public function createTier(Request $request): JsonResponse
{
    $request->validate([
        'event_id' => 'required|exists:events,id',
        'name'     => 'required|string|max:255',
        'price'    => 'required|numeric|min:0',
        'count'    => 'required|integer|min:1',
    ]);

    // ၁။ Seat Tier ကို အရင်ဆောက်မယ်
    $tier = SeatTier::create([
        'event_id' => $request->event_id,
        'name'     => $request->name,
        'price'    => $request->price
    ]);

    // ၂။ ထို Tier အောက်မှာ အရေအတွက်အတိုင်း ခုံ (Seats) များကို Loop ပတ်ဆောက်မယ်
    $prefix = strtoupper(substr($request->name, 0, 1));

    for ($i = 1; $i <= $request->count; $i++) {
        Seat::create([
            'tier_id' => $tier->id,
            'event_id'=> $request->event_id,
            'seat_number'  => $prefix . '-' . $i,
        ]);
    }

    return response()->json([
        'success' => true,
        'message' => "🎉 {$request->name} Tier နှင့် ခုံပေါင်း {$request->count} ခုကို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီဗျာ။"
    ], 201);
}
}
