<?php

namespace App\Repositories\Contracts;

use App\Models\IslamicHoliday;
use Illuminate\Support\Collection;

interface IslamicHolidayRepositoryInterface
{
    public function all(): Collection;

    public function active(): Collection;

    public function forMonth(int $hijriMonth): Collection;

    public function find(int $id): ?IslamicHoliday;

    public function create(array $data): IslamicHoliday;

    public function update(int $id, array $data): IslamicHoliday;

    public function delete(int $id): bool;
}
