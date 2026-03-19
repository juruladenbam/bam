<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Services\BranchService;
use App\Services\PersonService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class SilsilahController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected BranchService $branchService,
        protected PersonService $personService
    ) {
    }

    /**
     * Get all branches with statistics
     * GET /api/portal/silsilah
     */
    public function index()
    {
        $data = $this->branchService->getTreeData();

        return $this->success([
            'branches' => $data['branches'],
            'stats' => [
                'total_persons' => $data['total_persons'],
                'total_descendants' => $data['total_descendants'],
                'total_spouses' => $data['total_spouses'],
                'total_living_descendants' => $data['total_living_descendants'],
                'total_living_spouses' => $data['total_living_spouses'],
                'total_living' => $data['total_living'],
                'total_kk_utuh' => $data['total_kk_utuh'],
                'total_male' => $data['total_male'],
                'total_female' => $data['total_female'],
                'generation_stats' => $data['generation_stats'],
            ],
        ], 'Data silsilah berhasil dimuat');
    }

    /**
     * Get persons in a specific branch with relationships
     * GET /api/portal/silsilah/branch/{id}
     */
    public function branch(int $id)
    {
        $branch = $this->branchService->getBranchWithPersons($id);

        // Get parent-child relationships for persons in this branch
        $personIds = $branch->persons->pluck('id')->toArray();
        
        // Get marriages where at least one parent is in this branch
        $marriages = \App\Models\Marriage::whereIn('husband_id', $personIds)
            ->orWhereIn('wife_id', $personIds)
            ->with(['husband:id,full_name,gender', 'wife:id,full_name,gender'])
            ->get();

        // Get parent-child links with birth_order for proper child ordering
        $parentChildLinks = \App\Models\ParentChild::whereIn('child_id', $personIds)
            ->with(['marriage:id,husband_id,wife_id'])
            ->orderBy('birth_order')
            ->get()
            ->map(fn($pc) => [
                'child_id' => $pc->child_id,
                'marriage_id' => $pc->marriage_id,
                'father_id' => $pc->marriage?->husband_id,
                'mother_id' => $pc->marriage?->wife_id,
                'birth_order' => $pc->birth_order,
            ]);

        // Collect spouse IDs from marriages that are NOT in this branch
        $spouseIds = [];
        foreach ($marriages as $m) {
            if (!in_array($m->husband_id, $personIds)) {
                $spouseIds[] = $m->husband_id;
            }
            if (!in_array($m->wife_id, $personIds)) {
                $spouseIds[] = $m->wife_id;
            }
        }

        // Get additional spouse persons (from outside the branch)
        $spouses = \App\Models\Person::whereIn('id', array_unique($spouseIds))->with('branch')->get();

        // Ghost Children: Include children from internal marriages from other branches
        $extraData = $this->collectGhostChildren($marriages, $personIds, $spouses->pluck('id')->toArray());
        
        $extraPersons = $extraData['persons'];
        $extraParentChildLinks = $extraData['parent_child'];
        $extraMarriages = $extraData['marriages'];

        // Ensure branch relation is also loaded for branch persons
        // and explicitly set it to ensure the frontend gets the branch object
        $branch->persons->each(function($p) use ($branch) {
            $p->setRelation('branch', $branch);
        });

        // Merge all parent_child links
        $allParentChildLinks = $parentChildLinks->merge($extraParentChildLinks)->values();

        // Merge all marriages
        $allMarriages = $marriages->merge($extraMarriages)->unique('id')->values();

        // Combine branch persons + outside spouses + ghost children & their families
        $allPersons = $branch->persons
            ->merge($spouses)
            ->merge($extraPersons)
            ->unique('id');

        return $this->success([
            'branch' => $branch,
            'persons' => $allPersons->values(),
            'parent_child' => $allParentChildLinks,
            'marriages' => $allMarriages,
        ], 'Data cabang berhasil dimuat');
    }

    /**
     * Collect children from internal marriages who are in other branches.
     */
    private function collectGhostChildren(
        \Illuminate\Database\Eloquent\Collection $marriages,
        array $personIds,
        array $spouseIds
    ): array {
        $internalMarriages = $marriages->filter(fn($m) => $m->is_internal);
        $extraPersons = collect();
        $extraParentChildLinks = collect();
        $extraMarriages = collect();

        if ($internalMarriages->isEmpty()) {
            return [
                'persons' => $extraPersons,
                'parent_child' => $extraParentChildLinks,
                'marriages' => $extraMarriages,
            ];
        }

        $internalMarriageIds = $internalMarriages->pluck('id')->toArray();
        $allKnownIds = array_merge($personIds, $spouseIds);

        // Get children of internal marriages that are NOT already in the branch
        $ghostChildren = \App\Models\ParentChild::whereIn('marriage_id', $internalMarriageIds)
            ->whereNotIn('child_id', $allKnownIds)
            ->with(['child.branch', 'marriage:id,husband_id,wife_id'])
            ->orderBy('birth_order')
            ->get();

        if ($ghostChildren->isNotEmpty()) {
            // Add ghost children persons
            $ghostChildPersons = $ghostChildren->pluck('child')->filter()->unique('id');
            $extraPersons = $extraPersons->merge($ghostChildPersons);

            // Add their parent_child links
            $ghostChildLinks = $ghostChildren->map(fn($pc) => [
                'child_id' => $pc->child_id,
                'marriage_id' => $pc->marriage_id,
                'father_id' => $pc->marriage?->husband_id,
                'mother_id' => $pc->marriage?->wife_id,
                'birth_order' => $pc->birth_order,
            ]);
            $extraParentChildLinks = $extraParentChildLinks->merge($ghostChildLinks);

            // Recursively collect descendants of ghost children (up to 2 levels)
            $ghostChildIds = $ghostChildPersons->pluck('id')->toArray();
            $this->collectDescendants(
                $ghostChildIds,
                array_merge($allKnownIds, $ghostChildIds),
                $extraPersons,
                $extraParentChildLinks,
                $extraMarriages,
                0,  // current depth
                2   // max depth
            );
        }

        return [
            'persons' => $extraPersons,
            'parent_child' => $extraParentChildLinks,
            'marriages' => $extraMarriages,
        ];
    }

    /**
     * Recursively collect descendants (children, their spouses, marriages)
     * for ghost children from internal marriages.
     */
    private function collectDescendants(
        array $parentIds,
        array $knownIds,
        \Illuminate\Support\Collection &$extraPersons,
        \Illuminate\Support\Collection &$extraParentChildLinks,
        \Illuminate\Support\Collection &$extraMarriages,
        int $depth,
        int $maxDepth
    ): void {
        if ($depth >= $maxDepth || empty($parentIds)) {
            return;
        }

        // Get marriages of these parents
        $childMarriages = \App\Models\Marriage::where(function ($q) use ($parentIds) {
                $q->whereIn('husband_id', $parentIds)
                  ->orWhereIn('wife_id', $parentIds);
            })
            ->with(['husband:id,full_name,gender', 'wife:id,full_name,gender'])
            ->get();

        if ($childMarriages->isEmpty()) {
            return;
        }

        $extraMarriages = $extraMarriages->merge($childMarriages);

        // Collect spouse persons not yet known
        $newSpouseIds = [];
        foreach ($childMarriages as $m) {
            if (!in_array($m->husband_id, $knownIds)) {
                $newSpouseIds[] = $m->husband_id;
            }
            if (!in_array($m->wife_id, $knownIds)) {
                $newSpouseIds[] = $m->wife_id;
            }
        }

        if (!empty($newSpouseIds)) {
            $newSpouseIds = array_unique($newSpouseIds);
            $newSpouses = \App\Models\Person::whereIn('id', $newSpouseIds)->with('branch')->get();
            $extraPersons = $extraPersons->merge($newSpouses);
            $knownIds = array_merge($knownIds, $newSpouseIds);
        }

        // Get children of these marriages
        $marriageIds = $childMarriages->pluck('id')->toArray();
        $nextChildren = \App\Models\ParentChild::whereIn('marriage_id', $marriageIds)
            ->whereNotIn('child_id', $knownIds)
            ->with(['child.branch', 'marriage:id,husband_id,wife_id'])
            ->orderBy('birth_order')
            ->get();

        if ($nextChildren->isEmpty()) {
            return;
        }

        $nextChildPersons = $nextChildren->pluck('child')->filter()->unique('id');
        $extraPersons = $extraPersons->merge($nextChildPersons);

        $nextChildLinks = $nextChildren->map(fn($pc) => [
            'child_id' => $pc->child_id,
            'marriage_id' => $pc->marriage_id,
            'father_id' => $pc->marriage?->husband_id,
            'mother_id' => $pc->marriage?->wife_id,
            'birth_order' => $pc->birth_order,
        ]);
        $extraParentChildLinks = $extraParentChildLinks->merge($nextChildLinks);

        // Recurse deeper
        $nextChildIds = $nextChildPersons->pluck('id')->toArray();
        $this->collectDescendants(
            $nextChildIds,
            array_merge($knownIds, $nextChildIds),
            $extraPersons,
            $extraParentChildLinks,
            $extraMarriages,
            $depth + 1,
            $maxDepth
        );
    }

    /**
     * Get full tree data for React Flow
     * GET /api/portal/silsilah/tree
     */
    public function tree(Request $request)
    {
        $branchId = $request->query('branch_id');

        if ($branchId) {
            $persons = $this->personService->getPersonsByBranch($branchId);
        } else {
            // Get first few from each branch for overview
            $branches = $this->branchService->getAllBranches();
            $persons = collect();
            
            foreach ($branches as $branch) {
                $branchPersons = $this->personService->getPersonsByBranch($branch->id)->take(10);
                $persons = $persons->merge($branchPersons);
            }
        }

        // Transform to React Flow format
        $nodes = $persons->map(function ($person) {
            return [
                'id' => "person-{$person->id}",
                'type' => 'personNode',
                'position' => ['x' => 0, 'y' => $person->generation * 200],
                'data' => [
                    'id' => $person->id,
                    'name' => $person->full_name,
                    'nickname' => $person->nickname,
                    'gender' => $person->gender,
                    'birth_date' => $person->birth_date,
                    'death_date' => $person->death_date,
                    'is_alive' => $person->is_alive,
                    'photo_url' => $person->photo_url,
                    'generation' => $person->generation,
                    'branch_id' => $person->branch_id,
                ],
            ];
        });

        return $this->success([
            'nodes' => $nodes,
            'edges' => [], // Will be calculated on frontend based on marriages
        ], 'Data tree berhasil dimuat');
    }

    /**
     * Search persons
     * GET /api/portal/silsilah/search
     */
    public function search(Request $request)
    {
        $query = $request->query('q', '');
        $limit = $request->query('limit', 10);

        if (strlen($query) < 2) {
            return $this->success([], 'Minimal 2 karakter untuk pencarian');
        }

        $results = $this->personService->searchPersons($query, $limit, 0, $request->query('gender'));

        return $this->success($results, 'Hasil pencarian');
    }
}
