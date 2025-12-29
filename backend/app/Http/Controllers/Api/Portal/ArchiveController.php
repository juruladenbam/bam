<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Services\ContentService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ArchiveController extends Controller
{
    use ApiResponse;

    public function __construct(protected ContentService $service)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['type', 'year', 'event_id', 'per_page']);
        // Default to public/safe media if we had a toggle. Assuming all media is viewable by portal users (who are logged in).
        $media = $this->service->getMediaGallery($filters);
        return $this->success($media);
    }
}
