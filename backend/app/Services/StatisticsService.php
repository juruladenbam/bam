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

        if (!empty($filters['ids'])) {
            $query->whereIn('id', $filters['ids']);
        }

        if (!empty($filters['branch_id'])) {
            $branchIds = is_array($filters['branch_id']) ? $filters['branch_id'] : explode(',', $filters['branch_id']);
            $query->whereIn('branch_id', $branchIds);
        }

        if (!empty($filters['generation'])) {
            $generations = is_array($filters['generation']) ? $filters['generation'] : explode(',', $filters['generation']);
            $query->whereIn('generation', $generations);
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

        $query->leftJoin('branches', 'persons.branch_id', '=', 'branches.id')
            ->select('persons.*');

        return $query->orderBy('branches.order')
            ->orderBy('persons.generation')
            ->orderBy('persons.birth_order')
            ->orderBy('persons.birth_date')
            ->orderBy('persons.full_name')
            ->get();
    }

    /**
     * Get marriages list based on filters for Export or Admin List.
     */
    public function getFilteredMarriages(array $filters = []): Collection
    {
        $query = Marriage::with(['husband.branch', 'wife.branch']);

        if (!empty($filters['ids'])) {
            $query->whereIn('id', $filters['ids']);
        }

        if (isset($filters['is_active'])) {
            if ($filters['is_active']) {
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

        if (isset($filters['is_internal'])) {
            $query->where('is_internal', $filters['is_internal']);
        }

        if (isset($filters['branch_id'])) {
            $branchIds = is_array($filters['branch_id']) ? $filters['branch_id'] : explode(',', $filters['branch_id']);
            $query->where(function($q) use ($branchIds) {
                $q->whereHas('husband', function ($q2) use ($branchIds) {
                    $q2->whereIn('branch_id', $branchIds);
                })->orWhereHas('wife', function ($q2) use ($branchIds) {
                    $q2->whereIn('branch_id', $branchIds);
                });
            });
        }

        if (isset($filters['generation'])) {
            $generations = is_array($filters['generation']) ? $filters['generation'] : explode(',', $filters['generation']);
            $query->where(function($q) use ($generations) {
                $q->whereHas('husband', function ($q2) use ($generations) {
                    $q2->whereIn('generation', $generations);
                })->orWhereHas('wife', function ($q2) use ($generations) {
                    $q2->whereIn('generation', $generations);
                });
            });
        }

        // Join with both spouses and their branches for sorting
        $query->leftJoin('persons as h', 'marriages.husband_id', '=', 'h.id')
            ->leftJoin('branches as hb', 'h.branch_id', '=', 'hb.id')
            ->leftJoin('persons as w', 'marriages.wife_id', '=', 'w.id')
            ->leftJoin('branches as wb', 'w.branch_id', '=', 'wb.id')
            ->select('marriages.*');

        return $query->orderByRaw('COALESCE(hb.order, wb.order)')
            ->orderByRaw('COALESCE(h.generation, w.generation)')
            ->orderByRaw('COALESCE(h.birth_order, w.birth_order)')
            ->orderByRaw('COALESCE(h.birth_date, w.birth_date)')
            ->get();
    }
}
