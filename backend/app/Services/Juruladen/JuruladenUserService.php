<?php

namespace App\Services\Juruladen;

use App\Models\Person;
use App\Models\User;
use App\Services\NibService;
use Illuminate\Validation\ValidationException;

class JuruladenUserService
{
    /**
     * List all Juruladen users (has person_id, role admin/superadmin).
     */
    public function listUsers(): array
    {
        return User::whereNotNull("person_id")
            ->whereIn("role", ["admin", "superadmin"])
            ->with("person:id,full_name,nib")
            ->get()
            ->map(function ($user) {
                return [
                    "id" => $user->id,
                    "name" => $user->name,
                    "email" => $user->email,
                    "role" => $user->role,
                    "person_id" => $user->person_id,
                    "person_name" => $user->person?->full_name,
                    "nib" => $user->person?->nib,
                    "has_password" => !is_null($user->password),
                    "created_at" => $user->created_at,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Create a new Juruladen user from an existing person record.
     */
    public function createUser(int $personId, string $role = "admin"): User
    {
        if (!in_array($role, ["admin", "superadmin"])) {
            throw ValidationException::withMessages([
                "role" => ["Role harus admin atau superadmin."],
            ]);
        }

        // Check if user already exists for this person
        $existing = User::where("person_id", $personId)->first();
        if ($existing) {
            throw ValidationException::withMessages([
                "person_id" => ["Orang ini sudah memiliki akun Juruladen."],
            ]);
        }

        $person = Person::findOrFail($personId);

        return User::create([
            "name" => $person->full_name,
            "email" => null,
            "password" => null, // First-time user, belum set password
            "role" => $role,
            "person_id" => $personId,
        ]);
    }

    /**
     * Reset user password — set to NULL so user must create new one.
     * Only accessible by Superadmin.
     */
    public function resetPassword(int $userId): User
    {
        $user = User::findOrFail($userId);

        if (is_null($user->person_id)) {
            throw ValidationException::withMessages([
                "user" => ["User ini bukan pengguna Juruladen."],
            ]);
        }

        $user->password = null;
        $user->save();

        // Revoke all existing tokens — force re-login
        $user->tokens()->delete();

        return $user;
    }

    /**
     * Delete a Juruladen user.
     */
    public function deleteUser(int $userId): void
    {
        $user = User::findOrFail($userId);

        if (is_null($user->person_id)) {
            throw ValidationException::withMessages([
                "user" => ["User ini bukan pengguna Juruladen."],
            ]);
        }

        $user->tokens()->delete();
        $user->delete();
    }

    /**
     * Search persons by NIB or name. If juruladenOnly, only return persons
     * who already have a Juruladen user account.
     */
    public function searchPerson(
        string $query,
        int $limit = 10,
        bool $juruladenOnly = false,
    ): array {
        if (empty(trim($query))) {
            return [];
        }

        $searchNib = NibService::extractNib($query) ?? $query;

        $q = Person::where("full_name", "like", "%{$query}%")->orWhere(
            "nib",
            "like",
            "%{$searchNib}%",
        );

        if ($juruladenOnly) {
            $userIds = User::whereIn("role", ["admin", "superadmin"])->pluck(
                "person_id",
            );
            $q->whereIn("id", $userIds);
        }

        return $q
            ->with("branch:id,name")
            ->limit($limit)
            ->get(["id", "full_name", "nib", "branch_id"])
            ->map(
                fn($p) => [
                    "id" => $p->id,
                    "full_name" => $p->full_name,
                    "nib" => $p->nib,
                    "qobilah" => $p->branch?->name,
                    "has_user" => User::where("person_id", $p->id)->exists(),
                ],
            )
            ->toArray();
    }
}
