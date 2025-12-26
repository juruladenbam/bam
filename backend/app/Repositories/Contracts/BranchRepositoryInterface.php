<?php

namespace App\Repositories\Contracts;

use App\Models\Branch;
use Illuminate\Support\Collection;

interface BranchRepositoryInterface
{
    /**
     * Get all branches
     */
    public function all(): Collection;

    /**
     * Find branch by ID
     */
    public function find(int $id): ?Branch;

    /**
     * Find branch by ID or fail
     */
    public function findOrFail(int $id): Branch;

    /**
     * Get all branches with statistics (person count, etc)
     */
    public function getAllWithStats(): Collection;

    /**
     * Get branch with all persons
     */
    public function getWithPersons(int $id): Branch;
}
