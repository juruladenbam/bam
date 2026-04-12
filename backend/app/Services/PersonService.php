<?php

namespace App\Services;

use App\Models\Person;
use App\Models\Marriage;
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
            
            // Auto-generate NIB for bloodline member (child)
            $nib = $this->generateNibForChild($data['parent_marriage_id'], $birthOrder);
            if ($nib) {
                $person->nib = $nib;
                $person->save();
            }
        }

        return $person;
    }

    /**
     * Generate NIB for a new child based on parent marriage and birth order
     */
    protected function generateNibForChild(int $parentMarriageId, int $birthOrder): ?string
    {
        $marriage = $this->marriageRepository->find($parentMarriageId);
        
        if (!$marriage) {
            return null;
        }

        // Get the BAM member parent (the one with nib ending in 000)
        $husband = $this->personRepository->find($marriage->husband_id);
        $wife = $this->personRepository->find($marriage->wife_id);

        $bamParent = null;
        if ($husband && $husband->nib && str_ends_with($husband->nib, '000')) {
            $bamParent = $husband;
        } elseif ($wife && $wife->nib && str_ends_with($wife->nib, '000')) {
            $bamParent = $wife;
        }

        if (!$bamParent) {
            return null;
        }

        // Parent base NIB = Parent NIB without last 3 digits (000)
        $parentBaseNib = substr($bamParent->nib, 0, -3);
        
        // Child NIB = ParentBase + BirthOrder (2-digit padded) + 000
        $birthOrderPadded = str_pad((string) $birthOrder, 2, '0', STR_PAD_LEFT);
        return $parentBaseNib . $birthOrderPadded . '000';
    }

    /**
     * Generate NIB for a spouse
     */
    public function generateNibForSpouse(int $partnerId): ?string
    {
        $partner = $this->personRepository->find($partnerId);
        
        if (!$partner || !$partner->nib || !str_ends_with($partner->nib, '000')) {
            return null;
        }

        // Partner base NIB = Partner NIB without last 3 digits
        $partnerBaseNib = substr($partner->nib, 0, -3);

        // Count existing spouses to determine next index
        $existingSpouseCount = Person::where('nib', 'like', $partnerBaseNib . '%')
            ->where('id', '!=', $partnerId)
            ->whereRaw("nib NOT LIKE '%000'") // Exclude bloodline members
            ->count();

        $spouseIndex = $existingSpouseCount + 1;
        
        return $partnerBaseNib . str_pad((string) $spouseIndex, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Generate and assign spouse NIB for a marriage pair.
     * Determines which partner is the BAM member (NIB ending '000')
     * and assigns a spouse NIB to the other partner.
     */
    public function generateAndAssignSpouseNib(int $husbandId, int $wifeId): void
    {
        $husband = $this->personRepository->find($husbandId);
        $wife = $this->personRepository->find($wifeId);

        // Try husband as BAM member → assign NIB to wife
        if ($husband && $husband->nib && str_ends_with($husband->nib, '000')) {
            if ($wife && !$wife->nib) {
                $spouseNib = $this->generateNibForSpouse($husbandId);
                if ($spouseNib) {
                    $wife->nib = $spouseNib;
                    $wife->save();
                }
            }
            return;
        }

        // Try wife as BAM member → assign NIB to husband
        if ($wife && $wife->nib && str_ends_with($wife->nib, '000')) {
            if ($husband && !$husband->nib) {
                $spouseNib = $this->generateNibForSpouse($wifeId);
                if ($spouseNib) {
                    $husband->nib = $spouseNib;
                    $husband->save();
                }
            }
        }
    }

    /**
     * Update person
     */
    public function updatePerson(int $id, array $data): Person
    {
        $person = $this->personRepository->findOrFail($id);
        $oldBirthOrder = $person->birth_order;
        
        // Handle parent_marriage_id changes
        if (array_key_exists('parent_marriage_id', $data)) {
            $newParentMarriageId = $data['parent_marriage_id'];
            $currentParentMarriageId = $person->parent_marriage_id;
            
            // If parent marriage changed
            if ($newParentMarriageId !== $currentParentMarriageId) {
                // Remove old parent relationship if exists
                if ($currentParentMarriageId) {
                    \DB::table('parent_child')
                        ->where('child_id', $id)
                        ->delete();
                }
                
                // Add new parent relationship if provided
                if ($newParentMarriageId) {
                    // Auto-calculate generation
                    $data['generation'] = $this->calculateGeneration($newParentMarriageId);
                    
                    // Auto-detect branch if not explicitly provided
                    if (!isset($data['branch_id']) || $data['branch_id'] === null) {
                        $detectedBranch = $this->detectBranchFromParent($newParentMarriageId);
                        if ($detectedBranch) {
                            $data['branch_id'] = $detectedBranch;
                        }
                    }
                    
                    // Create parent_child relationship
                    $birthOrder = $data['birth_order'] ?? $person->birth_order ?? 1;
                    $this->marriageRepository->addChild(
                        $newParentMarriageId,
                        $id,
                        $birthOrder
                    );
                }
            }
            
            // Remove parent_marriage_id from data as it's not a column in persons table
            unset($data['parent_marriage_id']);
        }
        
        // If birth_order updated specifically without changing parent marriage
        if (isset($data['birth_order'])) {
            // Also update parent_child table
            \DB::table('parent_child')
                ->where('child_id', $id)
                ->update(['birth_order' => $data['birth_order']]);
        }

        $result = $this->personRepository->update($id, $data);

        // If birth_order or parent_marriage_id changed, regenerate NIB
        if ((isset($data['birth_order']) && $data['birth_order'] != $oldBirthOrder) || isset($newParentMarriageId)) {
            $this->regenerateNibRecursive($result);
        }

        return $result;
    }

    /**
     * Swap birth order between two siblings
     */
    public function swapBirthOrder(int $personAId, int $personBId): void
    {
        \DB::transaction(function () use ($personAId, $personBId) {
            $personA = $this->personRepository->findOrFail($personAId);
            $personB = $this->personRepository->findOrFail($personBId);

            // Verify they are siblings (same parent marriage)
            if ($personA->parent_marriage_id !== $personB->parent_marriage_id) {
                throw new \Exception("Persons are not siblings from the same marriage.");
            }

            if (!$personA->parent_marriage_id) {
                throw new \Exception("Cannot swap root/founder members without parent marriage.");
            }

            // Get all descendant IDs to nullify NIBs first (prevents collision during swap)
            $allIdsA = $this->collectDescendantIds($personAId);
            $allIdsB = $this->collectDescendantIds($personBId);
            $allSubtreeIds = array_unique(array_merge($allIdsA, $allIdsB));

            // Nullify NIBs of everyone in the subtrees
            Person::whereIn('id', $allSubtreeIds)->update(['nib' => null]);

            // Get current orders from parent_child table (source of truth)
            $orderA = \DB::table('parent_child')->where('child_id', $personAId)->value('birth_order');
            $orderB = \DB::table('parent_child')->where('child_id', $personBId)->value('birth_order');

            if ($orderA === null || $orderB === null) {
                // Fallback to person table if not found, though should exist
                $orderA = $orderA ?? $personA->birth_order ?? 1;
                $orderB = $orderB ?? $personB->birth_order ?? 1;
            }

            // Swap in persons table
            $personA->update(['birth_order' => $orderB]);
            $personB->update(['birth_order' => $orderA]);

            // Swap in parent_child table
            \DB::table('parent_child')
                ->where('child_id', $personAId)
                ->update(['birth_order' => $orderB]);

            \DB::table('parent_child')
                ->where('child_id', $personBId)
                ->update(['birth_order' => $orderA]);

            // Regenerate NIB for both and their descendants
            $this->regenerateNibRecursive($personA->fresh());
            $this->regenerateNibRecursive($personB->fresh());
        });
    }

    /**
     * Update birth order for a person and sync everything
     */
    public function updateBirthOrder(int $personId, int $newOrder): void
    {
        $this->updatePerson($personId, ['birth_order' => $newOrder]);
    }

    /**
     * Recursively regenerate NIB for a person and all their descendants
     */
    public function regenerateNibRecursive(Person $person): void
    {
        // 1. Regenerate for this person (if they are a bloodline member)
        if ($person->parent_marriage_id) {
            // ALWAYS get birth_order from parent_child (source of truth)
            $actualBirthOrder = \DB::table('parent_child')->where('child_id', $person->id)->value('birth_order');
            
            if ($actualBirthOrder) {
                $newNib = $this->generateNibForChild($person->parent_marriage_id, $actualBirthOrder);
                if ($newNib && $newNib !== $person->nib) {
                    // Temporarily null to avoid unique constraint
                    $person->nib = null;
                    $person->save();
                    
                    $person->nib = $newNib;
                    $person->save();
                }
            }
        }

        // 2. Regenerate for spouses (their NIBs depend on the person's base NIB)
        $this->regenerateSpouseNibs($person);

        // 3. Recursively regenerate for all children
        $marriages = Marriage::where('husband_id', $person->id)
            ->orWhere('wife_id', $person->id)
            ->get();
            
        foreach ($marriages as $marriage) {
            foreach ($marriage->children as $parentChild) {
                if ($parentChild->child) {
                    $this->regenerateNibRecursive($parentChild->child);
                }
            }
        }
    }

    /**
     * Helper to regenerate NIBs for all spouses of a person
     */
    protected function regenerateSpouseNibs(Person $person): void
    {
        if (!$person->nib || !str_ends_with($person->nib, '000')) {
            return;
        }

        $partnerBaseNib = substr($person->nib, 0, -3);
        
        // Get all marriages ordered by ID for consistency in spouse suffix (001, 002...)
        $marriages = Marriage::where('husband_id', $person->id)
            ->orWhere('wife_id', $person->id)
            ->orderBy('id')
            ->get();

        $spouseIndex = 1;
        foreach ($marriages as $marriage) {
            $spouseId = $marriage->husband_id === $person->id ? $marriage->wife_id : $marriage->husband_id;
            $spouse = Person::find($spouseId);
            
            if ($spouse && (!str_ends_with($spouse->nib, '000'))) {
                $newSpouseNib = $partnerBaseNib . str_pad((string) $spouseIndex, 3, '0', STR_PAD_LEFT);
                if ($spouse->nib !== $newSpouseNib) {
                    $spouse->nib = null;
                    $spouse->save();
                    $spouse->nib = $newSpouseNib;
                    $spouse->save();
                }
                $spouseIndex++;
            }
        }
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
     * Get all unique generation numbers
     */
    public function getGenerations(): Collection
    {
        return $this->personRepository->getGenerations();
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
            'parents' => $person->parents,
        ];
    }

    /**
     * Get parents of a person
     */
    public function getParents(int $personId): Collection
    {
        $person = $this->personRepository->getWithRelationships($personId);
        return $person->parents;
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

    /**
     * Collect all descendant IDs of a person recursively
     */
    protected function collectDescendantIds(int $personId): array
    {
        $ids = [$personId];
        
        $marriages = Marriage::where('husband_id', $personId)
            ->orWhere('wife_id', $personId)
            ->get();
            
        foreach ($marriages as $marriage) {
            foreach ($marriage->children as $parentChild) {
                if ($parentChild->child_id) {
                    $ids = array_merge($ids, $this->collectDescendantIds($parentChild->child_id));
                }
            }
        }
        
        return array_unique($ids);
    }
}
