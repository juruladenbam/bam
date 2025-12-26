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

        return [
            'branches' => $branches,
            'total_descendants' => $branches->where('order', '<=', 10)->sum('persons_count'),
            'total_spouses' => $branches->where('order', 99)->sum('persons_count'),
            'total_living_descendants' => $branches->where('order', '<=', 10)->sum('living_count'),
            'total_living_spouses' => $branches->where('order', 99)->sum('living_count'),
            'total_persons' => $branches->sum('persons_count'),
            'total_living' => $branches->sum('living_count'),
        ];
    }
}
