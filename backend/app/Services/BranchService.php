<?php

namespace App\Services;

use App\Models\Branch;
use App\Repositories\Contracts\BranchRepositoryInterface;
use Illuminate\Support\Collection;

class BranchService
{
    public function __construct(
        protected BranchRepositoryInterface $branchRepository
    ) {
    }

    /**
     * Get all branches
     */
    public function getAllBranches(): Collection
    {
        return $this->branchRepository->all();
    }

    /**
     * Get branch by ID
     */
    public function getBranchById(int $id): Branch
    {
        return $this->branchRepository->findOrFail($id);
    }

    /**
     * Get all branches with statistics
     */
    public function getAllBranchesWithStats(): Collection
    {
        return $this->branchRepository->getAllWithStats();
    }

    /**
     * Get branch with all persons for tree view
     */
    public function getBranchWithPersons(int $id): Branch
    {
        return $this->branchRepository->getWithPersons($id);
    }

    /**
     * Get tree data for all branches (for React Flow)
     */
    public function getTreeData(): array
    {
        $branches = $this->branchRepository->getAllWithStats();

        // Calculate generation stats (including both descendants and spouses)
        $generationStats = \App\Models\Person::whereNotNull('generation')
            ->selectRaw('generation, 
                COUNT(*) as total, 
                SUM(CASE WHEN is_alive = 1 THEN 1 ELSE 0 END) as living,
                SUM(CASE WHEN gender = "male" THEN 1 ELSE 0 END) as male,
                SUM(CASE WHEN gender = "female" THEN 1 ELSE 0 END) as female')
            ->groupBy('generation')
            ->orderBy('generation')
            ->get();

        // Calculate burial place stats for deceased members
        $burialPlaceStats = \App\Models\Person::where('is_alive', 0)
            ->whereNotNull('burial_place')
            ->whereRaw('TRIM(burial_place) != ""')
            ->selectRaw('TRIM(burial_place) as place, COUNT(*) as total')
            ->groupBy('place')
            ->orderByDesc('total')
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
            'burial_place_stats' => $burialPlaceStats,
        ];
    }
}
