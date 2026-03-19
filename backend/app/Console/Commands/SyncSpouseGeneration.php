<?php

namespace App\Console\Commands;

use App\Models\Marriage;
use App\Models\Person;
use Illuminate\Console\Command;

class SyncSpouseGeneration extends Command
{
    protected $signature = 'silsilah:sync-spouse-generation';
    protected $description = 'Sync spouse generation to match their partner\'s generation';

    public function handle()
    {
        $this->info('Syncing spouse generations...');

        // Find all persons with generation = 0 (spouses from outside)
        $spouses = Person::where('generation', 0)->get();

        $updated = 0;
        $skipped = 0;

        /** @var Person $spouse */
        foreach ($spouses as $spouse) {
            // Find the marriage(s) this spouse is part of
            $marriage = Marriage::where('husband_id', $spouse->id)
                ->orWhere('wife_id', $spouse->id)
                ->first();

            if (!$marriage) {
                $this->warn("  No marriage found for: {$spouse->full_name} (ID: {$spouse->id})");
                $skipped++;
                continue;
            }

            // Determine the partner (the keturunan, not the spouse)
            $partnerId = $marriage->husband_id === $spouse->id
                ? $marriage->wife_id
                : $marriage->husband_id;

            $partner = Person::find($partnerId);

            if (!$partner || $partner->generation === 0) {
                $this->warn("  Partner not found or also gen 0: {$spouse->full_name} → Partner ID: {$partnerId}");
                $skipped++;
                continue;
            }

            // Update spouse's generation to match partner
            $oldGen = $spouse->generation;
            $spouse->generation = $partner->generation;
            $spouse->save();

            $updated++;
            $this->line("  ✓ {$spouse->full_name}: gen {$oldGen} → gen {$partner->generation} (partner: {$partner->full_name})");
        }

        $this->newLine();
        $this->info("Done! Updated: {$updated}, Skipped: {$skipped}");

        return self::SUCCESS;
    }
}
