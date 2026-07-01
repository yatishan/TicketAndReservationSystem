<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeatTier extends Model
{
    protected $fillable = ['event_id', 'name', 'price'];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function seats()
    {
        return $this->hasMany(Seat::class, 'tier_id');
    }
}
