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

        // Get parent-child links
        $parentChildLinks = \App\Models\ParentChild::whereIn('child_id', $personIds)
            ->with(['marriage:id,husband_id,wife_id'])
            ->get()
            ->map(fn($pc) => [
                'child_id' => $pc->child_id,
                'marriage_id' => $pc->marriage_id,
                'father_id' => $pc->marriage?->husband_id,
                'mother_id' => $pc->marriage?->wife_id,
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
        $spouses = \App\Models\Person::whereIn('id', array_unique($spouseIds))->get();

        // Combine branch persons with outside spouses
        $allPersons = $branch->persons->merge($spouses);

        return $this->success([
            'branch' => $branch,
            'persons' => $allPersons->values(),
            'parent_child' => $parentChildLinks,
            'marriages' => $marriages,
        ], 'Data cabang berhasil dimuat');
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

        $results = $this->personService->searchPersons($query, $limit);

        return $this->success($results, 'Hasil pencarian');
    }
}
