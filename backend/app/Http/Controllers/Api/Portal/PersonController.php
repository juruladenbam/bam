<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Services\PersonService;
use App\Services\RelationshipService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class PersonController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected PersonService $personService,
        protected RelationshipService $relationshipService
    ) {
    }

    /**
     * Get person detail with relationship to viewer
     * GET /api/portal/persons/{id}
     */
    public function show(Request $request, int $id)
    {
        $person = $this->personService->getPersonWithRelationships($id);
        $familyData = $this->personService->getFamilyData($id);

        $response = [
            'person' => [
                'id' => $person->id,
                'full_name' => $person->full_name,
                'nickname' => $person->nickname,
                'gender' => $person->gender,
                'birth_date' => $person->birth_date,
                'birth_place' => $person->birth_place,
                'death_date' => $person->death_date,
                'is_alive' => $person->is_alive,
                'photo_url' => $person->photo_url,
                'bio' => $person->bio,
                'generation' => $person->generation,
                'branch' => $person->branch,
            ],
            'family' => [
                'spouses' => $familyData['spouses'],
                'children' => $familyData['children'],
                'parents' => $familyData['parents'],
            ],
        ];

        // Calculate relationship if user is logged in and linked to a person
        $viewerId = $request->user()?->person_id;
        
        if ($viewerId && $viewerId !== $id) {
            $response['relationship'] = $this->relationshipService->calculate($viewerId, $id);
        }

        return $this->success($response, 'Detail person berhasil dimuat');
    }
}
