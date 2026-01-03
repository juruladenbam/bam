<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\SubmissionService;
use App\Models\Submission;
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
     * List all submissions (with filters)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Submission::with('user:id,name,email');
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            // Default to pending
            $query->pending();
        }
        
        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        $submissions = $query->latest()->paginate($request->input('per_page', 15));
        
        return $this->paginated($submissions, 'Data submission berhasil diambil');
    }

    /**
     * Show submission detail
     */
    public function show(int $id): JsonResponse
    {
        $submission = Submission::with(['user:id,name,email', 'reviewer:id,name'])
            ->findOrFail($id);
        
        return $this->success($submission);
    }

    /**
     * Approve submission
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);
        
        $submission = $this->submissionService->approveSubmission(
            $id,
            $request->user()->id,
            $validated['notes'] ?? null
        );
        
        return $this->success($submission, 'Submission berhasil disetujui dan data telah diterapkan');
    }

    /**
     * Reject submission
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);
        
        $submission = $this->submissionService->rejectSubmission(
            $id,
            $request->user()->id,
            $validated['reason']
        );
        
        return $this->success($submission, 'Submission ditolak');
    }
}
