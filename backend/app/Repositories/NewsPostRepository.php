<?php

namespace App\Repositories;

use App\Models\NewsPost;
use App\Repositories\Contracts\NewsPostRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class NewsPostRepository implements NewsPostRepositoryInterface
{
    public function __construct(protected NewsPost $model)
    {
    }

    public function all(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->query();

        if (isset($filters['search'])) {
            $query->where('title', 'like', "%{$filters['search']}%");
        }

        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['is_public'])) {
            $query->where('is_public', $filters['is_public']);
        }

        $sortBy = $filters['sort_by'] ?? 'published_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return $query->with('author')->paginate($filters['per_page'] ?? 15);
    }

    public function find(int $id): ?NewsPost
    {
        return $this->model->with('author')->find($id);
    }

    public function findBySlug(string $slug): ?NewsPost
    {
        return $this->model->where('slug', $slug)->with('author')->first();
    }

    public function create(array $data): NewsPost
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): NewsPost
    {
        $news = $this->model->findOrFail($id);
        $news->update($data);
        return $news->fresh();
    }

    public function delete(int $id): bool
    {
        return $this->model->findOrFail($id)->delete();
    }

    public function getLatest(int $limit = 5): Collection
    {
        return $this->model
            ->where('is_public', true)
            ->whereNotNull('published_at')
            ->orderBy('published_at', 'desc')
            ->limit($limit)
            ->with('author')
            ->get();
    }

    public function getByCategory(string $category, int $limit = 10): LengthAwarePaginator
    {
        return $this->model
            ->where('category', $category)
            ->where('is_public', true)
            ->orderBy('published_at', 'desc')
            ->paginate($limit);
    }
}
