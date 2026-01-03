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
        $submissions = $this->submissionService->getUserSubmissions(
            $request->user()->id,
            $request->input('per_page', 15)
        );
        
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
            'data.birth_order' => 'nullable|integer|min:1',
        ]);
        
        $submission = $this->submissionService->createSubmission(
            $validated,
            $request->user()->id
        );
        
        return $this->success($submission, 'Submission berhasil dikirim, menunggu persetujuan admin', 201);
    }

    /**
     * Show submission detail
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $submission = $request->user()
            ->submissions()
            ->with('reviewer:id,name')
            ->findOrFail($id);
        
        return $this->success($submission);
    }
}
