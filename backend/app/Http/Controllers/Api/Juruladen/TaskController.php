<?php

namespace App\Http\Controllers\Api\Juruladen;

use App\Http\Controllers\Controller;
use App\Models\CommitteeDivision;
use App\Models\CommitteeTask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * List tasks for a division, optionally filtered by status.
     */
    public function index(Request $request, CommitteeDivision $division): JsonResponse
    {
        $tasks = $division->tasks()
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->with(['assignee:id,full_name,nib', 'creator:id,name', 'subTasks'])
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tasks,
        ]);
    }

    /**
     * Create a new task.
     */
    public function store(Request $request, CommitteeDivision $division): JsonResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'in:todo,in_progress,done,blocked'],
            'priority' => ['nullable', 'in:low,medium,high,urgent'],
            'deadline' => ['nullable', 'date'],
            'assignee_id' => ['nullable', 'integer', 'exists:persons,id'],
            'parent_task_id' => ['nullable', 'integer', 'exists:committee_tasks,id'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $task = $division->tasks()->create([
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status ?? 'todo',
            'priority' => $request->priority ?? 'medium',
            'deadline' => $request->deadline,
            'assignee_id' => $request->assignee_id,
            'parent_task_id' => $request->parent_task_id,
            'sort_order' => $request->sort_order ?? 0,
            'created_by' => $request->user()?->id,
        ]);

        $task->load(['assignee:id,full_name,nib', 'creator:id,name']);

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil dibuat.',
            'data' => $task,
        ], 201);
    }

    /**
     * Update a task.
     */
    public function update(Request $request, CommitteeDivision $division, CommitteeTask $task): JsonResponse
    {
        $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:todo,in_progress,done,blocked'],
            'priority' => ['sometimes', 'in:low,medium,high,urgent'],
            'deadline' => ['nullable', 'date'],
            'assignee_id' => ['nullable', 'integer', 'exists:persons,id'],
            'parent_task_id' => ['nullable', 'integer', 'exists:committee_tasks,id'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $task->update($request->only([
            'title', 'description', 'status', 'priority',
            'deadline', 'assignee_id', 'parent_task_id', 'sort_order',
        ]));

        $task->load(['assignee:id,full_name,nib', 'creator:id,name']);

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil diperbarui.',
            'data' => $task,
        ]);
    }

    /**
     * Quick status update (for Kanban drag-drop).
     */
    public function updateStatus(Request $request, CommitteeTask $task): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:todo,in_progress,done,blocked'],
        ]);

        $task->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Status tugas diperbarui.',
            'data' => $task->fresh(),
        ]);
    }

    /**
     * Reorder tasks (batch update sort_order).
     */
    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'tasks' => ['required', 'array'],
            'tasks.*.id' => ['required', 'integer', 'exists:committee_tasks,id'],
            'tasks.*.sort_order' => ['required', 'integer', 'min:0'],
            'tasks.*.status' => ['nullable', 'in:todo,in_progress,done,blocked'],
        ]);

        foreach ($request->tasks as $taskData) {
            CommitteeTask::where('id', $taskData['id'])->update([
                'sort_order' => $taskData['sort_order'],
                ...(isset($taskData['status']) ? ['status' => $taskData['status']] : []),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Urutan tugas diperbarui.',
        ]);
    }

    /**
     * Delete a task.
     */
    public function destroy(CommitteeDivision $division, CommitteeTask $task): JsonResponse
    {
        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil dihapus.',
        ]);
    }
}
