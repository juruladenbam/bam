<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePersonRequest;
use App\Http\Requests\Admin\UpdatePersonRequest;
use App\Services\PersonService;
use App\Traits\ApiResponse;
use App\Models\Person;
use Illuminate\Http\Request;

class PersonController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected PersonService $personService
    ) {
    }

    /**
     * List all persons with filters
     * GET /api/admin/persons
     */
    public function index(Request $request)
    {
        $filters = $request->only([
            'branch_id', 'generation', 'gender',
            'search', 'sort_by', 'sort_dir', 'per_page'
        ]);

        if ($request->has('is_alive')) {
            $filters['is_alive'] = $request->boolean('is_alive');
        }

        if ($request->has('is_married')) {
            $filters['is_married'] = $request->boolean('is_married');
        }

        $persons = $this->personService->getAllPersons($filters);

        return $this->paginated($persons, 'Daftar person berhasil dimuat');
    }

    /**
     * Show person detail
     * GET /api/admin/persons/{id}
     */
    public function show(int $id)
    {
        $person = $this->personService->getPersonWithRelationships($id);
        $familyData = $this->personService->getFamilyData($id);

        // Append parents accessor for the detail view
        $person->append('parents');

        return $this->success([
            'person' => $person,
            'family' => $familyData,
        ], 'Detail person berhasil dimuat');
    }


    /**
     * Create new person
     * POST /api/admin/persons
     */
    public function store(StorePersonRequest $request)
    {
        $person = $this->personService->createPerson($request->validated());

        return $this->created($person, 'Person berhasil ditambahkan');
    }

    /**
     * Update person
     * PUT /api/admin/persons/{id}
     */
    public function update(UpdatePersonRequest $request, int $id)
    {
        $person = $this->personService->updatePerson($id, $request->validated());

        return $this->success($person, 'Person berhasil diperbarui');
    }

    /**
     * Delete person
     * DELETE /api/admin/persons/{id}
     */
    public function destroy(int $id)
    {
        $this->personService->deletePerson($id);

        return $this->success(null, 'Person berhasil dihapus');
    }

    /**
     * Search persons (for autocomplete)
     * GET /api/admin/persons/search
     */
    public function search(Request $request)
    {
        $query = $request->query('q', '');
        $limit = (int) $request->query('limit', 10);
        $offset = (int) $request->query('offset', 0);

        $results = $this->personService->searchPersons($query, $limit, $offset);

        return $this->success([
            'data' => $results,
            'has_more' => count($results) === $limit,
        ]);
    }
    /**
     * Get all unique generations
     * GET /api/admin/persons/generations
     */
    public function generations()
    {
        $generations = $this->personService->getGenerations();
        return $this->success($generations, 'Daftar generasi berhasil dimuat');
    }

    /**
     * Swap birth order between two siblings
     * POST /api/admin/persons/swap-order
     */
    public function swapOrder(Request $request)
    {
        $request->validate([
            'id_a' => 'required|integer|exists:persons,id',
            'id_b' => 'required|integer|exists:persons,id',
        ]);

        try {
            $this->personService->swapBirthOrder(
                $request->id_a,
                $request->id_b
            );

            return $this->success(null, 'Urutan kelahiran berhasil ditukar');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    /**
     * Check if a birth order is already taken by a sibling
     * GET /api/admin/persons/{id}/validate-birth-order?order=2
     */
    public function validateBirthOrder(Request $request, int $id)
    {
        $order = (int) $request->query('order');
        if (!$order) return $this->error('Order parameter is required', 400);

        $person = $this->personService->getPersonById($id);
        $parentChild = \DB::table('parent_child')->where('child_id', $id)->first();

        if (!$parentChild) {
            return $this->success(['has_conflict' => false], 'No conflict (no parent marriage)');
        }

        $collidingSibling = \DB::table('parent_child')
            ->join('persons', 'parent_child.child_id', '=', 'persons.id')
            ->where('parent_child.marriage_id', $parentChild->marriage_id)
            ->where('parent_child.birth_order', $order)
            ->where('parent_child.child_id', '!=', $id)
            ->select('persons.id', 'persons.full_name', 'persons.birth_order')
            ->first();

        return $this->success([
            'has_conflict' => !!$collidingSibling,
            'colliding_sibling' => $collidingSibling,
        ]);
    }

    /**
     * Get all siblings of a person (children of the same marriage)
     * GET /api/admin/persons/{id}/siblings
     */
    public function siblings(int $id)
    {
        $parentChild = \DB::table('parent_child')->where('child_id', $id)->first();

        if (!$parentChild) {
            return $this->success([], 'No siblings found (no parent marriage)');
        }

        $siblings = Person::join('parent_child', 'persons.id', '=', 'parent_child.child_id')
            ->where('parent_child.marriage_id', $parentChild->marriage_id)
            ->orderBy('parent_child.birth_order')
            ->orderBy('persons.id') // secondary sort
            ->select('persons.*', 'parent_child.birth_order')
            ->get();

        return $this->success($siblings);
    }

    /**
     * Trigger full NIB rebuild from root (for maintenance)
     * POST /api/admin/persons/rebuild-nibs
     */
    public function rebuildNibs(Request $request)
    {
        $rootBirthOrder = (int) ($request->root_birth_order ?? 8);
        
        // 1. Find root
        $root = Person::where('is_root', true)->first();
        if (!$root) {
            return $this->error("Root person not found!", 404);
        }

        \DB::beginTransaction();
        try {
            // 1. Fix birth order collisions for multiple marriages (Global unique for bloodline parent)
            $parentIds = \DB::table('marriages')
                ->select('husband_id as parent_id')
                ->whereNotNull('husband_id')
                ->groupBy('husband_id')
                ->havingRaw('COUNT(*) > 1')
                ->union(
                    \DB::table('marriages')
                        ->select('wife_id as parent_id')
                        ->whereNotNull('wife_id')
                        ->groupBy('wife_id')
                        ->havingRaw('COUNT(*) > 1')
                )
                ->pluck('parent_id');

            foreach ($parentIds as $parentId) {
                $marriages = \DB::table('marriages')
                    ->where('husband_id', $parentId)
                    ->orWhere('wife_id', $parentId)
                    ->pluck('id');

                $children = \DB::table('parent_child')
                    ->whereIn('marriage_id', $marriages)
                    ->orderBy('marriage_id')
                    ->orderBy('birth_order')
                    ->get();

                $currentGlobalOrder = 1;
                foreach ($children as $child) {
                    \DB::table('parent_child')
                        ->where('id', $child->id)
                        ->update(['birth_order' => $currentGlobalOrder]);
                    
                    \DB::table('persons')
                        ->where('id', $child->child_id)
                        ->update(['birth_order' => $currentGlobalOrder]);
                        
                    $currentGlobalOrder++;
                }
            }

            // 2. Sync all remaining birth_order fields between persons and parent_child
            $relations = \DB::table('parent_child')->get();
            foreach ($relations as $rel) {
                \DB::table('persons')
                    ->where('id', $rel->child_id)
                    ->update(['birth_order' => $rel->birth_order]);
            }

            // 3. Clear all NIBs
            Person::query()->update(['nib' => null]);

            // 4. Rebuild
            $rootBase = str_pad((string) $rootBirthOrder, 2, '0', STR_PAD_LEFT);
            $root->nib = $rootBase . '000';
            $root->save();

            $this->personService->regenerateNibRecursive($root);

            \DB::commit();
            
            return $this->success(null, 'Seluruh NIB berhasil dibangun ulang dan disinkronkan (termasuk penyesuaian lintas pernikahan).');
        } catch (\Exception $e) {
            \DB::rollBack();
            return $this->error("Gagal membangun ulang NIB: " . $e->getMessage(), 400);
        }
    }
}
