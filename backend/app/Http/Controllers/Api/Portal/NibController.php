<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Models\Person;
use App\Models\SiteSetting;
use App\Services\NibService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class NibController extends Controller
{
    /**
     * Validate NIB with checksum.
     * Semi-public endpoint with rate limiting.
     */
    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'nib' => 'required|string|min:4|max:20',
        ]);

        $nibInput = $request->input('nib');
        $person = null;
        $actualNib = null;
        
        // Strategy 1: Try with checksum validation first
        if (NibService::validate($nibInput)) {
            $actualNib = NibService::extractNib($nibInput);
            $person = NibService::findPersonByNib($actualNib);
        }
        
        // Strategy 2: If checksum validation failed, try direct DB lookup
        // This allows users to enter NIB without checksum
        if (!$person) {
            $person = NibService::findPersonByNib($nibInput);
            if ($person) {
                $actualNib = $nibInput;
            }
        }
        
        if (!$person) {
            return response()->json([
                'valid' => false,
                'error' => 'NIB tidak ditemukan. Pastikan NIB yang dimasukkan benar.',
            ]);
        }
        
        return response()->json([
            'valid' => true,
            'preview' => [
                'id' => $person->id,
                'full_name' => $person->full_name,
                'nickname' => $person->nickname,
                'gender' => $person->gender,
                'generation' => $person->generation,
                'branch' => $person->branch ? [
                    'id' => $person->branch->id,
                    'name' => $person->branch->name,
                ] : null,
                'is_alive' => $person->is_alive,
            ],
        ]);
    }

    /**
     * Link NIB to session.
     * Returns person data for localStorage storage.
     * Semi-public endpoint with rate limiting.
     */
    public function link(Request $request): JsonResponse
    {
        $request->validate([
            'nib' => 'required|string|min:4|max:20',
        ]);

        $nibInput = $request->input('nib');
        $person = null;
        $actualNib = null;
        
        // Strategy 1: Try with checksum validation first
        if (NibService::validate($nibInput)) {
            $actualNib = NibService::extractNib($nibInput);
            $person = NibService::findPersonByNib($actualNib);
        }
        
        // Strategy 2: If checksum validation failed, try direct DB lookup
        // This allows users to enter NIB without checksum
        if (!$person) {
            $person = NibService::findPersonByNib($nibInput);
            if ($person) {
                $actualNib = $nibInput;
            }
        }
        
        if (!$person) {
            return response()->json([
                'success' => false,
                'error' => 'NIB tidak ditemukan. Pastikan NIB yang dimasukkan benar.',
            ], 404);
        }
        
        // Load branch relationship
        $person->load('branch');
        
        return response()->json([
            'success' => true,
            'session' => [
                'nib' => $actualNib,
                'person_id' => $person->id,
                'person_name' => $person->full_name,
                'photo_url' => $person->photo_url,
                'branch_name' => $person->branch?->name ?? 'Unknown',
                'generation' => $person->generation,
                'gender' => $person->gender,
                'linked_at' => now()->toISOString(),
            ],
        ]);
    }

    /**
     * Get NIB guide/documentation.
     * Public endpoint for helping users understand NIB format.
     */
    public function guide(Request $request): JsonResponse
    {
        $nib = $request->query('nib', '');
        
        // Parse segments if NIB provided
        $segments = [];
        if ($nib && strlen($nib) >= 2) {
            // Remove checksum if present (validate first)
            $actualNib = NibService::validate($nib) 
                ? NibService::extractNib($nib) 
                : $nib;
            
            $segments = NibService::parseNibSegments($actualNib);
        }
        
        return response()->json([
            'pattern' => [
                'format' => '[08] + [XX][XX]... + [SSS] + [C]',
                'description' => 'NIB terdiri dari kode root, urutan per generasi, status, dan checksum',
            ],
            'segments' => [
                [
                    'position' => '1-2',
                    'label' => 'Root',
                    'description' => 'Kode root (selalu 08 untuk Abdul Manan)',
                    'example' => '08',
                    'color' => '#ec1325',
                ],
                [
                    'position' => '3-4',
                    'label' => 'Cabang',
                    'description' => 'Urutan anak dari Abdul Manan (01-11)',
                    'example' => '01',
                    'color' => '#2563eb',
                ],
                [
                    'position' => '5-6',
                    'label' => 'Sub-Cabang',
                    'description' => 'Urutan anak di generasi berikutnya',
                    'example' => '01',
                    'color' => '#16a34a',
                ],
                [
                    'position' => 'n-3 s/d n-1',
                    'label' => 'Status',
                    'description' => '000 = Garis Darah, 001+ = Pasangan',
                    'example' => '000',
                    'color' => '#9333ea',
                ],
                [
                    'position' => 'terakhir',
                    'label' => 'Checksum',
                    'description' => 'Digit validasi (dihitung otomatis)',
                    'example' => '1',
                    'color' => '#64748b',
                ],
            ],
            'examples' => [
                [
                    'nib' => '08',
                    'nib_with_checksum' => NibService::withChecksum('08'),
                    'meaning' => 'Abdul Manan (Root)',
                ],
                [
                    'nib' => '0801000',
                    'nib_with_checksum' => NibService::withChecksum('0801000'),
                    'meaning' => 'Anak ke-1 Abdul Manan (garis darah)',
                ],
                [
                    'nib' => '0801001',
                    'nib_with_checksum' => NibService::withChecksum('0801001'),
                    'meaning' => 'Pasangan anak ke-1 Abdul Manan',
                ],
                [
                    'nib' => '080101000',
                    'nib_with_checksum' => NibService::withChecksum('080101000'),
                    'meaning' => 'Cucu dari anak ke-1, anak ke-1 (garis darah)',
                ],
                [
                    'nib' => '080302000',
                    'nib_with_checksum' => NibService::withChecksum('080302000'),
                    'meaning' => 'Cucu dari anak ke-3, anak ke-2 (garis darah)',
                ],
            ],
            'parsed_input' => $segments,
        ]);
    }

    /**
     * Get portal mode settings.
     * Public endpoint for frontend to determine portal behavior.
     */
    public function getPortalMode(): JsonResponse
    {
        return response()->json([
            'login_enabled' => (bool) SiteSetting::getValue('portal.login_enabled', true),
            'nib_claiming_enabled' => (bool) SiteSetting::getValue('portal.nib_claiming_enabled', true),
        ]);
    }
}
