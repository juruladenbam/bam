<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IslamicHoliday extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'name',
        'name_arabic',
        'hijri_month',
        'hijri_day',
        'duration_days',
        'description',
        'is_active',
    ];

    protected $casts = [
        'hijri_month' => 'integer',
        'hijri_day' => 'integer',
        'duration_days' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Scope to get only active holidays
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get holidays for a specific Hijri month
     */
    public function scopeForMonth($query, int $month)
    {
        return $query->where('hijri_month', $month);
    }
}
