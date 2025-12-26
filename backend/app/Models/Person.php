<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Person extends Model
{
    use HasFactory;

    protected $table = 'persons';

    protected $fillable = [
        'legacy_id',
        'full_name',
        'nickname',
        'gender',
        'birth_date',
        'birth_place',
        'death_date',
        'is_alive',
        'photo_url',
        'phone',
        'address',
        'occupation',
        'bio',
        'generation',
        'birth_order',
        'branch_id',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'death_date' => 'date',
        'is_alive' => 'boolean',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    // Pernikahan sebagai suami
    public function marriagesAsHusband(): HasMany
    {
        return $this->hasMany(Marriage::class, 'husband_id');
    }

    // Pernikahan sebagai istri
    public function marriagesAsWife(): HasMany
    {
        return $this->hasMany(Marriage::class, 'wife_id');
    }

    // Semua pernikahan (kombinasi keduanya)
    public function marriages()
    {
        return Marriage::where('husband_id', $this->id)
            ->orWhere('wife_id', $this->id);
    }

    // Anak-anak (melalui relasi parent_child)
    public function childRelations(): HasMany
    {
        return $this->hasMany(ParentChild::class, 'marriage_id')
            ->whereHas('marriage', function ($query) {
                $query->where('husband_id', $this->id)
                    ->orWhere('wife_id', $this->id);
            });
    }

    // Mendapatkan pasangan (spouse/spouses)
    public function getSpousesAttribute()
    {
        $spouses = collect();

        foreach ($this->marriagesAsHusband as $marriage) {
            $spouses->push($marriage->wife);
        }

        foreach ($this->marriagesAsWife as $marriage) {
            $spouses->push($marriage->husband);
        }

        return $spouses;
    }

    // Mendapatkan orang tua
    public function getParentsAttribute()
    {
        $parentChild = ParentChild::where('child_id', $this->id)->first();

        if (!$parentChild) {
            return collect();
        }

        $marriage = $parentChild->marriage;
        return collect([$marriage->husband, $marriage->wife])->filter();
    }
}
