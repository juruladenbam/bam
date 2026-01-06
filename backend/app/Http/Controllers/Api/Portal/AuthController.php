<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthService;
use App\Traits\ApiResponse;

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
