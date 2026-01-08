<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class SettingImageController extends Controller
{
    use ApiResponse;

    /**
     * Upload image for a setting key
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'key' => 'required|string',
            'image' => 'required|image|max:5120', // 5MB max
        ]);

        $key = $request->input('key');
        $file = $request->file('image');
        
        // Generate filename
        $filename = $key . '_' . time() . '.' . $file->getClientOriginalExtension();
        
        // Store in public/settings directory
        $path = $file->storeAs('settings', $filename, 'public');
        
        // Generate full URL
        $url = asset('storage/' . $path);
        
        // Save to site_settings
        SiteSetting::setValue($key, $url, 'text');
        
        return $this->success([
            'key' => $key,
            'url' => $url,
        ], 'Gambar berhasil diupload');
    }
    
    /**
     * Delete image for a setting key
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'key' => 'required|string',
        ]);

        $key = $request->input('key');
        $setting = SiteSetting::where('key', $key)->first();
        
        if ($setting && $setting->value) {
            // Extract path from URL and delete file
            $path = str_replace(asset('storage/'), '', $setting->value);
            Storage::disk('public')->delete($path);
            
            // Clear the setting value
            SiteSetting::setValue($key, '', 'text');
        }
        
        return $this->success(null, 'Gambar berhasil dihapus');
    }
}
