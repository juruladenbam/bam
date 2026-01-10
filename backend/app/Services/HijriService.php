<?php

namespace App\Services;

use App\Models\IslamicHoliday;
use App\Models\SiteSetting;
use biladina\hijridatetime\HijriDateTime;
use Remls\HijriDate\HijriDate;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class HijriService
{
    /**
     * Cached offset value (null = not loaded yet)
     */
    protected ?int $cachedOffset = null;

    /**
     * HijriDateTime instance (Umm al-Qura calendar - accurate for G2H)
     */
    protected HijriDateTime $hijri;

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

    public function __construct()
    {
        $this->hijri = new HijriDateTime();
    }

    /**
     * Get current Hijri offset from settings (-3 to +3)
     * Cached per request to avoid repeated database queries
     */
    public function getOffset(): int
    {
        if ($this->cachedOffset === null) {
            $offset = (int) SiteSetting::getValue('calendar.hijri_offset', 0);
            $this->cachedOffset = max(-3, min(3, $offset));
        }
        return $this->cachedOffset;
    }

    /**
     * Convert Gregorian date to Hijri with offset applied
     * Uses Umm al-Qura calendar via biladina/hijridatetime (more accurate)
     */
    public function toHijri(Carbon $date): array
    {
        // Apply offset
        $offset = $this->getOffset();
        $adjustedDate = $date->copy();
        if ($offset !== 0) {
            $adjustedDate = $adjustedDate->addDays($offset);
        }

        // Use GeToHijr method directly to avoid language lookup issues
        $result = $this->hijri->GeToHijr(
            $adjustedDate->day,
            $adjustedDate->month,
            $adjustedDate->year
        );

        return [
            'year' => (int) $result['year'],
            'month' => (int) $result['month'],
            'day' => (int) $result['day'],
            'month_name' => $this->monthNames[(int) $result['month']] ?? '',
        ];
    }

    /**
     * Convert Hijri date to Gregorian (with offset reversed)
     * Uses brute-force search to find matching date using biladina library
     * This ensures consistency with toHijri conversion
     */
    public function toGregorian(int $year, int $month, int $day): Carbon
    {
        // Start with an approximate date from remls library
        $hijri = new HijriDate($year, $month, $day);
        $approxDate = Carbon::parse($hijri->getGregorianDate());
        
        // Search around this date to find exact match using biladina
        // Check ±5 days to account for library differences
        for ($offset = -5; $offset <= 5; $offset++) {
            $testDate = $approxDate->copy()->addDays($offset);
            $result = $this->hijri->GeToHijr(
                $testDate->day,
                $testDate->month,
                $testDate->year
            );
            
            if ((int) $result['year'] === $year && 
                (int) $result['month'] === $month && 
                (int) $result['day'] === $day) {
                
                // Apply hijri offset in reverse
                $hijriOffset = $this->getOffset();
                if ($hijriOffset !== 0) {
                    $testDate = $testDate->subDays($hijriOffset);
                }
                
                // Create fresh Carbon instance to avoid timezone issues
                return Carbon::createFromFormat('Y-m-d', $testDate->toDateString())->startOfDay();
            }
        }
        
        // Fallback to remls if not found (shouldn't happen normally)
        $hijriOffset = $this->getOffset();
        if ($hijriOffset !== 0) {
            $approxDate = $approxDate->subDays($hijriOffset);
        }
        
        return $approxDate->startOfDay();
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
