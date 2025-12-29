<?php

namespace App\Repositories\Contracts;

use App\Models\Event;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface EventRepositoryInterface
{
    public function all(array $filters = []): LengthAwarePaginator;
    public function find(int $id): ?Event;
    public function findOrFail(int $id): Event;
    public function create(array $data): Event;
    public function update(int $id, array $data): Event;
    public function delete(int $id): bool;
    
    public function getUpcoming(int $limit = 5): Collection;
    public function getPast(int $limit = 10): LengthAwarePaginator;
}
