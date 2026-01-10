<?php

namespace App\Http\Controllers;

use App\Models\Person;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ShareController extends Controller
{
    public function member($id)
    {
        try {
            $person = Person::findOrFail($id);

            // Determine image URL
            // If person has a photo, use it. Otherwise use a default or generate one.
            // For now, we'll try to use the photo_url if available, or a fallback.
            // Note: photo_url might be a relative path or full URL depending on storage.
            // We need to ensure it's a full URL for OG tags.
            
            $imageUrl = $person->photo_url 
                ? (filter_var($person->photo_url, FILTER_VALIDATE_URL) ? $person->photo_url : asset($person->photo_url))
                : asset('images/default-member.png'); // You might need a default image

            // Construct title and description
            $title = $person->full_name . " - Silsilah Keluarga";
            $description = "Lihat profil dan silsilah keluarga dari " . $person->full_name . ".";

            // The URL to redirect to (The React Portal)
            // Assuming portal is at a different subdomain or path.
            // From context: Portal seems to be at portal.bamseribuputu.my.id (based on previous convos)
            // But let's check .env or config if possible, or hardcode for now based on user request context.
            // Logic: The "share link" is clicked, user sees OG tags, then JS redirects them to the actual portal page.
            
            // Hardcoding portal URL based on typical setup, can be moved to config later.
            $portalUrl = "https://portal.bamseribuputu.my.id/silsilah/person/" . $id;

            return view('share.member', [
                'title' => $title,
                'description' => $description,
                'image' => $imageUrl,
                'url' => $portalUrl
            ]);

        } catch (\Exception $e) {
            Log::error("Error sharing member {$id}: " . $e->getMessage());
            abort(404);
        }
    }
}
