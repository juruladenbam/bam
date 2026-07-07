<?php

namespace App\Http\Controllers\Api\Juruladen;

use App\Http\Controllers\Controller;
use App\Models\CommitteeDivision;
use App\Models\CommitteeMember;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DivisionController extends Controller
{
    /**
     * List all divisions for an event with members and progress.
     */
    public function index(Event $event): JsonResponse
    {
        $divisions = $event->committeeDivisions()
            ->with(['members.person:id,full_name,nib'])
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'name' => $d->name,
                'slug' => $d->slug,
                'color' => $d->color,
                'description' => $d->description,
                'sort_order' => $d->sort_order,
                'progress' => $d->progress,
                'task_counts' => $d->task_counts,
                'members' => $d->members->map(fn ($m) => [
                    'id' => $m->id,
                    'person_id' => $m->person_id,
                    'person_name' => $m->person?->full_name,
                    'role' => $m->role,
                    'responsibilities' => $m->responsibilities,
                ]),
            ]);

        return response()->json([
            'success' => true,
            'data' => $divisions,
        ]);
    }

    /**
     * Create a new division.
     */
    public function store(Request $request, Event $event): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:7'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $division = $event->committeeDivisions()->create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'color' => $request->color ?? '#6B7280',
            'description' => $request->description,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Divisi berhasil dibuat.',
            'data' => $division,
        ], 201);
    }

    /**
     * Update a division.
     */
    public function update(Request $request, CommitteeDivision $division): JsonResponse
    {
        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:7'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $data = $request->only(['name', 'color', 'description', 'sort_order']);
        if ($request->has('name')) {
            $data['slug'] = Str::slug($request->name);
        }

        $division->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Divisi berhasil diperbarui.',
            'data' => $division->fresh(),
        ]);
    }

    /**
     * Delete a division.
     */
    public function destroy(CommitteeDivision $division): JsonResponse
    {
        $division->delete();

        return response()->json([
            'success' => true,
            'message' => 'Divisi berhasil dihapus.',
        ]);
    }

    /**
     * Add a member to a division.
     */
    public function addMember(Request $request, CommitteeDivision $division): JsonResponse
    {
        $request->validate([
            'person_id' => ['required', 'integer', 'exists:persons,id'],
            'role' => ['required', 'in:ketua,anggota'],
            'responsibilities' => ['nullable', 'string'],
        ]);

        // Check if already a member
        $exists = $division->members()->where('person_id', $request->person_id)->exists();
        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Orang ini sudah menjadi anggota divisi ini.',
            ], 422);
        }

        $member = $division->members()->create([
            'person_id' => $request->person_id,
            'role' => $request->role,
            'responsibilities' => $request->responsibilities,
        ]);

        $member->load('person:id,full_name,nib');

        return response()->json([
            'success' => true,
            'message' => 'Anggota berhasil ditambahkan.',
            'data' => [
                'id' => $member->id,
                'person_id' => $member->person_id,
                'person_name' => $member->person->full_name,
                'role' => $member->role,
                'responsibilities' => $member->responsibilities,
            ],
        ], 201);
    }

    /**
     * Remove a member from a division.
     */
    public function removeMember(CommitteeDivision $division, int $personId): JsonResponse
    {
        $division->members()->where('person_id', $personId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Anggota berhasil dikeluarkan dari divisi.',
        ]);
    }
}
