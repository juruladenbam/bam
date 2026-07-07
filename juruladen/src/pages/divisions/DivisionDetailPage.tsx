import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useUpdateTaskStatus,
} from "../../features/tasks/hooks/useTasks";
import { KanbanBoard } from "../../features/tasks/components/KanbanBoard";
import { useEvents } from "../../features/events/hooks/useEvent";
import {
  useDivisions,
  useAddMember,
  useRemoveMember,
} from "../../features/divisions/hooks/useDivisions";
import { useSearchPerson } from "../../features/users/hooks/useUsers";
import {
  LoadingSkeleton,
  EmptyState,
  ConfirmationModal,
  Badge,
} from "../../components/ui";
import { ClipboardList, Users, X, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { CommitteeTask } from "../../types";

export default function DivisionDetailPage() {
  const { divisionId } = useParams<{ divisionId: string }>();
  const { data: events } = useEvents();
  const event = events?.[0];
  const { data: divisions, refetch: refetchDivisions } = useDivisions(
    event?.id ?? null,
  );
  const division = divisions?.find((d) => d.id === Number(divisionId));

  const { data: tasks, isLoading } = useTasks(Number(divisionId));
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const updateStatus = useUpdateTaskStatus();
  const addMember = useAddMember(event?.id ?? 0);
  const removeMember = useRemoveMember(event?.id ?? 0);
  const searchPerson = useSearchPerson();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<CommitteeTask | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"kanban" | "anggota">("kanban");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<CommitteeTask["priority"]>("medium");
  const [deadline, setDeadline] = useState("");
  const [assigneeId, setAssigneeId] = useState<number | null>(null);

  // Member form
  const [memberSearch, setMemberSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (memberSearch.length >= 2) {
      const timer = setTimeout(async () => {
        const result = await searchPerson.mutateAsync({
          query: memberSearch,
        });
        if (result.success) {
          // Filter out existing members
          const existingIds = new Set(
            division?.members.map((m) => m.person_id) || [],
          );
          setSearchResults(
            (result.data as any[]).filter((p: any) => !existingIds.has(p.id)),
          );
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [memberSearch]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDeadline("");
    setAssigneeId(null);
    setEditingTask(null);
    setShowForm(false);
  };

  const openEdit = (task: CommitteeTask) => {
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setDeadline(task.deadline ? task.deadline.slice(0, 16) : "");
    setAssigneeId(task.assignee_id);
    setEditingTask(task);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !divisionId) return;

    const data: any = {
      title: title.trim(),
      description: description || undefined,
      priority,
      deadline: deadline || undefined,
      assignee_id: assigneeId || null,
    };

    if (editingTask) {
      await updateTask.mutateAsync({
        divisionId: Number(divisionId),
        taskId: editingTask.id,
        data,
      });
    } else {
      await createTask.mutateAsync({ divisionId: Number(divisionId), data });
    }
    resetForm();
  };

  const handleDrop = (taskId: number, newStatus: CommitteeTask["status"]) => {
    updateStatus.mutate({ taskId, status: newStatus });
  };

  const handleDelete = async () => {
    if (deleteId && divisionId) {
      await deleteTaskMutation.mutateAsync({
        divisionId: Number(divisionId),
        taskId: deleteId,
      });
      setDeleteId(null);
    }
  };

  const handleAddMember = async (personId: number, personName: string) => {
    if (!divisionId) return;
    await addMember.mutateAsync({
      divisionId: Number(divisionId),
      personId,
      role: "anggota",
    });
    setMemberSearch("");
    setSearchResults([]);
  };

  const handleRemoveMember = async (personId: number) => {
    if (!divisionId) return;
    await removeMember.mutateAsync({
      divisionId: Number(divisionId),
      personId,
    });
  };

  if (isLoading || !division) return <LoadingSkeleton lines={6} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/divisions"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Divisi
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: division.color }}
              />
              {division.name}
            </span>
          </h1>
          {division.description && (
            <p className="text-sm text-gray-500 mt-1">{division.description}</p>
          )}
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          + Tambah Tugas
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab("kanban")}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "kanban" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
        >
          <ClipboardList size={15} /> Kanban
        </button>
        <button
          onClick={() => setActiveTab("anggota")}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "anggota" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Users size={15} /> Anggota ({division.members.length})
        </button>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTask ? "Edit Tugas" : "Tambah Tugas"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioritas
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as CommitteeTask["priority"])
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                <select
                  value={assigneeId || ""}
                  onChange={(e) =>
                    setAssigneeId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Belum ditugaskan</option>
                  {division.members.map((m) => (
                    <option key={m.person_id} value={m.person_id}>
                      {m.person_name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  {editingTask ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Tab */}
      {activeTab === "kanban" &&
        (!tasks || tasks.length === 0 ? (
          <EmptyState
            title="Belum ada tugas"
            description="Tambahkan tugas pertama."
            action={
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg"
              >
                + Tambah Tugas
              </button>
            }
          />
        ) : (
          <KanbanBoard
            tasks={tasks}
            isLoading={false}
            divisionId={Number(divisionId)}
            eventId={event?.id ?? 0}
            onEditTask={openEdit}
            onDeleteTask={setDeleteId}
            onDropTask={handleDrop}
          />
        ))}

      {/* Anggota Tab */}
      {activeTab === "anggota" && (
        <div className="space-y-4">
          {/* Add member */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Tambah Anggota</h3>
            <div className="relative">
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Cari nama atau NIB orang..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleAddMember(p.id, p.full_name)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex justify-between items-center"
                    >
                      <span>{p.full_name}</span>
                      <span className="text-xs text-gray-400 font-mono">
                        {p.nib}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Member list */}
          {division.members.length === 0 ? (
            <EmptyState
              title="Belum ada anggota"
              description="Cari dan tambahkan anggota ke divisi ini."
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">
                      Nama
                    </th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">
                      Role
                    </th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {division.members.map((m) => (
                    <tr key={m.person_id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">
                        {m.person_name}
                      </td>
                      <td className="px-4 py-2">
                        <Badge
                          variant={m.role === "ketua" ? "warning" : "info"}
                        >
                          {m.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleRemoveMember(m.person_id)}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={12} /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        open={!!deleteId}
        title="Hapus Tugas"
        message="Tugas ini akan dihapus permanen. Lanjutkan?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Hapus"
        danger
      />
    </div>
  );
}
