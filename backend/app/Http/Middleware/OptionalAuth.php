<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * OptionalAuth Middleware
 * 
 * This middleware provides flexible authentication based on portal settings:
 * - If login_enabled = true: Requires auth (like auth:sanctum)
 * - If login_enabled = false: Auth is optional (guest access allowed)
 * 
 * When guest access is allowed, routes should handle unauthenticated users gracefully.
 */
class OptionalAuth
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get the login_enabled setting - stored as '1' or '0' string, or true/false
        $loginEnabledValue = SiteSetting::getValue('portal.login_enabled', '1');
        $loginEnabled = $this->parseBooleanValue($loginEnabledValue);
        
        // If login is required, enforce authentication
        if ($loginEnabled) {
            if (!Auth::guard('sanctum')->check()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            
            // Set the authenticated user
            Auth::shouldUse('sanctum');
        }
        
        // If login is disabled, allow request to proceed (guest access)
        // The NIB session header (X-Viewer-Person-Id) can be used by controllers
        // to identify the viewer if needed
        
        return $next($request);
    }
    
    /**
     * Parse boolean value from various formats
     */
    private function parseBooleanValue(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }
        if (is_string($value)) {
            return in_array(strtolower($value), ['true', '1', 'yes', 'on'], true);
        }
        return (bool) $value;
    }
}
