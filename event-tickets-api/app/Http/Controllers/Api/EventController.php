<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
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
}
