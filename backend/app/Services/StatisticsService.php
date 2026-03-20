<?php

namespace App\Services;

use App\Models\Person;
use App\Models\Branch;
use App\Models\Marriage;
use App\Repositories\Contracts\BranchRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class StatisticsService
{
    public function __construct(
        protected BranchRepositoryInterface $branchRepository
    ) {
    }

    /**
     * Get comprehensive statistics for Dashboard and Silsilah view.
     * Includes all members (descendants and spouses).
     */
    public function getComprehensiveStats(): array
    {
        $branches = $this->branchRepository->getAllWithStats();

        // Calculate generation stats (including both descendants and spouses)
        $generationStats = Person::whereNotNull('generation')
            ->selectRaw('generation, 
                COUNT(*) as total, 
                SUM(CASE WHEN is_alive = 1 THEN 1 ELSE 0 END) as living,
                SUM(CASE WHEN gender = "male" THEN 1 ELSE 0 END) as male,
                SUM(CASE WHEN gender = "female" THEN 1 ELSE 0 END) as female')
            ->groupBy('generation')
            ->orderBy('generation')
            ->get();

        return [
            'branches' => $branches,
            'total_descendants' => (int) $branches->sum('persons_count'),
            'total_spouses' => (int) $branches->sum(fn($b) => $b->spouse_count ?? 0),
            'total_living_descendants' => (int) $branches->sum('living_count'),
            'total_living_spouses' => (int) $branches->sum(fn($b) => $b->spouse_living_count ?? 0),
            'total_persons' => (int) $branches->sum('persons_count') + (int) $branches->sum(fn($b) => $b->spouse_count ?? 0),
            'total_living' => (int) $branches->sum('living_count') + (int) $branches->sum(fn($b) => $b->spouse_living_count ?? 0),
            'total_kk_utuh' => (int) $branches->sum(fn($b) => $b->kk_utuh_count ?? 0),
            'total_male' => (int) $branches->sum('male_count'),
            'total_female' => (int) $branches->sum('female_count'),
            'generation_stats' => $generationStats,
            'total_marriages' => Marriage::count(),
            'total_qobilah' => Branch::count(),
        ];
    }

    /**
     * Get personas list based on filters for Export or Admin List.
     */
    public function getFilteredPersons(array $filters = []): Collection
    {
        $query = Person::with([
            'branch',
            'marriagesAsHusband.wife.branch',
            'marriagesAsWife.husband.branch'
        ]);

        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        if (!empty($filters['generation'])) {
            $query->where('generation', $filters['generation']);
        }

        if (isset($filters['gender'])) {
            $query->where('gender', $filters['gender']);
        }

        if (isset($filters['is_alive'])) {
            $query->where('is_alive', $filters['is_alive']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('nickname', 'like', "%{$search}%")
                  ->orWhere('nib', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('generation')->orderBy('full_name')->get();
    }

    /**
     * Get marriages list based on filters for Export or Admin List.
     */
    public function getFilteredMarriages(array $filters = []): Collection
    {
        $query = Marriage::with(['husband.branch', 'wife.branch']);

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['is_internal'])) {
            $query->where('is_internal', $filters['is_internal']);
        }

        if (isset($filters['branch_id'])) {
            $query->whereHas('husband', function ($q) use ($filters) {
                $q->where('branch_id', $filters['branch_id']);
            });
        }

        if (isset($filters['is_complete'])) {
            if ($filters['is_complete']) {
                $query->where('is_active', true)
                    ->whereHas('husband', function($q) { $q->where('is_alive', true); })
                    ->whereHas('wife', function($q) { $q->where('is_alive', true); });
            } else {
                $query->where(function($q) {
                    $q->where('is_active', false)
                      ->orWhereHas('husband', function($q2) { $q2->where('is_alive', false); })
                      ->orWhereHas('wife', function($q2) { $q2->where('is_alive', false); });
                });
            }
        }

        return $query->latest()->get();
    }
}
