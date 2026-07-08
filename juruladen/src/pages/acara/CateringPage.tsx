import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useEvents } from "../../features/events/hooks/useEvent";
import { EventSelector } from "../../features/events/components/EventSelector";
import {
  useCatering,
  useCreateCatering,
  useUpdateCatering,
  useDeleteCatering,
  useRundowns,
} from "../../features/acara/hooks/useAcara";
import { acaraApi } from "../../features/acara/api/acaraApi";
import { useSearchPerson } from "../../features/users/hooks/useUsers";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import {
  LoadingSkeleton,
  EmptyState,
  Badge,
  ConfirmationModal,
} from "../../components/ui";
import type { CateringSchedule, CateringMenuItem } from "../../types";
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronRight,
  Recycle,
  User,
  Gift,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const CAT_BADGES: Record<
  string,
  {
    label: string;
    variant: "default" | "success" | "warning" | "danger" | "info";
  }
> = {
  makanan_berat: { label: "Makanan Berat", variant: "danger" },
  makanan_ringan: { label: "Makanan Ringan", variant: "warning" },
  minuman_es: { label: "Minuman Es", variant: "info" },
  minuman_hangat: { label: "Minuman Hangat", variant: "warning" },
  snack: { label: "Snack", variant: "success" },
};

export default function CateringPage() {
  const { eventSlug } = useParams();
  const queryClient = useQueryClient();
  const { data: events } = useEvents();
  const currentEvent = events?.find((e) => e.slug === eventSlug) || events?.[0];
  const eventId = currentEvent?.id ?? null;
  const { data: catering, isLoading } = useCatering(eventId);
  const { data: rundowns } = useRundowns(eventId);
  const createCatering = useCreateCatering(eventId!);
  const updateCatering = useUpdateCatering(eventId!);
  const deleteCatering = useDeleteCatering(eventId!);
  const searchPerson = useSearchPerson();

  // PIC person search
  const [picSearch, setPicSearch] = useState("");
  const [picResults, setPicResults] = useState<any[]>([]);

  // Fetch branches for qobilah dropdown
  const { data: branchesData } = useQuery({
    queryKey: ["juruladen", "branches"],
    queryFn: () => api.get("/admin/branches").then((r: any) => r.data),
    staleTime: 5 * 60 * 1000,
  });
  const branches = (branchesData as any[]) || [];

  // Collect existing menu names for autocomplete
  const existingMenus = useMemo(() => {
    if (!catering) return [] as CateringMenuItem[];
    return catering.flatMap((s) => s.menu_items);
  }, [catering]);

  const existingMenuNames = useMemo(() => {
    const seen = new Set<string>();
    return existingMenus.filter((m) => {
      const key = m.menu_name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [existingMenus]);

  // Auto-fill form when menu name matches existing item
  const handleMenuNameChange = (value: string) => {
    setMenuForm((f) => ({ ...f, menu_name: value }));
    if (!editingMenuItem && value.length >= 2) {
      const match = existingMenus.find(
        (m) => m.menu_name.toLowerCase() === value.toLowerCase(),
      );
      if (match) {
        setMenuForm((f) => ({
          ...f,
          menu_name: value,
          menu_category: match.menu_category,
          unit: match.unit || f.unit,
          is_subsidi: match.is_subsidi || false,
          serving_style: match.serving_style || "",
          equipments: (match as any).equipment_needs || [],
        }));
      }
    }
  };

  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [expandedMenuItems, setExpandedMenuItems] = useState<Set<number>>(
    new Set(),
  );
  const [hideNominal, setHideNominal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CateringSchedule | null>(null);
  const [form, setForm] = useState({
    time_serve: "",
    rundown_item_id: "" as string | number,
    pic_type: "person" as string,
    pic_name: "",
  });
  const [menuForm, setMenuForm] = useState({
    menu_category: "makanan_berat" as CateringMenuItem["menu_category"],
    menu_name: "",
    portion_count: 1,
    unit: "porsi",
    cost_per_portion: "",
    is_subsidi: false,
    subsidi_source_type: "" as string,
    subsidi_source_id: undefined as number | undefined,
    subsidi_source_name: "",
    serving_style: "" as string,
    equipments: [] as { name: string; quantity: number; unit: string }[],
  });
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [activeScheduleId, setActiveScheduleId] = useState<number | null>(null);
  const [editingMenuItem, setEditingMenuItem] =
    useState<CateringMenuItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "schedule" | "menu";
    id: number;
  } | null>(null);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleMenuItem = (id: number) => {
    setExpandedMenuItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set(
      catering?.flatMap((s) => [s.id, ...s.menu_items.map((m) => m.id)]) || [],
    );
    setExpanded(new Set(catering?.map((s) => s.id) || []));
    setExpandedMenuItems(
      new Set(catering?.flatMap((s) => s.menu_items.map((m) => m.id)) || []),
    );
  };

  const collapseAll = () => {
    setExpanded(new Set());
    setExpandedMenuItems(new Set());
  };

  const openScheduleModal = (schedule?: CateringSchedule) => {
    if (schedule) {
      setEditing(schedule);
      setForm({
        time_serve: schedule.time_serve?.slice(0, 5) || "",
        rundown_item_id: schedule.rundown_item_id || "",
        pic_type: (schedule as any).pic_type || "person",
        pic_name: (schedule as any).pic_name || "",
      });
    } else {
      setEditing(null);
      setForm({
        time_serve: "",
        rundown_item_id: "",
        pic_type: "person",
        pic_name: "",
      });
    }
    setShowModal(true);
  };

  const saveSchedule = () => {
    if (!form.time_serve) return;
    const data: any = {
      time_serve: form.time_serve + ":00",
      rundown_item_id: form.rundown_item_id
        ? Number(form.rundown_item_id)
        : null,
      pic_type: form.pic_type || "person",
      pic_name: form.pic_name || null,
      menu_items: [
        { menu_category: "makanan_berat", menu_name: "-", portion_count: 1 },
      ],
    };
    if (editing) {
      updateCatering.mutate(
        { id: editing.id, data },
        { onSuccess: () => setShowModal(false) },
      );
    } else {
      createCatering.mutate(data, { onSuccess: () => setShowModal(false) });
    }
  };

  const openMenuModal = (scheduleId: number, item?: CateringMenuItem) => {
    setActiveScheduleId(scheduleId);
    if (item) {
      setEditingMenuItem(item);
      setMenuForm({
        menu_category: item.menu_category,
        menu_name: item.menu_name,
        portion_count: item.portion_count,
        unit: item.unit || "porsi",
        cost_per_portion: item.cost_per_portion
          ? String(item.cost_per_portion)
          : "",
        is_subsidi: item.is_subsidi || false,
        subsidi_source_type: item.is_subsidi
          ? (item as any).subsidi_source_type || "qobilah"
          : "",
        subsidi_source_id: (item as any).subsidi_source_id || undefined,
        subsidi_source_name: (item as any).subsidi_source_name || "",
        serving_style: item.serving_style || "",
        equipments: (item as any).equipment_needs || [],
      });
    } else {
      setEditingMenuItem(null);
      setMenuForm({
        menu_category: "makanan_berat",
        menu_name: "",
        portion_count: 1,
        unit: "porsi",
        cost_per_portion: "",
        is_subsidi: false,
        subsidi_source_type: "",
        subsidi_source_id: undefined,
        subsidi_source_name: "",
        serving_style: "",
        equipments: [],
      });
    }
    setShowMenuModal(true);
  };

  const saveMenuItem = async () => {
    if (!activeScheduleId || !menuForm.menu_name.trim()) return;
    const data = {
      ...menuForm,
      portion_count: Number(menuForm.portion_count) || 1,
      unit: menuForm.unit || "porsi",
      cost_per_portion: menuForm.is_subsidi
        ? null
        : menuForm.cost_per_portion
          ? Number(menuForm.cost_per_portion)
          : null,
      equipment_needs:
        menuForm.equipments.length > 0 ? menuForm.equipments : null,
    };
    try {
      if (editingMenuItem) {
        await acaraApi.updateMenuItem(editingMenuItem.id, data);
      } else {
        await acaraApi.addMenuItem(activeScheduleId, data);
      }
      queryClient.invalidateQueries({
        queryKey: ["juruladen", "events", eventId, "catering"],
      });
      setShowMenuModal(false);
    } catch {}
  };

  const deleteMenuItem = async () => {
    if (confirmDelete?.type === "menu") {
      await acaraApi.deleteMenuItem(confirmDelete.id);
      queryClient.invalidateQueries({
        queryKey: ["juruladen", "events", eventId, "catering"],
      });
      setConfirmDelete(null);
    }
  };

  if (isLoading) return <LoadingSkeleton lines={8} />;
  if (!currentEvent)
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Konsumsi</h1>
          <EventSelector />
        </div>
        <EmptyState title="Belum ada acara" />
      </div>
    );

  const grandTotal =
    catering?.reduce((sum, s) => sum + (s.total_cost || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Konsumsi</h1>
        <EventSelector />
      </div>
      <button
        onClick={() => openScheduleModal()}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
      >
        <Plus size={18} /> Tambah Jadwal
      </button>

      {!catering || catering.length === 0 ? (
        <EmptyState title="Belum ada jadwal konsumsi" />
      ) : (
        <>
          {/* Master Controls */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={expandAll}
              className="text-blue-600 hover:text-blue-800"
            >
              Buka Semua
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={collapseAll}
              className="text-blue-600 hover:text-blue-800"
            >
              Tutup Semua
            </button>
            <span className="text-gray-300">|</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={hideNominal}
                onChange={(e) => setHideNominal(e.target.checked)}
                className="rounded"
              />
              <span className="text-gray-500">Samarkan Nominal</span>
            </label>
          </div>
          <div className="space-y-3">
            {catering.map((s) => {
              const isOpen = expanded.has(s.id);
              return (
                <div
                  key={s.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleExpand(s.id)}
                  >
                    {isOpen ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                    <span className="font-semibold text-gray-900">
                      {s.time_serve?.slice(0, 5)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {s.rundown_label || "—"}
                    </span>
                    {(s as any).pic_name && (
                      <span className="text-xs text-gray-400 ml-2 flex items-center gap-1">
                        <User size={11} /> {(s as any).pic_name}
                      </span>
                    )}
                    <div
                      className="ml-auto flex items-center gap-1 text-gray-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => openScheduleModal(s)}
                        className="p-1 hover:text-blue-600"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDelete({ type: "schedule", id: s.id })
                        }
                        className="p-1 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Menu items */}
                  {isOpen && (
                    <div className="border-t border-gray-100">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-50 text-left bg-gray-50/50">
                            <th className="px-4 py-1.5 text-xs font-medium text-gray-500 w-6" />
                            <th className="px-4 py-1.5 text-xs font-medium text-gray-500">
                              Kategori
                            </th>
                            <th className="px-4 py-1.5 text-xs font-medium text-gray-500">
                              Menu
                            </th>
                            <th className="px-4 py-1.5 text-xs font-medium text-gray-500">
                              Subsidi
                            </th>
                            <th className="px-4 py-1.5 text-xs font-medium text-gray-500">
                              Porsi
                            </th>
                            <th
                              className={`px-4 py-1.5 text-xs font-medium text-gray-500 ${hideNominal ? "blur-sm select-none" : ""}`}
                            >
                              Biaya/Porsi
                            </th>
                            <th
                              className={`px-4 py-1.5 text-xs font-medium text-gray-500 text-right ${hideNominal ? "blur-sm select-none" : ""}`}
                            >
                              Subtotal
                            </th>
                            <th className="px-4 py-1.5 text-xs font-medium text-gray-500 w-16" />
                          </tr>
                        </thead>
                        <tbody>
                          {s.menu_items?.map((m) => {
                            const badge = CAT_BADGES[m.menu_category] || {
                              label: m.menu_category,
                              variant: "default" as const,
                            };
                            const subtotal =
                              (m.portion_count || 0) *
                              (m.cost_per_portion || 0);
                            const isMenuOpen = expandedMenuItems.has(m.id);
                            const equips = (m as any).equipment_needs || [];
                            const subsidiName = (m as any).subsidi_source_name;
                            return (
                              <React.Fragment key={m.id}>
                                <tr
                                  key={m.id}
                                  className="border-b border-gray-50 hover:bg-gray-50"
                                >
                                  <td className="px-4 py-2">
                                    {equips.length > 0 && (
                                      <button
                                        onClick={() => toggleMenuItem(m.id)}
                                        className="text-gray-400 hover:text-gray-600"
                                      >
                                        {isMenuOpen ? (
                                          <ChevronDown size={14} />
                                        ) : (
                                          <ChevronRight size={14} />
                                        )}
                                      </button>
                                    )}
                                  </td>
                                  <td className="px-4 py-2">
                                    <Badge variant={badge.variant}>
                                      {badge.label}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-2 text-gray-900 font-medium">
                                    {m.menu_name}
                                  </td>
                                  <td className="px-4 py-2 text-xs text-gray-500">
                                    {subsidiName ? (
                                      <span className="flex items-center gap-1">
                                        <Gift size={11} /> {subsidiName}
                                      </span>
                                    ) : m.is_subsidi ? (
                                      <span className="flex items-center gap-1">
                                        <Gift size={11} /> Subsidi
                                      </span>
                                    ) : (
                                      ""
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-gray-500">
                                    {m.portion_count} {m.unit || "porsi"}
                                  </td>
                                  <td
                                    className={`px-4 py-2 text-gray-500 ${hideNominal ? "blur-sm select-none" : ""}`}
                                  >
                                    {m.cost_per_portion
                                      ? `Rp ${Number(m.cost_per_portion).toLocaleString()}`
                                      : m.is_subsidi
                                        ? "Subsidi"
                                        : "-"}
                                  </td>
                                  <td
                                    className={`px-4 py-2 text-right font-medium text-gray-700 ${hideNominal ? "blur-sm select-none" : ""}`}
                                  >
                                    {m.is_subsidi
                                      ? "—"
                                      : `Rp ${subtotal.toLocaleString()}`}
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => openMenuModal(s.id, m)}
                                        className="p-1 text-gray-400 hover:text-blue-600"
                                      >
                                        <Pencil size={13} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setConfirmDelete({
                                            type: "menu",
                                            id: m.id,
                                          })
                                        }
                                        className="p-1 text-gray-400 hover:text-red-600"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                                {/* Equipment detail row */}
                                {isMenuOpen && equips.length > 0 && (
                                  <tr
                                    key={`eq-${m.id}`}
                                    className="bg-gray-50/50"
                                  >
                                    <td></td>
                                    <td colSpan={7} className="px-4 py-2">
                                      <div className="flex gap-3 flex-wrap text-xs text-gray-500">
                                        <span className="font-medium text-gray-600">
                                          Perlengkapan:
                                        </span>
                                        {equips.map((eq: any, i: number) => (
                                          <span
                                            key={i}
                                            className="bg-white px-2 py-0.5 rounded border border-gray-200"
                                          >
                                            {eq.name} ×{eq.quantity} {eq.unit}{" "}
                                            {eq.usage === "reusable" && (
                                              <Recycle
                                                size={11}
                                                className="inline text-green-500"
                                              />
                                            )}
                                          </span>
                                        ))}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="flex justify-between px-4 py-2 bg-gray-50/50 border-t border-gray-100 text-xs">
                        <button
                          onClick={() => openMenuModal(s.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          + Tambah Menu
                        </button>
                        <span className="text-gray-700 font-semibold">
                          Total: Rp {(s.total_cost || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {grandTotal > 0 && (
              <div className="text-right text-sm font-semibold text-gray-900">
                Grand Total: Rp {grandTotal.toLocaleString()}
              </div>
            )}
          </div>
        </>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-start sm:justify-center bg-black/40 sm:overflow-y-auto sm:py-8">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl p-6 w-full sm:max-w-sm sm:mx-4 sm:my-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editing ? "Edit Jadwal" : "Tambah Jadwal"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waktu Saji
                </label>
                <input
                  type="time"
                  value={form.time_serve}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, time_serve: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jadwal Rundown
                </label>
                <select
                  value={form.rundown_item_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rundown_item_id: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Tidak terkait rundown</option>
                  {rundowns?.map((r) => (
                    <optgroup key={r.id} label={r.title}>
                      {r.items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.time_start?.slice(0, 5)} — {item.activity_title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PIC
                  </label>
                  <select
                    value={form.pic_type || "person"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        pic_type: e.target.value,
                        pic_name: "",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="person">Perorangan</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  {form.pic_type === "other" ? (
                    <input
                      type="text"
                      value={form.pic_name || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, pic_name: e.target.value }))
                      }
                      placeholder="Nama kelompok..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        value={form.pic_name || ""}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, pic_name: e.target.value }));
                          if (e.target.value.length >= 2) {
                            searchPerson.mutate(
                              { query: e.target.value },
                              {
                                onSuccess: (r: any) =>
                                  setPicResults(r.data || []),
                              },
                            );
                          } else {
                            setPicResults([]);
                          }
                        }}
                        placeholder="Cari nama orang..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      {picResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {picResults.map((p: any) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setForm((f) => ({
                                  ...f,
                                  pic_name: p.full_name,
                                }));
                                setPicResults([]);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
                            >
                              <div>{p.full_name}</div>
                              {p.qobilah && (
                                <div className="text-xs text-gray-400">
                                  {p.qobilah}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={saveSchedule}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg"
              >
                {editing ? "Simpan" : "Tambah"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Item Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-start sm:justify-center bg-black/40 sm:overflow-y-auto sm:py-8">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl p-6 w-full sm:max-w-lg sm:mx-4 sm:my-auto max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingMenuItem ? "Edit Menu" : "Tambah Menu"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={menuForm.menu_category}
                  onChange={(e) =>
                    setMenuForm((f) => ({
                      ...f,
                      menu_category: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="makanan_berat">Makanan Berat</option>
                  <option value="makanan_ringan">
                    Makanan Ringan (Snack/Jajanan/Gorengan)
                  </option>
                  <option value="minuman_es">Minuman Es</option>
                  <option value="minuman_hangat">Minuman Hangat</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Menu
                </label>
                <input
                  type="text"
                  list="menu-suggestions"
                  value={menuForm.menu_name}
                  onChange={(e) => handleMenuNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
                <datalist id="menu-suggestions">
                  {existingMenuNames.map((m) => (
                    <option key={m.id} value={m.menu_name} />
                  ))}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    value={menuForm.portion_count}
                    onChange={(e) =>
                      setMenuForm((f) => ({
                        ...f,
                        portion_count: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    list="satuan-options"
                    value={menuForm.unit}
                    onChange={(e) =>
                      setMenuForm((f) => ({ ...f, unit: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <datalist id="satuan-options">
                    <option value="porsi" />
                    <option value="pcs" />
                    <option value="lusin" />
                    <option value="pack" />
                    <option value="kg" />
                    <option value="liter" />
                    <option value="gelas" />
                    <option value="bungkus" />
                    <option value="kotak" />
                  </datalist>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={menuForm.is_subsidi}
                  onChange={(e) =>
                    setMenuForm((f) => ({
                      ...f,
                      is_subsidi: e.target.checked,
                      cost_per_portion: e.target.checked
                        ? ""
                        : f.cost_per_portion,
                      subsidi_source_type: e.target.checked
                        ? f.subsidi_source_type || "qobilah"
                        : "",
                      subsidi_source_name: e.target.checked
                        ? f.subsidi_source_name
                        : "",
                    }))
                  }
                  className="rounded"
                />
                Subsidi (tanpa biaya)
              </label>
              {menuForm.is_subsidi && (
                <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <span className="text-xs font-medium text-gray-600">
                    Sumber Subsidi
                  </span>
                  <select
                    value={menuForm.subsidi_source_type || "qobilah"}
                    onChange={(e) =>
                      setMenuForm((f) => ({
                        ...f,
                        subsidi_source_type: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="qobilah">Qobilah (Cabang)</option>
                    <option value="person">Perorangan</option>
                    <option value="other">Lainnya</option>
                  </select>
                  {menuForm.subsidi_source_type === "qobilah" ? (
                    <select
                      value={menuForm.subsidi_source_id || ""}
                      onChange={(e) => {
                        const id = e.target.value
                          ? Number(e.target.value)
                          : undefined;
                        const branch = branches.find((b: any) => b.id === id);
                        setMenuForm((f) => ({
                          ...f,
                          subsidi_source_id: id,
                          subsidi_source_name: branch?.name || "",
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Pilih qobilah...</option>
                      {branches.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={menuForm.subsidi_source_name || ""}
                      onChange={(e) =>
                        setMenuForm((f) => ({
                          ...f,
                          subsidi_source_name: e.target.value,
                        }))
                      }
                      placeholder={
                        menuForm.subsidi_source_type === "person"
                          ? "Nama orang..."
                          : "Nama kelompok..."
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  )}
                </div>
              )}
              {!menuForm.is_subsidi && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biaya per Porsi (Rp)
                  </label>
                  <input
                    type="number"
                    value={menuForm.cost_per_portion}
                    onChange={(e) =>
                      setMenuForm((f) => ({
                        ...f,
                        cost_per_portion: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="25000"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Penyajian
                </label>
                <select
                  value={menuForm.serving_style}
                  onChange={(e) =>
                    setMenuForm((f) => ({
                      ...f,
                      serving_style: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">— Pilih —</option>
                  <option value="sendiri">
                    Sendiri-sendiri (piring/mangkok/sendok)
                  </option>
                  <option value="bareng">
                    Bareng-bareng (kertas minyak/alas)
                  </option>
                </select>
              </div>
              {menuForm.serving_style && (
                <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      Perlengkapan
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setMenuForm((f) => ({
                          ...f,
                          equipments: [
                            ...f.equipments,
                            { name: "", quantity: 1, unit: "pcs" },
                          ],
                        }))
                      }
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      + Tambah
                    </button>
                  </div>
                  {menuForm.equipments.map((eq, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={eq.name}
                        onChange={(e) => {
                          const next = [...menuForm.equipments];
                          next[i] = { ...next[i], name: e.target.value };
                          setMenuForm((f) => ({ ...f, equipments: next }));
                        }}
                        placeholder="Nama barang"
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                      <input
                        type="number"
                        value={eq.quantity}
                        onChange={(e) => {
                          const next = [...menuForm.equipments];
                          next[i] = {
                            ...next[i],
                            quantity: Number(e.target.value),
                          };
                          setMenuForm((f) => ({ ...f, equipments: next }));
                        }}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                        min={1}
                      />
                      <select
                        value={eq.unit}
                        onChange={(e) => {
                          const next = [...menuForm.equipments];
                          next[i] = { ...next[i], unit: e.target.value };
                          setMenuForm((f) => ({ ...f, equipments: next }));
                        }}
                        className="w-14 px-1 py-1 border border-gray-300 rounded text-xs"
                      >
                        <option value="pcs">pcs</option>
                        <option value="lusin">lusin</option>
                        <option value="pack">pack</option>
                      </select>
                      <select
                        value={(eq as any).usage || "single"}
                        onChange={(e) => {
                          const next = [...menuForm.equipments];
                          next[i] = { ...next[i], usage: e.target.value };
                          setMenuForm((f) => ({ ...f, equipments: next }));
                        }}
                        className="w-20 px-1 py-1 border border-gray-300 rounded text-xs"
                      >
                        <option value="single">Sekali</option>
                        <option value="reusable">Ulang</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const next = menuForm.equipments.filter(
                            (_, j) => j !== i,
                          );
                          setMenuForm((f) => ({ ...f, equipments: next }));
                        }}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {menuForm.equipments.length === 0 && (
                    <p className="text-xs text-gray-400">
                      Belum ada perlengkapan. Klik "+ Tambah"
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowMenuModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={saveMenuItem}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg"
              >
                {editingMenuItem ? "Simpan" : "Tambah"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        open={!!confirmDelete}
        title={
          confirmDelete?.type === "schedule" ? "Hapus Jadwal" : "Hapus Menu"
        }
        message={
          confirmDelete?.type === "schedule"
            ? "Seluruh menu dalam jadwal ini akan ikut terhapus."
            : "Menu ini akan dihapus."
        }
        onConfirm={() =>
          confirmDelete?.type === "schedule"
            ? (deleteCatering.mutate(confirmDelete!.id), setConfirmDelete(null))
            : deleteMenuItem()
        }
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Hapus"
        danger
      />
    </div>
  );
}
