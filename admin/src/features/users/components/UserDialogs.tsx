import { useState, useEffect } from 'react'
import type { User } from '../api/userApi'

interface EditUserDialogProps {
    user: User | null
    isOpen: boolean
    onClose: () => void
    onSave: (id: number, data: { name?: string; role?: string; person_id?: number | null }) => void
    isLoading?: boolean
}

export function EditUserDialog({ user, isOpen, onClose, onSave, isLoading }: EditUserDialogProps) {
    const [name, setName] = useState('')
    const [role, setRole] = useState<string>('member')

    useEffect(() => {
        if (user) {
            setName(user.name)
            setRole(user.role)
        }
    }, [user])

    if (!isOpen || !user) return null

    const handleSave = () => {
        onSave(user.id, { name, role: role as any })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Dialog */}
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Edit User
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                        </select>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Email:</span> {user.email}
                        </p>
                        {user.person && (
                            <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Linked to:</span> {user.person.full_name}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={isLoading}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#ec1325] rounded-lg hover:bg-[#c91020] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading && (
                            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        )}
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    )
}

interface DeleteUserDialogProps {
    user: User | null
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isLoading?: boolean
}

export function DeleteUserDialog({ user, isOpen, onClose, onConfirm, isLoading }: DeleteUserDialogProps) {
    if (!isOpen || !user) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Dialog */}
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Hapus User
                        </h3>
                        <p className="text-sm text-gray-500">
                            Tindakan ini tidak dapat dibatalkan
                        </p>
                    </div>
                </div>

                <p className="text-gray-600 mb-6">
                    Apakah Anda yakin ingin menghapus user <strong>{user.name}</strong> ({user.email})?
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={isLoading}
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading && (
                            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        )}
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    )
}
