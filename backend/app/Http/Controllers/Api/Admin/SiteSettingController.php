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
            $result[] = [
                'id' => $setting->id,
                'key' => $setting->key,
                'value' => $setting->type === 'json' ? json_decode($setting->value, true) : $setting->value,
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
            'type' => 'sometimes|in:text,html,json',
        ]);

        $setting = SiteSetting::where('key', $key)->first();
        
        if (!$setting) {
            $setting = new SiteSetting(['key' => $key]);
        }

        $type = $validated['type'] ?? $setting->type ?? 'text';
        $value = $type === 'json' ? json_encode($validated['value']) : $validated['value'];

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
            'settings.*.type' => 'sometimes|in:text,html,json',
        ]);

        $updated = [];
        foreach ($validated['settings'] as $item) {
            $fullKey = str_starts_with($item['key'], "{$prefix}.") 
                ? $item['key'] 
                : "{$prefix}.{$item['key']}";
            
            $type = $item['type'] ?? 'text';
            $value = $type === 'json' ? json_encode($item['value']) : $item['value'];

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
