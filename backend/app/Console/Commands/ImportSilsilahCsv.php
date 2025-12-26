<?php

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Person;
use App\Models\Marriage;
use App\Models\ParentChild;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportSilsilahCsv extends Command
{
    protected $signature = 'silsilah:import {file? : Path to CSV file}';
    protected $description = 'Import silsilah data from CSV file';

    protected array $personMap = [];
    protected array $marriageMap = [];
    protected array $childrenByMarriage = [];
    protected int $generation1Count = 0;

    public function handle(): int
    {
        $file = $this->argument('file') ?? base_path('../docs/data_silsilah_bam_30_maret_2025 - data_silsilah_bam_30_maret_2025.csv');

        if (!file_exists($file)) {
            $this->error("File not found: {$file}");
            return 1;
        }

        $this->info("Importing from: {$file}");

        DB::beginTransaction();

        try {
            $this->createBranches();
            $this->parseFile($file);
            $this->importPersons();
            $this->importMarriages();
            $this->importChildren();
            $this->calculateGenerations();
            $this->assignBranches();

            DB::commit();
            $this->info("✅ Import completed successfully!");
            $this->table(['Metric', 'Count'], [
                ['Persons', Person::count()],
                ['Marriages', Marriage::count()],
                ['Parent-Child Links', ParentChild::count()],
            ]);

            return 0;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Import failed: " . $e->getMessage());
            $this->error($e->getTraceAsString());
            return 1;
        }
    }

    protected function createBranches(): void
    {
        $this->info("Creating branches...");

        $branches = [
            ['name' => 'Cabang 1', 'order' => 1, 'description' => 'Keturunan anak pertama Abdul Manan'],
            ['name' => 'Cabang 2', 'order' => 2, 'description' => 'Keturunan anak kedua Abdul Manan'],
            ['name' => 'Cabang 3', 'order' => 3, 'description' => 'Keturunan anak ketiga Abdul Manan'],
            ['name' => 'Cabang 4', 'order' => 4, 'description' => 'Keturunan anak keempat Abdul Manan'],
            ['name' => 'Cabang 5', 'order' => 5, 'description' => 'Keturunan anak kelima Abdul Manan'],
            ['name' => 'Cabang 6', 'order' => 6, 'description' => 'Keturunan anak keenam Abdul Manan'],
            ['name' => 'Cabang 7', 'order' => 7, 'description' => 'Keturunan anak ketujuh Abdul Manan'],
            ['name' => 'Cabang 8', 'order' => 8, 'description' => 'Keturunan anak kedelapan Abdul Manan'],
            ['name' => 'Cabang 9', 'order' => 9, 'description' => 'Keturunan anak kesembilan Abdul Manan'],
            ['name' => 'Cabang 10', 'order' => 10, 'description' => 'Keturunan anak kesepuluh Abdul Manan'],
            ['name' => 'Cabang 11', 'order' => 11, 'description' => 'Keturunan anak kesebelas Abdul Manan'],
            ['name' => 'Pasangan Luar', 'order' => 99, 'description' => 'Pasangan dari luar keluarga'],
        ];

        foreach ($branches as $branch) {
            Branch::updateOrCreate(['name' => $branch['name']], $branch);
        }
    }

    protected function parseFile(string $file): void
    {
        $this->info("Parsing CSV file...");

        $content = file_get_contents($file);
        $lines = explode("\n", $content);

        $section = 'persons';
        $personData = [];
        $marriageData = [];
        $childrenData = [];

        foreach ($lines as $index => $line) {
            $line = trim($line);
            if (empty($line)) continue;

            // Detect section change
            if (str_starts_with($line, 'Marriage,Husband')) {
                $section = 'marriages';
                continue;
            }

            // Skip header
            if ($index === 0 || str_starts_with($line, 'Person,Surname')) continue;

            $fields = str_getcsv($line);

            if ($section === 'persons') {
                // Check if this is a person row (starts with [I...])
                if (preg_match('/\[I\d+\]/', $fields[0] ?? '')) {
                    $personData[] = $fields;
                }
            } elseif ($section === 'marriages') {
                // Marriage row: [F0000],[I0000],[I0001],...
                if (preg_match('/\[F\d+\]/', $fields[0] ?? '')) {
                    // Check if this is a marriage definition or children link
                    if (preg_match('/\[I\d+\]/', $fields[1] ?? '') && preg_match('/\[I\d+\]/', $fields[2] ?? '')) {
                        // Marriage definition: Family, Husband, Wife
                        $marriageData[] = $fields;
                    } elseif (preg_match('/\[I\d+\]/', $fields[1] ?? '') && empty($fields[2])) {
                        // Children link: Family, Child
                        $childrenData[] = $fields;
                    }
                }
            }
        }

        $this->personMap = $personData;
        $this->marriageMap = $marriageData;
        $this->childrenByMarriage = $childrenData;

        $this->info("  Persons: " . count($personData));
        $this->info("  Marriages: " . count($marriageData));
        $this->info("  Children links: " . count($childrenData));
    }

    protected function importPersons(): void
    {
        $this->info("Importing persons...");

        $bar = $this->output->createProgressBar(count($this->personMap));
        $defaultBranch = Branch::where('name', 'Pasangan Luar')->first();

        foreach ($this->personMap as $row) {
            $legacyId = $this->extractId($row[0] ?? '');
            if (!$legacyId) continue;

            $fullName = trim($row[2] ?? 'Unknown');
            $gender = strtolower(trim($row[5] ?? 'male')) === 'female' ? 'female' : 'male';
            $deathDate = $this->parseDate($row[7] ?? '');
            $title = trim($row[4] ?? '');
            $isAlive = empty($deathDate);

            Person::updateOrCreate(
                ['legacy_id' => $legacyId],
                [
                    'full_name' => $fullName,
                    'nickname' => $title ? "{$title} {$fullName}" : null,
                    'gender' => $gender,
                    'death_date' => $deathDate,
                    'is_alive' => $isAlive,
                    'branch_id' => $defaultBranch->id,
                    'generation' => 0, // Will be calculated later
                ]
            );

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
    }

    protected function importMarriages(): void
    {
        $this->info("Importing marriages...");

        $bar = $this->output->createProgressBar(count($this->marriageMap));

        foreach ($this->marriageMap as $row) {
            $legacyId = $this->extractId($row[0] ?? '');
            $husbandLegacyId = $this->extractId($row[1] ?? '');
            $wifeLegacyId = $this->extractId($row[2] ?? '');
            $isActive = !str_contains(strtolower($row[5] ?? ''), 'non-active');

            if (!$legacyId || !$husbandLegacyId || !$wifeLegacyId) {
                $bar->advance();
                continue;
            }

            $husband = Person::where('legacy_id', $husbandLegacyId)->first();
            $wife = Person::where('legacy_id', $wifeLegacyId)->first();

            if (!$husband || !$wife) {
                $bar->advance();
                continue;
            }

            Marriage::updateOrCreate(
                ['legacy_id' => $legacyId],
                [
                    'husband_id' => $husband->id,
                    'wife_id' => $wife->id,
                    'is_active' => $isActive,
                ]
            );

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
    }

    protected function importChildren(): void
    {
        $this->info("Importing parent-child relationships...");

        $bar = $this->output->createProgressBar(count($this->childrenByMarriage));
        $birthOrder = [];

        foreach ($this->childrenByMarriage as $row) {
            $marriageLegacyId = $this->extractId($row[0] ?? '');
            $childLegacyId = $this->extractId($row[1] ?? '');

            if (!$marriageLegacyId || !$childLegacyId) {
                $bar->advance();
                continue;
            }

            $marriage = Marriage::where('legacy_id', $marriageLegacyId)->first();
            $child = Person::where('legacy_id', $childLegacyId)->first();

            if (!$marriage || !$child) {
                $bar->advance();
                continue;
            }

            // Track birth order per marriage
            if (!isset($birthOrder[$marriage->id])) {
                $birthOrder[$marriage->id] = 0;
            }
            $birthOrder[$marriage->id]++;

            ParentChild::updateOrCreate(
                ['marriage_id' => $marriage->id, 'child_id' => $child->id],
                ['birth_order' => $birthOrder[$marriage->id]]
            );

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
    }

    protected function calculateGenerations(): void
    {
        $this->info("Calculating generations...");

        // Find Abdul Manan (I0000)
        $abdulManan = Person::where('legacy_id', 'I0000')->first();

        if (!$abdulManan) {
            $this->warn("Abdul Manan (I0000) not found, skipping generation calculation");
            return;
        }

        // Set Abdul Manan as generation 1
        $abdulManan->update(['generation' => 1]);

        // BFS to calculate generations
        $this->calculateGenerationBFS($abdulManan->id, 1);

        $this->info("  Generations calculated");
    }

    protected function calculateGenerationBFS(int $personId, int $generation): void
    {
        // Find all marriages where this person is a parent
        $marriages = Marriage::where('husband_id', $personId)
            ->orWhere('wife_id', $personId)
            ->get();

        foreach ($marriages as $marriage) {
            // Get all children of this marriage
            $children = ParentChild::where('marriage_id', $marriage->id)->get();

            foreach ($children as $parentChild) {
                $child = Person::find($parentChild->child_id);
                if ($child && $child->generation === 0) {
                    $child->update(['generation' => $generation + 1]);
                    // Recursively calculate for this child
                    $this->calculateGenerationBFS($child->id, $generation + 1);
                }
            }
        }
    }

    protected function assignBranches(): void
    {
        $this->info("Assigning branches...");

        // Find Abdul Manan's direct children (generation 2)
        $abdulManan = Person::where('legacy_id', 'I0000')->first();
        if (!$abdulManan) return;

        // Get marriages of Abdul Manan
        $marriages = Marriage::where('husband_id', $abdulManan->id)->get();

        $branchOrder = 1;
        foreach ($marriages as $marriage) {
            $children = ParentChild::where('marriage_id', $marriage->id)->get();

            foreach ($children as $parentChild) {
                if ($branchOrder > 10) break; // Limit to 10 branches

                $child = Person::find($parentChild->child_id);
                if (!$child) continue;

                $branch = Branch::where('order', $branchOrder)->first();
                
                // Create branch if not exists (in case 1-10 are not all pre-seeded)
                if (!$branch) {
                    $branch = Branch::create([
                        'name' => "Qobilah {$child->full_name}",
                        'order' => $branchOrder,
                        'description' => "Keturunan dari {$child->full_name}"
                    ]);
                } else {
                    // Rename existing branch
                    $branch->update([
                        'name' => "Qobilah {$child->full_name}",
                        'description' => "Keturunan dari {$child->full_name}"
                    ]);
                }

                // Assign this child and all descendants to this branch
                $this->assignBranchToDescendants($child->id, $branch->id);
                $branchOrder++;
            }
        }

        $this->info("  Branches assigned");
    }

    protected function assignBranchToDescendants(int $personId, int $branchId): void
    {
        $person = Person::find($personId);
        if (!$person) return;

        $person->update(['branch_id' => $branchId]);

        // Find marriages and children
        $marriages = Marriage::where('husband_id', $personId)
            ->orWhere('wife_id', $personId)
            ->get();

        foreach ($marriages as $marriage) {
            $children = ParentChild::where('marriage_id', $marriage->id)->get();

            foreach ($children as $parentChild) {
                $this->assignBranchToDescendants($parentChild->child_id, $branchId);
            }
        }
    }

    protected function extractId(string $value): ?string
    {
        if (preg_match('/\[(I\d+|F\d+)\]/', $value, $matches)) {
            return $matches[1];
        }
        return null;
    }

    protected function parseDate(string $value): ?string
    {
        $value = trim($value);
        if (empty($value)) return null;

        // Handle M/D/YYYY format
        if (preg_match('/(\d{1,2})\/(\d{1,2})\/(\d{4})/', $value, $matches)) {
            return "{$matches[3]}-{$matches[1]}-{$matches[2]}";
        }

        return null;
    }
}
