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
        $viewerId = $request->user()?->person_id;

        if (!$viewerId) {
            return $this->error('Akun Anda belum terhubung dengan data silsilah', 400);
        }

        if ($viewerId === $personId) {
            return $this->success([
                'relationship' => 'self',
                'label' => 'Diri Sendiri',
                'label_javanese' => null,
            ], 'Ini adalah profil Anda');
        }

        $result = $this->relationshipService->calculate($viewerId, $personId);

        return $this->success($result, 'Hubungan berhasil dihitung');
    }
}
