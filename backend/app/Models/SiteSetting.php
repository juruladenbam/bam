<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SiteSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
    ];

    /**
     * Get a setting value by key
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = Cache::remember("site_setting.{$key}", 3600, function () use ($key) {
            return static::where('key', $key)->first();
        });

        if (!$setting) {
            return $default;
        }

        return match ($setting->type) {
            'json' => json_decode($setting->value, true),
            'html', 'text' => $setting->value,
            default => $setting->value,
        };
    }

    /**
     * Set a setting value
     */
    public static function setValue(string $key, mixed $value, string $type = 'text'): static
    {
        $processedValue = $type === 'json' ? json_encode($value) : $value;

        $setting = static::updateOrCreate(
            ['key' => $key],
            ['value' => $processedValue, 'type' => $type]
        );

        Cache::forget("site_setting.{$key}");

        return $setting;
    }

    /**
     * Get multiple settings by prefix
     */
    public static function getByPrefix(string $prefix): array
    {
        $settings = static::where('key', 'like', "{$prefix}.%")->get();
        
        $result = [];
        foreach ($settings as $setting) {
            $shortKey = str_replace("{$prefix}.", '', $setting->key);
            $result[$shortKey] = match ($setting->type) {
                'json' => json_decode($setting->value, true),
                default => $setting->value,
            };
        }
        
        return $result;
    }
}

