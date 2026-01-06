<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected AuthService $authService
    ) {
    }

    /**
     * Login user
     */
    public function login(LoginRequest $request)
    {
        $user = $this->authService->login($request->validated());

        return $this->success([
            'user' => $user,
        ], 'Login berhasil');
    }

    /**
     * Register new user
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $this->authService->register($validated);

        return $this->success([
            'user' => $user,
        ], 'Registrasi berhasil. Silahkan login.');
    }

    /**
     * Claim person profile
     */
    public function claimPerson(Request $request)
    {
        $validated = $request->validate([
            'person_id' => 'required|exists:persons,id',
        ]);

        $user = $request->user();

        // Check if already claimed by ANY user (optional but good for data integrity)
        // For now, assuming a simple update. 
        // We might want to check if $user already has a person_id?
        if ($user->person_id) {
             throw ValidationException::withMessages([
                'person_id' => ['Anda sudah terhubung dengan data diri.'],
            ]);
        }
        
        // Update user
        $user->person_id = $validated['person_id'];
        $user->save();

        return $this->success([
            'user' => $user,
            'person' => $user->person
        ], 'Data diri berhasil ditautkan.');
    }

    /**
     * Get current authenticated user
     */
    public function me()
    {
        $user = $this->authService->getCurrentUser();

        return $this->success([
            'user' => $user,
            'person' => $user->person,
        ]);
    }

    /**
     * Logout user
     */
    public function logout()
    {
        $this->authService->logout();

        return $this->success(null, 'Logout berhasil');
    }
}
