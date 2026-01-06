import { useState, useEffect } from 'react'
import type { User } from '../api/userApi'
import { Combobox } from '../../../components/Combobox'
import { adminApi } from '../../admin/api/adminApi'

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
    const [selectedPerson, setSelectedPerson] = useState<{ id: number; full_name: string } | null>(null)
    const [personOptions, setPersonOptions] = useState<{ id: number; label: string; subLabel?: string }[]>([])
    const [personLoading, setPersonLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setName(user.name)
            setRole(user.role)
            // Use user.person type from API which matches {id, full_name, gender}
            setSelectedPerson(user.person ? { id: user.person.id, full_name: user.person.full_name } : null)
        }
    }, [user])

    const handleSearchPerson = async (query: string) => {
        if (!query || query.length < 2) {
            setPersonOptions([])
            return
        }
        setPersonLoading(true)
        try {
            const { data } = await adminApi.searchPersons(query)
            setPersonOptions(data.data.map(p => ({
                id: p.id,
                label: p.full_name,
                subLabel: p.branch ? `Qobilah ${p.branch.name.replace('Qobilah ', '')}` : `Gen ${p.generation}`,
            })))
        } catch (error) {
            console.error('Failed to search persons', error)
        } finally {
            setPersonLoading(false)
        }
    }

    if (!isOpen || !user) return null

    const handleSave = () => {
        onSave(user.id, {
            name,
            role: role as any,
            person_id: selectedPerson?.id || null,
        })
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
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Link Person
                        </label>
                        {selectedPerson ? (
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-300">
                                <div>
                                    <p className="text-sm font-medium text-[#181112]">{selectedPerson.full_name}</p>
                                    <p className="text-xs text-[#896165]">ID: {selectedPerson.id}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedPerson(null)}
                                    className="text-xs text-red-600 hover:text-red-800 font-medium px-3 py-1.5 rounded hover:bg-red-50 border border-red-100 transition-colors"
                                >
                                    Unlink
                                </button>
                            </div>
                        ) : (
                            <Combobox
                                label=""
                                placeholder="Cari nama person..."
                                onSearch={handleSearchPerson}
                                options={personOptions}
                                onSelect={(opt) => {
                                    if (opt) {
                                        setSelectedPerson({ id: Number(opt.id), full_name: opt.label })
                                    }
                                }}
                                loading={personLoading}
                            />
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Hubungkan akun user ini dengan data person di silsilah.
                        </p>
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
