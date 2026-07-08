import { useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useEvents } from "../../features/events/hooks/useEvent";
import { EventSelector } from "../../features/events/components/EventSelector";
import { useSearchPerson } from "../../features/users/hooks/useUsers";
import {
  useInventory,
  useCreateCategory,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  useUpdateInventoryStatus,
} from "../../features/acara/hooks/useAcara";
import {
  LoadingSkeleton,
  EmptyState,
  Badge,
  ConfirmationModal,
} from "../../components/ui";
import type { InventoryCategory, InventoryItem } from "../../types";
import {
  Package,
  Plus,
  CheckCircle,
  Truck,
  RotateCcw,
  Trash2,
  Pencil,
} from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  beli: "Beli",
  sewa: "Sewa",
  pinjam: "Pinjam",
  punya_sendiri: "Punya Sendiri",
};

const STATUS_BADGES: Record<
  string,
  {
    label: string;
    variant: "default" | "success" | "warning" | "danger" | "info";
  }
> = {
  pending: { label: "Pending", variant: "default" },
  delivered: { label: "Tersedia", variant: "success" },
  returned: { label: "Dikembalikan", variant: "info" },
};

export default function InventoryPage() {
  const { eventSlug } = useParams();
  const { data: events } = useEvents();
  const currentEvent = events?.find((e) => e.slug === eventSlug) || events?.[0];
  const eventId = currentEvent?.id ?? null;

  const [filterCategoryId, setFilterCategoryId] = useState<
    number | undefined
  >();
  const { data: inventory, isLoading } = useInventory(
    eventId,
    filterCategoryId,
  );
  // Separate unfiltered query for dropdown options
  const { data: allCategories } = useInventory(eventId);
  const createCategory = useCreateCategory(eventId!);
  const createItem = useCreateInventoryItem(eventId!);
  const updateItem = useUpdateInventoryItem(eventId!);
  const deleteItem = useDeleteInventoryItem(eventId!);
  const updateStatus = useUpdateInventoryStatus(eventId!);

  // Category modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  // Item modal
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [itemForm, setItemForm] = useState({
    name: "",
    quantity_needed: 1,
    unit: "pcs",
    source_type: "beli" as InventoryItem["source_type"],
    source_detail: "",
    cost_per_unit: "",
    notes: "",
    acquisition_status: "pending" as InventoryItem["acquisition_status"],
    return_status: "not_applicable" as InventoryItem["return_status"],
  });

  // Confirmation
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  // Person search for PIC
  const [picSearch, setPicSearch] = useState("");
  const [selectedPic, setSelectedPic] = useState<{
    id: number;
    full_name: string;
  } | null>(null);
  const searchPerson = useSearchPerson();
  const personTimer = useRef<ReturnType<typeof setTimeout>>();

  const handlePicSearch = useCallback(
    (q: string) => {
      setPicSearch(q);
      if (personTimer.current) clearTimeout(personTimer.current);
      personTimer.current = setTimeout(() => {
        if (q.length >= 2) searchPerson.mutate({ query: q });
      }, 400);
    },
    [searchPerson],
  );

  if (isLoading) return <LoadingSkeleton lines={10} />;
  if (!currentEvent) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Perlengkapan</h1>
          <EventSelector />
        </div>
        <EmptyState
          title="Belum ada acara"
          description="Pilih atau buat acara terlebih dahulu."
        />
      </div>
    );
  }

  const openItemModal = (categoryId: number, item?: InventoryItem) => {
    setSelectedCategoryId(categoryId);
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        quantity_needed: item.quantity_needed,
        unit: item.unit,
        source_type: item.source_type,
        source_detail: item.source_detail || "",
        cost_per_unit: item.cost_per_unit ? String(item.cost_per_unit) : "",
        notes: item.notes || "",
        acquisition_status: item.acquisition_status,
        return_status: item.return_status,
      });
      setSelectedPic(
        item.assigned_person_id
          ? {
              id: item.assigned_person_id,
              full_name:
                (item as any).assigned_person_name ||
                item.assigned_person?.full_name ||
                "",
            }
          : null,
      );
      setPicSearch(
        (item as any).assigned_person_name ||
          item.assigned_person?.full_name ||
          "",
      );
    } else {
      setEditingItem(null);
      setItemForm({
        name: "",
        quantity_needed: 1,
        unit: "pcs",
        source_type: "beli",
        source_detail: "",
        cost_per_unit: "",
        notes: "",
        acquisition_status: "pending",
        return_status: "not_applicable",
      });
      setSelectedPic(null);
      setPicSearch("");
    }
    setShowItemModal(true);
  };

  const saveItem = () => {
    if (!selectedCategoryId || !itemForm.name.trim()) return;
    const data: Partial<InventoryItem> = {
      name: itemForm.name,
      quantity_needed: itemForm.quantity_needed,
      unit: itemForm.unit,
      source_type: itemForm.source_type,
      source_detail: itemForm.source_detail || undefined,
      cost_per_unit: itemForm.cost_per_unit
        ? Number(itemForm.cost_per_unit)
        : undefined,
      notes: itemForm.notes || undefined,
      assigned_to_person_id: selectedPic?.id,
      acquisition_status: itemForm.acquisition_status,
      return_status: itemForm.return_status,
    };

    if (editingItem) {
      updateItem.mutate(
        { itemId: editingItem.id, data },
        { onSuccess: () => setShowItemModal(false) },
      );
    } else {
      createItem.mutate(
        { categoryId: selectedCategoryId, data },
        { onSuccess: () => setShowItemModal(false) },
      );
    }
  };

  const saveCategory = () => {
    if (!categoryName.trim()) return;
    createCategory.mutate(
      { name: categoryName },
      {
        onSuccess: () => {
          setShowCategoryModal(false);
          setCategoryName("");
        },
      },
    );
  };

  const getNextStatus = (
    current: string,
  ): { acquisition_status: string } | null => {
    if (current === "pending") return { acquisition_status: "delivered" };
    if (current === "delivered") return { acquisition_status: "returned" };
    return null;
  };

  const itemTotal = (item: InventoryItem) =>
    (item.cost_per_unit || 0) * item.quantity_needed;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Perlengkapan</h1>
        <EventSelector />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterCategoryId || ""}
          onChange={(e) =>
            setFilterCategoryId(
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Semua Kategori</option>
          {allCategories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowCategoryModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Tambah Kategori
        </button>
      </div>

      {!inventory || inventory.length === 0 ? (
        <EmptyState
          title="Belum ada perlengkapan"
          description="Tambahkan kategori dan item perlengkapan."
        />
      ) : (
        <div className="space-y-6">
          {inventory.map((cat) => {
            const categoryTotal = cat.items.reduce(
              (sum, item) => sum + itemTotal(item),
              0,
            );
            return (
              <div
                key={cat.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Package size={18} className="text-blue-600" />
                    {cat.name}
                  </h3>
                  <button
                    onClick={() => openItemModal(cat.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    <Plus size={14} />
                    Tambah Item
                  </button>
                </div>

                {cat.items.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Belum ada item di kategori ini.
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-left">
                            <th className="px-5 py-2 text-xs font-medium text-gray-500">
                              Nama
                            </th>
                            <th className="px-5 py-2 text-xs font-medium text-gray-500">
                              Qty
                            </th>
                            <th className="px-5 py-2 text-xs font-medium text-gray-500">
                              Unit
                            </th>
                            <th className="px-5 py-2 text-xs font-medium text-gray-500">
                              Sumber
                            </th>
                            <th className="px-5 py-2 text-xs font-medium text-gray-500">
                              Status
                            </th>
                            <th className="px-5 py-2 text-xs font-medium text-gray-500 text-right">
                              Biaya
                            </th>
                            <th className="px-5 py-2 text-xs font-medium text-gray-500">
                              PIC
                            </th>
                            <th className="px-5 py-2 text-xs font-medium text-gray-500">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {cat.items.map((item) => {
                            const badge = STATUS_BADGES[
                              item.acquisition_status
                            ] || {
                              label: item.acquisition_status,
                              variant: "default" as const,
                            };
                            return (
                              <tr
                                key={item.id}
                                className="border-b border-gray-50 hover:bg-gray-50"
                              >
                                <td className="px-5 py-3 font-medium text-gray-900">
                                  {item.name}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                  {item.quantity_needed}
                                </td>
                                <td className="px-5 py-3 text-gray-500">
                                  {item.unit}
                                </td>
                                <td className="px-5 py-3 text-gray-500">
                                  {SOURCE_LABELS[item.source_type] ||
                                    item.source_type}
                                </td>
                                <td className="px-5 py-3">
                                  <Badge variant={badge.variant}>
                                    {badge.label}
                                  </Badge>
                                </td>
                                <td className="px-5 py-3 text-right text-gray-700">
                                  {itemTotal(item) > 0
                                    ? `Rp ${itemTotal(item).toLocaleString()}`
                                    : "-"}
                                </td>
                                <td className="px-5 py-3 text-gray-500">
                                  {(item as any).assigned_person_name ||
                                    item.assigned_person?.full_name ||
                                    "-"}
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() =>
                                          openItemModal(cat.id, item)
                                        }
                                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                        title="Edit"
                                      >
                                        <Pencil size={14} />
                                      </button>
                                      {getNextStatus(
                                        item.acquisition_status,
                                      ) && (
                                        <button
                                          onClick={() => {
                                            const next = getNextStatus(
                                              item.acquisition_status,
                                            );
                                            if (next)
                                              updateStatus.mutate({
                                                itemId: item.id,
                                                data: next,
                                              });
                                          }}
                                          className="p-1 text-gray-400 hover:text-green-600 rounded"
                                          title={
                                            item.acquisition_status ===
                                            "pending"
                                              ? "Tandai Tersedia"
                                              : "Tandai Dikembalikan"
                                          }
                                        >
                                          {item.acquisition_status ===
                                          "pending" ? (
                                            <Truck size={14} />
                                          ) : (
                                            <RotateCcw size={14} />
                                          )}
                                        </button>
                                      )}
                                      <button
                                        onClick={() =>
                                          setConfirmDelete(item.id)
                                        }
                                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                                        title="Hapus"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {categoryTotal > 0 && (
                      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-right">
                        <span className="text-sm font-medium text-gray-700">
                          Total: Rp {categoryTotal.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Category Modal ────────────────────────── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tambah Kategori
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Kategori
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contoh: Sound System"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={saveCategory}
                disabled={!categoryName.trim() || createCategory.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createCategory.isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Item Modal ────────────────────────────── */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingItem ? "Edit Item" : "Tambah Item"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Item *
                </label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) =>
                    setItemForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Microphone Wireless"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={itemForm.quantity_needed}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        quantity_needed: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={itemForm.unit}
                    onChange={(e) =>
                      setItemForm((prev) => ({ ...prev, unit: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="pcs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sumber
                  </label>
                  <select
                    value={itemForm.source_type}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        source_type: e.target
                          .value as InventoryItem["source_type"],
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="beli">Beli</option>
                    <option value="sewa">Sewa</option>
                    <option value="pinjam">Pinjam</option>
                    <option value="punya_sendiri">Punya Sendiri</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detail Sumber
                </label>
                <input
                  type="text"
                  value={itemForm.source_detail}
                  onChange={(e) =>
                    setItemForm((prev) => ({
                      ...prev,
                      source_detail: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama toko / vendor / kontak"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biaya per Unit (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={itemForm.cost_per_unit}
                  onChange={(e) =>
                    setItemForm((prev) => ({
                      ...prev,
                      cost_per_unit: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIC Penanggung Jawab
                </label>
                {selectedPic ? (
                  <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-700">
                      {selectedPic.full_name}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPic(null);
                        setPicSearch("");
                      }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={picSearch}
                      onChange={(e) => handlePicSearch(e.target.value)}
                      placeholder="Ketik nama untuk mencari..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {searchPerson.isPending && (
                      <span className="absolute right-3 top-2 text-xs text-gray-400">
                        Mencari...
                      </span>
                    )}
                    {searchPerson.data?.data && picSearch.length >= 2 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {searchPerson.data.data.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedPic(p);
                              setPicSearch(p.full_name);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
                          >
                            {p.full_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan
                </label>
                <textarea
                  value={itemForm.notes}
                  onChange={(e) =>
                    setItemForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Catatan tambahan..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Pengadaan
                  </label>
                  <select
                    value={itemForm.acquisition_status}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        acquisition_status: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="delivered">Tersedia</option>
                    <option value="returned">Dikembalikan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Pengembalian
                  </label>
                  <select
                    value={itemForm.return_status}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        return_status: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="not_applicable">N/A</option>
                    <option value="pending">Pending</option>
                    <option value="returned">Dikembalikan</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowItemModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={saveItem}
                disabled={!itemForm.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {editingItem ? "Update" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirmation Modal ────────────────────── */}
      <ConfirmationModal
        open={!!confirmDelete}
        title="Konfirmasi Hapus"
        message="Hapus item perlengkapan ini?"
        onConfirm={() => {
          if (confirmDelete) deleteItem.mutate(confirmDelete);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Hapus"
        danger
      />
    </div>
  );
}
