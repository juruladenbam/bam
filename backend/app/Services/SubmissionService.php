<?php

namespace App\Services;

use App\Models\Submission;
use App\Models\Person;
use App\Models\Marriage;
use App\Repositories\Contracts\PersonRepositoryInterface;
use Illuminate\Support\Facades\DB;

class SubmissionService
{
    public function __construct(
        protected PersonRepositoryInterface $personRepository
    ) {}

    /**
     * Create a new submission
     */
    public function createSubmission(array $data, int $userId): Submission
    {
        return Submission::create([
            'user_id' => $userId,
            'type' => $data['type'],
            'data' => $data['data'],
            'status' => 'pending',
        ]);
    }

    /**
     * Get all pending submissions for admin
     */
    public function getPendingSubmissions(int $perPage = 15)
    {
        return Submission::pending()
            ->with('user:id,name,email')
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Get submissions for a specific user
     */
    public function getUserSubmissions(int $userId, int $perPage = 15)
    {
        return Submission::where('user_id', $userId)
            ->with('reviewer:id,name')
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Approve a submission
     */
    public function approveSubmission(int $submissionId, int $adminId, ?string $notes = null): Submission
    {
        return DB::transaction(function () use ($submissionId, $adminId, $notes) {
            $submission = Submission::findOrFail($submissionId);
            
            // Apply the changes based on submission type
            $this->applyChanges($submission);
            
            // Update submission status
            $submission->update([
                'status' => 'approved',
                'reviewed_by' => $adminId,
                'reviewed_at' => now(),
                'admin_notes' => $notes,
            ]);
            
            return $submission->fresh();
        });
    }

    /**
     * Reject a submission
     */
    public function rejectSubmission(int $submissionId, int $adminId, string $reason): Submission
    {
        $submission = Submission::findOrFail($submissionId);
        
        $submission->update([
            'status' => 'rejected',
            'reviewed_by' => $adminId,
            'reviewed_at' => now(),
            'admin_notes' => $reason,
        ]);
        
        return $submission->fresh();
    }

    /**
     * Apply changes from submission to actual data
     */
    protected function applyChanges(Submission $submission): void
    {
        $data = $submission->data;
        
        switch ($submission->type) {
            case 'birth':
                $this->applyBirthSubmission($data);
                break;
            case 'marriage':
                $this->applyMarriageSubmission($data);
                break;
            case 'death':
                $this->applyDeathSubmission($data);
                break;
            case 'correction':
                $this->applyCorrectionSubmission($data);
                break;
        }
    }

    /**
     * Apply birth submission - create new person
     */
    protected function applyBirthSubmission(array $data): void
    {
        $personData = [
            'full_name' => $data['full_name'],
            'nickname' => $data['nickname'] ?? null,
            'gender' => $data['gender'],
            'birth_date' => $data['birth_date'] ?? null,
            'birth_place' => $data['birth_place'] ?? null,
            'is_alive' => true,
            'branch_id' => $data['branch_id'] ?? null,
            'generation' => $data['generation'] ?? null,
        ];
        
        $person = $this->personRepository->create($personData);
        
        // Link to parent marriage if provided
        if (!empty($data['parent_marriage_id'])) {
            DB::table('parent_child')->insert([
                'marriage_id' => $data['parent_marriage_id'],
                'child_id' => $person->id,
                'birth_order' => $data['birth_order'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Apply marriage submission - create new marriage
     */
    protected function applyMarriageSubmission(array $data): void
    {
        Marriage::create([
            'husband_id' => $data['husband_id'],
            'wife_id' => $data['wife_id'],
            'marriage_date' => $data['marriage_date'] ?? null,
            'marriage_order' => $data['marriage_order'] ?? 1,
            'is_current' => $data['is_current'] ?? true,
        ]);
    }

    /**
     * Apply death submission - update person status
     */
    protected function applyDeathSubmission(array $data): void
    {
        $this->personRepository->update($data['person_id'], [
            'is_alive' => false,
            'death_date' => $data['death_date'] ?? null,
            'death_place' => $data['death_place'] ?? null,
        ]);
    }

    /**
     * Apply correction submission - update person data
     */
    protected function applyCorrectionSubmission(array $data): void
    {
        $personId = $data['person_id'];
        
        // Field mapping from SubmissionForm labels to Database columns
        $fieldMapping = [
            'Nama Lengkap' => 'full_name',
            'Nama Panggilan' => 'nickname',
            'Jenis Kelamin' => 'gender',
            'Tanggal Lahir' => 'birth_date',
            'Tempat Lahir' => 'birth_place',
            'Urutan Kelahiran' => 'birth_order',
            'Tanggal Wafat' => 'death_date',
            'Tempat Wafat' => 'death_place',
            'Tempat Dimakamkan' => 'burial_place',
        ];

        // Determine which column to update
        $fieldSelect = $data['field_select'] ?? null;
        $customField = $data['field'] ?? null;
        
        // If "Lainnya" (other) or custom field provided, uses customField if mapped, 
        // otherwise we can't auto-apply unknown fields safely.
        $targetColumn = null;
        
        if ($fieldSelect && isset($fieldMapping[$fieldSelect])) {
            $targetColumn = $fieldMapping[$fieldSelect];
        } elseif ($customField && in_array($customField, array_values($fieldMapping))) {
            // If they manually typed a valid column name
            $targetColumn = $customField;
        }

        if ($targetColumn) {
            $value = $data['correct_value'];

            // Value transformation for specific fields
            if ($targetColumn === 'gender') {
                $value = strtolower($value);
                if (in_array($value, ['laki-laki', 'pria', 'cowok', 'male', 'l'])) $value = 'male';
                if (in_array($value, ['perempuan', 'wanita', 'cewek', 'female', 'p'])) $value = 'female';
            }

            $this->personRepository->update($personId, [
                $targetColumn => $value
            ]);
        }
    }
}
