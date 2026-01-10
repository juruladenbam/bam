<?php

namespace App\Repositories;

use App\Models\IslamicHoliday;
use App\Repositories\Contracts\IslamicHolidayRepositoryInterface;
use Illuminate\Support\Collection;

class IslamicHolidayRepository implements IslamicHolidayRepositoryInterface
{
    public function all(): Collection
    {
        return IslamicHoliday::orderBy('hijri_month')
            ->orderBy('hijri_day')
            ->get();
    }

    public function active(): Collection
    {
        return IslamicHoliday::active()
            ->orderBy('hijri_month')
            ->orderBy('hijri_day')
            ->get();
    }

    public function forMonth(int $hijriMonth): Collection
    {
        return IslamicHoliday::active()
            ->forMonth($hijriMonth)
            ->orderBy('hijri_day')
            ->get();
    }

    public function find(int $id): ?IslamicHoliday
    {
        return IslamicHoliday::find($id);
    }

    public function create(array $data): IslamicHoliday
    {
        return IslamicHoliday::create($data);
    }

    public function update(int $id, array $data): IslamicHoliday
    {
        $holiday = IslamicHoliday::findOrFail($id);
        $holiday->update($data);
        return $holiday->fresh();
    }

    public function delete(int $id): bool
    {
        return IslamicHoliday::destroy($id) > 0;
    }
}
