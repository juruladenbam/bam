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

        // Calculate relationship
        $viewerId = $request->user()?->person_id ?? $request->header('X-Viewer-Person-Id');
        
        if ($viewerId) {
            if ((int)$viewerId === $id) {
                $response['relationship'] = [
                    'relationship' => 'self',
                    'label' => 'Diri Sendiri',
                ];
            } else {
                $response['relationship'] = $this->relationshipService->calculate((int)$viewerId, $id);
            }
        } else {
            // Guest mode: return root perspective
            $response['relationship'] = $this->relationshipService->getRelationshipFromRoot($person);
        }

        return $this->success($response, 'Detail person berhasil dimuat');
    }
}
