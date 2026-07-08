import { useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useEvents } from "../../features/events/hooks/useEvent";
import { EventSelector } from "../../features/events/components/EventSelector";
import { useSearchPerson } from "../../features/users/hooks/useUsers";
import {
  useMcAssignments,
  useCreateMcAssignment,
  useDeleteMcAssignment,
} from "../../features/acara/hooks/useAcara";
import {
  LoadingSkeleton,
  EmptyState,
  Badge,
  ConfirmationModal,
} from "../../components/ui";
import type { McAssignment } from "../../types";
import { MicVocal, Users, Plus, Trash2 } from "lucide-react";

const ROLE_GROUPS: {
  role: McAssignment["role"];
  label: string;
  icon: typeof MicVocal;
}[] = [
  { role: "mc_utama", label: "MC Utama", icon: MicVocal },
  { role: "co_mc", label: "Co-MC", icon: MicVocal },
  { role: "qori", label: "Qori'", icon: Users },
  { role: "tilawah", label: "Tilawah", icon: Users },
];

const ROLE_BADGES: Record<
  string,
  {
    label: string;
    variant: "default" | "success" | "warning" | "danger" | "info";
  }
> = {
  mc_utama: { label: "MC Utama", variant: "info" },
  co_mc: { label: "Co-MC", variant: "success" },
  qori: { label: "Qori'", variant: "warning" },
  tilawah: { label: "Tilawah", variant: "default" },
};

export default function McPage() {
  const { eventSlug } = useParams();
  const { data: events } = useEvents();
  const currentEvent = events?.find((e) => e.slug === eventSlug) || events?.[0];
  const eventId = currentEvent?.id ?? null;

  const { data: assignments, isLoading } = useMcAssignments(eventId);
  const createAssignment = useCreateMcAssignment(eventId!);
  const deleteAssignment = useDeleteMcAssignment(eventId!);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    person_id: "",
    role: "mc_utama" as McAssignment["role"],
    segment_description: "",
    notes: "",
  });

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

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  if (isLoading) return <LoadingSkeleton lines={8} />;
  if (!currentEvent) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">MC & Petugas</h1>
          <EventSelector />
        </div>
        <EmptyState
          title="Belum ada acara"
          description="Pilih atau buat acara terlebih dahulu."
        />
      </div>
    );
  }

  const grouped: Record<string, McAssignment[]> = {};
  assignments?.forEach((a) => {
    if (!grouped[a.role]) grouped[a.role] = [];
    grouped[a.role].push(a);
  });

  const openModal = () => {
    setForm({
      person_id: "",
      role: "mc_utama",
      segment_description: "",
      notes: "",
    });
    setSelectedPerson(null);
    setPersonSearch("");
    setShowModal(true);
  };

  const saveAssignment = () => {
    if (!selectedPerson) return;
    createAssignment.mutate(
      {
        person_id: selectedPerson.id,
        role: form.role,
        segment_description: form.segment_description || undefined,
        notes: form.notes || undefined,
      },
      { onSuccess: () => setShowModal(false) },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">MC & Petugas</h1>
        <EventSelector />
      </div>

      <button
        onClick={openModal}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus size={18} />
        Tambah Assignment
      </button>

      {!assignments || assignments.length === 0 ? (
        <EmptyState
          title="Belum ada assignment MC"
          description="Tambahkan MC utama, Co-MC, Qori', atau Tilawah."
        />
      ) : (
        <div className="space-y-6">
          {ROLE_GROUPS.map(({ role, label, icon: Icon }) => {
            const items = grouped[role];
            if (!items || items.length === 0) return null;
            return (
              <div key={role}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={20} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{label}</h3>
                  <span className="text-xs text-gray-400">
                    ({items.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((a) => {
                    const badge = ROLE_BADGES[a.role];
                    return (
                      <div
                        key={a.id}
                        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900 truncate">
                                {a.person?.full_name ||
                                  `Person #${a.person_id}`}
                              </p>
                              {badge && (
                                <Badge variant={badge.variant}>
                                  {badge.label}
                                </Badge>
                              )}
                            </div>
                            {a.segment_description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {a.segment_description}
                              </p>
                            )}
                            {a.notes && (
                              <p className="text-xs text-gray-400 mt-1 italic">
                                {a.notes}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => setConfirmDelete(a.id)}
                            className="p-1 text-gray-300 hover:text-red-500 rounded flex-shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Modal ─────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tambah Assignment
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Person *
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
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      role: e.target.value as McAssignment["role"],
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="mc_utama">MC Utama</option>
                  <option value="co_mc">Co-MC</option>
                  <option value="qori">Qori'</option>
                  <option value="tilawah">Tilawah</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segmen / Deskripsi
                </label>
                <input
                  type="text"
                  value={form.segment_description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      segment_description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Segmen Pembukaan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Catatan tambahan..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={saveAssignment}
                disabled={!selectedPerson || createAssignment.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createAssignment.isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirmation Modal ────────────────────── */}
      <ConfirmationModal
        open={!!confirmDelete}
        title="Konfirmasi Hapus"
        message="Hapus assignment MC ini?"
        onConfirm={() => {
          if (confirmDelete) deleteAssignment.mutate(confirmDelete);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Hapus"
        danger
      />
    </div>
  );
}
