import { useState } from "react";
import {
  useUsers,
  useCreateUser,
  useResetPassword,
  useDeleteUser,
} from "../features/users/hooks/useUsers";
import {
  LoadingSkeleton,
  EmptyState,
  Badge,
  ConfirmationModal,
} from "../components/ui";
import { Key, Trash2 } from "lucide-react";
import { useAuth } from "../features/auth/hooks/useAuth";

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const resetPassword = useResetPassword();
  const deleteUser = useDeleteUser();

  const [showForm, setShowForm] = useState(false);
  const [personNib, setPersonNib] = useState("");
  const [role, setRole] = useState<"admin" | "superadmin">("admin");
  const [resetId, setResetId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // First search person by NIB
      const response = await fetch(
        `/api/juruladen/users/search-person?q=${encodeURIComponent(personNib)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("juruladen_token")}`,
          },
        },
      );
      const result = await response.json();

      if (!result.success || !result.data?.length) {
        setError("NIB tidak ditemukan di data silsilah.");
        return;
      }

      const person = result.data[0];
      if (person.has_user) {
        setError("Orang ini sudah memiliki akun Juruladen.");
        return;
      }

      await createUser.mutateAsync({ personId: person.id, role });
      setPersonNib("");
      setShowForm(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal menambahkan user.");
    }
  };

  const handleReset = async () => {
    if (resetId) {
      await resetPassword.mutateAsync(resetId);
      setResetId(null);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteUser.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) return <LoadingSkeleton lines={5} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Pengguna Juruladen</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          + Tambah User
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
        >
          <h3 className="font-semibold text-gray-900">Tambah User Juruladen</h3>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <input
            type="text"
            value={personNib}
            onChange={(e) => setPersonNib(e.target.value)}
            placeholder="NIB orang (mis: 0803050102000)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            autoFocus
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "superadmin")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="admin">Admin (Panitia)</option>
            <option value="superadmin">Superadmin</option>
          </select>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
              className="px-4 py-2 text-sm text-gray-600"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createUser.isPending}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              {createUser.isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      {!users || users.length === 0 ? (
        <EmptyState
          title="Belum ada pengguna"
          description="Tambahkan pengguna Juruladen pertama."
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Nama
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    NIB
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {u.person_name || u.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {u.nib || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={u.role === "superadmin" ? "warning" : "info"}
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {u.has_password ? (
                        <Badge variant="success">✅ Aktif</Badge>
                      ) : (
                        <Badge variant="warning">🟡 Belum Set Password</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setResetId(u.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 rounded"
                        >
                          <Key size={12} /> Reset
                        </button>
                        {currentUser?.id !== u.id && (
                          <button
                            onClick={() => setDeleteId(u.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-800 bg-red-50 rounded"
                          >
                            <Trash2 size={12} /> Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmationModal
        open={!!resetId}
        title="Reset Password"
        message="Password user akan dihapus. User harus membuat password baru saat login berikutnya. Lanjutkan?"
        onConfirm={handleReset}
        onCancel={() => setResetId(null)}
        confirmLabel="Reset"
        danger
      />

      <ConfirmationModal
        open={!!deleteId}
        title="Hapus User"
        message="User akan dihapus. Data transaksi/tugas yang sudah dibuat tetap ada. Lanjutkan?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Hapus"
        danger
      />
    </div>
  );
}
