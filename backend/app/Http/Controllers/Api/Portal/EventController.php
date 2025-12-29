<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Services\EventService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    use ApiResponse;

    public function __construct(protected EventService $service)
    {
    }

    public function index(Request $request)
    {
        $type = $request->query('type', 'upcoming'); // upcoming or past
        $limit = $request->query('limit', 10);

        if ($type === 'past') {
            $events = $this->service->getPastEvents($limit);
        } else {
            $events = $this->service->getUpcomingEvents($limit);
        }

        return $this->success($events);
    }
    
    public function show($id)
    {
        // Allow fetching detail by ID if needed
        $event = $this->service->getEvent($id);
        return $this->success($event);
    }
}
