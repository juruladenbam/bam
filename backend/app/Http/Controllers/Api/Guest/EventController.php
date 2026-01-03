<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Http\Resources\EventResource;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class EventController extends Controller
{
    use ApiResponse;

    /**
     * List upcoming public events
     */
    public function index(): JsonResponse
    {
        $events = Event::where('is_active', true)
            ->where('start_date', '>=', now()->subDays(7)) // Include recent events
            ->orderBy('start_date')
            ->get();
        
        return $this->success($events, 'Daftar acara publik');
    }

    /**
     * Show event detail by slug or id
     */
    public function show(string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)
            ->orWhere('id', $slug)
            ->where('is_active', true)
            ->with('schedules')
            ->firstOrFail();
        
        return $this->success($event, 'Detail acara');
    }
}
