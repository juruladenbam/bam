<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HostRotation extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'host_person_id',
        'year',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'host_person_id');
    }
}
