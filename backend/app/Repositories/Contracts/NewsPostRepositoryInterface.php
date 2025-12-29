<?php

namespace App\Repositories\Contracts;

use App\Models\NewsPost;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface NewsPostRepositoryInterface
{
    public function all(array $filters = []): LengthAwarePaginator;
    public function find(int $id): ?NewsPost;
    public function findBySlug(string $slug): ?NewsPost;
    public function create(array $data): NewsPost;
    public function update(int $id, array $data): NewsPost;
    public function delete(int $id): bool;
    
    public function getLatest(int $limit = 5): Collection;
    public function getByCategory(string $category, int $limit = 10): LengthAwarePaginator;
}
