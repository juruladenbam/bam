<?php

namespace App\Http\Controllers\Api\Juruladen;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    /**
     * List inventory categories with their items for an event.
     * Optional ?category_id= filter.
     */
    public function index(Request $request, Event $event): JsonResponse
    {
        $categories = $event
            ->inventoryCategories()
            ->when(
                $request->category_id,
                fn($q) => $q->where("id", $request->category_id),
            )
            ->with([
                "items" => function ($q) {
                    $q->orderBy("sort_order")->with(
                        "assignedPerson:id,full_name,nib",
                    );
                },
            ])
            ->orderBy("sort_order")
            ->get()
            ->map(
                fn($c) => [
                    "id" => $c->id,
                    "name" => $c->name,
                    "sort_order" => $c->sort_order,
                    "items" => $c->items->map(
                        fn($i) => [
                            "id" => $i->id,
                            "name" => $i->name,
                            "quantity_needed" => $i->quantity_needed,
                            "unit" => $i->unit,
                            "source_type" => $i->source_type,
                            "source_detail" => $i->source_detail,
                            "cost_per_unit" => $i->cost_per_unit,
                            "assigned_to_person_id" =>
                                $i->assigned_to_person_id,
                            "assigned_person_name" =>
                                $i->assignedPerson?->full_name,
                            "acquisition_status" => $i->acquisition_status,
                            "return_status" => $i->return_status,
                            "notes" => $i->notes,
                            "sort_order" => $i->sort_order,
                        ],
                    ),
                ],
            );

        return response()->json([
            "success" => true,
            "data" => $categories,
        ]);
    }

    /**
     * Create a new inventory category for an event.
     */
    public function createCategory(Request $request, Event $event): JsonResponse
    {
        $request->validate([
            "name" => ["required", "string", "max:255"],
        ]);

        $maxOrder = $event->inventoryCategories()->max("sort_order") ?? 0;

        $category = $event->inventoryCategories()->create([
            "name" => $request->name,
            "sort_order" => $maxOrder + 1,
        ]);

        return response()->json(
            [
                "success" => true,
                "message" => "Kategori inventaris berhasil dibuat.",
                "data" => $category,
            ],
            201,
        );
    }

    /**
     * Create a new inventory item in a category.
     */
    public function storeItem(
        Request $request,
        InventoryCategory $category,
    ): JsonResponse {
        $request->validate([
            "name" => ["required", "string", "max:255"],
            "quantity_needed" => ["nullable", "integer", "min:1"],
            "unit" => ["nullable", "string", "max:50"],
            "source_type" => ["nullable", "string", "max:100"],
            "source_detail" => ["nullable", "string", "max:255"],
            "cost_per_unit" => ["nullable", "numeric", "min:0"],
            "assigned_to_person_id" => [
                "nullable",
                "integer",
                "exists:persons,id",
            ],
            "acquisition_status" => ["nullable", "string", "max:50"],
            "return_status" => ["nullable", "string", "max:50"],
            "notes" => ["nullable", "string"],
        ]);

        $maxOrder = $category->items()->max("sort_order") ?? 0;

        $item = $category->items()->create([
            "name" => $request->name,
            "quantity_needed" => $request->quantity_needed,
            "unit" => $request->unit,
            "source_type" => $request->source_type,
            "source_detail" => $request->source_detail,
            "cost_per_unit" => $request->cost_per_unit,
            "assigned_to_person_id" => $request->assigned_to_person_id,
            "acquisition_status" => $request->acquisition_status ?? "pending",
            "return_status" => $request->return_status ?? "not_applicable",
            "notes" => $request->notes,
            "sort_order" => $maxOrder + 1,
        ]);

        $item->load("assignedPerson:id,full_name,nib");

        return response()->json(
            [
                "success" => true,
                "message" => "Item inventaris berhasil ditambahkan.",
                "data" => [
                    "id" => $item->id,
                    "name" => $item->name,
                    "quantity_needed" => $item->quantity_needed,
                    "unit" => $item->unit,
                    "source_type" => $item->source_type,
                    "source_detail" => $item->source_detail,
                    "cost_per_unit" => $item->cost_per_unit,
                    "assigned_to_person_id" => $item->assigned_to_person_id,
                    "assigned_person_name" => $item->assignedPerson?->full_name,
                    "acquisition_status" => $item->acquisition_status,
                    "return_status" => $item->return_status,
                    "notes" => $item->notes,
                    "sort_order" => $item->sort_order,
                ],
            ],
            201,
        );
    }

    /**
     * Update an inventory item.
     */
    public function updateItem(
        Request $request,
        InventoryItem $item,
    ): JsonResponse {
        $request->validate([
            "name" => ["sometimes", "string", "max:255"],
            "quantity_needed" => ["nullable", "integer", "min:1"],
            "unit" => ["nullable", "string", "max:50"],
            "source_type" => ["nullable", "string", "max:100"],
            "source_detail" => ["nullable", "string", "max:255"],
            "cost_per_unit" => ["nullable", "numeric", "min:0"],
            "assigned_to_person_id" => [
                "nullable",
                "integer",
                "exists:persons,id",
            ],
            "acquisition_status" => ["nullable", "string", "max:50"],
            "return_status" => ["nullable", "string", "max:50"],
            "notes" => ["nullable", "string"],
            "sort_order" => ["nullable", "integer"],
        ]);

        $item->update(
            $request->only([
                "name",
                "quantity_needed",
                "unit",
                "source_type",
                "source_detail",
                "cost_per_unit",
                "assigned_to_person_id",
                "acquisition_status",
                "return_status",
                "notes",
                "sort_order",
            ]),
        );

        $item->load("assignedPerson:id,full_name,nib");

        return response()->json([
            "success" => true,
            "message" => "Item inventaris berhasil diperbarui.",
            "data" => [
                "id" => $item->id,
                "name" => $item->name,
                "quantity_needed" => $item->quantity_needed,
                "unit" => $item->unit,
                "source_type" => $item->source_type,
                "source_detail" => $item->source_detail,
                "cost_per_unit" => $item->cost_per_unit,
                "assigned_to_person_id" => $item->assigned_to_person_id,
                "assigned_person_name" => $item->assignedPerson?->full_name,
                "acquisition_status" => $item->acquisition_status,
                "return_status" => $item->return_status,
                "notes" => $item->notes,
                "sort_order" => $item->sort_order,
            ],
        ]);
    }

    /**
     * Delete an inventory item.
     */
    public function destroyItem(InventoryItem $item): JsonResponse
    {
        $item->delete();

        return response()->json([
            "success" => true,
            "message" => "Item inventaris berhasil dihapus.",
        ]);
    }

    /**
     * Quick status update for acquisition_status or return_status.
     */
    public function updateStatus(
        Request $request,
        InventoryItem $item,
    ): JsonResponse {
        $request->validate([
            "acquisition_status" => ["nullable", "string", "max:50"],
            "return_status" => ["nullable", "string", "max:50"],
        ]);

        $data = array_filter(
            $request->only(["acquisition_status", "return_status"]),
            fn($v) => !is_null($v),
        );

        if (empty($data)) {
            return response()->json(
                [
                    "success" => false,
                    "message" => "Tidak ada status yang dikirim.",
                ],
                422,
            );
        }

        $item->update($data);

        return response()->json([
            "success" => true,
            "message" => "Status item diperbarui.",
            "data" => $item
                ->fresh()
                ->only(["id", "acquisition_status", "return_status"]),
        ]);
    }
}
