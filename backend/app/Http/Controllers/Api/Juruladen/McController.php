<?php

namespace App\Http\Controllers\Api\Juruladen;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\McAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class McController extends Controller
{
    /**
     * List all MC assignments for an event.
     */
    public function index(Event $event): JsonResponse
    {
        $assignments = $event->mcAssignments()
            ->with('person:id,full_name,nib')
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'event_id' => $a->event_id,
                'person_id' => $a->person_id,
                'person_name' => $a->person?->full_name,
                'role' => $a->role,
                'segment_description' => $a->segment_description,
                'notes' => $a->notes,
                'sort_order' => $a->sort_order,
            ]);

        return response()->json([
            'success' => true,
            'data' => $assignments,
        ]);
    }

    /**
     * Create a new MC assignment.
     */
    public function store(Request $request, Event $event): JsonResponse
    {
        $request->validate([
            'person_id' => ['required', 'integer', 'exists:persons,id'],
            'role' => ['required', 'string', 'max:100'],
            'segment_description' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $maxOrder = $event->mcAssignments()->max('sort_order') ?? 0;

        $assignment = $event->mcAssignments()->create([
            'person_id' => $request->person_id,
            'role' => $request->role,
            'segment_description' => $request->segment_description,
            'notes' => $request->notes,
            'sort_order' => $maxOrder + 1,
        ]);

        $assignment->load('person:id,full_name,nib');

        return response()->json([
            'success' => true,
            'message' => 'Penugasan MC berhasil dibuat.',
            'data' => [
                'id' => $assignment->id,
                'event_id' => $assignment->event_id,
                'person_id' => $assignment->person_id,
                'person_name' => $assignment->person?->full_name,
                'role' => $assignment->role,
                'segment_description' => $assignment->segment_description,
                'notes' => $assignment->notes,
                'sort_order' => $assignment->sort_order,
            ],
        ], 201);
    }

    /**
     * Update an MC assignment.
     */
    public function update(Request $request, McAssignment $assignment): JsonResponse
    {
        $request->validate([
            'person_id' => ['sometimes', 'integer', 'exists:persons,id'],
            'role' => ['sometimes', 'string', 'max:100'],
            'segment_description' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $assignment->update($request->only([
            'person_id', 'role', 'segment_description', 'notes', 'sort_order',
        ]));

        $assignment->load('person:id,full_name,nib');

        return response()->json([
            'success' => true,
            'message' => 'Penugasan MC berhasil diperbarui.',
            'data' => [
                'id' => $assignment->id,
                'event_id' => $assignment->event_id,
                'person_id' => $assignment->person_id,
                'person_name' => $assignment->person?->full_name,
                'role' => $assignment->role,
                'segment_description' => $assignment->segment_description,
                'notes' => $assignment->notes,
                'sort_order' => $assignment->sort_order,
            ],
        ]);
    }

    /**
     * Delete an MC assignment.
     */
    public function destroy(McAssignment $assignment): JsonResponse
    {
        $assignment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Penugasan MC berhasil dihapus.',
        ]);
    }
}
