<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CateringSchedule extends Model
{
    protected $fillable = [
        "event_id",
        "rundown_item_id",
        "time_serve",
        "pic_type",
        "pic_person_id",
        "pic_name",
        "sort_order",
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function rundownItem(): BelongsTo
    {
        return $this->belongsTo(RundownItem::class);
    }

    public function menuItems(): HasMany
    {
        return $this->hasMany(CateringMenuItem::class)->orderBy("sort_order");
    }

    public function getTotalCostAttribute(): float
    {
        return (float) $this->menuItems->sum(
            fn($item) => ($item->portion_count ?? 0) *
                (float) ($item->cost_per_portion ?? 0),
        );
    }
}
