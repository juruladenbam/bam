<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryItem extends Model
{
    protected $fillable = [
        'inventory_category_id',
        'name',
        'quantity_needed',
        'unit',
        'source_type',
        'source_detail',
        'cost_per_unit',
        'assigned_to_person_id',
        'acquisition_status',
        'return_status',
        'notes',
        'sort_order',
    ];

    protected $casts = [
        'cost_per_unit' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(InventoryCategory::class, 'inventory_category_id');
    }

    public function assignedPerson(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'assigned_to_person_id');
    }
}
