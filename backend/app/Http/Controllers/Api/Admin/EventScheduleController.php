<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventSchedule;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventScheduleController extends Controller
{
    use ApiResponse;

    public function store(Request $request, Event $event): JsonResponse
    {
        $validated = $request->validate([
            'day_sequence' => 'required|integer|min:1',
            'title' => 'required|string|max:255',
            'time_start' => 'required|date_format:H:i',
            'time_end' => 'nullable|date_format:H:i|after:time_start',
            'description' => 'nullable|string',
        ]);

        $schedule = $event->schedules()->create($validated);

        return $this->created($schedule);
    }

    public function update(Request $request, Event $event, EventSchedule $schedule): JsonResponse
    {
        // Verify schedule belongs to event
        if ($schedule->event_id !== $event->id) {
            return $this->error('Schedule does not belong to this event', 404);
        }

        $validated = $request->validate([
            'day_sequence' => 'sometimes|integer|min:1',
            'title' => 'sometimes|string|max:255',
            'time_start' => 'sometimes|date_format:H:i',
            'time_end' => 'nullable|date_format:H:i|after:time_start',
            'description' => 'nullable|string',
        ]);

        $schedule->update($validated);

        return $this->success($schedule);
    }

    public function destroy(Event $event, EventSchedule $schedule): JsonResponse
    {
         if ($schedule->event_id !== $event->id) {
            return $this->error('Schedule does not belong to this event', 404);
        }
        
        $schedule->delete();

        return $this->success(null, 'Schedule deleted successfully');
    }
}
