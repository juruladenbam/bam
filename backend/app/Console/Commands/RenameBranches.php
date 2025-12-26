<?php

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Person;
use App\Models\Marriage;
use App\Models\ParentChild;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RenameBranches extends Command
{
    protected $signature = 'silsilah:rename-branches';
    protected $description = 'Rename branches to "Qobilah {Name}" based on Abdul Manan children';

    public function handle()
    {
        $this->info("Renaming branches...");

        $abdulManan = Person::where('legacy_id', 'I0000')->first();
        if (!$abdulManan) {
            $this->error("Abdul Manan (I0000) not found.");
            return 1;
        }

        // Get children of Abdul Manan
        // We need to respect the order they were assigned to branches originally.
        // The original import assigned them sequentially via loop over marriages then children.
        // Assumption: Marriages are fetched in order or sorted by ID is okay? 
        // ImportSilsilahCsv uses: $marriages = Marriage::where('husband_id', $abdulManan->id)->get();
        // and then creates existing branches 1..10 hardcoded.
        
        $marriages = Marriage::where('husband_id', $abdulManan->id)->get();
        
        $branchOrder = 1;
        
        DB::beginTransaction();
        try {
            foreach ($marriages as $marriage) {
                // SilsilahImport sorts by birth_order implicitly if DB order is preserved, 
                // but explicit orderBy is safer if data exists
                $children = ParentChild::where('marriage_id', $marriage->id)
                    ->orderBy('birth_order') 
                    ->get();

                foreach ($children as $parentChild) {
                    if ($branchOrder > 10) break;

                    $child = Person::find($parentChild->child_id);
                    if (!$child) continue;

                    $branch = Branch::where('order', $branchOrder)->first();
                    
                    if ($branch) {
                        $oldName = $branch->name;
                        // Format: "Qobilah {Name}" as requested
                        $newName = "Qobilah {$child->full_name}";
                        
                        $branch->update([
                            'name' => $newName,
                            'description' => "Keturunan dari {$child->full_name}"
                        ]);
                        
                        $this->info("Renamed Branch {$branchOrder}: [{$oldName}] -> [{$newName}]");
                    } else {
                         //$this->warn("Branch order {$branchOrder} not found.");
                    }
                    
                    $branchOrder++;
                }
            }
            
            // "sesuaikan jadi 10 saja" -> Delete branches > 10 if customized
            $deleted = Branch::where('order', '>', 10)->where('order', '<', 99)->delete();
            if ($deleted > 0) {
               $this->info("Deleted {$deleted} extra branches (>10).");
            }

            // "untuk pasangan luar hilangkan saja untuk saat ini" 
            // We cannot delete Branch 99 because of FK constraints (persons branch_id is not nullable).
            // We will hide it in the frontend instead.
            // $deletedPL = Branch::where('order', 99)->delete();

            
            DB::commit();
            $this->info("✅ Branch renaming and cleanup completed successfully.");
            return 0;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error($e->getMessage());
            return 1;
        }
    }
}
