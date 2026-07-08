<?php

namespace App\Http\Controllers\Api\Juruladen;

use App\Http\Controllers\Controller;
use App\Models\CommitteeTask;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * List events that are Juruladen-active.
     */
    public function index(): JsonResponse
    {
        $events = Event::where('is_juruladen_active', true)
            ->orderBy('start_date', 'desc')
            ->get(['id', 'slug', 'name', 'start_date', 'end_date', 'is_active', 'is_juruladen_active']);

        return response()->json([
            'success' => true,
            'data' => $events,
        ]);
    }

    /**
     * Get event detail with division progress summary.
     */
    public function show(Event $event): JsonResponse
    {
        $event->load('committeeDivisions');

        $totalTasks = CommitteeTask::whereHas('division', fn ($q) => $q->where('event_id', $event->id))->count();
        $doneTasks = CommitteeTask::whereHas('division', fn ($q) => $q->where('event_id', $event->id))
            ->where('status', 'done')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $event->id,
                'slug' => $event->slug,
                'name' => $event->name,
                'start_date' => $event->start_date,
                'end_date' => $event->end_date,
                'is_active' => $event->is_active,
                'is_juruladen_active' => $event->is_juruladen_active,
                'budget_total' => $event->budget_total,
                'budget_status' => $event->budget_status,
                'task_progress' => [
                    'total' => $totalTasks,
                    'done' => $doneTasks,
                    'percentage' => $totalTasks > 0 ? round(($doneTasks / $totalTasks) * 100, 1) : 0,
                ],
            ],
        ]);
    }

    /**
     * Toggle juruladen active status for an event.
     */
    public function toggleActive(Event $event): JsonResponse
    {
        $event->is_juruladen_active = !$event->is_juruladen_active;
        $event->save();

        return response()->json([
            'success' => true,
            'message' => $event->is_juruladen_active
                ? 'Event diaktifkan untuk Juruladen.'
                : 'Event dinonaktifkan dari Juruladen.',
            'data' => $event->only(['id', 'slug', 'name', 'is_juruladen_active']),
        ]);
    }

    /**
     * Get progress overview for an event — all divisions.
     */
    public function progress(Event $event): JsonResponse
    {
        $divisions = $event->committeeDivisions()
            ->with('tasks')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'name' => $d->name,
                'slug' => $d->slug,
                'color' => $d->color,
                'progress' => $d->progress,
                'task_counts' => $d->task_counts,
            ]);

        $totalTasks = $divisions->sum('task_counts.total');
        $doneTasks = $divisions->sum('task_counts.done');

        return response()->json([
            'success' => true,
            'data' => [
                'overall_progress' => $totalTasks > 0 ? round(($doneTasks / $totalTasks) * 100, 1) : 0,
                'total_tasks' => $totalTasks,
                'done_tasks' => $doneTasks,
                'divisions' => $divisions,
            ],
        ]);
    }

    /**
     * Get timeline of all tasks for an event.
     * Query params: division, status, month (YYYY-MM), assignee_id
     */
    public function timeline(Request $request, Event $event): JsonResponse
    {
        $tasks = CommitteeTask::whereHas('division', fn ($q) => $q->where('event_id', $event->id))
            ->forTimeline(
                $request->month,
                $request->division,
                $request->status
            )
            ->when($request->assignee_id, fn ($q) => $q->where('assignee_id', $request->assignee_id))
            ->with([
                'division:id,name,slug,color',
                'assignee:id,full_name',
            ])
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'status' => $t->status,
                'priority' => $t->priority,
                'deadline' => $t->deadline,
                'division' => [
                    'id' => $t->division->id,
                    'name' => $t->division->name,
                    'slug' => $t->division->slug,
                    'color' => $t->division->color,
                ],
                'assignee_name' => $t->assignee?->full_name,
            ]);

        // Group by date for calendar view
        $grouped = $tasks->groupBy(fn ($t) => optional($t['deadline'])->format('Y-m-d') ?? 'no-deadline');

        return response()->json([
            'success' => true,
            'data' => [
                'tasks' => $tasks,
                'grouped_by_date' => $grouped,
            ],
        ]);
    }
}
