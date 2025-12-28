import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePersons, useBranches, useDeletePerson } from '../../features/admin/hooks/useAdmin'
import type { PersonFilters, Person, Branch } from '../../types'

export function PersonsPage() {
    const [filters, setFilters] = useState<PersonFilters>({
        per_page: 15,
        page: 1,
    })
    const [search, setSearch] = useState('')

    const { data, isLoading, error } = usePersons({ ...filters, search: search || undefined })
    const { data: branchesData } = useBranches()
    const deletePerson = useDeletePerson()

    const branches: Branch[] = branchesData?.data || []
    const persons: Person[] = data?.data || []
    const meta = data?.meta

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setFilters(prev => ({ ...prev, page: 1 }))
    }

    const handleFilterChange = <K extends keyof PersonFilters>(key: K, value: PersonFilters[K]) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1,
        }))
    }

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Yakin ingin menghapus "${name}"?`)) {
            deletePerson.mutate(id)
        }
    }

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#181112]">Daftar Anggota</h1>
                    <p className="text-sm text-[#896165]">
                        {meta ? `Total ${meta.total} anggota` : 'Kelola data anggota keluarga Bani Abdul Manan'}
                    </p>
                </div>
                <Link
                    to="/persons/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ec1325] text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Tambah Anggota
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 border border-[#e6dbdc] flex flex-wrap gap-4">
                <div className="flex-1 min-w-48">
                    <input
                        type="text"
                        placeholder="Cari nama..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                    />
                </div>
                <select
                    value={filters.branch_id || ''}
                    onChange={(e) => handleFilterChange('branch_id', e.target.value ? Number(e.target.value) : undefined)}
                    className="px-4 py-2 border border-[#e6dbdc] rounded-lg bg-white focus:outline-none focus:border-[#ec1325]/50"
                >
                    <option value="">Semua Qobilah</option>
                    {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
                <select
                    value={filters.gender || ''}
                    onChange={(e) => handleFilterChange('gender', (e.target.value || undefined) as 'male' | 'female' | undefined)}
                    className="px-4 py-2 border border-[#e6dbdc] rounded-lg bg-white focus:outline-none focus:border-[#ec1325]/50\"
                >
                    <option value="">Semua Gender</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                </select>
                <select
                    value={filters.is_alive === undefined ? '' : filters.is_alive ? '1' : '0'}
                    onChange={(e) => handleFilterChange('is_alive', e.target.value === '' ? undefined : e.target.value === '1')}
                    className="px-4 py-2 border border-[#e6dbdc] rounded-lg bg-white focus:outline-none focus:border-[#ec1325]/50"
                >
                    <option value="">Semua Status</option>
                    <option value="1">Masih Hidup</option>
                    <option value="0">Almarhum/Almarhumah</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#e6dbdc] overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#f8f6f6] border-b border-[#e6dbdc]">
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Nama</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Qobilah</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Gen</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Gender</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Status</th>
                            <th className="text-right px-4 py-3 text-sm font-semibold text-[#181112]">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-[#896165]">
                                    <span className="material-symbols-outlined animate-spin text-2xl mb-2 block">progress_activity</span>
                                    Memuat data...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-red-500">
                                    <span className="material-symbols-outlined text-2xl mb-2 block">error</span>
                                    Gagal memuat data
                                </td>
                            </tr>
                        ) : persons.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-[#896165]">
                                    <span className="material-symbols-outlined text-2xl mb-2 block">search_off</span>
                                    Data tidak ditemukan
                                </td>
                            </tr>
                        ) : (
                            persons.map((person) => (
                                <tr key={person.id} className="border-b border-[#e6dbdc] hover:bg-[#f8f6f6]/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${person.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                                                }`}>
                                                {person.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-[#181112]">{person.full_name}</p>
                                                {person.nickname && (
                                                    <p className="text-xs text-[#896165]">{person.nickname}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#181112]">
                                        {person.branch?.name || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#181112]">
                                        {person.generation}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${person.gender === 'male'
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'bg-pink-50 text-pink-700'
                                            }`}>
                                            {person.gender === 'male' ? 'L' : 'P'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${person.is_alive
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {person.is_alive ? 'Hidup' : 'Almarhum'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                to={`/persons/${person.id}/edit`}
                                                className="p-1.5 hover:bg-[#f8f6f6] rounded transition-colors"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-[18px] text-[#896165]">edit</span>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(person.id, person.full_name)}
                                                className="p-1.5 hover:bg-red-50 rounded transition-colors"
                                                title="Hapus"
                                                disabled={deletePerson.isPending}
                                            >
                                                <span className="material-symbols-outlined text-[18px] text-red-500">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {meta && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-[#896165]">
                        Menampilkan {persons.length} dari {meta.total} data
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(meta.current_page - 1)}
                            disabled={meta.current_page <= 1}
                            className="px-3 py-1.5 border border-[#e6dbdc] rounded text-sm text-[#896165] bg-white disabled:opacity-50 hover:bg-[#f8f6f6] transition-colors"
                        >
                            Sebelumnya
                        </button>
                        <span className="px-3 py-1.5 text-sm text-[#181112]">
                            {meta.current_page} / {meta.last_page}
                        </span>
                        <button
                            onClick={() => handlePageChange(meta.current_page + 1)}
                            disabled={meta.current_page >= meta.last_page}
                            className="px-3 py-1.5 border border-[#e6dbdc] rounded text-sm text-[#896165] bg-white disabled:opacity-50 hover:bg-[#f8f6f6] transition-colors"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
