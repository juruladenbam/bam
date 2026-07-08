<?php

namespace App\Http\Controllers\Api\Juruladen;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Rundown;
use App\Models\RundownItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RundownController extends Controller
{
    /**
     * List all rundowns for an event with their items.
     */
    public function index(Event $event): JsonResponse
    {
        $rundowns = $event
            ->rundowns()
            ->with([
                "items" => function ($q) {
                    $q->orderBy("sort_order")->with("pic:id,full_name,nib");
                },
            ])
            ->orderBy("sort_order")
            ->get()
            ->map(
                fn($r) => [
                    "id" => $r->id,
                    "event_id" => $r->event_id,
                    "title" => $r->title,
                    "description" => $r->description,
                    "sort_order" => $r->sort_order,
                    "items" => $r->items->map(
                        fn($i) => [
                            "id" => $i->id,
                            "time_start" => $i->time_start,
                            "time_end" => $i->time_end,
                            "activity_title" => $i->activity_title,
                            "description" => $i->description,
                            "pic_person_id" => $i->pic_person_id,
                            "pic_name" => $i->pic?->full_name,
                            "location_venue" => $i->location_venue,
                            "sort_order" => $i->sort_order,
                        ],
                    ),
                ],
            );

        return response()->json([
            "success" => true,
            "data" => $rundowns,
        ]);
    }

    /**
     * Create a new rundown for an event.
     */
    public function store(Request $request, Event $event): JsonResponse
    {
        $request->validate([
            "title" => ["required", "string", "max:255"],
            "description" => ["nullable", "string"],
        ]);

        $maxOrder = $event->rundowns()->max("sort_order") ?? 0;

        $rundown = $event->rundowns()->create([
            "title" => $request->title,
            "description" => $request->description,
            "sort_order" => $maxOrder + 1,
        ]);

        return response()->json(
            [
                "success" => true,
                "message" => "Rundown berhasil dibuat.",
                "data" => $rundown,
            ],
            201,
        );
    }

    /**
     * Update a rundown.
     */
    public function update(Request $request, Rundown $rundown): JsonResponse
    {
        $request->validate([
            "title" => ["sometimes", "string", "max:255"],
            "description" => ["nullable", "string"],
            "sort_order" => ["nullable", "integer"],
        ]);

        $rundown->update(
            $request->only(["title", "description", "sort_order"]),
        );

        return response()->json([
            "success" => true,
            "message" => "Rundown berhasil diperbarui.",
            "data" => $rundown->fresh(),
        ]);
    }

    /**
     * Delete a rundown and all its items.
     */
    public function destroy(Rundown $rundown): JsonResponse
    {
        $rundown->delete();

        return response()->json([
            "success" => true,
            "message" => "Rundown berhasil dihapus.",
        ]);
    }

    /**
     * Add an item to a rundown.
     */
    public function addItem(Request $request, Rundown $rundown): JsonResponse
    {
        $request->validate([
            "time_start" => ["required", "date_format:H:i,H:i:s"],
            "time_end" => ["nullable", "date_format:H:i,H:i:s"],
            "activity_title" => ["required", "string", "max:255"],
            "description" => ["nullable", "string"],
            "pic_person_id" => ["nullable", "integer", "exists:persons,id"],
            "location_venue" => ["nullable", "string", "max:255"],
        ]);

        $maxOrder = $rundown->items()->max("sort_order") ?? 0;

        $item = $rundown->items()->create([
            "time_start" => $request->time_start,
            "time_end" => $request->time_end,
            "activity_title" => $request->activity_title,
            "description" => $request->description,
            "pic_person_id" => $request->pic_person_id,
            "location_venue" => $request->location_venue,
            "sort_order" => $maxOrder + 1,
        ]);

        $item->load("pic:id,full_name,nib");

        return response()->json(
            [
                "success" => true,
                "message" => "Item rundown berhasil ditambahkan.",
                "data" => [
                    "id" => $item->id,
                    "time_start" => $item->time_start,
                    "time_end" => $item->time_end,
                    "activity_title" => $item->activity_title,
                    "description" => $item->description,
                    "pic_person_id" => $item->pic_person_id,
                    "pic_name" => $item->pic?->full_name,
                    "location_venue" => $item->location_venue,
                    "sort_order" => $item->sort_order,
                ],
            ],
            201,
        );
    }

    /**
     * Update a rundown item.
     */
    public function updateItem(
        Request $request,
        Rundown $rundown,
        RundownItem $item,
    ): JsonResponse {
        $request->validate([
            "time_start" => ["sometimes", "date_format:H:i,H:i:s"],
            "time_end" => ["sometimes", "nullable", "date_format:H:i,H:i:s"],
            "activity_title" => ["sometimes", "string", "max:255"],
            "description" => ["nullable", "string"],
            "pic_person_id" => ["nullable", "integer", "exists:persons,id"],
            "location_venue" => ["nullable", "string", "max:255"],
            "sort_order" => ["nullable", "integer"],
        ]);

        $item->update(
            $request->only([
                "time_start",
                "time_end",
                "activity_title",
                "description",
                "pic_person_id",
                "location_venue",
                "sort_order",
            ]),
        );

        $item->load("pic:id,full_name,nib");

        return response()->json([
            "success" => true,
            "message" => "Item rundown berhasil diperbarui.",
            "data" => [
                "id" => $item->id,
                "time_start" => $item->time_start,
                "time_end" => $item->time_end,
                "activity_title" => $item->activity_title,
                "description" => $item->description,
                "pic_person_id" => $item->pic_person_id,
                "pic_name" => $item->pic?->full_name,
                "location_venue" => $item->location_venue,
                "sort_order" => $item->sort_order,
            ],
        ]);
    }

    /**
     * Delete a rundown item.
     */
    public function deleteItem(
        Rundown $rundown,
        RundownItem $item,
    ): JsonResponse {
        $item->delete();

        return response()->json([
            "success" => true,
            "message" => "Item rundown berhasil dihapus.",
        ]);
    }

    /**
     * Batch reorder items within a rundown.
     */
    public function reorderItems(
        Request $request,
        Rundown $rundown,
    ): JsonResponse {
        $request->validate([
            "items" => ["required", "array"],
            "items.*.id" => ["required", "integer", "exists:rundown_items,id"],
            "items.*.sort_order" => ["required", "integer", "min:0"],
        ]);

        foreach ($request->items as $itemData) {
            RundownItem::where("id", $itemData["id"])
                ->where("rundown_id", $rundown->id)
                ->update(["sort_order" => $itemData["sort_order"]]);
        }

        return response()->json([
            "success" => true,
            "message" => "Urutan item rundown diperbarui.",
        ]);
    }
}
