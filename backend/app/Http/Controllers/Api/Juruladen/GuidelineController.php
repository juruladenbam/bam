<?php

namespace App\Http\Controllers\Api\Juruladen;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventGuideline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuidelineController extends Controller
{
    /**
     * Get guidelines for an event (both juknis & juklak).
     */
    public function index(Event $event): JsonResponse
    {
        $guidelines = $event->guidelines()->get()->map(fn ($g) => [
            'id' => $g->id,
            'type' => $g->type,
            'content' => $g->content,
        ]);

        return response()->json([
            'success' => true,
            'data' => $guidelines,
        ]);
    }

    /**
     * Upsert guideline content for a specific type (juknis / juklak).
     */
    public function update(Request $request, Event $event, string $type): JsonResponse
    {
        $request->validate([
            'content' => ['required', 'string'],
        ]);

        $guideline = $event->guidelines()->updateOrCreate(
            ['type' => $type],
            ['content' => $request->content]
        );

        return response()->json([
            'success' => true,
            'message' => 'Panduan berhasil disimpan.',
            'data' => [
                'id' => $guideline->id,
                'type' => $guideline->type,
                'content' => $guideline->content,
            ],
        ]);
    }
}
