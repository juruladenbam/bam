<?php

namespace App\Services;

use App\Models\Marriage;
use App\Repositories\Contracts\MarriageRepositoryInterface;
use App\Repositories\Contracts\PersonRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class MarriageService
{
    public function __construct(
        protected MarriageRepositoryInterface $marriageRepository,
        protected PersonRepositoryInterface $personRepository
    ) {
    }

    /**
     * Get all marriages with filters
     */
    public function getAllMarriages(array $filters = []): LengthAwarePaginator
    {
        return $this->marriageRepository->all($filters);
    }

    /**
     * Get marriage by ID
     */
    public function getMarriageById(int $id): Marriage
    {
        return $this->marriageRepository->findOrFail($id);
    }

    /**
     * Create new marriage
     */
    public function createMarriage(array $data): Marriage
    {
        return $this->marriageRepository->create($data);
    }

    /**
     * Update marriage
     */
    public function updateMarriage(int $id, array $data): Marriage
    {
        return $this->marriageRepository->update($id, $data);
    }

    /**
     * Delete marriage
     */
    public function deleteMarriage(int $id): bool
    {
        return $this->marriageRepository->delete($id);
    }

    /**
     * Get marriages by person
     */
    public function getMarriagesByPerson(int $personId): Collection
    {
        return $this->marriageRepository->getByPerson($personId);
    }

    /**
     * Get children of marriage
     */
    public function getChildren(int $marriageId): Collection
    {
        return $this->marriageRepository->getChildren($marriageId);
    }

    /**
     * Add child to marriage
     */
    public function addChildToMarriage(int $marriageId, int $childId, int $birthOrder = 1): void
    {
        // Update child's generation based on parents
        $marriage = $this->marriageRepository->find($marriageId);
        
        if ($marriage) {
            $husband = $this->personRepository->find($marriage->husband_id);
            $wife = $this->personRepository->find($marriage->wife_id);
            
            $parentGeneration = max(
                $husband?->generation ?? 0,
                $wife?->generation ?? 0
            );

            $this->personRepository->update($childId, [
                'generation' => $parentGeneration + 1,
            ]);
        }

        $this->marriageRepository->addChild($marriageId, $childId, $birthOrder);
    }

    /**
     * Check if marriage would be internal (between relatives)
     */
    public function checkIfInternal(int $husbandId, int $wifeId): bool
    {
        return $this->marriageRepository->isInternal($husbandId, $wifeId);
    }

    /**
     * Get marriage with full family tree data
     */
    public function getMarriageWithFamily(int $id): array
    {
        $marriage = $this->marriageRepository->findOrFail($id);
        $children = $this->marriageRepository->getChildren($id);

        return [
            'marriage' => $marriage,
            'husband' => $marriage->husband,
            'wife' => $marriage->wife,
            'children' => $children,
            'is_internal' => $marriage->is_internal,
        ];
    }
}
