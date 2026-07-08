<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommitteeDivision extends Model
{
    protected $fillable = [
        'event_id',
        'name',
        'slug',
        'color',
        'description',
        'sort_order',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(CommitteeMember::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(CommitteeTask::class);
    }

    /**
     * Get task progress as percentage (0-100).
     */
    public function getProgressAttribute(): float
    {
        $total = $this->tasks()->count();
        if ($total === 0) return 0;
        $done = $this->tasks()->where('status', 'done')->count();
        return round(($done / $total) * 100, 1);
    }

    /**
     * Get task count breakdown by status.
     */
    public function getTaskCountsAttribute(): array
    {
        return [
            'total' => $this->tasks()->count(),
            'done' => $this->tasks()->where('status', 'done')->count(),
            'in_progress' => $this->tasks()->where('status', 'in_progress')->count(),
            'todo' => $this->tasks()->where('status', 'todo')->count(),
            'blocked' => $this->tasks()->where('status', 'blocked')->count(),
        ];
    }
}
