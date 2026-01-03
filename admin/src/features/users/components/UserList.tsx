import type { User } from '../api/userApi'

interface UserListProps {
    users: User[]
    isLoading?: boolean
    onEdit?: (user: User) => void
    onDelete?: (user: User) => void
}

const roleColors: Record<string, string> = {
    superadmin: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    member: 'bg-gray-100 text-gray-800',
}

const roleLabels: Record<string, string> = {
    superadmin: 'Super Admin',
    admin: 'Admin',
    member: 'Member',
}

export function UserList({ users, isLoading, onEdit, onDelete }: UserListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl h-20 animate-pulse border border-gray-200" />
                ))}
            </div>
        )
    }

    if (!users.length) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <span className="material-symbols-outlined text-5xl text-gray-300">group_off</span>
                <p className="mt-4 text-gray-500">Tidak ada user</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">User</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Role</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Linked Person</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Joined</th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                                    {roleLabels[user.role]}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {user.person ? (
                                    <span className="text-sm text-gray-900">{user.person.full_name}</span>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">Belum terhubung</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(user.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(user)}
                                            className="p-2 text-gray-500 hover:text-[#ec1325] hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                    )}
                                    {onDelete && user.role !== 'superadmin' && (
                                        <button
                                            onClick={() => onDelete(user)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default UserList
