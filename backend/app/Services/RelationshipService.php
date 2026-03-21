<?php

namespace App\Services;

use App\Models\Person;
use App\Models\Marriage;
use App\Models\ParentChild;
use App\Repositories\Contracts\PersonRepositoryInterface;
use Illuminate\Support\Collection;

class RelationshipService
{
    public function __construct(
        protected PersonRepositoryInterface $personRepository
    ) {
    }

    /**
     * Calculate relationship between two persons
     */
    public function calculate(int $personAId, int $personBId): array
    {
        $personA = $this->personRepository->findOrFail($personAId);
        $personB = $this->personRepository->findOrFail($personBId);

        if ($personAId === $personBId) {
            return [
                'relationship' => 'self',
                'label' => 'Diri Sendiri',
                'label_javanese' => null,
                'path' => $this->buildPathDescription($personA, $personB, ['id' => $personAId, 'name' => $personA->full_name], 0, 0),
                'lca_id' => $personAId,
                'sapaan' => $this->getSapaan('self', $personA, $personB),
            ];
        }

        // 1. Standard calculation for descendants
        // Build ancestor paths
        $pathA = $this->buildAncestorPath($personAId);
        $pathB = $this->buildAncestorPath($personBId);

        // Find LCA
        $lca = $this->findLCA($pathA, $pathB);

        // 2. If no LCA found, check for external spouse relationships
        if (!$lca) {
            // Check if target (personB) is a spouse from outside the family
            $isSpouse = $this->isExternalSpouse($personB);
            if ($isSpouse) {
                $internalPartner = $this->findInternalPartner($personB);
                if ($internalPartner) {
                    if ($internalPartner->id === $personAId) {
                        return [
                            'relationship' => $personB->gender === 'male' ? 'husband' : 'wife',
                            'label' => $personB->gender === 'male' ? 'Suami' : 'Istri',
                            'label_javanese' => null,
                            'path' => [
                                'description' => "{$personB->full_name} adalah pasangan dari {$personA->full_name}.",
                            ],
                            'lca_id' => $personAId,
                            'sapaan' => $personB->gender === 'male' ? 'Suami / Mas' : 'Istri / Adek',
                        ];
                    }

                    $partnerResult = $this->calculate($personAId, $internalPartner->id);

                    if ($partnerResult['relationship'] !== 'unknown') {
                        $iparLabel = $this->convertToIparLabel($partnerResult['label'], $personB->gender);
                        $iparSapaan = $this->getIparSapaan($partnerResult, $personA, $personB);

                        // Enhance path description for marital relationship
                        $path = $partnerResult['path'];
                        $marriageWord = $personB->gender === 'male' ? 'Suami' : 'Istri';
                        $path['description'] = "{$personB->full_name} adalah {$marriageWord} dari {$internalPartner->full_name}. " . ($path['description'] ?? '');

                        return [
                            'relationship' => $partnerResult['relationship'] . '_ipar',
                            'label' => $iparLabel,
                            'label_javanese' => $partnerResult['label_javanese'] ? $partnerResult['label_javanese'] . ' (Ipar)' : null,
                            'path' => $path,
                            'lca_id' => $partnerResult['lca_id'] ?? null,
                            'lca_name' => $partnerResult['lca_name'] ?? null,
                            'distance_a' => $partnerResult['distance_a'] ?? null,
                            'distance_b' => $partnerResult['distance_b'] ?? null,
                            'sapaan' => $iparSapaan,
                            'is_ipar' => true,
                            'partner_name' => $internalPartner->full_name,
                        ];
                    }
                }
            }


            // Check if viewer (personA) is a spouse
            $isViewerSpouse = $this->isExternalSpouse($personA);

            if ($isViewerSpouse) {
                $viewerPartner = $this->findInternalPartner($personA);

                if ($viewerPartner && $viewerPartner->id !== $personBId) {
                    $partnerResult = $this->calculate($viewerPartner->id, $personBId);

                    if ($partnerResult['relationship'] !== 'unknown') {
                        $iparLabel = $this->convertToIparLabel($partnerResult['label'], $personB->gender);
                        $iparSapaan = $this->getIparSapaan($partnerResult, $personA, $personB);

                        return array_merge($partnerResult, [
                            'relationship' => $partnerResult['relationship'] . '_ipar',
                            'label' => $iparLabel,
                            'sapaan' => $iparSapaan,
                            'is_ipar' => true,
                        ]);
                    }
                }
            }

            return [
                'relationship' => 'unknown',
                'label' => 'Tidak diketahui',
                'label_javanese' => null,
                'path' => [],
                'lca_id' => null,
            ];
        }

        // 3. Standard relationship based on LCA
        // Calculate distances
        $distA = $this->getDistanceToAncestor($personAId, $lca['id']);
        $distB = $this->getDistanceToAncestor($personBId, $lca['id']);

        // Determine relationship (Target relative to Viewer)
        $relationship = $this->determineRelationship($distB, $distA);
        $label = $this->getRelationshipLabel($relationship, $personB->gender, $distA, $distB);
        $labelJavanese = $this->getJavaneseTitle($relationship, $personA, $personB);

        // Build path description
        $pathDescription = $this->buildPathDescription($personA, $personB, $lca, $distA, $distB);

        return [
            'relationship' => $relationship,
            'label' => $label,
            'label_javanese' => $labelJavanese,
            'path' => $pathDescription,
            'lca_id' => $lca['id'],
            'lca_name' => $lca['name'],
            'distance_a' => $distA,
            'distance_b' => $distB,
            'sapaan' => $this->getSapaan($relationship, $personA, $personB),
        ];

    }

    /**
     * Check if a person is an external spouse (not a descendant)
     */
    protected function isExternalSpouse(Person $person): bool
    {
        // External spouses have no branch_id
        if ($person->branch_id === null) {
            return true;
        }

        // Check if they have a parent_child record (descendants do, spouses don't)
        $hasParent = ParentChild::where('child_id', $person->id)->exists();
        if (!$hasParent && !$person->is_root) {
            return true;
        }

        return false;
    }

    /**
     * Find the internal (descendant) partner of an external spouse
     */
    protected function findInternalPartner(Person $spouse): ?Person
    {
        $marriage = Marriage::where('husband_id', $spouse->id)
            ->orWhere('wife_id', $spouse->id)
            ->first();

        if (!$marriage) {
            return null;
        }

        $partnerId = $marriage->husband_id === $spouse->id
            ? $marriage->wife_id
            : $marriage->husband_id;

        return $this->personRepository->find($partnerId);
    }

    /**
     * Convert relationship label to "Ipar" variant
     */
    protected function convertToIparLabel(string $label, string $gender): string
    {
        // Map base labels to ipar versions
        $iparMap = [
            'Diri Sendiri' => $gender === 'male' ? 'Suami' : 'Istri',
            'Anak Laki-laki' => $gender === 'male' ? 'Menantu Laki-laki' : 'Menantu Perempuan',
            'Anak Perempuan' => $gender === 'male' ? 'Menantu Laki-laki' : 'Menantu Perempuan',
            'Ayah' => $gender === 'male' ? 'Mertua Laki-laki' : 'Mertua Perempuan',
            'Ibu' => $gender === 'male' ? 'Mertua Laki-laki' : 'Mertua Perempuan',
            'Kakek' => 'Mertua (Kakek)',
            'Nenek' => 'Mertua (Nenek)',
            'Saudara Laki-laki' => $gender === 'male' ? 'Ipar Laki-laki' : 'Ipar Perempuan',
            'Saudara Perempuan' => $gender === 'male' ? 'Ipar Laki-laki' : 'Ipar Perempuan',
            'Paman' => 'Bibi (Ipar)',
            'Bibi' => 'Paman (Ipar)',
            'Keponakan Laki-laki' => 'Keponakan (Ipar)',
            'Keponakan Perempuan' => 'Keponakan (Ipar)',
        ];


        if (isset($iparMap[$label])) {
            return $iparMap[$label];
        }

        // If it's already an Ipar label, don't append it again
        if (str_contains($label, 'Ipar') || str_contains($label, 'Mertua') || str_contains($label, 'Menantu')) {
            return $label;
        }

        // For other relationships, append "(Ipar)"
        return $label . ' (Ipar)';

    }

    /**
     * Get appropriate sapaan for ipar relationship
     */
    protected function getIparSapaan(array $partnerResult, Person $viewer, Person $target): ?string
    {
        $category = $target->gender === 'male' ? 'male' : 'female';
        $baseRelationship = $partnerResult['relationship'];
        $isOlder = ($target->birth_date && $viewer->birth_date)
            ? $target->birth_date < $viewer->birth_date
            : null;

        // Direct spouse of viewer or viewer's partner
        if ($baseRelationship === 'self') {
            return $category === 'male' ? 'Mas / Suami' : 'Mbak / Istri';
        }

        // Direct spouse of viewer's sibling/cousin = Ipar
        if (in_array($baseRelationship, ['sibling', 'cousin'])) {
            if ($isOlder === true) {
                return $category === 'male' ? 'Mas (Ipar)' : 'Mbak (Ipar)';
            }
            return $category === 'male' ? 'Mas (Ipar)' : 'Mbak (Ipar)';
        }

        // Spouse of uncle/aunt = use appropriate counterpart title
        if ($baseRelationship === 'uncle_aunt') {
            $partnerSapaan = $partnerResult['sapaan'] ?? '';
            
            // Map Javanese titles to their counterparts
            $counterparts = [
                'Pakde' => 'Bude',
                'Bude' => 'Pakde',
                'Om' => 'Tante',
                'Tante' => 'Om',
                'Paman' => 'Bibi',
                'Bibi' => 'Paman',
                'Lilik' => 'Lilik',
            ];

            foreach ($counterparts as $source => $target_title) {
                if (str_contains($partnerSapaan, $source)) {
                    return $target_title;
                }
            }

            return $category === 'male' ? 'Paman (Ipar)' : 'Bibi (Ipar)';
        }


        // Spouse of parent = Mertua
        if ($baseRelationship === 'parent') {
            return $category === 'male' ? 'Bapak Mertua' : 'Ibu Mertua';
        }

        // Spouse of child = Menantu
        if ($baseRelationship === 'child') {
            return $category === 'male' ? 'Mas / Nama (Menantu)' : 'Mbak / Nama (Menantu)';
        }


        // Spouse of nephew/niece
        if ($baseRelationship === 'niece_nephew') {
            return $category === 'male' ? 'Mas / Nama' : 'Mbak / Nama';
        }

        // Fallback: use partner's sapaan with Ipar suffix
        if (!empty($partnerResult['sapaan'])) {
            return $partnerResult['sapaan'] . ' (Ipar)';
        }

        return $category === 'male' ? 'Mas' : 'Mbak';
    }

    /**
     * Determine recommended address/sapaan
     */
    protected function getSapaan(string $relationship, Person $viewer, Person $target): ?string
    {
        $category = $target->gender === 'male' ? 'male' : 'female';
        $isOlder = ($target->birth_date && $viewer->birth_date) 
            ? $target->birth_date < $viewer->birth_date 
            : null;

        switch ($relationship) {
            case 'self':
                return 'Saya Sendiri';
            
            case 'parent':
                return $category === 'male' ? 'Abah / Bapak' : 'Ibu / Umi';
                
            case 'grandparent':
                return $category === 'male' ? 'Mbah Kung' : 'Mbah Putri';
                
            case 'great_grandparent':
                return 'Mbah Buyut';

            case 'uncle_aunt':
                // Reuse logic from getJavaneseTitle but simplified direct return
                // We assume getJavaneseTitle returns "Pakde/Om" etc.
                $javanese = $this->getJavaneseTitle($relationship, $viewer, $target);
                return $javanese ?? ($category === 'male' ? 'Paman' : 'Bibi');

            case 'sibling':
            case 'cousin':
                if ($isOlder === true) {
                    return $category === 'male' ? 'Mas / Gus' : 'Mbak / Ning';
                } elseif ($isOlder === false) {
                    return 'Dik / Nama';
                }
                return $category === 'male' ? 'Mas' : 'Mbak';

            case 'child':
            case 'grandchild':
            case 'niece_nephew':
                return $category === 'male' ? 'Le (Thole) / Nama' : 'Nduk (Genduk) / Nama';

            default:
                // Handle complex relationships like cousin_once_removed based on Generation
                $genDiff = $viewer->generation - $target->generation; // Pos: Target is older gen (2 vs 3 -> 1)

                // Target is higher generation (Parent Gen or above)
                if ($genDiff > 0) {
                    // Gen 1 diff = Uncle/Aunt level (e.g. Sepupu Ortu)
                    if ($genDiff == 1) {
                         // Force 'uncle_aunt' check for Javanese title
                         $javanese = $this->getJavaneseTitle('uncle_aunt', $viewer, $target);
                         return $javanese ?? ($category === 'male' ? 'Paman' : 'Bibi');
                    }
                    // Gen 2+ diff = Grandparent level
                    return $category === 'male' ? 'Mbah Kung' : 'Mbah Putri';
                }

                // Target is lower generation (Child Gen or below)
                if ($genDiff < 0) {
                     return $category === 'male' ? 'Le (Thole) / Nama' : 'Nduk (Genduk) / Nama';
                }

                // Same generation fallthrough (distant cousins same gen)
                if ($isOlder === true) {
                    return $category === 'male' ? 'Mas / Gus' : 'Mbak / Ning';
                } elseif ($isOlder === false) {
                    return 'Dik / Nama';
                }
                return $category === 'male' ? 'Mas' : 'Mbak';
        }
    }

    /**
     * Build ancestor path for a person (traverses BOTH parents)
     */
    protected function buildAncestorPath(int $personId, array $visited = []): array
    {
        $ancestors = [$personId];
        $visited[$personId] = true;

        // Find parents via parent_child table
        $parentChild = ParentChild::where('child_id', $personId)->first();
        
        if (!$parentChild) {
            return $ancestors;
        }

        $marriage = Marriage::find($parentChild->marriage_id);
        
        if (!$marriage) {
            return $ancestors;
        }

        // Traverse BOTH father and mother paths
        foreach ([$marriage->husband_id, $marriage->wife_id] as $parentId) {
            if ($parentId && !isset($visited[$parentId])) {
                $parentPath = $this->buildAncestorPath($parentId, $visited);
                $ancestors = array_merge($ancestors, $parentPath);
            }
        }

        return array_unique($ancestors);
    }

    /**
     * Find Lowest Common Ancestor
     */
    protected function findLCA(array $pathA, array $pathB): ?array
    {
        // Convert paths to sets for intersection
        $setA = collect($pathA);
        $setB = collect($pathB);

        // Find common ancestors
        $common = $setA->intersect($setB);

        if ($common->isEmpty()) {
            return null;
        }

        // The LCA is the first common ancestor (closest to both)
        foreach ($pathA as $ancestorId) {
            if ($common->contains($ancestorId)) {
                $person = $this->personRepository->find($ancestorId);
                
                // Try to find if their spouse is also a common ancestor to represent them as a couple
                $marriage = Marriage::where('husband_id', $ancestorId)
                    ->orWhere('wife_id', $ancestorId)
                    ->first();
                
                if ($marriage) {
                    $spouseId = $marriage->husband_id === $ancestorId ? $marriage->wife_id : $marriage->husband_id;
                    if ($spouseId && $common->contains($spouseId)) {
                        $spouse = $this->personRepository->find($spouseId);
                        
                        // Sort names consistently: husband first then wife (or use gender/convention)
                        $p1 = $person->gender === 'male' ? $person : $spouse;
                        $p2 = $person->gender === 'male' ? $spouse : $person;

                        return [
                            'id' => $ancestorId,
                            'name' => "{$p1->full_name} & {$p2->full_name}",
                            'spouse_id' => $spouseId,
                            'is_couple' => true,
                        ];
                    }
                }

                return [
                    'id' => $ancestorId,
                    'name' => $person?->full_name ?? 'Unknown',
                ];
            }
        }


        return null;
    }

    /**
     * Get distance from person to ancestor (BFS through both parents)
     */
    protected function getDistanceToAncestor(int $personId, int $ancestorId): int
    {
        if ($personId === $ancestorId) {
            return 0;
        }

        // BFS to find shortest path to ancestor
        $queue = [[$personId, 0]]; // [personId, distance]
        $visited = [$personId => true];

        while (!empty($queue)) {
            [$currentId, $distance] = array_shift($queue);

            // Find parents
            $parentChild = ParentChild::where('child_id', $currentId)->first();
            
            if (!$parentChild) {
                continue;
            }

            $marriage = Marriage::find($parentChild->marriage_id);
            
            if (!$marriage) {
                continue;
            }

            // Check both parents
            foreach ([$marriage->husband_id, $marriage->wife_id] as $parentId) {
                if (!$parentId || isset($visited[$parentId])) {
                    continue;
                }

                if ($parentId === $ancestorId) {
                    return $distance + 1;
                }

                $visited[$parentId] = true;
                $queue[] = [$parentId, $distance + 1];
            }
        }

        return 999; // Not found
    }

    /**
     * Determine relationship type based on distances
     */
    protected function determineRelationship(int $distA, int $distB): string
    {
        if ($distA === 0 && $distB === 0) return 'self';
        if ($distA === 1 && $distB === 0) return 'child';
        if ($distA === 0 && $distB === 1) return 'parent';
        if ($distA === 1 && $distB === 1) return 'sibling';
        if ($distA === 2 && $distB === 1) return 'niece_nephew';
        if ($distA === 1 && $distB === 2) return 'uncle_aunt';
        if ($distA === 2 && $distB === 2) return 'cousin';
        if ($distA === 2 && $distB === 0) return 'grandchild';
        if ($distA === 0 && $distB === 2) return 'grandparent';
        if ($distA === 3 && $distB === 0) return 'great_grandchild';
        if ($distA === 0 && $distB === 3) return 'great_grandparent';

        // Generalized cousin
        if ($distA > 1 && $distB > 1) {
            $cousinDegree = min($distA, $distB) - 1;
            $removed = abs($distA - $distB);
            return "cousin_{$cousinDegree}_removed_{$removed}";
        }

        return 'distant_relative';
    }

    /**
     * Get Indonesian label for relationship
     */
    protected function getRelationshipLabel(string $relationship, string $gender, int $distA, int $distB): string
    {
        $labels = [
            'self' => 'Diri Sendiri',
            'child' => $gender === 'male' ? 'Anak Laki-laki' : 'Anak Perempuan',
            'parent' => $gender === 'male' ? 'Ayah' : 'Ibu',
            'sibling' => $gender === 'male' ? 'Saudara Laki-laki' : 'Saudara Perempuan',
            'niece_nephew' => $gender === 'male' ? 'Keponakan Laki-laki' : 'Keponakan Perempuan',
            'uncle_aunt' => $gender === 'male' ? 'Paman' : 'Bibi',
            'cousin' => 'Sepupu',
            'grandchild' => $gender === 'male' ? 'Cucu Laki-laki' : 'Cucu Perempuan',
            'grandparent' => $gender === 'male' ? 'Kakek' : 'Nenek',
            'great_grandchild' => $gender === 'male' ? 'Cicit Laki-laki' : 'Cicit Perempuan',
            'great_grandparent' => $gender === 'male' ? 'Buyut' : 'Buyut',
            'distant_relative' => 'Kerabat Jauh',
        ];

        if (isset($labels[$relationship])) {
            return $labels[$relationship];
        }

        // Handle generalized cousins
        if (str_starts_with($relationship, 'cousin_')) {
            preg_match('/cousin_(\d+)_removed_(\d+)/', $relationship, $matches);
            $degree = $matches[1] ?? 1;
            $removed = $matches[2] ?? 0;

            // If removed > 0, translate to Paman/Keponakan context
            if ($removed > 0) {
                // Target is higher generation (e.g., Parent's Cousin) -> Paman/Bibi
                if ($distA > $distB) {
                    return $gender === 'male' ? 'Paman (Sepupu)' : 'Bibi (Sepupu)';
                }
                // Target is lower generation (e.g., Cousin's Child) -> Keponakan
                if ($distA < $distB) {
                    return $gender === 'male' ? 'Keponakan (Sepupu)' : 'Keponakan (Sepupu)';
                }
            }

            $ordinals = ['', 'pertama', 'kedua', 'ketiga', 'keempat', 'kelima'];
            $degreeText = $ordinals[$degree] ?? "ke-{$degree}";

            return "Sepupu {$degreeText}";
        }

        return 'Kerabat';
    }

    /**
     * Get Javanese title based on age comparison
     */
    protected function getJavaneseTitle(string $relationship, Person $personA, Person $personB): ?string
    {
        // Only apply Javanese titles for uncle/aunt relationships
        if (!in_array($relationship, ['uncle_aunt', 'parent'])) {
            return null;
        }

        // Get parent of person A for age comparison
        $parentChild = ParentChild::where('child_id', $personA->id)->first();
        
        if (!$parentChild) {
            return null;
        }

        $marriage = Marriage::find($parentChild->marriage_id);
        
        if (!$marriage) {
            return null;
        }

        $parent = $this->personRepository->find(
            $personA->gender === 'male' ? $marriage->husband_id : $marriage->wife_id
        );

        if (!$parent || !$parent->birth_date || !$personB->birth_date) {
            return null;
        }

        // Compare ages: is personB older or younger than the parent?
        $isOlder = $personB->birth_date < $parent->birth_date;

        if ($personB->gender === 'male') {
            return $isOlder ? 'Pakde' : 'Om';
        } else {
            return $isOlder ? 'Bude' : 'Tante';
        }
    }

    /**
     * Build path description
     */
    protected function buildPathDescription(Person $personA, Person $personB, array $lca, int $distA, int $distB): array
    {
        $description = "";

        if ($distB === 0) {
            // Target is LCA (Ancestor)
            if ($distA === 0) {
                $description = "Diri Sendiri.";
            } elseif ($distA === 1) {
                $description = "{$personB->full_name} adalah " . ($personB->gender === 'male' ? 'Ayah' : 'Ibu') . " dari {$personA->full_name}.";
            } else {
                $description = "{$personB->full_name} adalah leluhur dari {$personA->full_name}, berjarak {$distA} generasi.";
            }
        } elseif ($distA === 0) {
            // Viewer is LCA (Descendant is target)
            if ($distB === 1) {
                $description = "{$personB->full_name} adalah anak dari {$personA->full_name}.";
            } else {
                $description = "{$personB->full_name} adalah keturunan dari {$personA->full_name}, berjarak {$distB} generasi.";
            }
        } elseif ($distA === 1 && $distB === 1) {
            // Siblings
            $description = "{$personB->full_name} adalah saudara dari {$personA->full_name}. Mereka adalah anak dari {$lca['name']}.";
        } elseif ($distA === 2 && $distB === 2) {
            // First Cousins
            $description = "{$personB->full_name} adalah sepupu dari {$personA->full_name}. Mereka adalah cucu dari {$lca['name']}.";
        } else {
            // Other Sibling/Cousin etc.
            $relationshipName = $this->determineRelationship($distB, $distA);
            $label = strtolower($this->getRelationshipLabel($relationshipName, $personB->gender, $distA, $distB));
            
            $description = "{$personB->full_name} adalah {$label} dari {$personA->full_name}. " .
                           "Mereka memiliki leluhur yang sama yaitu {$lca['name']}.";
        }

        return [
            'from' => $personA->full_name,
            'to' => $personB->full_name,
            'via' => $lca['name'],
            'description' => $description,
        ];
    }


    /**
     * Calculate relationship from a specific perspective person.
     * Used for NIB-based access where we calculate from the NIB person's perspective.
     * 
     * @param int $perspectivePersonId The person whose perspective we're using (viewer)
     * @param int $targetPersonId The person we're looking at (target)
     * @return array Relationship data
     */
    public function calculateFromPerspective(int $perspectivePersonId, int $targetPersonId): array
    {
        return $this->calculate($perspectivePersonId, $targetPersonId);
    }

    /**
     * Get relationship from root's perspective.
     * Returns generation-based labels (anak, cucu, cicit, etc.)
     * Used for guest mode when no personal perspective is available.
     */
    public function getRelationshipFromRoot(Person $person): array
    {
        $generation = $person->generation;
        
        // Check if person is an external spouse (menantu)
        $isSpouse = $this->isExternalSpouse($person);

        $label = match ($generation) {
            1 => 'Root',
            2 => 'Anak',
            3 => 'Cucu',
            4 => 'Cicit',
            5 => 'Canggah',
            6 => 'Wareng',
            7 => 'Udeg-udeg',
            8 => 'Gantung Siwur',
            default => 'Generasi ' . $generation,
        };

        if ($isSpouse) {
            $label = 'Menantu ' . $label;
        }

        return [
            'relationship' => 'root_perspective',
            'generation' => $generation,
            'label' => $label,
            'label_short' => match ($generation) {
                1 => 'Root',
                2 => 'Anak',
                3 => 'Cucu',
                4 => 'Cicit',
                5 => 'Canggah',
                default => 'Gen-' . $generation,
            },
            'is_spouse' => $isSpouse,
            'label_javanese' => null,
            'path' => null,
            'lca_id' => null,
        ];
    }
}
