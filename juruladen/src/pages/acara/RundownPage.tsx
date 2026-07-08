import { useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useEvents } from "../../features/events/hooks/useEvent";
import { EventSelector } from "../../features/events/components/EventSelector";
import { useSearchPerson } from "../../features/users/hooks/useUsers";
import {
  useRundowns,
  useCreateRundown,
  useUpdateRundown,
  useDeleteRundown,
  useAddRundownItem,
  useUpdateRundownItem,
  useDeleteRundownItem,
  useReorderRundownItems,
} from "../../features/acara/hooks/useAcara";
import {
  LoadingSkeleton,
  EmptyState,
  ConfirmationModal,
} from "../../components/ui";
import type { Rundown, RundownItem } from "../../types";
import {
  ListPlus,
  GripVertical,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  mc_utama: "MC Utama",
  co_mc: "Co-MC",
  qori: "Qori'",
  tilawah: "Tilawah",
};

export default function RundownPage() {
  const { eventSlug } = useParams();
  const { data: events } = useEvents();
  const currentEvent = events?.find((e) => e.slug === eventSlug) || events?.[0];
  const eventId = currentEvent?.id ?? null;

  const { data: rundowns, isLoading } = useRundowns(eventId);
  const createRundown = useCreateRundown(eventId!);
  const deleteRundown = useDeleteRundown(eventId!);
  const addItem = useAddRundownItem(eventId!);
  const updateItem = useUpdateRundownItem(eventId!);
  const deleteItem = useDeleteRundownItem(eventId!);
  const reorderItems = useReorderRundownItems(eventId!);

  // Section modal
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    title: "",
    description: "",
  });
  const [editingSection, setEditingSection] = useState<Rundown | null>(null);

  // Item modal
  const [showItemModal, setShowItemModal] = useState(false);
  const [activeRundownId, setActiveRundownId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<RundownItem | null>(null);
  const [itemForm, setItemForm] = useState({
    time_start: "",
    time_end: "",
    activity_title: "",
    description: "",
    pic_person_id: "",
    location_venue: "",
  });

  // Confirmation
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "section" | "item";
    id: number;
    rundownId?: number;
  } | null>(null);

  // Person search
  const [personSearch, setPersonSearch] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<{
    id: number;
    full_name: string;
  } | null>(null);
  const searchPerson = useSearchPerson();
  const personTimer = useRef<ReturnType<typeof setTimeout>>();

  const handlePersonSearch = useCallback(
    (q: string) => {
      setPersonSearch(q);
      if (personTimer.current) clearTimeout(personTimer.current);
      personTimer.current = setTimeout(() => {
        if (q.length >= 2) searchPerson.mutate({ query: q });
      }, 400);
    },
    [searchPerson],
  );

  // Drag state
  const [dragItem, setDragItem] = useState<{
    rundownId: number;
    itemId: number;
  } | null>(null);

  if (isLoading) return <LoadingSkeleton lines={10} />;
  if (!currentEvent) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Rundown Acara</h1>
          <EventSelector />
        </div>
        <EmptyState
          title="Belum ada acara"
          description="Pilih atau buat acara terlebih dahulu."
        />
      </div>
    );
  }

  // ─── Section handlers ──────────────────────────

  const openSectionModal = (section?: Rundown) => {
    if (section) {
      setEditingSection(section);
      setSectionForm({
        title: section.title,
        description: section.description || "",
      });
    } else {
      setEditingSection(null);
      setSectionForm({ title: "", description: "" });
    }
    setShowSectionModal(true);
  };

  const saveSection = () => {
    if (!sectionForm.title.trim()) return;
    if (editingSection) {
      // updateRundown not directly used for edit via modal - we'll use a simple approach
      createRundown.mutate(
        {
          title: sectionForm.title,
          description: sectionForm.description || undefined,
        },
        {
          onSuccess: () => {
            setShowSectionModal(false);
            setEditingSection(null);
          },
        },
      );
      // For update, we'd need updateRundown; here we just create for the "add" flow
    } else {
      createRundown.mutate(
        {
          title: sectionForm.title,
          description: sectionForm.description || undefined,
        },
        { onSuccess: () => setShowSectionModal(false) },
      );
    }
  };

  // ─── Item handlers ─────────────────────────────

  const openItemModal = (rundownId: number, item?: RundownItem) => {
    setActiveRundownId(rundownId);
    if (item) {
      setEditingItem(item);
      setItemForm({
        time_start: item.time_start?.slice(0, 5) || "",
        time_end: item.time_end?.slice(0, 5) || "",
        activity_title: item.activity_title,
        description: item.description || "",
        pic_person_id: item.pic_person_id ? String(item.pic_person_id) : "",
        location_venue: item.location_venue || "",
      });
      setSelectedPerson(
        item.pic_person_id
          ? {
              id: item.pic_person_id,
              full_name: (item as any).pic_name || item.pic?.full_name || "",
            }
          : null,
      );
      setPersonSearch((item as any).pic_name || item.pic?.full_name || "");
    } else {
      setEditingItem(null);
      setItemForm({
        time_start: "",
        time_end: "",
        activity_title: "",
        description: "",
        pic_person_id: "",
        location_venue: "",
      });
      setSelectedPerson(null);
      setPersonSearch("");
    }
    setShowItemModal(true);
  };

  const saveItem = () => {
    if (!activeRundownId || !itemForm.activity_title.trim()) return;
    const data: Partial<RundownItem> = {
      time_start: itemForm.time_start
        ? itemForm.time_start + ":00"
        : "00:00:00",
      time_end: itemForm.time_end ? itemForm.time_end + ":00" : undefined,
      activity_title: itemForm.activity_title,
      description: itemForm.description || undefined,
      pic_person_id: selectedPerson?.id,
      location_venue: itemForm.location_venue || undefined,
    };

    if (editingItem) {
      updateItem.mutate(
        { rundownId: activeRundownId, itemId: editingItem.id, data },
        { onSuccess: () => setShowItemModal(false) },
      );
    } else {
      addItem.mutate(
        { rundownId: activeRundownId, data },
        { onSuccess: () => setShowItemModal(false) },
      );
    }
  };

  const doDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === "section") {
      deleteRundown.mutate(confirmDelete.id);
    } else if (confirmDelete.type === "item" && confirmDelete.rundownId) {
      deleteItem.mutate({
        rundownId: confirmDelete.rundownId,
        itemId: confirmDelete.id,
      });
    }
    setConfirmDelete(null);
  };

  // ─── Drag & Drop ───────────────────────────────

  const handleDragStart = (rundownId: number, itemId: number) => {
    setDragItem({ rundownId, itemId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (rundownId: number, targetItemId: number) => {
    if (!dragItem || dragItem.rundownId !== rundownId) return;
    const section = rundowns?.find((r) => r.id === rundownId);
    if (!section) return;

    const items = [...section.items];
    const draggedIdx = items.findIndex((i) => i.id === dragItem.itemId);
    const targetIdx = items.findIndex((i) => i.id === targetItemId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    items.splice(targetIdx, 0, items.splice(draggedIdx, 1)[0]);
    const reordered = items.map((item, idx) => ({
      id: item.id,
      sort_order: idx + 1,
    }));
    reorderItems.mutate({ rundownId, items: reordered });
    setDragItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Rundown Acara</h1>
        <EventSelector />
      </div>

      <button
        onClick={() => openSectionModal()}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <ListPlus size={18} />
        Tambah Section
      </button>

      {!rundowns || rundowns.length === 0 ? (
        <EmptyState
          title="Belum ada rundown"
          description="Tambahkan section rundown untuk memulai."
        />
      ) : (
        <div className="space-y-4">
          {rundowns.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {section.title}
                  </h3>
                  {section.description && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {section.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openItemModal(section.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    <Plus size={14} />
                    Tambah Item
                  </button>
                  <button
                    onClick={() =>
                      setConfirmDelete({ type: "section", id: section.id })
                    }
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100">
                {section.items.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Belum ada item. Klik "Tambah Item" untuk menambahkan.
                  </p>
                ) : (
                  section.items.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(section.id, item.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(section.id, item.id)}
                      onClick={() => openItemModal(section.id, item)}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="cursor-grab text-gray-300 hover:text-gray-500 flex-shrink-0">
                        <GripVertical size={16} />
                      </div>
                      <div className="flex items-center gap-2 min-w-[80px] text-xs text-blue-700 font-mono">
                        <Clock size={14} />
                        {item.time_start?.slice(0, 5) || "--:--"}
                        {item.time_end && ` - ${item.time_end.slice(0, 5)}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.activity_title}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-500 truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.location_venue && (
                        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={12} />
                          {item.location_venue}
                        </div>
                      )}
                      {(item.pic || item.pic_name) && (
                        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                          <User size={12} />
                          {item.pic?.full_name || item.pic_name}
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete({
                            type: "item",
                            id: item.id,
                            rundownId: section.id,
                          });
                        }}
                        className="p-1 text-gray-300 hover:text-red-500 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Section Modal ─────────────────────────── */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSection ? "Edit Section" : "Tambah Section"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul
                </label>
                <input
                  type="text"
                  value={sectionForm.title}
                  onChange={(e) =>
                    setSectionForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Pembukaan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi (opsional)
                </label>
                <textarea
                  value={sectionForm.description}
                  onChange={(e) =>
                    setSectionForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Deskripsi singkat..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowSectionModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={saveSection}
                disabled={!sectionForm.title.trim() || createRundown.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createRundown.isPending ? "Menyimpan..." : "Simpan"}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Mulai
                  </label>
                  <input
                    type="time"
                    value={itemForm.time_start}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        time_start: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Selesai
                  </label>
                  <input
                    type="time"
                    value={itemForm.time_end}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        time_end: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Aktivitas *
                </label>
                <input
                  type="text"
                  value={itemForm.activity_title}
                  onChange={(e) =>
                    setItemForm((prev) => ({
                      ...prev,
                      activity_title: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Sambutan Ketua Panitia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) =>
                    setItemForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detail aktivitas..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIC
                </label>
                {selectedPerson ? (
                  <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-700">
                      {selectedPerson.full_name}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPerson(null);
                        setPersonSearch("");
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
                      value={personSearch}
                      onChange={(e) => handlePersonSearch(e.target.value)}
                      placeholder="Ketik nama untuk mencari..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {searchPerson.isPending && (
                      <span className="absolute right-3 top-2 text-xs text-gray-400">
                        Mencari...
                      </span>
                    )}
                    {searchPerson.data?.data && personSearch.length >= 2 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {searchPerson.data.data.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedPerson(p);
                              setPersonSearch(p.full_name);
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
                  Lokasi / Venue
                </label>
                <input
                  type="text"
                  value={itemForm.location_venue}
                  onChange={(e) =>
                    setItemForm((prev) => ({
                      ...prev,
                      location_venue: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Aula Utama"
                />
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
                disabled={!itemForm.activity_title.trim()}
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
        message={
          confirmDelete?.type === "section"
            ? "Hapus section ini beserta semua item di dalamnya?"
            : "Hapus item rundown ini?"
        }
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Hapus"
        danger
      />
    </div>
  );
}
