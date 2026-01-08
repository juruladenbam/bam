<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
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
     * Register new user
     */
    public function register(RegisterRequest $request)
    {
        $user = $this->authService->register($request->validated());

        return $this->created([
            'user' => $user,
        ], 'Registrasi berhasil');
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
     * Check login status
     */
    public function check()
    {
        return $this->success([
            'is_logged_in' => auth('sanctum')->check(),
            'user' => auth('sanctum')->user(),
        ]);
    }
}
