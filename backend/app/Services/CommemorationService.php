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
     */
    public function getUpcoming(Carbon $from, Carbon $to): Collection
    {
        $deceased = Person::whereNotNull('death_date')
            ->where('is_alive', false)
            ->get();

        $commemorations = collect();

        foreach ($deceased as $person) {
            // Fixed commemorations
            $fixedComms = $this->getFixedCommemorations($person, $from, $to);
            $commemorations = $commemorations->merge($fixedComms);

            // Haul (unlimited, calculated dynamically)
            // Note: Haul is annual (Hijri), independent of 1000 days commemoration.
            // Haul 1st and 2nd will typically occur before 1000 days (approx 2.7 years).
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
