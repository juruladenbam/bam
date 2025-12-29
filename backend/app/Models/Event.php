<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'type',
        'year',
        'start_date',
        'end_date',
        'description',
        'location_name',
        'location_maps_url',
        'is_active',
        'meta_data',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'meta_data' => 'array',
    ];

    public function schedules(): HasMany
    {
        return $this->hasMany(EventSchedule::class)->orderBy('day_sequence')->orderBy('time_start');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function hostRotations(): HasMany
    {
        return $this->hasMany(HostRotation::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(MediaGallery::class);
    }
}
