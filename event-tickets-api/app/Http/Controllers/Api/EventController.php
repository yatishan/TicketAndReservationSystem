<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Event;
use App\Models\Seat;
use App\Models\SeatTier;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use function PHPSTORM_META\map;

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
            'description' => 'required|string'
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
            'event_id' => $event->id
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
                'event_id' => $request->event_id,
                'seat_number'  => $prefix . '-' . $i,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => "🎉 {$request->name} Tier နှင့် ခုံပေါင်း {$request->count} ခုကို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီဗျာ။"
        ], 201);
    }

    public function deleteEvent($id): JsonResponse
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['success' => false, 'message' => 'ပွဲစဉ် ရှာမတွေ့ပါဗျာ။'], 404);
        }

        $event->delete(); // ပွဲစဉ်ကို ဖျက်မည်

        return response()->json([
            'success' => true,
            'message' => '🗑️ ပွဲစဉ်ကို အောင်မြင်စွာ ဖျက်ပစ်လိုက်ပါပြီဗျာ။'
        ]);
    }

    public function updateEvent(Request $request, $id): JsonResponse
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'location'    => 'required|string|max:255',
            'start_time'  => 'required|date',
            'end_time'    => 'required|date|after:start_time',
        ]);

        $event = Event::find($id);

        if (!$event) {
            return response()->json(['success' => false, 'message' => 'ပွဲစဉ် ရှာမတွေ့ပါဗျာ။'], 404);
        }

        // ဒေတာများ အစားထိုးပြင်ဆင်မည်
        $event->update([
            'title'       => $request->title,
            'description' => $request->description,
            'location'    => $request->location,
            'start_time'  => $request->start_time,
            'end_time'    => $request->end_time,
        ]);

        return response()->json([
            'success' => true,
            'message' => '📝 ပွဲစဉ်အချက်အလက်များကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီဗျာ။'
        ]);
    }

    public function getTiers(): JsonResponse
{
    // Tier Model ထဲမှာ event()ဆိုတဲ့ Relationship ရေးထားဖို့ လိုအပ်ပါတယ်ဗျာ
    $tiers = SeatTier::with('event','seats')->orderBy('created_at', 'desc')->get();
    return response()->json(['success' => true, 'tiers' => $tiers]);
}

// ၂။ Tier အချက်အလက် (ဈေးနှုန်း/ခုံအရေအတွက်) ပြင်ဆင်ရန်
public function updateTier(Request $request, $id): JsonResponse
{
    $request->validate([
        'name'     => 'required|string|max:255',
        'price'    => 'required|numeric|min:0',
        'capacity' => 'required|integer|min:1',
    ]);

    $tier = SeatTier::find($id);
    if (!$tier) {
        return response()->json(['success' => false, 'message' => 'ခုံအမျိုးအစား ရှာမတွေ့ပါဗျာ။'], 404);
    }

    $newCapacity = (int) $request->capacity;


    $currentSeatsCount = $tier->seats()->count();


    if ($newCapacity < $currentSeatsCount) {
        $seatsToDeleteCount = $currentSeatsCount - $newCapacity;


        $bookedSeatsCount = $tier->seats()->where('status', 'booked')->count();
        if ($newCapacity < $bookedSeatsCount) {
            return response()->json([
                'success' => false,
                'message' => '⚠️ မအောင်မြင်ပါ။ လူကြိုတင်ဝယ်ယူထားသော ခုံအရေအတွက်ထက် နည်း၍ လျှော့ချ၍မရပါဗျာ။'
            ], 422);
        }

        // မဝယ်ရသေးတဲ့ နောက်ဆုံးခုံတွေကို ရွေးပြီး ဖျက်ပစ်မယ်
        $seatsToDelete = $tier->seats()
            ->where('status', 'available')
            ->orderBy('id', 'desc')
            ->take($seatsToDeleteCount)
            ->get();

        foreach ($seatsToDelete as $seat) {
            $seat->delete();
        }
    }

    elseif ($newCapacity > $currentSeatsCount) {
        $seatsToCreateCount = $newCapacity - $currentSeatsCount;

        for ($i = 1; $i <= $seatsToCreateCount; $i++) {
            $seatNumber =strtoupper(substr($request->name, 0, 1));


            $tier->seats()->create([
                'event_id'    => $tier->event_id,
                'seat_number' => $seatNumber.'-'. $i,
                'status'   => 'available'
            ]);
        }
    }

    // 📝 နောက်ဆုံးမှ Tier data ကိုပါ Update လုပ်မယ်
    $tier->update([
        'name'     => $request->name,
        'price'    => $request->price,
    ]);

    return response()->json([
        'success' => true,
        'message' => '🪑 ခုံအမျိုးအစားနှင့် Seats စာရင်းကိုပါ အလိုအလျောက် ညှိနှိုင်းပြင်ဆင်ပြီးပါပြီဗျာ။'
    ]);
}

// ၃။ Tier ကို ဖျက်ပစ်ရန်
public function deleteTier($id): JsonResponse
{
    $tier = SeatTier::find($id);
    if (!$tier) {
        return response()->json(['success' => false, 'message' => 'ခုံအမျိုးအစား ရှာမတွေ့ပါဗျာ။'], 404);
    }

    $tier->delete();
    return response()->json(['success' => true, 'message' => '🗑️ ခုံအမျိုးအစားကို ဖျက်ပစ်လိုက်ပါပြီ။']);
}

public function getSalesDashboard(): JsonResponse
{
    // 💡 items ရော၊ items ထဲက seat ကိုပါ တစ်ခါတည်း Nested ဆွဲယူရန် 'items.seat' ဟု ရေးရပါမည်
    $bookings = Booking::with(['user', 'event', 'items.seat'])
        ->orderBy('created_at', 'desc')
        ->get();

    $totalRevenue = $bookings->sum('total_price');

    // စုစုပေါင်း လက်မှတ်စောင်ရေ ရောင်းရမှု
    $totalTicketsSold = $bookings->sum(function($booking) {
        return $booking->items->count();
    });

    return response()->json([
        'success' => true,
        'total_revenue' => $totalRevenue,
        'total_tickets_sold' => $totalTicketsSold,
        'bookings' => $bookings
    ]);
}

// app/Http/Controllers/BookingController.php ထဲတွင် ထည့်ရန်

// ၁။ User စာရင်းအားလုံးကို ဆွဲထုတ်ရန် (Admin မဟုတ်သူများကိုသာ)
public function getUsers(): JsonResponse
{
    $users = User::where('role', '!=', 'admin') // သင့်စနစ်ထဲက admin role စစ်ဆေးမှုအတိုင်း ရေးနိုင်ပါတယ်
                 ->orderBy('created_at', 'desc')
                 ->get();

    return response()->json(['success' => true, 'users' => $users]);
}

// ၂။ User ကို Block / Unblock ပြုလုပ်ရန်
public function toggleUserStatus($id): JsonResponse
{
    $user = User::find($id);
    if (!$user) {
        return response()->json(['success' => false, 'message' => 'အသုံးပြုသူ ရှာမတွေ့ပါဗျာ။'], 404);
    }

    // လက်ရှိ status ကို ပြောင်းပြန်လှန်လိုက်ခြင်း (True ဖြစ်ရင် False၊ False ဖြစ်ရင် True)
    $user->is_active = !$user->is_active;
    $user->save();

    $statusMessage = $user->is_active ? '🔓 အကောင့်ကို ပြန်လည်ဖွင့်လှစ်ပေးလိုက်ပါပြီ။' : '🔒 အကောင့်ကို ပိတ်ပင် (Block) လိုက်ပါပြီ။';

    return response()->json(['success' => true, 'message' => $statusMessage, 'user' => $user]);
}
}
