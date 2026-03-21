<?php

namespace App\Console\Commands;

use App\Models\Marriage;
use App\Models\ParentChild;
use App\Models\Person;
use App\Services\PersonService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RebuildNibsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bam:rebuild-nibs {--root-birth-order=8 : Birth order for the root (Abdul Manan Ali)} {--dry-run : Only show what would be updated}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize birth order and rebuild NIB tree from root';

    protected PersonService $personService;

    public function __construct(PersonService $personService)
    {
        parent::__construct();
        $this->personService = $personService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $rootBirthOrder = (int) $this->option('root-birth-order');
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info("🔍 DRY RUN: No data will be written.");
        }

        // 1. Find root
        $root = Person::where('is_root', true)->first();
        if (!$root) {
            $this->error("Root person not found!");
            return self::FAILURE;
        }

        $this->info("Starting NIB rebuild from root: {$root->full_name}");

        // 2. Fix global birth orders for multiple marriages (Bloodline unique)
        $this->fixCrossMarriageBirthOrders($dryRun);

        // 3. Synchronize birth_order between persons table and parent_child table for others
        $this->syncBirthOrderFields($dryRun);

        // 3. Clear all NIBs to avoid unique conflicts during massive rebuild (optional but safer)
        if (!$dryRun) {
            $confirm = $this->confirm("All existing NIBs will be cleared and regenerated. Continue?");
            if (!$confirm) return self::SUCCESS;
            
            $this->info("Clearing existing NIBs...");
            Person::query()->update(['nib' => null]);
        }

        // 4. Start rebuilding from root
        DB::beginTransaction();
        try {
            // Root base NIB (padded 2 digits)
            $rootBase = str_pad((string) $rootBirthOrder, 2, '0', STR_PAD_LEFT);
            $rootNib = $rootBase . '000';
            
            if (!$dryRun) {
                $root->nib = $rootNib;
                $root->save();
                $this->info("Root assigned NIB: {$rootNib}");
                
                // Recursively build children
                // Note: PersonService->regenerateNibRecursive starts from person.
                // It already handles spouses and descendants.
                $this->personService->regenerateNibRecursive($root);
            } else {
                $this->info("WOULD assign Root NIB: {$rootNib}");
            }

            if (!$dryRun) {
                DB::commit();
                $this->info("✅ NIB tree rebuilt successfully.");
            } else {
                DB::rollBack();
                $this->info("🔍 Dry run completed scope.");
            }

            return self::SUCCESS;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Error rebuilding NIBs: " . $e->getMessage());
            $this->line($e->getTraceAsString());
            return self::FAILURE;
        }
    }

    /**
     * Sync birth_order in persons table from parent_child table
     */
    protected function syncBirthOrderFields(bool $dryRun)
    {
        $this->info("Syncing birth_order fields from parent_child table...");
        
        $relations = DB::table('parent_child')->get();
        $updated = 0;

        foreach ($relations as $rel) {
            $person = Person::find($rel->child_id);
            if ($person && $person->birth_order !== $rel->birth_order) {
                if (!$dryRun) {
                    $person->update(['birth_order' => $rel->birth_order]);
                }
                $updated++;
            }
        }

        $this->info("✅ Found and synced {$updated} persons with mismatched birth_order.");
    }

    /**
     * Fix duplicate birth orders for parents with multiple marriages
     */
    protected function fixCrossMarriageBirthOrders(bool $dryRun)
    {
        $this->info("Checking for birth order collisions in multiple marriages...");

        // Find parents with multiple marriages
        $parentIds = DB::table('marriages')
            ->select('husband_id as parent_id')
            ->whereNotNull('husband_id')
            ->groupBy('husband_id')
            ->havingRaw('COUNT(*) > 1')
            ->union(
                DB::table('marriages')
                    ->select('wife_id as parent_id')
                    ->whereNotNull('wife_id')
                    ->groupBy('wife_id')
                    ->havingRaw('COUNT(*) > 1')
            )
            ->pluck('parent_id');

        $totalFixed = 0;

        foreach ($parentIds as $parentId) {
            // Get all children from all marriages of this parent
            $marriages = DB::table('marriages')
                ->where('husband_id', $parentId)
                ->orWhere('wife_id', $parentId)
                ->pluck('id');

            $children = DB::table('parent_child')
                ->whereIn('marriage_id', $marriages)
                ->join('persons', 'parent_child.child_id', '=', 'persons.id')
                ->select('parent_child.*', 'persons.birth_date', 'persons.full_name')
                // Order by Marriage ID (as proxy for marriage order) and then their current order
                ->orderBy('parent_child.marriage_id')
                ->orderBy('parent_child.birth_order')
                ->get();

            $seenOrders = [];
            $currentGlobalOrder = 1;

            foreach ($children as $child) {
                if (!$dryRun) {
                    // Update to unique global order for this parent
                    DB::table('parent_child')
                        ->where('id', $child->id)
                        ->update(['birth_order' => $currentGlobalOrder]);
                        
                    DB::table('persons')
                        ->where('id', $child->child_id)
                        ->update(['birth_order' => $currentGlobalOrder]);
                }
                $currentGlobalOrder++;
                $totalFixed++;
            }
        }

        $this->info("✅ Adjusted {$totalFixed} children to have unique global birth orders.");
    }
}
