<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Services\RelationshipService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class RelationshipController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected RelationshipService $relationshipService
    ) {
    }

    /**
     * Calculate relationship between logged user and target person
     * GET /api/portal/relationship/{personId}
     */
    public function calculate(Request $request, int $personId)
    {
        $viewerId = $request->user()?->person_id ?? $request->header('X-Viewer-Person-Id');

        $person = \App\Models\Person::findOrFail($personId);

        if (!$viewerId) {
            // Guest mode: return root perspective (Anak, Cucu, etc.)
            $result = $this->relationshipService->getRelationshipFromRoot($person);
            return $this->success($result, 'Hubungan dari perspektif root');
        }

        if ((int)$viewerId === $personId) {
            return $this->success([
                'relationship' => 'self',
                'label' => 'Diri Sendiri',
                'label_javanese' => null,
            ], 'Ini adalah profil Anda');
        }

        $result = $this->relationshipService->calculate((int)$viewerId, $personId);

        return $this->success($result, 'Hubungan berhasil dihitung');
    }
}
