<?php

namespace App\Services;

use App\Models\Person;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class CommemorationService
{
    public function __construct(
        protected HijriService $hijriService
    ) {
    }

    /**
     * Fixed commemorations configuration (days after death)
     */
    protected array $fixedCommemorations = [
        '7_hari' => ['days' => 6, 'label' => '7 Hari'],
        '40_hari' => ['days' => 39, 'label' => '40 Hari'],
        '100_hari' => ['days' => 99, 'label' => '100 Hari'],
        '1000_hari' => ['days' => 999, 'label' => '1000 Hari'],
    ];

    /**
     * Get all commemorations within a date range
     * Optimized to filter at database level where possible
     */
    public function getUpcoming(Carbon $from, Carbon $to): Collection
    {
        $commemorations = collect();

        // Calculate date ranges for fixed commemorations
        // If someone died X days before, their commemorations would be in this range
        $maxDays = 999; // 1000 days
        $earliestDeathForFixed = $from->copy()->subDays($maxDays);
        $latestDeathForFixed = $to->copy()->subDays(6); // 7 days minimum

        // Get persons who might have fixed commemorations in this range
        $deceasedForFixed = Person::whereNotNull('death_date')
            ->where('is_alive', false)
            ->whereBetween('death_date', [$earliestDeathForFixed, $latestDeathForFixed])
            ->select(['id', 'full_name', 'death_date'])
            ->get();

        foreach ($deceasedForFixed as $person) {
            $fixedComms = $this->getFixedCommemorations($person, $from, $to);
            $commemorations = $commemorations->merge($fixedComms);
        }

        // For haul, we need a different approach - persons who died before this range
        // and might have their death anniversary in this month (Hijri-based)
        // Limit to last 100 years of deaths to be reasonable
        $deceasedForHaul = Person::whereNotNull('death_date')
            ->where('is_alive', false)
            ->where('death_date', '<', $earliestDeathForFixed) // Not already included above
            ->where('death_date', '>=', now()->subYears(100))
            ->select(['id', 'full_name', 'death_date'])
            ->limit(500) // Safety limit
            ->get();

        foreach ($deceasedForHaul as $person) {
            $haulComms = $this->getHaulForRange($person, $from, $to);
            $commemorations = $commemorations->merge($haulComms);
        }

        // Also check haul for recent deaths (included in fixed query)
        foreach ($deceasedForFixed as $person) {
            $haulComms = $this->getHaulForRange($person, $from, $to);
            $commemorations = $commemorations->merge($haulComms);
        }

        return $commemorations->sortBy('date')->values();
    }

    /**
     * Get fixed commemorations (7, 40, 100, 1000 days) that fall within range
     */
    protected function getFixedCommemorations(Person $person, Carbon $from, Carbon $to): array
    {
        $results = [];
        $deathDate = Carbon::parse($person->death_date);

        foreach ($this->fixedCommemorations as $type => $config) {
            $commDate = $deathDate->copy()->addDays($config['days']);

            if ($commDate->between($from, $to)) {
                $results[] = [
                    'type' => 'commemoration',
                    'commemoration_type' => $type,
                    'label' => $config['label'],
                    'date' => $commDate->toDateString(),
                    'person_id' => $person->id,
                    'person_name' => $person->full_name,
                    'hijri_date' => $this->hijriService->format($commDate),
                ];
            }
        }

        return $results;
    }

    /**
     * Get haul (annual commemoration) that falls within range
     * Haul is calculated based on Hijri year since death
     */
    protected function getHaulForRange(Person $person, Carbon $from, Carbon $to): array
    {
        $results = [];
        $deathDate = Carbon::parse($person->death_date);
        $deathHijri = $this->hijriService->toHijri($deathDate);
        
        $fromHijri = $this->hijriService->toHijri($from);
        $toHijri = $this->hijriService->toHijri($to);

        // Check each Hijri year in the range
        for ($year = $fromHijri['year']; $year <= $toHijri['year']; $year++) {
            $haulYear = $year - $deathHijri['year'];

            // Only include positive haul years
            if ($haulYear > 0) {
                try {
                    $haulDate = $this->hijriService->toGregorian(
                        $year,
                        $deathHijri['month'],
                        $deathHijri['day']
                    );

                    if ($haulDate->between($from, $to)) {
                        $results[] = [
                            'type' => 'commemoration',
                            'commemoration_type' => 'haul',
                            'label' => "Haul ke-{$haulYear}",
                            'haul_year' => $haulYear,
                            'date' => $haulDate->toDateString(),
                            'person_id' => $person->id,
                            'person_name' => $person->full_name,
                            'hijri_date' => $this->hijriService->format($haulDate),
                        ];
                    }
                } catch (\Exception $e) {
                    // Skip if date conversion fails (edge cases)
                    continue;
                }
            }
        }

        return $results;
    }

    /**
     * Calculate all commemoration dates for a specific person
     */
    public function calculateDatesForPerson(Person $person): array
    {
        $deathDate = Carbon::parse($person->death_date);
        $deathHijri = $this->hijriService->toHijri($deathDate);
        $currentHijri = $this->hijriService->toHijri(now());

        $dates = [];

        // Fixed commemorations
        foreach ($this->fixedCommemorations as $type => $config) {
            $commDate = $deathDate->copy()->addDays($config['days']);
            $dates[$type] = [
                'date' => $commDate->toDateString(),
                'label' => $config['label'],
                'hijri_date' => $this->hijriService->format($commDate),
                'is_past' => $commDate->isPast(),
            ];
        }

        // Next 5 upcoming hauls
        $currentHaulYear = $currentHijri['year'] - $deathHijri['year'];
        for ($i = 0; $i < 5; $i++) {
            $haulYear = max(1, $currentHaulYear + $i);
            try {
                $haulDate = $this->hijriService->toGregorian(
                    $deathHijri['year'] + $haulYear,
                    $deathHijri['month'],
                    $deathHijri['day']
                );

                $dates["haul_{$haulYear}"] = [
                    'date' => $haulDate->toDateString(),
                    'label' => "Haul ke-{$haulYear}",
                    'hijri_date' => $this->hijriService->format($haulDate),
                    'is_past' => $haulDate->isPast(),
                ];
            } catch (\Exception $e) {
                continue;
            }
        }

        return $dates;
    }
}
