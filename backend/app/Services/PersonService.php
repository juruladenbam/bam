<?php

namespace App\Services;

use App\Models\Person;
use App\Repositories\Contracts\PersonRepositoryInterface;
use App\Repositories\Contracts\MarriageRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PersonService
{
    public function __construct(
        protected PersonRepositoryInterface $personRepository,
        protected MarriageRepositoryInterface $marriageRepository
    ) {
    }

    /**
     * Get all persons with filters
     */
    public function getAllPersons(array $filters = []): LengthAwarePaginator
    {
        return $this->personRepository->all($filters);
    }

    /**
     * Get person by ID
     */
    public function getPersonById(int $id): Person
    {
        return $this->personRepository->findOrFail($id);
    }

    /**
     * Get person with all relationships
     */
    public function getPersonWithRelationships(int $id): Person
    {
        return $this->personRepository->getWithRelationships($id);
    }

    /**
     * Create new person
     */
    public function createPerson(array $data): Person
    {
        // Auto-calculate generation if parent marriage provided
        if (isset($data['parent_marriage_id'])) {
            $data['generation'] = $this->calculateGeneration($data['parent_marriage_id']);
            
            // Auto-detect branch if not explicitly provided and not indicating external spouse (explicit null)
            // Note: If branch_id is strictly NULL/missing in input, we try to detect. 
            // If user likely wants external spouse, they send explicit NULL/undefined from frontend, 
            // but we should only auto-detect if we HAVE a parent. External spouses usually don't have parent_marriage_id in DB.
            if (!isset($data['branch_id'])) {
                $detectedBranch = $this->detectBranchFromParent($data['parent_marriage_id']);
                if ($detectedBranch) {
                    $data['branch_id'] = $detectedBranch;
                }
            }
        }

        $person = $this->personRepository->create($data);

        // Link to parent marriage if provided
        if (isset($data['parent_marriage_id'])) {
            $birthOrder = $data['birth_order'] ?? 1;
            $this->marriageRepository->addChild(
                $data['parent_marriage_id'],
                $person->id,
                $birthOrder
            );
        }

        return $person;
    }

    /**
     * Update person
     */
    public function updatePerson(int $id, array $data): Person
    {
        return $this->personRepository->update($id, $data);
    }

    /**
     * Delete person
     */
    public function deletePerson(int $id): bool
    {
        return $this->personRepository->delete($id);
    }

    /**
     * Get persons by branch
     */
    public function getPersonsByBranch(int $branchId): Collection
    {
        return $this->personRepository->getByBranch($branchId);
    }

    /**
     * Search persons
     */
    public function searchPersons(string $query, int $limit = 10, int $offset = 0, ?string $gender = null): Collection
    {
        return $this->personRepository->search($query, $limit, $offset, $gender);
    }

    /**
     * Get family data for a person (spouses, children, parents)
     */
    public function getFamilyData(int $personId): array
    {
        $person = $this->personRepository->getWithRelationships($personId);

        $spouses = collect();
        $children = collect();

        // Get all marriages
        $marriages = $person->marriagesAsHusband->merge($person->marriagesAsWife);

        foreach ($marriages as $marriage) {
            // Add spouse
            if ($marriage->husband_id === $personId) {
                $spouses->push($marriage->wife);
            } else {
                $spouses->push($marriage->husband);
            }

            // Add children
            foreach ($marriage->children as $parentChild) {
                $children->push($parentChild->child);
            }
        }

        return [
            'person' => $person,
            'spouses' => $spouses->unique('id'),
            'children' => $children->unique('id'),
            'parents' => $this->getParents($personId),
        ];
    }

    /**
     * Get parents of a person
     */
    public function getParents(int $personId): Collection
    {
        $ancestors = $this->personRepository->getAncestors($personId);
        
        // Filter to only direct parents (first level)
        // This is simplified - actual implementation would check parent_child table
        return $ancestors->take(2);
    }

    /**
     * Calculate generation based on parent marriage
     */
    protected function calculateGeneration(int $marriageId): int
    {
        $marriage = $this->marriageRepository->find($marriageId);
        
        if (!$marriage) {
            return 1;
        }

        $husband = $this->personRepository->find($marriage->husband_id);
        $wife = $this->personRepository->find($marriage->wife_id);

        $parentGeneration = max(
            $husband?->generation ?? 0,
            $wife?->generation ?? 0
        );

        return $parentGeneration + 1;
    }

    /**
     * Detect branch ID from parent marriage
     */
    protected function detectBranchFromParent(int $marriageId): ?int
    {
        $marriage = $this->marriageRepository->find($marriageId);
        
        if (!$marriage) {
            return null;
        }

        $husband = $this->personRepository->find($marriage->husband_id);
        $wife = $this->personRepository->find($marriage->wife_id);

        // If husband is BAM member (has branch or is root), inherit his branch
        // Note: If husband is root, he has no branch_id, so child gets null?
        // Wait, root's children are the FOUNDERS of branches 1-10.
        // So strict inheritance works for Gen 2+ (cucu dst).
        // For Gen 1 (anak root), they must be assigned manually.
        
        if ($husband && $husband->branch_id) {
            return $husband->branch_id;
        }

        if ($wife && $wife->branch_id) {
            return $wife->branch_id;
        }

        return null; // Fallback: manual selection needed (e.g. child of root)
    }
}
