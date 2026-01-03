<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    use ApiResponse;

    /**
     * Get homepage data
     */
    public function index(): JsonResponse
    {
        $branches = Branch::orderBy('order')->get(['id', 'name', 'order']);
        
        return $this->success([
            'branches_count' => $branches->count(),
            'branches' => $branches,
        ], 'Data homepage');
    }

    /**
     * Get all branches for public display
     */
    public function branches(): JsonResponse
    {
        $branches = Branch::orderBy('order')
            ->withCount('persons')
            ->get();
        
        return $this->success($branches, 'Daftar cabang keluarga');
    }
}
