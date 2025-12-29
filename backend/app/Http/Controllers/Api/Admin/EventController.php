<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\EventService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    use ApiResponse;

    public function __construct(protected EventService $service)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'type', 'year', 'sort_by', 'sort_dir', 'per_page']);
        $events = $this->service->getAllEvents($filters);
        return $this->success($events);
    }

    public function show($id)
    {
        $event = $this->service->getEvent($id);
        return $this->success($event);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::in(['festival', 'halal_bihalal', 'youth_camp', 'other'])],
            'year' => 'required|integer|min:1900|max:2100',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'location_name' => 'nullable|string',
            'location_maps_url' => 'nullable|url',
            'is_active' => 'boolean',
            'meta_data' => 'nullable|array',
        ]);

        $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']) . '-' . $validated['year'];

        $event = $this->service->createEvent($validated);
        return $this->created($event, 'Event created successfully');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'type' => [Rule::in(['festival', 'halal_bihalal', 'youth_camp', 'other'])],
            'year' => 'integer|min:1900|max:2100',
            'start_date' => 'date',
            'end_date' => 'date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'location_name' => 'nullable|string',
            'location_maps_url' => 'nullable|url',
            'is_active' => 'boolean',
            'meta_data' => 'nullable|array',
        ]);

        if (isset($validated['name']) && isset($validated['year'])) {
             $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']) . '-' . $validated['year'];
        }

        $event = $this->service->updateEvent($id, $validated);
        return $this->success($event, 'Event updated successfully');
    }

    public function destroy($id)
    {
        $this->service->deleteEvent($id);
        return $this->success(null, 'Event deleted successfully');
    }
}
