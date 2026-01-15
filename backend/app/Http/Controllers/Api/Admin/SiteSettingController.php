<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteSettingController extends Controller
{
    use ApiResponse;

    /**
     * Parse boolean value from various formats (string 'true'/'false', '1'/'0', or actual boolean)
     */
    private function parseBooleanValue(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }
        if (is_string($value)) {
            return in_array(strtolower($value), ['true', '1', 'yes', 'on'], true);
        }
        return (bool) $value;
    }

    /**
     * Get all site settings
     */
    public function index(): JsonResponse
    {
        $settings = SiteSetting::all()->groupBy(function ($setting) {
            return explode('.', $setting->key)[0];
        });

        return $this->success($settings, 'Daftar pengaturan');
    }

    /**
     * Get settings by prefix (e.g., "about")
     */
    public function show(string $prefix): JsonResponse
    {
        $settings = SiteSetting::where('key', 'like', "{$prefix}.%")->get();
        
        $result = [];
        foreach ($settings as $setting) {
            $value = match($setting->type) {
                'json' => json_decode($setting->value, true),
                'boolean' => (bool) $setting->value,
                'integer' => (int) $setting->value,
                default => $setting->value,
            };
            
            $result[] = [
                'id' => $setting->id,
                'key' => $setting->key,
                'value' => $value,
                'type' => $setting->type,
            ];
        }
        
        return $this->success($result, "Pengaturan {$prefix}");
    }

    /**
     * Update a single setting
     */
    public function update(Request $request, string $key): JsonResponse
    {
        $validated = $request->validate([
            'value' => 'required',
            'type' => 'sometimes|in:text,html,json,boolean,integer',
        ]);

        $setting = SiteSetting::where('key', $key)->first();
        
        if (!$setting) {
            $setting = new SiteSetting(['key' => $key]);
        }

        $type = $validated['type'] ?? $setting->type ?? 'text';
        $value = match($type) {
            'json' => json_encode($validated['value']),
            'boolean' => $this->parseBooleanValue($validated['value']) ? '1' : '0',
            'integer' => (string) intval($validated['value']),
            default => $validated['value'],
        };

        $setting->value = $value;
        $setting->type = $type;
        $setting->save();

        // Clear cache
        cache()->forget("site_setting.{$key}");

        return $this->success($setting, 'Pengaturan berhasil diperbarui');
    }

    /**
     * Bulk update settings by prefix
     */
    public function bulkUpdate(Request $request, string $prefix): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required',
            'settings.*.type' => 'sometimes|in:text,html,json,boolean,integer',
        ]);

        $updated = [];
        foreach ($validated['settings'] as $item) {
            $fullKey = str_starts_with($item['key'], "{$prefix}.") 
                ? $item['key'] 
                : "{$prefix}.{$item['key']}";
            
            $type = $item['type'] ?? 'text';
            $value = match($type) {
                'json' => json_encode($item['value']),
                'boolean' => $this->parseBooleanValue($item['value']) ? '1' : '0',
                'integer' => (string) intval($item['value']),
                default => $item['value'],
            };

            $setting = SiteSetting::updateOrCreate(
                ['key' => $fullKey],
                ['value' => $value, 'type' => $type]
            );

            cache()->forget("site_setting.{$fullKey}");
            $updated[] = $setting;
        }

        return $this->success($updated, 'Pengaturan berhasil diperbarui');
    }
}
