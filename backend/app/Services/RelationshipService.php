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
        if ($personAId === $personBId) {
            return [
                'relationship' => 'self',
                'label' => 'Diri Sendiri',
                'label_javanese' => null,
                'path' => [],
                'lca_id' => $personAId,
            ];
        }

        $personA = $this->personRepository->findOrFail($personAId);
        $personB = $this->personRepository->findOrFail($personBId);

        // Build ancestor paths
        $pathA = $this->buildAncestorPath($personAId);
        $pathB = $this->buildAncestorPath($personBId);

        // Find LCA
        $lca = $this->findLCA($pathA, $pathB);

        if (!$lca) {
            return [
                'relationship' => 'unknown',
                'label' => 'Tidak diketahui',
                'label_javanese' => null,
                'path' => [],
                'lca_id' => null,
            ];
        }

        // Calculate distances
        $distA = $this->getDistanceToAncestor($personAId, $lca['id']);
        $distB = $this->getDistanceToAncestor($personBId, $lca['id']);

        // Determine relationship
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
        // We need the one that appears earliest in both paths
        foreach ($pathA as $ancestorId) {
            if ($common->contains($ancestorId)) {
                $person = $this->personRepository->find($ancestorId);
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
        return [
            'from' => $personA->full_name,
            'to' => $personB->full_name,
            'via' => $lca['name'],
            'description' => "{$personB->full_name} adalah keturunan dari {$lca['name']}, " .
                           "berjarak {$distB} generasi. Sedangkan {$personA->full_name} " .
                           "berjarak {$distA} generasi dari {$lca['name']}.",
        ];
    }
}
