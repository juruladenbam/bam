<?php

namespace App\Repositories;

use App\Models\Event;
use App\Repositories\Contracts\EventRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class EventRepository implements EventRepositoryInterface
{
    public function __construct(protected Event $model)
    {
    }

    public function all(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->query();

        if (isset($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('location_name', 'like', "%{$filters['search']}%");
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['year'])) {
            $query->where('year', $filters['year']);
        }

        $sortBy = $filters['sort_by'] ?? 'start_date';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function find(int $id): ?Event
    {
        return $this->model->with('schedules')->find($id);
    }

    public function findOrFail(int $id): Event
    {
        return $this->model->with('schedules')->findOrFail($id);
    }

    public function create(array $data): Event
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): Event
    {
        $event = $this->findOrFail($id);
        $event->update($data);
        return $event->fresh();
    }

    public function delete(int $id): bool
    {
        return $this->findOrFail($id)->delete();
    }

    public function getUpcoming(int $limit = 5): Collection
    {
        return $this->model
            ->with('schedules')
            ->where('start_date', '>=', now())
            ->where('is_active', true)
            ->orderBy('start_date', 'asc')
            ->limit($limit)
            ->get();
    }

    public function getPast(int $limit = 10): LengthAwarePaginator
    {
        return $this->model
            ->where('end_date', '<', now())
            ->where('is_active', true)
            ->orderBy('start_date', 'desc')
            ->paginate($limit);
    }
}
