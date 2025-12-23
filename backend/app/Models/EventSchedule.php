<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'day_sequence',
        'title',
        'time_start',
        'time_end',
        'description',
    ];

    protected $casts = [
        'time_start' => 'datetime:H:i',
        'time_end' => 'datetime:H:i',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
