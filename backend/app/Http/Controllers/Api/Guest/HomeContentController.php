<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class HomeContentController extends Controller
{
    use ApiResponse;

    /**
     * Get all home page content
     */
    public function index(): JsonResponse
    {
        $settings = SiteSetting::getByPrefix('home');

        return $this->success([
            'hero' => [
                'badge' => $settings['hero_badge'] ?? 'Portal Keluarga Resmi',
                'title' => $settings['hero_title'] ?? '',
                'subtitle' => $settings['hero_subtitle'] ?? '',
                'image' => $settings['hero_image'] ?? '',
                'image_year' => $settings['hero_image_year'] ?? 'Sejak 1945',
                'image_caption' => $settings['hero_image_caption'] ?? 'Pertemuan Akbar Keluarga',
                'image_location' => $settings['hero_image_location'] ?? 'Yogyakarta, Indonesia',
            ],
            'features' => [
                'title' => $settings['features_title'] ?? '',
                'subtitle' => $settings['features_subtitle'] ?? '',
                'items' => $settings['features'] ?? [],
            ],
            'legacy' => [
                'title' => $settings['legacy_title'] ?? '',
                'content' => $settings['legacy_content'] ?? '',
                'quote' => $settings['legacy_quote'] ?? '',
                'image' => $settings['legacy_image'] ?? '',
            ],
            'cta' => [
                'title' => $settings['cta_title'] ?? '',
                'subtitle' => $settings['cta_subtitle'] ?? '',
            ],
        ], 'Data halaman beranda');
    }
}
