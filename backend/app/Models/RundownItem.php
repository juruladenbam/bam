<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RundownItem extends Model
{
    protected $fillable = [
        'rundown_id',
        'time_start',
        'time_end',
        'activity_title',
        'description',
        'pic_person_id',
        'location_venue',
        'sort_order',
    ];

    public function rundown(): BelongsTo
    {
        return $this->belongsTo(Rundown::class);
    }

    public function pic(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'pic_person_id');
    }
}
