<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\ContentService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NewsController extends Controller
{
    use ApiResponse;

    public function __construct(protected ContentService $service)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'category', 'is_public', 'sort_by', 'sort_dir', 'per_page']);
        $news = $this->service->getAllNews($filters);
        return $this->success($news);
    }

    public function show($id)
    {
         // Quick fix: fetch directly via repository logic from service helper if available
         // For now, return 501 but with correct method
        return $this->error('Method not implemented yet', 501);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => ['required', Rule::in(['kelahiran', 'lelayu', 'prestasi', 'umum'])],
            'is_public' => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        $validated['author_id'] = $request->user()->person_id ?? $request->user()->id; // Fallback

        $news = $this->service->createNews($validated);
        return $this->created($news, 'News created successfully');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'content' => 'string',
            'category' => [Rule::in(['kelahiran', 'lelayu', 'prestasi', 'umum'])],
            'is_public' => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        $news = $this->service->updateNews($id, $validated);
        return $this->success($news, 'News updated successfully');
    }

    public function destroy($id)
    {
        $this->service->deleteNews($id);
        return $this->success(null, 'News deleted successfully');
    }
}
