<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'author_id',
        'slug',
        'title',
        'thumbnail',
        'description',
        'content',
        'category',
        'is_public',
        'is_headline',
        'published_at',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'is_headline' => 'boolean',
        'published_at' => 'datetime',
    ];

    protected $appends = ['thumbnail_url'];

    public function getThumbnailUrlAttribute()
    {
        return $this->thumbnail;
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
