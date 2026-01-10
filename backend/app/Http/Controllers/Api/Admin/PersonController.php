<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePersonRequest;
use App\Http\Requests\Admin\UpdatePersonRequest;
use App\Services\PersonService;
use App\Traits\ApiResponse;
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
            'branch_id', 'generation', 'gender', 'is_alive',
            'search', 'sort_by', 'sort_dir', 'per_page'
        ]);

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
}
