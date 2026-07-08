<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommitteeMember extends Model
{
    protected $fillable = [
        'committee_division_id',
        'person_id',
        'role',
        'responsibilities',
        'sort_order',
    ];

    public function division(): BelongsTo
    {
        return $this->belongsTo(CommitteeDivision::class, 'committee_division_id');
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }
}
