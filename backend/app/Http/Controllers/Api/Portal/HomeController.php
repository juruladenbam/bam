<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Services\ContentService;
use App\Services\EventService;
use App\Services\BranchService;
use App\Repositories\Contracts\PersonRepositoryInterface;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected ContentService $contentService,
        protected EventService $eventService,
        protected BranchService $branchService,
        protected PersonRepositoryInterface $personRepository
    ) {
    }

    public function index()
    {
        $limit = 3;

        // Latest News (General)
        $news = $this->contentService->getLatestNews($limit);

        // Upcoming Events
        $events = $this->eventService->getUpcomingEvents($limit);

        // Quick Stats Summary
        $stats = [
            'total_persons' => \App\Models\Person::count(),
            'total_living' => \App\Models\Person::where('is_alive', true)->count(),
            'total_descendants' => \App\Models\Person::whereNotNull('generation')->where('generation', '>', 0)->count(),
             // Adding total branches for completeness if needed, or stick to what HomePage.tsx displays
             // HomePage.tsx computed branches length. Logic: Service method.
        ];
        // Branch logic is separate in BranchService. Let's get branch stats if inexpensive.
        // Actually, HomePage.tsx calls `useBranches` which hits `/silsilah` endpoint.
        // This Home API is supplementary for "News" and "Events" and "Summary Stats" if not covered.
        // HomePage.tsx currently fetches `data` from `useBranches` which contains `branches` and `stats`.
        // So we might not need to duplicate stats here unless we want a dedicated dashboard endpoint.
        // Let's provide what's missing: News & Events.
        
        return $this->success([
            'news' => $news,
            'upcoming_events' => $events,
            // 'stats' => $stats // Optional, redundant with /silsilah endpoint
        ]);
    }
}
