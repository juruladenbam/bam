<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Controllers\Controller;
use App\Models\NewsPost;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NewsController extends Controller
{
    use ApiResponse;

    /**
     * List public news articles
     */
    public function index(Request $request): JsonResponse
    {
        $news = NewsPost::where('is_public', true)
            ->latest('published_at')
            ->paginate($request->input('per_page', 10));
        
        return $this->paginated($news, 'Daftar berita publik');
    }

    public function headlines(): JsonResponse
    {
        $headlines = NewsPost::where('is_public', true)
            ->where('is_headline', true)
            ->latest('published_at')
            ->take(5)
            ->get();

        $count = $headlines->count();
        
        // Ensure at least 4 items for layout (1 main + 3 side)
        if ($count < 4) {
            $needed = 5 - $count; // Try to get up to 5 total
            $excludeIds = $headlines->pluck('id')->toArray();
            
            $more = NewsPost::where('is_public', true)
                ->whereNotIn('id', $excludeIds)
                ->latest('published_at')
                ->take($needed)
                ->get();
            
            $headlines = $headlines->merge($more);
        }

        return $this->success($headlines, 'Berita Headline');
    }

    /**
     * Show news detail by slug
     */
    public function show(string $slug): JsonResponse
    {
        $news = NewsPost::where('slug', $slug)
            ->orWhere('id', $slug)
            ->where('is_public', true)
            ->firstOrFail();
        
        return $this->success($news, 'Detail berita');
    }

    public function clap($id): JsonResponse
    {
        $news = NewsPost::where('id', $id)
            ->where('is_public', true)
            ->firstOrFail();

        $news->increment('claps');
        
        return $this->success(['claps' => $news->claps], 'Clapped!');
    }
}

