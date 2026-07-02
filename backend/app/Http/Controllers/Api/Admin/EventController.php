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
            'thumbnail' => 'nullable|string|max:500',
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
            'thumbnail' => 'nullable|string|max:500',
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

    public function registrations($id)
    {
        $registrations = \App\Models\EventRegistration::where('event_id', $id)
            ->with(['person.branch'])
            ->get();
            
        return $this->success($registrations);
    }

    public function updateRegistration(Request $request, $eventId, $registrationId)
    {
        $validated = $request->validate([
            'person_id' => 'nullable|exists:persons,id',
            'branch_id' => 'required|exists:branches,id',
            'email' => 'nullable|email|max:255',
            'whatsapp' => ['nullable', 'string', 'regex:/^62[0-9]{8,15}$/'],
            'attendance' => ['nullable', Rule::in(['hadir', 'tidak_hadir'])],
        ]);

        $registration = \App\Models\EventRegistration::where('event_id', $eventId)
            ->where('id', $registrationId)
            ->firstOrFail();

        \Illuminate\Support\Facades\DB::transaction(function () use ($registration, $validated) {
            $registration->update([
                'person_id' => $validated['person_id'] ?? null,
                'email' => $validated['email'] ?? null,
                'whatsapp' => $validated['whatsapp'] ?? null,
                'attendance' => $validated['attendance'] ?? null,
                'status' => empty($validated['attendance']) ? 'pending' : 'approved',
            ]);

            // Sync to person table if person_id is present
            if (!empty($validated['person_id']) && !empty($validated['whatsapp'])) {
                $person = \App\Models\Person::find($validated['person_id']);
                if ($person) {
                    $person->update([
                        'phone' => $validated['whatsapp'],
                        'branch_id' => $validated['branch_id'],
                    ]);
                }
            }
        });

        return $this->success($registration->fresh(['person.branch']), 'Registrasi berhasil diperbarui');
    }
}
