<?php

namespace App\Services\Juruladen;

use App\Models\Person;
use App\Models\User;
use App\Services\NibService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class JuruladenAuthService
{
    /**
     * Resolve NIB to database format: strip checksum if valid, otherwise use as-is.
     */
    private function resolveNib(string $nib): string
    {
        return NibService::extractNib($nib) ?? $nib;
    }

    /**
     * Check NIB validity and user registration status.
     * Step 1 of login flow: user enters NIB, system returns next step.
     * Accepts NIB with or without checksum.
     */
    public function checkNib(string $nib): array
    {
        $baseNib = $this->resolveNib($nib);
        $person = Person::where("nib", $baseNib)->first();

        if (!$person) {
            return [
                "success" => false,
                "message" => "NIB tidak ditemukan di data silsilah BAM.",
                "data" => [
                    "nib_valid" => false,
                    "person_found" => false,
                ],
            ];
        }

        // Check if user exists for this person
        $user = User::where("person_id", $person->id)->first();

        if (!$user) {
            return [
                "success" => false,
                "message" =>
                    "Akses ditolak. NIB Anda belum terdaftar sebagai pengguna Juruladen.",
                "data" => [
                    "nib_valid" => true,
                    "person_found" => true,
                    "person_name" => $person->full_name,
                    "user_registered" => false,
                ],
            ];
        }

        // User exists — check password status
        $hasPassword = !is_null($user->password);
        $nextStep = $hasPassword ? "login" : "set_password";

        return [
            "success" => true,
            "data" => [
                "nib_valid" => true,
                "person_found" => true,
                "person_name" => $person->full_name,
                "user_registered" => true,
                "has_password" => $hasPassword,
                "next_step" => $nextStep,
            ],
        ];
    }

    /**
     * Set password for first-time user and auto-login.
     * Accepts NIB with or without checksum.
     */
    public function setPassword(
        string $nib,
        string $email,
        string $password,
    ): array {
        $baseNib = $this->resolveNib($nib);

        $person = Person::where("nib", $baseNib)->first();
        if (!$person) {
            throw ValidationException::withMessages([
                "nib" => ["NIB tidak ditemukan."],
            ]);
        }

        $user = User::where("person_id", $person->id)->first();
        if (!$user) {
            throw ValidationException::withMessages([
                "nib" => ["Akun tidak ditemukan. Hubungi Superadmin."],
            ]);
        }

        if (!is_null($user->password)) {
            throw ValidationException::withMessages([
                "nib" => ["Password sudah diatur. Silakan login."],
            ]);
        }

        // Update user
        $user->email = $email;
        $user->password = Hash::make($password);
        $user->name = $person->full_name;
        $user->save();

        $token = $user->createToken("juruladen-auth")->plainTextToken;

        return [
            "token" => $token,
            "user" => $this->formatUserResponse($user),
        ];
    }

    /**
     * Login existing user with NIB + password.
     * Accepts NIB with or without checksum.
     */
    public function login(string $nib, string $password): array
    {
        $baseNib = $this->resolveNib($nib);

        $person = Person::where("nib", $baseNib)->first();
        if (!$person) {
            throw ValidationException::withMessages([
                "nib" => ["NIB tidak ditemukan."],
            ]);
        }

        $user = User::where("person_id", $person->id)->first();
        if (!$user) {
            throw ValidationException::withMessages([
                "nib" => ["Akun tidak ditemukan. Hubungi Superadmin."],
            ]);
        }

        if (is_null($user->password)) {
            throw ValidationException::withMessages([
                "nib" => [
                    "Akun belum diatur. Silakan buat password terlebih dahulu.",
                ],
            ]);
        }

        if (!Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                "password" => ["Password salah."],
            ]);
        }

        $user->tokens()->where("name", "juruladen-auth")->delete();
        $token = $user->createToken("juruladen-auth")->plainTextToken;

        return [
            "token" => $token,
            "user" => $this->formatUserResponse($user),
        ];
    }

    /**
     * Request password reset.
     */
    public function requestReset(string $nib): array
    {
        $baseNib = $this->resolveNib($nib);

        $person = Person::where("nib", $baseNib)->first();
        if (!$person) {
            return ["success" => false, "message" => "NIB tidak ditemukan."];
        }

        $user = User::where("person_id", $person->id)->first();
        if (!$user) {
            return ["success" => false, "message" => "Akun tidak ditemukan."];
        }

        return [
            "success" => true,
            "message" =>
                "Permintaan reset password telah dikirim ke Superadmin.",
        ];
    }

    /**
     * Logout user by revoking current token.
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    /**
     * Format user data for API response.
     */
    private function formatUserResponse(User $user): array
    {
        return [
            "id" => $user->id,
            "name" => $user->name,
            "email" => $user->email,
            "role" => $user->role,
            "person_id" => $user->person_id,
        ];
    }
}
