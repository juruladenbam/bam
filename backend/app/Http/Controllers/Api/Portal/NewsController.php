<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Services\ContentService;
use App\Traits\ApiResponse;

class NewsController extends Controller
{
    use ApiResponse;

    public function __construct(protected ContentService $contentService)
    {
    }

    public function index()
    {
        // TODO: Add filters if needed (e.g. only published)
        $news = $this->contentService->getAllNews(['per_page' => 10]);
        return $this->success($news);
    }

    public function show($id)
    {
        $news = $this->contentService->getNews($id);
        
        if (!$news) {
            return $this->error('News not found', 404);
        }
        
        if (!$news->is_public) {
             return $this->error('News is not public', 403);
        }

        return $this->success($news);
    }

    public function clap($id)
    {
        $news = $this->contentService->getNews($id);
        
        if (!$news) {
            return $this->error('News not found', 404);
        }

        $news->increment('claps');
        
        return $this->success(['claps' => $news->claps], 'Clapped!');
    }
}
