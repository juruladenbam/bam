<?php

namespace App\Repositories\Contracts;

use App\Models\Marriage;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface MarriageRepositoryInterface
{
    /**
     * Get all marriages with optional filters
     */
    public function all(array $filters = []): LengthAwarePaginator;

    /**
     * Find marriage by ID
     */
    public function find(int $id): ?Marriage;

    /**
     * Find marriage by ID or fail
     */
    public function findOrFail(int $id): Marriage;

    /**
     * Create new marriage
     */
    public function create(array $data): Marriage;

    /**
     * Update marriage
     */
    public function update(int $id, array $data): Marriage;

    /**
     * Delete marriage
     */
    public function delete(int $id): bool;

    /**
     * Get all marriages of a person
     */
    public function getByPerson(int $personId): Collection;

    /**
     * Get children of a marriage
     */
    public function getChildren(int $marriageId): Collection;

    /**
     * Add child to marriage
     */
    public function addChild(int $marriageId, int $childId, int $birthOrder = 1): void;

    /**
     * Check if marriage is internal (between relatives)
     */
    public function isInternal(int $husbandId, int $wifeId): bool;
}
