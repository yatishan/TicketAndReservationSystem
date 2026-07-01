<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = ['title', 'description', 'location', 'start_time', 'end_time'];

    public function seatTiers()
    {
        return $this->hasMany(SeatTier::class);
    }

    public function seats()
    {
        return $this->hasMany(Seat::class);
    }
}
