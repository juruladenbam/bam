<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\Branch;
use App\Models\Person;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RsvpController extends Controller
{
    use ApiResponse;

    /**
     * Get list of branches/qobilah
     */
    public function getBranches(): JsonResponse
    {
        $branches = Branch::orderBy('order')->get();
        return $this->success($branches, 'Daftar qobilah');
    }

    /**
     * Get list of prepopulated RSVP participants for an event
     */
    public function getParticipants(string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)
            ->orWhere('id', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $registrations = EventRegistration::where('event_id', $event->id)
            ->with(['person.branch'])
            ->get()
            ->map(function ($reg) {
                $transportStatus = $reg->custom_data['transport_status'] ?? '-';
                return [
                    'id' => $reg->id,
                    'person_id' => $reg->person_id,
                    'name' => $reg->name ?? ($reg->person ? $reg->person->full_name : ''),
                    'nickname' => $reg->person ? $reg->person->nickname : '',
                    'email' => $reg->email,
                    'whatsapp' => $reg->whatsapp ?? ($reg->person ? $reg->person->phone : ''),
                    'attendance' => $reg->attendance,
                    'transport_status' => $transportStatus,
                    'branch_id' => $reg->person ? $reg->person->branch_id : null,
                    'branch_name' => $reg->person ? ($reg->person->branch ? $reg->person->branch->name : null) : null,
                ];
            });

        return $this->success($registrations, 'Daftar peserta RSVP');
    }

    /**
     * Submit RSVP for a participant
     */
    public function submitRsvp(Request $request, string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)
            ->orWhere('id', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $validated = $request->validate([
            'registration_id' => 'required|exists:event_registrations,id',
            'person_id' => 'required|exists:persons,id',
            'branch_id' => 'required|exists:branches,id',
            'email' => 'nullable|email|max:255',
            'whatsapp' => ['required', 'string', 'regex:/^62[0-9]{8,15}$/'],
            'attendance' => ['required', Rule::in(['hadir', 'tidak_hadir'])],
            'confirmed' => 'boolean',
        ], [
            'whatsapp.regex' => 'Nomor WhatsApp harus diawali dengan 62 dan hanya berisi angka (contoh: 628123456789).',
        ]);

        $registration = EventRegistration::where('event_id', $event->id)
            ->where('id', $validated['registration_id'])
            ->firstOrFail();

        $transportStatus = $registration->custom_data['transport_status'] ?? '-';

        // Check if confirmation is needed:
        // status awal (transportStatus) ≠ "-" AND user chooses "tidak_hadir" AND not yet confirmed
        if ($transportStatus !== '-' && $validated['attendance'] === 'tidak_hadir' && !($request->input('confirmed', false))) {
            return response()->json([
                'success' => false,
                'requires_confirmation' => true,
                'message' => 'Konfirmasi perubahan status kehadiran dibutuhkan.',
                'transport_status' => $transportStatus,
            ], 200); // return 200 with flag so frontend can handle it nicely
        }

        // Perform inside transaction to ensure consistency
        DB::transaction(function () use ($registration, $validated) {
            // Update registration
            $registration->update([
                'email' => $validated['email'],
                'whatsapp' => $validated['whatsapp'],
                'attendance' => $validated['attendance'] === 'hadir' ? 'hadir' : 'tidak_hadir',
                'status' => 'approved', // Auto-approve RSVP
            ]);

            // Sync phone and branch to person table
            $person = Person::find($validated['person_id']);
            if ($person) {
                $person->update([
                    'phone' => $validated['whatsapp'],
                    'branch_id' => $validated['branch_id'],
                ]);
            }
        });

        return $this->success([
            'registration' => $registration->fresh(['person.branch']),
        ], 'RSVP berhasil dikirim');
    }
}
