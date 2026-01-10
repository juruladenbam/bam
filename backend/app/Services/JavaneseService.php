<?php

namespace App\Services;

use Carbon\Carbon;
use Irsyadulibad\Weton\Weton;

class JavaneseService
{
    /**
     * Get weton information for a date
     */
    public function getWeton(Carbon $date): array
    {
        $weton = new Weton($date);
        $weton->toIndonesian();

        return [
            'dino' => $weton->day->name,
            'pasaran' => $weton->pasaran->name,
            'weton' => (string) $weton,
            'neptu_dino' => $weton->day->neptu,
            'neptu_pasaran' => $weton->pasaran->neptu,
            'neptu_total' => $weton->totalNeptu,
        ];
    }

    /**
     * Format date with Javanese weton
     */
    public function format(Carbon $date): string
    {
        $weton = new Weton($date);
        $weton->toIndonesian();
        return (string) $weton;
    }
}
