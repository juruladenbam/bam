<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CateringMenuItem extends Model
{
    protected $fillable = [
        "catering_schedule_id",
        "menu_category",
        "menu_name",
        "portion_count",
        "unit",
        "cost_per_portion",
        "is_subsidi",
        "subsidi_source_type",
        "subsidi_source_id",
        "subsidi_source_name",
        "serving_style",
        "equipment_needs",
        "notes",
        "sort_order",
    ];

    protected $casts = [
        "cost_per_portion" => "decimal:2",
        "is_subsidi" => "boolean",
        "equipment_needs" => "array",
    ];

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(
            CateringSchedule::class,
            "catering_schedule_id",
        );
    }

    public function getSubtotalAttribute(): float
    {
        return (float) ($this->portion_count ?? 0) *
            (float) ($this->cost_per_portion ?? 0);
    }
}
