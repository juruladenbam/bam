<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\ContentService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MediaController extends Controller
{
    use ApiResponse;

    public function __construct(protected ContentService $service)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['type', 'year', 'event_id', 'per_page']);
        $media = $this->service->getMediaGallery($filters);
        return $this->success($media);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'file_url' => 'required|string|max:500', // Assuming file uploaded elsewhere or URL provided
            'type' => ['required', Rule::in(['image', 'video'])],
            'caption' => 'nullable|string',
            'year' => 'nullable|integer|min:1900|max:2100',
            'event_id' => 'nullable|exists:events,id',
        ]);

        $validated['uploader_id'] = $request->user()->person_id ?? $request->user()->id;

        $media = $this->service->createMedia($validated);
        return $this->created($media, 'Media uploaded successfully');
    }

    public function destroy($id)
    {
        $this->service->deleteMedia($id);
        return $this->success(null, 'Media deleted successfully');
    }
}
