<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\BranchService;
use App\Traits\ApiResponse;

class BranchController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected BranchService $branchService
    ) {
    }

    /**
     * List all branches with stats
     * GET /api/admin/branches
     */
    public function index()
    {
        $branches = $this->branchService->getAllBranchesWithStats();

        return $this->success($branches, 'Daftar cabang berhasil dimuat');
    }

    /**
     * Show branch detail with persons
     * GET /api/admin/branches/{id}
     */
    public function show(int $id)
    {
        $branch = $this->branchService->getBranchWithPersons($id);

        return $this->success($branch, 'Detail cabang berhasil dimuat');
    }
}
