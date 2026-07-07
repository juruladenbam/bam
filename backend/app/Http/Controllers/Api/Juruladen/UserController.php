<?php

namespace App\Http\Controllers\Api\Juruladen;

use App\Http\Controllers\Controller;
use App\Services\Juruladen\JuruladenUserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(protected JuruladenUserService $userService) {}

    /**
     * List all Juruladen users.
     */
    public function index(): JsonResponse
    {
        $users = $this->userService->listUsers();

        return response()->json([
            "success" => true,
            "data" => $users,
        ]);
    }

    /**
     * Create a new Juruladen user.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            "person_id" => ["required", "integer", "exists:persons,id"],
            "role" => ["required", "in:admin,superadmin"],
        ]);

        $user = $this->userService->createUser(
            $request->person_id,
            $request->role,
        );

        return response()->json(
            [
                "success" => true,
                "message" => "User berhasil ditambahkan.",
                "data" => [
                    "id" => $user->id,
                    "name" => $user->name,
                    "role" => $user->role,
                    "person_id" => $user->person_id,
                    "has_password" => false,
                ],
            ],
            201,
        );
    }

    /**
     * Reset user password (set to NULL).
     */
    public function resetPassword(int $userId): JsonResponse
    {
        $this->userService->resetPassword($userId);

        return response()->json([
            "success" => true,
            "message" =>
                "Password berhasil direset. User harus membuat password baru.",
        ]);
    }

    /**
     * Delete a Juruladen user.
     */
    public function destroy(int $userId): JsonResponse
    {
        $this->userService->deleteUser($userId);

        return response()->json([
            "success" => true,
            "message" => "User berhasil dihapus.",
        ]);
    }

    /**
     * Search persons for user creation autocomplete.
     */
    public function searchPerson(Request $request): JsonResponse
    {
        $request->validate([
            "q" => ["required", "string", "min:1"],
            "juruladen_only" => ["nullable", "boolean"],
        ]);

        $results = $this->userService->searchPerson(
            $request->q,
            10,
            $request->boolean("juruladen_only", false),
        );

        return response()->json([
            "success" => true,
            "data" => $results,
        ]);
    }
}
