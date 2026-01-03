import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    useUsers,
    useUpdateUser,
    useDeleteUser,
    UserList,
    EditUserDialog,
    DeleteUserDialog,
    type User,
    type UserFilters,
} from '../../features/users'

export function UserListPage() {
    const [filters, setFilters] = useState<UserFilters>({})
    const [searchInput, setSearchInput] = useState('')
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [deletingUser, setDeletingUser] = useState<User | null>(null)

    const { data, isLoading } = useUsers(filters)
    const updateMutation = useUpdateUser()
    const deleteMutation = useDeleteUser()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setFilters({ ...filters, search: searchInput, page: 1 })
    }

    const handleSaveUser = (id: number, userData: any) => {
        updateMutation.mutate(
            { id, data: userData },
            {
                onSuccess: () => setEditingUser(null),
            }
        )
    }

    const handleDeleteUser = () => {
        if (!deletingUser) return
        deleteMutation.mutate(deletingUser.id, {
            onSuccess: () => setDeletingUser(null),
        })
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link to="/" className="hover:text-[#ec1325]">Dashboard</Link>
                    <span>/</span>
                    <span>Users</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
                        <p className="text-gray-500 mt-1">
                            Kelola akun dan hak akses pengguna sistem
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[240px]">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Cari nama atau email..."
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-[#ec1325]"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#ec1325] text-white rounded-lg hover:bg-[#c91020] transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">search</span>
                        </button>
                    </form>

                    {/* Role Filter */}
                    <select
                        value={filters.role || ''}
                        onChange={(e) => setFilters({
                            ...filters,
                            role: e.target.value as any || undefined,
                            page: 1
                        })}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-[#ec1325]"
                    >
                        <option value="">Semua Role</option>
                        <option value="superadmin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            {data?.meta && (
                <div className="mb-4 text-sm text-gray-500">
                    Menampilkan {data.data.length} dari {data.meta.total} user
                </div>
            )}

            {/* List */}
            <UserList
                users={data?.data || []}
                isLoading={isLoading}
                onEdit={setEditingUser}
                onDelete={setDeletingUser}
            />

            {/* Pagination */}
            {data?.meta && data.meta.last_page > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    <button
                        onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                        disabled={!filters.page || filters.page <= 1}
                        className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
                    >
                        Sebelumnya
                    </button>
                    <span className="px-4 py-2">
                        Halaman {data.meta.current_page} dari {data.meta.last_page}
                    </span>
                    <button
                        onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                        disabled={data.meta.current_page >= data.meta.last_page}
                        className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
                    >
                        Selanjutnya
                    </button>
                </div>
            )}

            {/* Dialogs */}
            <EditUserDialog
                user={editingUser}
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                onSave={handleSaveUser}
                isLoading={updateMutation.isPending}
            />
            <DeleteUserDialog
                user={deletingUser}
                isOpen={!!deletingUser}
                onClose={() => setDeletingUser(null)}
                onConfirm={handleDeleteUser}
                isLoading={deleteMutation.isPending}
            />
        </div>
    )
}

export default UserListPage
