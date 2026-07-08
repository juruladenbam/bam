<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommitteeTask extends Model
{
    protected $fillable = [
        'committee_division_id',
        'parent_task_id',
        'title',
        'description',
        'status',
        'priority',
        'deadline',
        'assignee_id',
        'created_by',
        'sort_order',
    ];

    protected $casts = [
        'deadline' => 'datetime',
    ];

    public function division(): BelongsTo
    {
        return $this->belongsTo(CommitteeDivision::class, 'committee_division_id');
    }

    public function parentTask(): BelongsTo
    {
        return $this->belongsTo(CommitteeTask::class, 'parent_task_id');
    }

    public function subTasks(): HasMany
    {
        return $this->hasMany(CommitteeTask::class, 'parent_task_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'assignee_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope for timeline — filter by month if provided.
     */
    public function scopeForTimeline($query, ?string $month = null, ?string $division = null, ?string $status = null)
    {
        if ($month) {
            $query->whereYear('deadline', substr($month, 0, 4))
                  ->whereMonth('deadline', substr($month, 5, 2));
        }

        if ($division) {
            $query->whereHas('division', fn ($q) => $q->where('slug', $division));
        }

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderBy('deadline')->orderBy('sort_order');
    }
}
