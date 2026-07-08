<?php

namespace App\Http\Controllers\Api\Juruladen;

use App\Http\Controllers\Controller;
use App\Services\Juruladen\JuruladenAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        protected JuruladenAuthService $authService
    ) {}

    /**
     * Step 1: Check NIB validity and user status.
     */
    public function checkNib(Request $request): JsonResponse
    {
        $request->validate([
            'nib' => ['required', 'string', 'min:3'],
        ]);

        $result = $this->authService->checkNib($request->nib);

        $status = $result['success'] ? 200 : 422;
        return response()->json($result, $status);
    }

    /**
     * Step 2 (first-time): Set password and auto-login.
     */
    public function setPassword(Request $request): JsonResponse
    {
        $request->validate([
            'nib' => ['required', 'string', 'min:3'],
            'email' => ['required', 'email', 'unique:users,email,' . optional(auth()->user())->id],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        try {
            $result = $this->authService->setPassword(
                $request->nib,
                $request->email,
                $request->password
            );

            return response()->json([
                'success' => true,
                'message' => 'Akun berhasil dibuat. Selamat datang!',
                'data' => $result,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Login (returning user): NIB + password.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'nib' => ['required', 'string', 'min:3'],
            'password' => ['required', 'string'],
        ]);

        try {
            $result = $this->authService->login(
                $request->nib,
                $request->password
            );

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Forgot password — request reset.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'nib' => ['required', 'string', 'min:3'],
        ]);

        $result = $this->authService->requestReset($request->nib);

        $status = $result['success'] ? 200 : 422;
        return response()->json($result, $status);
    }

    /**
     * Logout — revoke current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Berhasil logout.',
        ]);
    }
}
