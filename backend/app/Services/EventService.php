<?php

namespace App\Services;

use App\Repositories\Contracts\EventRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class EventService
{
    public function __construct(protected EventRepositoryInterface $eventRepository)
    {
    }

    public function getUpcomingEvents(int $limit = 5): Collection
    {
        return $this->eventRepository->getUpcoming($limit);
    }

    public function getPastEvents(int $limit = 10): LengthAwarePaginator
    {
        return $this->eventRepository->getPast($limit);
    }

    public function getAllEvents(array $filters = []): LengthAwarePaginator
    {
        return $this->eventRepository->all($filters);
    }

    public function createEvent(array $data): \App\Models\Event
    {
        return $this->eventRepository->create($data);
    }

    public function updateEvent(int $id, array $data): \App\Models\Event
    {
        return $this->eventRepository->update($id, $data);
    }

    public function deleteEvent(int $id): bool
    {
        return $this->eventRepository->delete($id);
    }

    public function getEvent(int $id): \App\Models\Event
    {
        return $this->eventRepository->findOrFail($id);
    }
}
