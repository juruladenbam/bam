<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Person;
use App\Models\Marriage;
use App\Models\Branch;
use App\Models\Submission;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected \App\Services\StatisticsService $statisticsService
    ) {
    }

    /**
     * Get dashboard statistics
     */
    public function index(): JsonResponse
    {
        $compStats = $this->statisticsService->getComprehensiveStats();
        
        $stats = [
            'total_persons' => $compStats['total_persons'],
            'total_alive' => $compStats['total_living'],
            'total_marriages' => $compStats['total_marriages'],
            'total_branches' => $compStats['total_qobilah'],
            'total_male' => $compStats['total_male'],
            'total_female' => $compStats['total_female'],
            'total_descendants' => $compStats['total_descendants'],
            'total_spouses' => $compStats['total_spouses'],
            'total_kk_utuh' => $compStats['total_kk_utuh'],
            'pending_submissions' => Submission::pending()->count(),
        ];
        
        $recentPersons = Person::orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'full_name', 'gender', 'created_at']);
        
        $pendingSubmissions = Submission::pending()
            ->with('user:id,name')
            ->latest()
            ->take(5)
            ->get();
        
        return $this->success([
            'stats' => $stats,
            'generation_stats' => $compStats['generation_stats'],
            'branch_stats' => $compStats['branches'],
            'recent_persons' => $recentPersons,
            'pending_submissions' => $pendingSubmissions,
        ], 'Admin dashboard stats');
    }
}
