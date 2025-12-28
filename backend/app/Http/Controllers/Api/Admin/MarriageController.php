<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMarriageRequest;
use App\Http\Requests\Admin\UpdateMarriageRequest;
use App\Services\MarriageService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class MarriageController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected MarriageService $marriageService
    ) {
    }

    /**
     * List all marriages
     * GET /api/admin/marriages
     */
    public function index(Request $request)
    {
        $filters = $request->only(['is_active', 'is_internal', 'year', 'per_page', 'search']);

        $marriages = $this->marriageService->getAllMarriages($filters);

        return $this->paginated($marriages, 'Daftar pernikahan berhasil dimuat');
    }

    /**
     * Show marriage detail with family
     * GET /api/admin/marriages/{id}
     */
    public function show(int $id)
    {
        $data = $this->marriageService->getMarriageWithFamily($id);

        return $this->success($data, 'Detail pernikahan berhasil dimuat');
    }

    /**
     * Create new marriage
     * POST /api/admin/marriages
     */
    public function store(StoreMarriageRequest $request)
    {
        $marriage = $this->marriageService->createMarriage($request->validated());

        return $this->created($marriage, 'Pernikahan berhasil ditambahkan');
    }

    /**
     * Update marriage
     * PUT /api/admin/marriages/{id}
     */
    public function update(UpdateMarriageRequest $request, int $id)
    {
        $marriage = $this->marriageService->updateMarriage($id, $request->validated());

        return $this->success($marriage, 'Pernikahan berhasil diperbarui');
    }

    /**
     * Delete marriage
     * DELETE /api/admin/marriages/{id}
     */
    public function destroy(int $id)
    {
        $this->marriageService->deleteMarriage($id);

        return $this->success(null, 'Pernikahan berhasil dihapus');
    }

    /**
     * Add child to marriage
     * POST /api/admin/marriages/{id}/children
     */
    public function addChild(Request $request, int $id)
    {
        $request->validate([
            'child_id' => 'required|exists:persons,id',
            'birth_order' => 'nullable|integer|min:1',
        ]);

        $this->marriageService->addChildToMarriage(
            $id,
            $request->child_id,
            $request->birth_order ?? 1
        );

        return $this->success(null, 'Anak berhasil ditambahkan ke pernikahan');
    }

    /**
     * Get children of a marriage
     * GET /api/admin/marriages/{id}/children
     */
    public function children(int $id)
    {
        $children = $this->marriageService->getChildren($id);

        return $this->success($children, 'Daftar anak berhasil dimuat');
    }

    /**
     * Check if marriage would be internal
     * GET /api/admin/marriages/check-internal
     */
    public function checkInternal(Request $request)
    {
        $request->validate([
            'husband_id' => 'required|exists:persons,id',
            'wife_id' => 'required|exists:persons,id',
        ]);

        $isInternal = $this->marriageService->checkIfInternal(
            $request->husband_id,
            $request->wife_id
        );

        return $this->success([
            'is_internal' => $isInternal,
            'message' => $isInternal
                ? 'Pernikahan ini terdeteksi sebagai pernikahan internal (antar kerabat)'
                : 'Pernikahan ini bukan pernikahan internal',
        ]);
    }
}
