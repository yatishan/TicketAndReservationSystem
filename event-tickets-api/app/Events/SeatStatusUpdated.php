<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SeatStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $eventId;
    public $seatIds; // 💡 တဦးတည်းခုံမဟုတ်ဘဲ Array အဖြစ် ပြောင်းလိုက်ပါတယ်
    public $status;

    // ကန့်သတ်ချက်တွင် array ဟု သတ်မှတ်ပေးပါမည်
    public function __construct($eventId, array $seatIds, $status)
    {
        $this->eventId = $eventId;
        $this->seatIds = $seatIds;
        $this->status = $status;
    }

    public function broadcastOn()
    {
        return new Channel('event.' . $this->eventId);
    }

    public function broadcastAs()
    {
        return 'SeatStatusUpdated';
    }
}
