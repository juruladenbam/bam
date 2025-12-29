<?php

namespace App\Repositories;

use App\Models\MediaGallery;
use App\Repositories\Contracts\MediaGalleryRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class MediaGalleryRepository implements MediaGalleryRepositoryInterface
{
    public function __construct(protected MediaGallery $model)
    {
    }

    public function all(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->query();

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['year'])) {
            $query->where('year', $filters['year']);
        }

        if (isset($filters['event_id'])) {
            $query->where('event_id', $filters['event_id']);
        }

        $query->orderBy('created_at', 'desc');

        return $query->with(['event', 'uploader'])->paginate($filters['per_page'] ?? 20);
    }

    public function find(int $id): ?MediaGallery
    {
        return $this->model->with(['event', 'uploader'])->find($id);
    }

    public function create(array $data): MediaGallery
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): MediaGallery
    {
        $media = $this->model->findOrFail($id);
        $media->update($data);
        return $media->fresh();
    }

    public function delete(int $id): bool
    {
        return $this->model->findOrFail($id)->delete();
    }

    public function getByType(string $type, int $limit = 12): LengthAwarePaginator
    {
        return $this->model
            ->where('type', $type)
            ->orderBy('year', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($limit);
    }

    public function getByYear(int $year): Collection
    {
        return $this->model
            ->where('year', $year)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
