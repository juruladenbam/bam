<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\SiteSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class AboutController extends Controller
{
    use ApiResponse;

    /**
     * Get all about page content
     */
    public function index(): JsonResponse
    {
        // Get about settings
        $aboutSettings = SiteSetting::getByPrefix('about');
        
        // Get branches with person count
        $branches = Branch::orderBy('order')
            ->withCount('persons')
            ->get(['id', 'name', 'order', 'description']);

        // Calculate total members
        $totalMembers = $branches->sum('persons_count');
        
        return $this->success([
            'title' => $aboutSettings['title'] ?? 'Bani Abdul Manan',
            'subtitle' => $aboutSettings['subtitle'] ?? '',
            'biography_title' => $aboutSettings['biography_title'] ?? '',
            'biography_content' => $aboutSettings['biography_content'] ?? '',
            'values' => $aboutSettings['values'] ?? [],
            'branches' => $branches,
            'total_members' => $totalMembers,
            'total_branches' => $branches->count(),
        ], 'Data halaman tentang');
    }
}
