<?php

namespace App\Repositories;

use App\Models\Marriage;
use App\Models\ParentChild;
use App\Models\Person;
use App\Repositories\Contracts\MarriageRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class MarriageRepository implements MarriageRepositoryInterface
{
    public function __construct(protected Marriage $model)
    {
    }

    public function all(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->query()
            ->with(['husband', 'wife'])
            ->withCount('children');

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['is_internal'])) {
            $query->where('is_internal', $filters['is_internal']);
        }

        if (isset($filters['year'])) {
            $query->whereYear('marriage_date', $filters['year']);
        }

        return $query->orderByDesc('marriage_date')->paginate($filters['per_page'] ?? 15);
    }

    public function find(int $id): ?Marriage
    {
        return $this->model->find($id);
    }

    public function findOrFail(int $id): Marriage
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data): Marriage
    {
        // Check if this is an internal marriage
        if (isset($data['husband_id']) && isset($data['wife_id'])) {
            $data['is_internal'] = $this->isInternal($data['husband_id'], $data['wife_id']);
        }

        return $this->model->create($data);
    }

    public function update(int $id, array $data): Marriage
    {
        $marriage = $this->findOrFail($id);

        // Recalculate is_internal if spouse changed
        if (isset($data['husband_id']) || isset($data['wife_id'])) {
            $husbandId = $data['husband_id'] ?? $marriage->husband_id;
            $wifeId = $data['wife_id'] ?? $marriage->wife_id;
            $data['is_internal'] = $this->isInternal($husbandId, $wifeId);
        }

        $marriage->update($data);
        return $marriage->fresh();
    }

    public function delete(int $id): bool
    {
        return $this->findOrFail($id)->delete();
    }

    public function getByPerson(int $personId): Collection
    {
        return $this->model
            ->where('husband_id', $personId)
            ->orWhere('wife_id', $personId)
            ->with(['husband', 'wife', 'children.child'])
            ->get();
    }

    public function getChildren(int $marriageId): Collection
    {
        return ParentChild::where('marriage_id', $marriageId)
            ->with('child')
            ->orderBy('birth_order')
            ->get()
            ->pluck('child');
    }

    public function addChild(int $marriageId, int $childId, int $birthOrder = 1): void
    {
        ParentChild::create([
            'marriage_id' => $marriageId,
            'child_id' => $childId,
            'birth_order' => $birthOrder,
        ]);
    }

    public function isInternal(int $husbandId, int $wifeId): bool
    {
        // Internal marriage: both spouses are BAM descendants (not external/pasangan luar)
        // External spouse branch has order = 99
        $husband = Person::with('branch')->find($husbandId);
        $wife = Person::with('branch')->find($wifeId);

        if (!$husband || !$wife) {
            return false;
        }

        // Get the external spouse branch order (order = 99 means "Pasangan Luar")
        $externalBranchOrder = 99;
        
        $husbandIsBAM = $husband->branch && $husband->branch->order < $externalBranchOrder;
        $wifeIsBAM = $wife->branch && $wife->branch->order < $externalBranchOrder;

        // If both are BAM descendants, it's an internal marriage
        return $husbandIsBAM && $wifeIsBAM;
    }
}
