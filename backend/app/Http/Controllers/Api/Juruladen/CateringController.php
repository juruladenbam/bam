<?php

namespace App\Http\Controllers\Api\Juruladen;

use App\Http\Controllers\Controller;
use App\Models\CateringMenuItem;
use App\Models\CateringSchedule;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CateringController extends Controller
{
    public function index(Event $event): JsonResponse
    {
        $schedules = $event
            ->cateringSchedules()
            ->with([
                "rundownItem:id,activity_title,time_start,time_end",
                "menuItems",
            ])
            ->orderBy("sort_order")
            ->get()
            ->map(
                fn($s) => [
                    "id" => $s->id,
                    "event_id" => $s->event_id,
                    "rundown_item_id" => $s->rundown_item_id,
                    "rundown_label" => $s->rundownItem
                        ? $s->rundownItem->time_start .
                            " " .
                            $s->rundownItem->activity_title
                        : null,
                    "time_serve" => $s->time_serve,
                    "total_cost" => $s->total_cost,
                    "pic_type" => $s->pic_type,
                    "pic_name" => $s->pic_name,
                    "sort_order" => $s->sort_order,
                    "menu_items" => $s->menuItems->map(
                        fn($m) => [
                            "id" => $m->id,
                            "menu_category" => $m->menu_category,
                            "menu_name" => $m->menu_name,
                            "portion_count" => $m->portion_count,
                            "unit" => $m->unit,
                            "cost_per_portion" => $m->cost_per_portion,
                            "is_subsidi" => $m->is_subsidi,
                            "subsidi_source_type" => $m->subsidi_source_type,
                            "subsidi_source_id" => $m->subsidi_source_id,
                            "subsidi_source_name" => $m->subsidi_source_name,
                            "serving_style" => $m->serving_style,
                            "equipment_needs" => $m->equipment_needs,
                            "subtotal" => $m->subtotal,
                            "notes" => $m->notes,
                        ],
                    ),
                ],
            );

        return response()->json(["success" => true, "data" => $schedules]);
    }

    public function store(Request $request, Event $event): JsonResponse
    {
        $request->validate([
            "time_serve" => ["required", "date_format:H:i,H:i:s"],
            "rundown_item_id" => [
                "nullable",
                "integer",
                "exists:rundown_items,id",
            ],
            "pic_type" => ["nullable", "in:person,other"],
            "pic_person_id" => ["nullable", "integer", "exists:persons,id"],
            "pic_name" => ["nullable", "string", "max:255"],
            "menu_items" => ["required", "array", "min:1"],
            "menu_items.*.menu_category" => [
                "required",
                "in:makanan_berat,makanan_ringan,minuman_es,minuman_hangat,snack",
            ],
            "menu_items.*.menu_name" => ["required", "string", "max:255"],
            "menu_items.*.portion_count" => ["nullable", "integer", "min:1"],
            "menu_items.*.unit" => ["nullable", "string", "max:20"],
            "menu_items.*.cost_per_portion" => ["nullable", "numeric", "min:0"],
            "menu_items.*.is_subsidi" => ["nullable", "boolean"],
            "menu_items.*.subsidi_source_type" => [
                "nullable",
                "in:person,qobilah,other",
            ],
            "menu_items.*.subsidi_source_id" => ["nullable", "integer"],
            "menu_items.*.subsidi_source_name" => [
                "nullable",
                "string",
                "max:255",
            ],
            "menu_items.*.serving_style" => ["nullable", "in:sendiri,bareng"],
            "menu_items.*.notes" => ["nullable", "string"],
        ]);

        $maxOrder = $event->cateringSchedules()->max("sort_order") ?? 0;

        $schedule = $event->cateringSchedules()->create([
            "time_serve" => $request->time_serve,
            "rundown_item_id" => $request->rundown_item_id,
            "pic_type" => $request->pic_type,
            "pic_person_id" => $request->pic_person_id,
            "pic_name" => $request->pic_name,
            "sort_order" => $maxOrder + 1,
        ]);

        foreach ($request->menu_items as $i => $item) {
            $schedule->menuItems()->create([
                "menu_category" => $item["menu_category"],
                "menu_name" => $item["menu_name"],
                "portion_count" => $item["portion_count"] ?? 1,
                "unit" => $item["unit"] ?? "porsi",
                "cost_per_portion" => $item["cost_per_portion"] ?? null,
                "is_subsidi" => $item["is_subsidi"] ?? false,
                "subsidi_source_type" => $item["subsidi_source_type"] ?? null,
                "subsidi_source_id" => $item["subsidi_source_id"] ?? null,
                "subsidi_source_name" => $item["subsidi_source_name"] ?? null,
                "serving_style" => $item["serving_style"] ?? null,
                "notes" => $item["notes"] ?? null,
                "sort_order" => $i,
            ]);
        }

        $schedule->load([
            "rundownItem:id,activity_title,time_start",
            "menuItems",
        ]);

        return response()->json(
            [
                "success" => true,
                "message" => "Jadwal konsumsi berhasil dibuat.",
                "data" => $this->formatSchedule($schedule),
            ],
            201,
        );
    }

    public function update(
        Request $request,
        CateringSchedule $schedule,
    ): JsonResponse {
        $request->validate([
            "time_serve" => ["sometimes", "date_format:H:i,H:i:s"],
            "rundown_item_id" => [
                "nullable",
                "integer",
                "exists:rundown_items,id",
            ],
            "pic_type" => ["nullable", "in:person,other"],
            "pic_person_id" => ["nullable", "integer", "exists:persons,id"],
            "pic_name" => ["nullable", "string", "max:255"],
            "sort_order" => ["nullable", "integer"],
        ]);

        $schedule->update(
            $request->only([
                "time_serve",
                "rundown_item_id",
                "pic_type",
                "pic_person_id",
                "pic_name",
                "sort_order",
            ]),
        );

        return response()->json([
            "success" => true,
            "message" => "Jadwal konsumsi berhasil diperbarui.",
            "data" => $this->formatSchedule(
                $schedule->fresh(["rundownItem", "menuItems"]),
            ),
        ]);
    }

    public function destroy(CateringSchedule $schedule): JsonResponse
    {
        $schedule->delete();
        return response()->json([
            "success" => true,
            "message" => "Jadwal konsumsi berhasil dihapus.",
        ]);
    }

    // ─── Menu Items ──────────────────────────────

    public function addMenuItem(
        Request $request,
        CateringSchedule $schedule,
    ): JsonResponse {
        $request->validate([
            "menu_category" => [
                "required",
                "in:makanan_berat,makanan_ringan,minuman_es,minuman_hangat,snack",
            ],
            "menu_name" => ["required", "string", "max:255"],
            "portion_count" => ["nullable", "integer", "min:1"],
            "unit" => ["nullable", "string", "max:20"],
            "cost_per_portion" => ["nullable", "numeric", "min:0"],
            "is_subsidi" => ["nullable", "boolean"],
            "subsidi_source_type" => ["nullable", "in:person,qobilah,other"],
            "subsidi_source_id" => ["nullable", "integer"],
            "subsidi_source_name" => ["nullable", "string", "max:255"],
            "serving_style" => ["nullable", "in:sendiri,bareng"],
            "equipment_needs" => ["nullable", "array"],
            "notes" => ["nullable", "string"],
        ]);

        $maxOrder = $schedule->menuItems()->max("sort_order") ?? 0;

        $item = $schedule->menuItems()->create([
            "menu_category" => $request->menu_category,
            "menu_name" => $request->menu_name,
            "portion_count" => $request->portion_count ?? 1,
            "unit" => $request->unit ?? "porsi",
            "cost_per_portion" => $request->cost_per_portion,
            "is_subsidi" => $request->is_subsidi ?? false,
            "subsidi_source_type" => $request->subsidi_source_type,
            "subsidi_source_id" => $request->subsidi_source_id,
            "subsidi_source_name" => $request->subsidi_source_name,
            "serving_style" => $request->serving_style,
            "equipment_needs" => $request->equipment_needs,
            "notes" => $request->notes,
            "sort_order" => $maxOrder + 1,
        ]);

        // Sync equipment to inventory
        if ($request->equipment_needs) {
            $this->syncEquipmentToInventory(
                $schedule->event_id,
                $request->equipment_needs,
                "Konsumsi",
            );
        }

        return response()->json(
            [
                "success" => true,
                "message" => "Menu berhasil ditambahkan.",
                "data" => $item,
            ],
            201,
        );
    }

    public function updateMenuItem(
        Request $request,
        CateringMenuItem $item,
    ): JsonResponse {
        $oldEquipment = $item->equipment_needs ?? [];

        $item->update(
            $request->only([
                "menu_category",
                "menu_name",
                "portion_count",
                "unit",
                "cost_per_portion",
                "is_subsidi",
                "subsidi_source_type",
                "subsidi_source_id",
                "subsidi_source_name",
                "serving_style",
                "equipment_needs",
                "notes",
                "sort_order",
            ]),
        );

        // Sync delta to inventory
        if ($request->has("equipment_needs")) {
            $newEquipment = $request->equipment_needs ?: [];
            $this->syncEquipmentDelta(
                $item->schedule->event_id,
                $oldEquipment,
                $newEquipment,
            );
        }

        return response()->json([
            "success" => true,
            "message" => "Menu berhasil diperbarui.",
            "data" => $item->fresh(),
        ]);
    }

    public function deleteMenuItem(CateringMenuItem $item): JsonResponse
    {
        $item->delete();
        return response()->json([
            "success" => true,
            "message" => "Menu berhasil dihapus.",
        ]);
    }

    /**
     * Apply delta between old and new equipment needs on edit.
     * Adds new items, adjusts quantity for changed items, removes old items.
     */
    private function syncEquipmentDelta(
        int $eventId,
        array $oldEquipment,
        array $newEquipment,
    ): void {
        $categoryName = "Konsumsi";
        $category = \App\Models\InventoryCategory::firstOrCreate(
            ["event_id" => $eventId, "name" => $categoryName],
            ["sort_order" => 0],
        );

        // Index old by name
        $oldMap = [];
        foreach ($oldEquipment as $eq) {
            $name = strtolower(trim($eq["name"] ?? ""));
            if ($name) {
                $oldMap[$name] = (int) ($eq["quantity"] ?? 1);
            }
        }

        // Index new by name
        $newMap = [];
        foreach ($newEquipment as $eq) {
            $name = strtolower(trim($eq["name"] ?? ""));
            if ($name) {
                $newMap[$name] = (int) ($eq["quantity"] ?? 1);
            }
        }

        // Apply deltas
        $allNames = array_unique(
            array_merge(array_keys($oldMap), array_keys($newMap)),
        );
        foreach ($allNames as $name) {
            $oldQty = $oldMap[$name] ?? 0;
            $newQty = $newMap[$name] ?? 0;
            $delta = $newQty - $oldQty;

            $item = $category
                ->items()
                ->whereRaw("LOWER(name) = ?", [$name])
                ->first();

            if ($item) {
                $updatedQty = max(0, ($item->quantity_needed ?? 0) + $delta);
                if ($updatedQty <= 0) {
                    // Remove if quantity drops to zero
                    $item->delete();
                } else {
                    $item->update(["quantity_needed" => $updatedQty]);
                }
            } elseif ($newQty > 0) {
                // New item
                $category->items()->create([
                    "name" => ucfirst($name),
                    "quantity_needed" => $newQty,
                    "unit" =>
                        $newEquipment[array_search($name, array_keys($newMap))][
                            "unit"
                        ] ?? "pcs",
                    "source_type" => "pinjam",
                    "acquisition_status" => "pending",
                    "return_status" => "not_applicable",
                ]);
            }
        }
    }

    private function formatSchedule($s): array
    {
        return [
            "id" => $s->id,
            "event_id" => $s->event_id,
            "rundown_item_id" => $s->rundown_item_id,
            "rundown_label" => $s->rundownItem
                ? $s->rundownItem->time_start .
                    " " .
                    $s->rundownItem->activity_title
                : null,
            "time_serve" => $s->time_serve,
            "total_cost" => $s->total_cost,
            "pic_type" => $s->pic_type,
            "pic_name" => $s->pic_name,
            "sort_order" => $s->sort_order,
            "menu_items" => $s->menuItems->map(
                fn($m) => [
                    "id" => $m->id,
                    "menu_category" => $m->menu_category,
                    "menu_name" => $m->menu_name,
                    "portion_count" => $m->portion_count,
                    "unit" => $m->unit,
                    "cost_per_portion" => $m->cost_per_portion,
                    "is_subsidi" => $m->is_subsidi,
                    "subsidi_source_type" => $m->subsidi_source_type,
                    "subsidi_source_id" => $m->subsidi_source_id,
                    "subsidi_source_name" => $m->subsidi_source_name,
                    "serving_style" => $m->serving_style,
                    "equipment_needs" => $m->equipment_needs,
                    "subtotal" => $m->subtotal,
                    "notes" => $m->notes,
                ],
            ),
        ];
    }

    private function syncEquipmentToInventory(
        int $eventId,
        array $equipment,
        ?string $categoryName = null,
    ): void {
        $categoryName = $categoryName ?: "Konsumsi";

        foreach ($equipment as $eq) {
            $name = trim($eq["name"] ?? "");
            $qty = (int) ($eq["quantity"] ?? 1);
            $unit = $eq["unit"] ?? "pcs";
            $usage = $eq["usage"] ?? "single"; // single = sekali pakai, reusable = pakai ulang

            if (empty($name)) {
                continue;
            }

            $category = \App\Models\InventoryCategory::firstOrCreate(
                ["event_id" => $eventId, "name" => $categoryName],
                ["sort_order" => 0],
            );

            $item = $category
                ->items()
                ->whereRaw("LOWER(name) = ?", [strtolower($name)])
                ->first();

            if ($item) {
                // Reusable: take max, single-use: accumulate
                $newQty =
                    $usage === "reusable"
                        ? max($item->quantity_needed, $qty)
                        : $item->quantity_needed + $qty;

                $item->update([
                    "quantity_needed" => $newQty,
                    "unit" => $unit,
                    "source_type" => "pinjam",
                ]);
            } else {
                $category->items()->create([
                    "name" => ucfirst($name),
                    "quantity_needed" => $qty,
                    "unit" => $unit,
                    "source_type" => "pinjam",
                    "acquisition_status" => "pending",
                    "return_status" => "not_applicable",
                ]);
            }
        }
    }
}
