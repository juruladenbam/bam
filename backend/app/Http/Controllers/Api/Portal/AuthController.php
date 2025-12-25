<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
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
     * Get current authenticated user
     */
    public function me()
    {
        $user = $this->authService->getCurrentUser();

        return $this->success([
            'user' => $user,
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
