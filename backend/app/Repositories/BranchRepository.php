<?php

namespace App\Repositories;

use App\Models\Branch;
use App\Repositories\Contracts\BranchRepositoryInterface;
use Illuminate\Support\Collection;

class BranchRepository implements BranchRepositoryInterface
{
    public function __construct(protected Branch $model)
    {
    }

    public function all(): Collection
    {
        return $this->model->orderBy('order')->get();
    }

    public function find(int $id): ?Branch
    {
        return $this->model->find($id);
    }

    public function findOrFail(int $id): Branch
    {
        return $this->model->findOrFail($id);
    }

    public function getAllWithStats(): Collection
    {
        $branches = $this->model
            ->withCount('persons')
            ->withCount(['persons as living_count' => function ($query) {
                $query->where('is_alive', true);
            }])
            ->orderBy('order')
            ->get();

        // Inject root_gender and calculating spouse_count
        foreach ($branches as $branch) {
            // 1. Root Gender Logic
            if (str_starts_with($branch->name, 'Qobilah ')) {
                $rootName = trim(substr($branch->name, 8)); // Remove 'Qobilah '
                $person = \App\Models\Person::where('full_name', $rootName)->first();
                
                $branch->root_gender = $person ? $person->gender : 'male'; 
            } else {
                $branch->root_gender = 'male';
            }

            // 2. Spouse Count Logic (Menantu)
            // Get all person IDs in this branch
            $personIds = \App\Models\Person::where('branch_id', $branch->id)->pluck('id');
            
            // Count marriages where one partner is in this branch and the other is NOT
            // Count marriages where one partner is in this branch and the other is NOT
            $spouseQuery = function($q) use ($personIds) {
                $q->whereIn('husband_id', $personIds)
                  ->whereNotIn('wife_id', $personIds);
            };
            
            $spouseQueryOr = function($q) use ($personIds) {
                $q->whereIn('wife_id', $personIds)
                  ->whereNotIn('husband_id', $personIds);
            };

            // Total Spouses
            $spouseCount = \App\Models\Marriage::where($spouseQuery)
                ->orWhere($spouseQueryOr)
                ->count();

            // Living Spouses (We need to join properly to check is_alive of the EXTERNAL spouse)
            // This is complex with Eloquent standard check. 
            // Simplified: Iterate or custom query?
            // Let's use get() and filter for accuracy or refined query.
            // Query approach:
            
            $marriages = \App\Models\Marriage::with(['husband', 'wife'])
                ->where(function($q) use ($personIds) {
                     $q->whereIn('husband_id', $personIds)
                       ->whereNotIn('wife_id', $personIds);
                })->orWhere(function($q) use ($personIds) {
                     $q->whereIn('wife_id', $personIds)
                       ->whereNotIn('husband_id', $personIds);
                })->get();

            $spouseTotal = 0;
            $spouseLiving = 0;

            foreach ($marriages as $marriage) {
                $spouseTotal++;
                // Check which one is the external spouse (not in personIds)
                // personIds is Collection/Array? It's a pluck result (Collection).
                // Use strict check.
                
                $isHusbandInternal = $personIds->contains($marriage->husband_id);
                $externalSpouse = $isHusbandInternal ? $marriage->wife : $marriage->husband;
                
                if ($externalSpouse && $externalSpouse->is_alive) {
                    $spouseLiving++;
                }
            }

            $branch->spouse_count = $spouseTotal;
            $branch->spouse_living_count = $spouseLiving;
        }

        return $branches;
    }

    public function getWithPersons(int $id): Branch
    {
        return $this->model
            ->with(['persons' => function ($query) {
                $query->orderBy('generation')->orderBy('birth_date');
            }])
            ->findOrFail($id);
    }
}
