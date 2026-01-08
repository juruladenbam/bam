<?php

namespace App\Repositories;

use App\Models\Person;
use App\Models\Marriage;
use App\Models\ParentChild;
use App\Repositories\Contracts\PersonRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PersonRepository implements PersonRepositoryInterface
{
    public function __construct(protected Person $model)
    {
    }

    public function all(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->query();

        if (isset($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        if (isset($filters['generation'])) {
            $query->where('generation', $filters['generation']);
        }

        if (isset($filters['gender'])) {
            $query->where('gender', $filters['gender']);
        }

        if (isset($filters['is_alive'])) {
            $query->where('is_alive', $filters['is_alive']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('full_name', 'like', "%{$filters['search']}%")
                  ->orWhere('nickname', 'like', "%{$filters['search']}%");
            });
        }

        $sortBy = $filters['sort_by'] ?? 'full_name';
        $sortDir = $filters['sort_dir'] ?? 'asc';
        $query->orderBy($sortBy, $sortDir);

        return $query->with('branch')->paginate($filters['per_page'] ?? 15);
    }

    public function find(int $id): ?Person
    {
        return $this->model->find($id);
    }

    public function findOrFail(int $id): Person
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data): Person
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): Person
    {
        $person = $this->findOrFail($id);
        $person->update($data);
        return $person->fresh();
    }

    public function delete(int $id): bool
    {
        return $this->findOrFail($id)->delete();
    }

    public function getByBranch(int $branchId): Collection
    {
        return $this->model
            ->where('branch_id', $branchId)
            ->orderBy('generation')
            ->orderBy('birth_date')
            ->get();
    }

    public function search(string $query, int $limit = 10, int $offset = 0, ?string $gender = null): Collection
    {
        $q = $this->model
            ->where(function ($q) use ($query) {
                $q->where('full_name', 'like', "%{$query}%")
                  ->orWhere('nickname', 'like', "%{$query}%");
            });

        if ($gender) {
            $q->where('gender', $gender);
        }

        return $q->skip($offset)
            ->take($limit)
            ->with('branch:id,name,order')
            ->get(['id', 'full_name', 'nickname', 'gender', 'branch_id']);
    }

    public function getAncestors(int $personId): Collection
    {
        $ancestors = collect();
        $this->findAncestorsRecursive($personId, $ancestors);
        return $ancestors;
    }

    protected function findAncestorsRecursive(int $personId, Collection &$ancestors): void
    {
        // Find parent_child record where this person is the child
        $parentChildRecords = ParentChild::where('child_id', $personId)->get();

        foreach ($parentChildRecords as $record) {
            $marriage = Marriage::find($record->marriage_id);
            if (!$marriage) continue;

            // Add both parents if not already in ancestors
            foreach ([$marriage->husband_id, $marriage->wife_id] as $parentId) {
                if ($parentId && !$ancestors->contains('id', $parentId)) {
                    $parent = $this->find($parentId);
                    if ($parent) {
                        $ancestors->push($parent);
                        // Recursively find ancestors of this parent
                        $this->findAncestorsRecursive($parentId, $ancestors);
                    }
                }
            }
        }
    }

    public function getDescendants(int $personId): Collection
    {
        $descendants = collect();
        $this->findDescendantsRecursive($personId, $descendants);
        return $descendants;
    }

    protected function findDescendantsRecursive(int $personId, Collection &$descendants): void
    {
        // Find all marriages where this person is husband or wife
        $marriages = Marriage::where('husband_id', $personId)
            ->orWhere('wife_id', $personId)
            ->get();

        foreach ($marriages as $marriage) {
            // Get all children of this marriage
            $children = ParentChild::where('marriage_id', $marriage->id)->get();

            foreach ($children as $childRecord) {
                if (!$descendants->contains('id', $childRecord->child_id)) {
                    $child = $this->find($childRecord->child_id);
                    if ($child) {
                        $descendants->push($child);
                        // Recursively find descendants
                        $this->findDescendantsRecursive($childRecord->child_id, $descendants);
                    }
                }
            }
        }
    }

    public function getWithRelationships(int $id): Person
    {
        return $this->model
            ->with([
                'branch',
                'marriagesAsHusband.wife',
                'marriagesAsHusband.children.child',
                'marriagesAsWife.husband',
                'marriagesAsWife.children.child',
            ])
            ->findOrFail($id);
    }
}
