<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RandomizeDummyDeathDates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'data:randomize-dummy-death-dates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Acak data tgl wafat dummy (2025-01-01) menjadi 1 Januari tahun 1970-2005';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Memeriksa data dengan tanggal wafat dummy...");

        // Mencari target: 2025-01-01 ATAU rentang 1970-2005 (yang baru saja diacak)
        $persons = DB::table('persons')
            ->where('is_alive', 0)
            ->where(function($query) {
                $query->where('death_date', '2025-01-01')
                      ->orWhere(function($q) {
                          $q->whereYear('death_date', '>=', 1970)
                            ->whereYear('death_date', '<=', 2005);
                      });
            })->get(['id']);
        
        if ($persons->isEmpty()) {
            $this->info("Tidak ada data dummy yang ditemukan.");
            return;
        }

        $this->info("Ditemukan {$persons->count()} data. Menjalankan randomisasi (Tahun saja, 1 Januari)...");
        
        $bar = $this->output->createProgressBar($persons->count());
        $bar->start();

        foreach ($persons as $person) {
            // Probabilitas: 75% tahun 1970-1995, 25% tahun 1996-2005
            if (rand(1, 100) <= 75) {
                $year = rand(1970, 1995);
            } else {
                $year = rand(1996, 2005);
            }

            // Hanya tahun yang diacak, bulan & hari dipatok 1 Januari sebagai penanda dummy
            DB::table('persons')->where('id', $person->id)->update([
                'death_date' => "{$year}-01-01"
            ]);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Selesai! Berhasil mengubah {$persons->count()} baris data dummy menjadi lebih realistis.");
    }
}
