<?php

namespace App\Console\Commands;

use App\Models\Marriage;
use App\Models\ParentChild;
use App\Models\Person;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateNibCommand extends Command
{
    protected $signature = 'nib:generate {--root-birth-order=8 : Birth order of root among their siblings} {--force : Overwrite existing NIBs}';
    protected $description = 'Generate Nomor Induk BAM (NIB) for all persons';

    private int $processedCount = 0;

    public function handle(): int
    {
        $rootBirthOrder = (int) $this->option('root-birth-order');
        $force = $this->option('force');

        $this->info("Generating NIB with root birth order: {$rootBirthOrder}");

        // Find root person
        $root = Person::where('is_root', true)->first();

        if (!$root) {
            $this->error('Root person not found! Please mark someone as is_root=true.');
            return Command::FAILURE;
        }

        $this->info("Found root: {$root->full_name} (ID: {$root->id})");

        DB::beginTransaction();

        try {
            // Process root - use 2-digit padding for root birth order
            $rootBase = str_pad((string) $rootBirthOrder, 2, '0', STR_PAD_LEFT);
            $this->assignNib($root, $rootBase, $force);

            // Process root's spouses
            $this->processSpouses($root, $rootBase, $force);

            // Process descendants recursively
            $this->processDescendants($root, $rootBase, $force);

            DB::commit();

            $this->newLine();
            $this->info("✅ Successfully generated NIB for {$this->processedCount} persons.");

            return Command::SUCCESS;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Error: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }

    /**
     * Assign NIB to a bloodline member (suffix 000)
     */
    private function assignNib(Person $person, string $baseNib, bool $force): void
    {
        $nib = $baseNib . '000';

        if ($person->nib && !$force) {
            $this->line("  Skipping {$person->full_name} (already has NIB: {$person->nib})");
            return;
        }

        $person->nib = $nib;
        $person->save();
        $this->processedCount++;

        $this->line("  [{$nib}] {$person->full_name}");
    }

    /**
     * Process spouses for a person (suffix 001, 002, ...)
     */
    private function processSpouses(Person $person, string $baseNib, bool $force): void
    {
        $marriages = Marriage::where('husband_id', $person->id)
            ->orWhere('wife_id', $person->id)
            ->orderBy('id') // Order by marriage record for consistency
            ->get();

        $spouseIndex = 1;

        foreach ($marriages as $marriage) {
            // Get the spouse (the other person in the marriage)
            $spouseId = $marriage->husband_id === $person->id
                ? $marriage->wife_id
                : $marriage->husband_id;

            $spouse = Person::find($spouseId);

            if (!$spouse) {
                continue;
            }

            // Only assign spouse NIB if they don't have a bloodline NIB (ending in 000)
            // This handles internal marriages where both are BAM members
            if ($spouse->nib && str_ends_with($spouse->nib, '000')) {
                $this->line("    ↳ Spouse {$spouse->full_name} is a BAM member with NIB: {$spouse->nib}");
                continue;
            }

            if ($spouse->nib && !$force) {
                $this->line("    ↳ Skipping spouse {$spouse->full_name} (already has NIB: {$spouse->nib})");
                $spouseIndex++;
                continue;
            }

            $spouseNib = $baseNib . str_pad((string) $spouseIndex, 3, '0', STR_PAD_LEFT);
            $spouse->nib = $spouseNib;
            $spouse->save();
            $this->processedCount++;

            $this->line("    ↳ [{$spouseNib}] {$spouse->full_name} (spouse)");
            $spouseIndex++;
        }
    }

    /**
     * Process all descendants recursively
     */
    private function processDescendants(Person $person, string $parentBaseNib, bool $force): void
    {
        // Get all marriages of this person
        $marriages = Marriage::where('husband_id', $person->id)
            ->orWhere('wife_id', $person->id)
            ->orderBy('id')
            ->get();

        // Collect all children from all marriages, then sort globally
        $allChildren = collect();
        
        foreach ($marriages as $marriage) {
            $children = ParentChild::where('marriage_id', $marriage->id)
                ->with('child')
                ->get();
            
            foreach ($children as $parentChild) {
                if ($parentChild->child) {
                    $allChildren->push([
                        'child' => $parentChild->child,
                        'birth_order' => $parentChild->birth_order ?? 999,
                        'marriage_id' => $marriage->id,
                        'id' => $parentChild->id,
                    ]);
                }
            }
        }

        // Sort by marriage_id first (keeps children of each wife together), then birth_order, then id
        $allChildren = $allChildren->sortBy([
            ['marriage_id', 'asc'],
            ['birth_order', 'asc'],
            ['id', 'asc'],
        ])->values();

        // Assign NIBs to all children with global sequence
        foreach ($allChildren as $index => $childData) {
            $child = $childData['child'];
            
            // Child's sequence (1-indexed, global across all marriages) - 2-digit padded
            $childSequence = str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT);
            $childBaseNib = $parentBaseNib . $childSequence;

            // Assign NIB to child
            $this->assignNib($child, $childBaseNib, $force);

            // Process child's spouses
            $this->processSpouses($child, $childBaseNib, $force);

            // Recursively process child's descendants
            $this->processDescendants($child, $childBaseNib, $force);
        }
    }
}
