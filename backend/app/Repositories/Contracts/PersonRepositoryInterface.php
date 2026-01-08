<?php

namespace App\Repositories\Contracts;

use App\Models\Person;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface PersonRepositoryInterface
{
    /**
     * Get all persons with optional filters
     */
    public function all(array $filters = []): LengthAwarePaginator;

    /**
     * Find person by ID
     */
    public function find(int $id): ?Person;

    /**
     * Find person by ID or fail
     */
    public function findOrFail(int $id): Person;

    /**
     * Create new person
     */
    public function create(array $data): Person;

    /**
     * Update person
     */
    public function update(int $id, array $data): Person;

    /**
     * Delete person
     */
    public function delete(int $id): bool;

    /**
     * Get persons by branch ID
     */
    public function getByBranch(int $branchId): Collection;

    /**
     * Search persons by name
     */
    public function search(string $query, int $limit = 10, int $offset = 0, ?string $gender = null): Collection;

    /**
     * Get all ancestors of a person (for LCA)
     */
    public function getAncestors(int $personId): Collection;

    /**
     * Get all descendants of a person
     */
    public function getDescendants(int $personId): Collection;

    /**
     * Get person with all relationships loaded
     */
    public function getWithRelationships(int $id): Person;
}
