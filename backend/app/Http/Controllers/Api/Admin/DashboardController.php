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

    /**
     * Get dashboard statistics
     */
    public function index(): JsonResponse
    {
        $stats = [
            'total_persons' => Person::count(),
            'total_alive' => Person::where('is_alive', true)->count(),
            'total_marriages' => Marriage::count(),
            'total_branches' => Branch::count(),
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
            'recent_persons' => $recentPersons,
            'pending_submissions' => $pendingSubmissions,
        ], 'Admin dashboard stats');
    }
}
