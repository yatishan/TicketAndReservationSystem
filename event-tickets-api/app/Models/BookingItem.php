<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingItem extends Model
{
    protected $fillable = ['booking_id', 'seat_id', 'unit_price'];

    public function booking()
    {
        return $this->belongsTo(Booking::class,'booking_id');
    }

    public function seat()
    {
        return $this->belongsTo(Seat::class);
    }
}
