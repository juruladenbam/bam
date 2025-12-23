<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Marriage extends Model
{
    use HasFactory;

    protected $fillable = [
        'husband_id',
        'wife_id',
        'marriage_date',
        'is_active',
        'divorce_date',
        'is_internal',
        'notes',
    ];

    protected $casts = [
        'marriage_date' => 'date',
        'divorce_date' => 'date',
        'is_active' => 'boolean',
        'is_internal' => 'boolean',
    ];

    public function husband(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'husband_id');
    }

    public function wife(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'wife_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(ParentChild::class);
    }
}
