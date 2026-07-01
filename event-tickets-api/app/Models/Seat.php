<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seat extends Model
{
    protected $fillable = ['event_id', 'tier_id', 'seat_number', 'status', 'lock_expired_at'];

    protected $casts = [
        'lock_expired_at' => 'datetime',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function tier()
    {
        return $this->belongsTo(SeatTier::class, 'tier_id');
    }

    // A helpful helper function to check if a seat's lock is active
    public function isLocked(): bool
    {
        return $this->status === 'pending' && $this->lock_expired_at && $this->lock_expired_at->isFuture();
    }
}
