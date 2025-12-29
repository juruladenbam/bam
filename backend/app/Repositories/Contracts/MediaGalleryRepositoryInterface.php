<?php

namespace App\Repositories\Contracts;

use App\Models\MediaGallery;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface MediaGalleryRepositoryInterface
{
    public function all(array $filters = []): LengthAwarePaginator;
    public function find(int $id): ?MediaGallery;
    public function create(array $data): MediaGallery;
    public function update(int $id, array $data): MediaGallery;
    public function delete(int $id): bool;
    
    public function getByType(string $type, int $limit = 12): LengthAwarePaginator;
    public function getByYear(int $year): Collection;
}
