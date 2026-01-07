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
            ],
            'cta' => [
                'title' => $settings['cta_title'] ?? '',
                'subtitle' => $settings['cta_subtitle'] ?? '',
            ],
        ], 'Data halaman beranda');
    }
}
