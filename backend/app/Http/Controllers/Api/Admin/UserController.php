<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    use ApiResponse;

    /**
     * List all users with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();
        
        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }
        
        $users = $query->with('person:id,full_name,gender')->orderBy('name')->paginate($request->input('per_page', 15));
        
        return $this->paginated($users, 'Data user berhasil diambil');
    }

    /**
     * Show user detail
     */
    public function show(int $id): JsonResponse
    {
        $user = User::with('person:id,full_name,gender')->findOrFail($id);
        
        return $this->success($user);
    }

    /**
     * Update user (role, status)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'role' => 'sometimes|in:superadmin,admin,member',
            'person_id' => 'sometimes|nullable|exists:persons,id',
        ]);
        
        $user->update($validated);
        
        return $this->success($user->fresh(), 'User berhasil diperbarui');
    }

    /**
     * Delete user (soft delete if available, or hard delete)
     */
    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting self
        if ($user->id === auth()->id()) {
            return $this->error('Tidak dapat menghapus akun sendiri', 403);
        }
        
        $user->delete();
        
        return $this->success(null, 'User berhasil dihapus');
    }
}
