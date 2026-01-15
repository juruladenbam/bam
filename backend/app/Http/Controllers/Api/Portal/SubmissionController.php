<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Services\SubmissionService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubmissionController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected SubmissionService $submissionService
    ) {}

    /**
     * List user's own submissions
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $personId = $request->header('X-Viewer-Person-Id');

        if ($user) {
            $submissions = $this->submissionService->getUserSubmissions(
                $user->id,
                $request->input('per_page', 15)
            );
        } elseif ($personId) {
            $submissions = $this->submissionService->getPersonSubmissions(
                (int) $personId,
                $request->input('per_page', 15)
            );
        } else {
            return $this->error('Identitas tidak ditemukan. Silahkan login atau tautkan NIB.', 401);
        }
        
        return $this->paginated($submissions, 'Data submission berhasil diambil');
    }

    /**
     * Create new submission
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:birth,marriage,death,correction',
            'data' => 'required|array',
            'data.full_name' => 'required_if:type,birth,death|string|max:255',
            'data.gender' => 'required_if:type,birth|in:male,female',
            // person_id is encouraged but not strictly required at submission time (can be linked by admin later)
            'data.person_id' => 'nullable|exists:persons,id', 
            // Allow names for marriage partners (common for new/outside spouses)
            'data.husband_name' => 'nullable|string',
            'data.wife_name' => 'nullable|string',
            // Keep ID validation if provided
            'data.husband_id' => 'nullable|exists:persons,id',
            'data.wife_id' => 'nullable|exists:persons,id',
            'data.father_id' => 'nullable|exists:persons,id',
            'data.mother_id' => 'nullable|exists:persons,id',
            'data.birth_order' => 'nullable|integer|min:1',
            'data.birth_place' => 'nullable|string',
            'data.parent_marriage_id' => 'nullable|exists:marriages,id',
            
            // Marriage specific
            'data.marriage_date' => 'nullable|date',
            
            // Death specific
            'data.death_date' => 'nullable|date',
            'data.death_place' => 'nullable|string',
            'data.burial_place' => 'nullable|string',
            
            // Correction specific
            'data.person_name' => 'nullable|string',
            'data.field_select' => 'nullable|string',
            'data.field' => 'nullable|string',
            'data.correct_value' => 'nullable|string',
            
            // General
            'data.notes' => 'nullable|string',
        ]);
        
        $user = $request->user();
        $personId = $request->header('X-Viewer-Person-Id');

        $submission = $this->submissionService->createSubmission(
            $validated,
            $user?->id,
            $personId ? (int) $personId : null
        );
        
        return $this->success($submission, 'Submission berhasil dikirim, menunggu persetujuan admin', 201);
    }

    /**
     * Show submission detail
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $personId = $request->header('X-Viewer-Person-Id');

        $query = \App\Models\Submission::query();

        if ($user) {
            $query->where('user_id', $user->id);
        } elseif ($personId) {
            $query->where('submitter_person_id', (int) $personId);
        } else {
            return $this->error('Identitas tidak ditemukan.', 401);
        }

        $submission = $query->with(['reviewer:id,name', 'submitter:id,full_name'])
            ->findOrFail($id);
        
        return $this->success($submission);
    }
}
