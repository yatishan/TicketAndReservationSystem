<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Event;
use App\Models\SeatTier;
use App\Models\Seat;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $event = Event::create([
            'title' => 'Moonlight Pop Music Festival 2026',
            'description' => 'The biggest live music festival of the year featuring top artists.',
            'location' => 'Thuwunna National Indoor Stadium, Yangon',
            'start_time' => Carbon::now()->addDays(30)->setTime(18, 0),
            'end_time' => Carbon::now()->addDays(30)->setTime(23, 0),
        ]);

        $vipTier = SeatTier::create([
            'event_id' => $event->id,
            'name' => 'VIP Experience',
            'price' => 70000.00, 
        ]);

        $standardTier = SeatTier::create([
            'event_id' => $event->id,
            'name' => 'Standard Seat',
            'price' => 30000.00,
        ]);

        for ($i = 1; $i <= 20; $i++) {
            Seat::create([
                'event_id' => $event->id,
                'tier_id' => $vipTier->id,
                'seat_number' => 'V-' . $i,
                'status' => 'available',
            ]);
        }

        for ($i = 1; $i <= 30; $i++) {
            Seat::create([
                'event_id' => $event->id,
                'tier_id' => $standardTier->id,
                'seat_number' => 'S-' . $i,
                'status' => 'available',
            ]);
        }
    }
}
