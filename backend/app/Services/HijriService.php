<?php

namespace App\Services;

use App\Models\IslamicHoliday;
use App\Models\SiteSetting;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Remls\HijriDate\HijriDate;

class HijriService
{
    /**
     * Hijri month names in Indonesian
     */
    protected array $monthNames = [
        1 => 'Muharram',
        2 => 'Safar',
        3 => 'Rabiul Awal',
        4 => 'Rabiul Akhir',
        5 => 'Jumadil Awal',
        6 => 'Jumadil Akhir',
        7 => 'Rajab',
        8 => 'Sya\'ban',
        9 => 'Ramadhan',
        10 => 'Syawal',
        11 => 'Dzulqa\'dah',
        12 => 'Dzulhijjah',
    ];

    /**
     * Get current Hijri offset from settings (-3 to +3)
     */
    public function getOffset(): int
    {
        $offset = (int) SiteSetting::getValue('calendar.hijri_offset', 0);
        return max(-3, min(3, $offset));
    }

    /**
     * Convert Gregorian date to Hijri with offset applied
     */
    public function toHijri(Carbon $date): array
    {
        $hijri = HijriDate::createFromGregorian($date);
        
        // Apply offset
        $offset = $this->getOffset();
        if ($offset !== 0) {
            $hijri = $hijri->addDays($offset);
        }

        return [
            'year' => $hijri->getYear(),
            'month' => $hijri->getMonth(),
            'day' => $hijri->getDay(),
            'month_name' => $this->monthNames[$hijri->getMonth()] ?? '',
        ];
    }

    /**
     * Convert Hijri date to Gregorian (with offset reversed)
     */
    public function toGregorian(int $year, int $month, int $day): Carbon
    {
        $hijri = new HijriDate($year, $month, $day);
        $gregorian = $hijri->getGregorianDate();
        
        // Reverse the offset
        $offset = $this->getOffset();
        if ($offset !== 0) {
            $gregorian = $gregorian->subDays($offset);
        }

        return Carbon::parse($gregorian);
    }

    /**
     * Format Gregorian date as Hijri string
     */
    public function format(Carbon $date): string
    {
        $hijri = $this->toHijri($date);
        return "{$hijri['day']} {$hijri['month_name']} {$hijri['year']} H";
    }

    /**
     * Get month name by number
     */
    public function getMonthName(int $month): string
    {
        return $this->monthNames[$month] ?? '';
    }

    /**
     * Get Islamic holidays that fall within a Gregorian month
     */
    public function getHolidaysForMonth(int $year, int $month): Collection
    {
        $startDate = Carbon::create($year, $month, 1);
        $endDate = $startDate->copy()->endOfMonth();
        
        // Get Hijri range for this Gregorian month
        $startHijri = $this->toHijri($startDate);
        $endHijri = $this->toHijri($endDate);

        // Query holidays that might fall in this range
        $holidays = IslamicHoliday::active()
            ->where(function ($query) use ($startHijri, $endHijri) {
                // Handle month boundary crossing
                if ($startHijri['month'] === $endHijri['month']) {
                    $query->where('hijri_month', $startHijri['month']);
                } else {
                    $query->whereIn('hijri_month', [$startHijri['month'], $endHijri['month']]);
                }
            })
            ->get();

        // Calculate Gregorian dates for each holiday
        return $holidays->map(function ($holiday) use ($startHijri, $endHijri, $startDate, $endDate) {
            // Determine which year to use
            $hijriYear = $startHijri['year'];
            if ($holiday->hijri_month < $startHijri['month']) {
                $hijriYear = $endHijri['year'];
            }

            $gregorianDate = $this->toGregorian($hijriYear, $holiday->hijri_month, $holiday->hijri_day);
            
            // Only include if within the month range
            if ($gregorianDate->between($startDate, $endDate)) {
                return [
                    'id' => $holiday->id,
                    'title' => $holiday->name, // Frontend expects title
                    'name' => $holiday->name,
                    'name_arabic' => $holiday->name_arabic,
                    'date' => $gregorianDate->toDateString(),
                    'hijri_date' => "{$holiday->hijri_day} {$this->getMonthName($holiday->hijri_month)}",
                    'duration_days' => $holiday->duration_days,
                    'description' => $holiday->description,
                    'type' => 'islamic',
                ];
            }
            return null;
        })->filter()->values();
    }
}
