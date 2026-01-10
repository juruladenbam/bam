<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\CommemorationService;
use App\Services\HijriService;
use App\Services\JavaneseService;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected HijriService $hijriService,
        protected JavaneseService $javaneseService,
        protected CommemorationService $commemorationService
    ) {
    }

    /**
     * Get calendar data for a month
     * GET /api/portal/calendar?year=2026&month=1
     */
    public function index(Request $request): JsonResponse
    {
        $year = (int) $request->input('year', now()->year);
        $month = (int) $request->input('month', now()->month);

        $startDate = Carbon::create($year, $month, 1)->startOfDay();
        $endDate = $startDate->copy()->endOfMonth()->endOfDay();

        // Build days with Hijri and Weton
        $days = $this->buildDaysData($startDate, $endDate);

        // Get family events from existing events table
        $familyEvents = Event::where('is_active', true)
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        $q->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                    });
            })
            ->get()
            ->map(fn ($event) => [
                'id' => $event->id,
                'type' => 'family',
                'title' => $event->name,
                'slug' => $event->slug,
                'date' => Carbon::parse($event->start_date)->toDateString(),
                'start_date' => Carbon::parse($event->start_date)->toDateString(),
                'end_date' => Carbon::parse($event->end_date)->toDateString(),
                'location' => $event->location_name,
                'thumbnail' => $event->thumbnail_url,
            ]);

        // Get Islamic holidays for this month
        $islamicHolidays = $this->hijriService->getHolidaysForMonth($year, $month);

        // Get commemorations (7, 40, 100, 1000 days + haul)
        $commemorations = $this->commemorationService->getUpcoming($startDate, $endDate);

        // Get current Hijri month info
        $midMonthHijri = $this->hijriService->toHijri($startDate->copy()->addDays(14));

        return $this->success([
            'year' => $year,
            'month' => $month,
            'hijri_offset' => $this->hijriService->getOffset(),
            'hijri_month' => [
                'year' => $midMonthHijri['year'],
                'month' => $midMonthHijri['month'],
                'month_name' => $midMonthHijri['month_name'],
            ],
            'days' => $days,
            'events' => [
                'family' => $familyEvents,
                'islamic' => $islamicHolidays,
                'commemorations' => $commemorations,
            ],
        ], 'Data kalender');
    }

    /**
     * Build days array with Hijri and Weton for each day
     */
    protected function buildDaysData(Carbon $startDate, Carbon $endDate): array
    {
        $days = [];
        $current = $startDate->copy();

        while ($current <= $endDate) {
            $hijri = $this->hijriService->toHijri($current);
            $weton = $this->javaneseService->getWeton($current);

            $days[] = [
                'date' => $current->toDateString(),
                'day' => $current->day,
                'hijri' => [
                    'day' => $hijri['day'],
                    'month' => $hijri['month'],
                    'month_name' => $hijri['month_name'],
                    'year' => $hijri['year'],
                ],
                'hijri_formatted' => $this->hijriService->format($current),
                'weton' => $weton['weton'],
                'pasaran' => $weton['pasaran'],
            ];

            $current->addDay();
        }

        return $days;
    }
}
