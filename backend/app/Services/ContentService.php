<?php

namespace App\Services;

use App\Repositories\Contracts\NewsPostRepositoryInterface;
use App\Repositories\Contracts\MediaGalleryRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ContentService
{
    public function __construct(
        protected NewsPostRepositoryInterface $newsRepository,
        protected MediaGalleryRepositoryInterface $mediaRepository
    ) {
    }

    // --- News Implementation ---

    public function getLatestNews(int $limit = 5): Collection
    {
        return $this->newsRepository->getLatest($limit);
    }

    public function getAllNews(array $filters = []): LengthAwarePaginator
    {
        return $this->newsRepository->all($filters);
    }

    public function getNews(int $id): ?\App\Models\NewsPost
    {
        return $this->newsRepository->find($id);
    }

    public function createNews(array $data): \App\Models\NewsPost
    {
        if (isset($data['title']) && !isset($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['title']) . '-' . uniqid();
        }
        return $this->newsRepository->create($data);
    }

    public function updateNews(int $id, array $data): \App\Models\NewsPost
    {
        if (isset($data['title']) && !isset($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['title']) . '-' . uniqid();
        }
        return $this->newsRepository->update($id, $data);
    }

    public function deleteNews(int $id): bool
    {
        return $this->newsRepository->delete($id);
    }
    
    public function getNewsBySlug(string $slug): ?\App\Models\NewsPost
    {
        return $this->newsRepository->findBySlug($slug);
    }

    // --- Media Implementation ---

    public function getMediaGallery(array $filters = []): LengthAwarePaginator
    {
        return $this->mediaRepository->all($filters);
    }

    public function createMedia(array $data): \App\Models\MediaGallery
    {
        return $this->mediaRepository->create($data);
    }

    public function deleteMedia(int $id): bool
    {
        return $this->mediaRepository->delete($id);
    }
}
