<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskTemplate extends Model
{
    protected $fillable = [
        'title',
        'description',
        'division_slug',
        'default_priority',
        'sort_order',
    ];
}
