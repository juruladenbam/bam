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
}

